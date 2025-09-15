const moment = require('moment-timezone');
const api = require('./apiClient');

// Utilitários de formatação
function extractMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data.message === 'string') return data.message;
  return fallback;
}

function formatRankingMessage(data) {
  if (!data || !data.challenge) {
    return '⚠️ Não há desafio ativo para este grupo.';
  }
  const ranking = Array.isArray(data.ranking) ? data.ranking : [];
  if (!ranking.length) {
    return `*🏆 Ranking do desafio de ${data.challenge.name} 🏆*\n\nNenhum check-in registrado ainda.`;
  }
  let msg = `*🏆 Ranking do desafio de ${data.challenge.name} 🏆*\n\n`;
  let currentPosition = 1;
  let lastCheckIns = null;
  ranking.forEach((entry, index) => {
    if (entry.totalCheckIns === lastCheckIns) {
      msg += `${currentPosition}. ${entry.userName} - *${entry.totalCheckIns}* check-ins\n`;
    } else {
      currentPosition = index + 1;
      msg += `${currentPosition}. ${entry.userName} - *${entry.totalCheckIns}* check-ins\n`;
    }
    lastCheckIns = entry.totalCheckIns;
  });
  return msg;
}

function mapCheckinSuccess(resData) {
  const userName = resData?.user?.userName || 'Usuário';
  const challengeName = resData?.challenge?.name || 'Atividade';
  const catName = resData?.category?.name || resData?.category?.category || 'categoria';
  const dateStr = resData?.checkin?.date
    ? moment(resData.checkin.date).tz('America/Sao_Paulo').format('DD/MM/YYYY')
    : moment().tz('America/Sao_Paulo').format('DD/MM/YYYY');
  return `🥳 *Parabéns* ${userName}! Check-in registrado para atividade *${challengeName}* na categoria *${catName}* na data de *${dateStr}*!`;
}

function mapCheckinError(errData, context = {}) {
  const error = errData?.error;
  const valid = Array.isArray(errData?.validCategories) ? errData.validCategories : undefined;

  const attemptedCategory = context.category
    || errData?.category?.name
    || errData?.category?.category
    || errData?.attemptedCategory
    || 'categoria';
  const challengeName = errData?.challenge?.name || 'desafio';
  const userName = context.userName || errData?.user?.userName || 'Você';
  const dateRef = errData?.date || errData?.checkin?.date || context.date;
  const dateStr = dateRef
    ? moment(dateRef).tz('America/Sao_Paulo').format('DD/MM/YYYY')
    : moment().tz('America/Sao_Paulo').format('DD/MM/YYYY');
  const daysLimit = process.env.LIMIT_DAYS_RETROACTIVE || 7;

  switch (error) {
    case 'NO_ACTIVE_CHALLENGE':
      return '🚫 Nenhum desafio encontrado para este grupo.';
    case 'INVALID_CATEGORY':
      return valid && valid.length
        ? `A categoria *"${attemptedCategory}"* não é aceita para a atividade *${challengeName}*. Por favor, use uma das seguintes categorias: *${valid.join(', ')}*.`
        : `A categoria *"${attemptedCategory}"* não é aceita para a atividade *${challengeName}*.`;
    case 'INVALID_DATE_FORMAT':
      return '❌ Data inválida fornecida no formato DD/MM/YYYY.';
    case 'DATE_IN_FUTURE':
      return '❌ A data não pode ser no futuro.';
    case 'DATE_TOO_OLD':
      return `❌ A data não pode ser inferior a ${daysLimit} dias passados.`;
    case 'DATE_OUT_OF_CHALLENGE_RANGE':
      return '❌ A data informada está fora do período do desafio.';
    case 'INVALID_TIMEFRAME':
      return '❌ Formato inválido de check-in. Exemplos válidos: *ta pago <categoria>*, *ta pago <categoria> 01/01/2025* ou *ta pago <categoria> ontem*';
    case 'ALREADY_CHECKED_IN':
      return `⚠️ ${userName}, você *já fez* um check-in para atividade *${challengeName}* na categoria *${attemptedCategory}* em *${dateStr}*.`;
    default:
      return extractMessage(errData, '❌ Não foi possível registrar o check-in. Tente novamente mais tarde.');
  }
}

async function listChallenges() {
  try {
    const res = await api.get(`/desafios`);
    const challenges = Array.isArray(res.data) ? res.data : [];
    return { success: true, challenges };
  } catch (err) {
    return { success: false, challenges: [], error: err?.response?.data || err?.message };
  }
}

async function registerCheckin({ groupId, senderWhatsAppId, userName, category, date }) {
  
  try {
    const res = await api.post(`/checkins/date`, {
      groupId,
      senderWhatsAppId,
      userName,
      category,
      date
    });
    
    return {
      success: true,
      message: mapCheckinSuccess(res.data),
      data: res.data,
    };
  } catch (err) {
    const backendMsg = err?.response?.data;
    return {
      success: false,
      message: mapCheckinError(backendMsg, { userName, category, date }),
      data: backendMsg,
    };
  }
}

async function getRanking({ groupId }) {
  try {
    const res = await api.get(`/ranking`, { params: { groupId } });
    return {
      success: true,
      message: formatRankingMessage(res.data),
      data: res.data,
    };
  } catch (err) {
    const backendMsg = err?.response?.data;
    return {
      success: false,
      message: extractMessage(backendMsg, '❌ Não foi possível obter o ranking.'),
      data: backendMsg,
    };
  }
}

async function addCategory({ groupId, categoryName, senderWhatsAppId }) {
  try {
    const res = await api.post(`/categorias`, { groupId, categoryName, senderWhatsAppId });
    const name = res?.data?.category?.name || categoryName;
    return {
      success: true,
      message: `✅ Categoria *"${name}"* adicionada ao desafio com sucesso!`,
      data: res.data,
    };
  } catch (err) {
    const backendMsg = err?.response?.data;
    let msg;
    if (backendMsg?.error === 'CATEGORY_ALREADY_EXISTS') {
      msg = `⚠️ A categoria *"${categoryName}"* já existe neste desafio.`;
    } else if (backendMsg?.error === 'NO_ACTIVE_CHALLENGE') {
      msg = '⚠️ Nenhum desafio encontrado para este grupo.';
    } else {
      msg = extractMessage(backendMsg, `❌ Não foi possível adicionar a categoria "${categoryName}".`);
    }
    return {
      success: false,
      message: msg,
      data: backendMsg,
    };
  }
}

async function listCategories({ groupId }) {
  try {
    const res = await api.get(`/categorias`, { params: { groupId } });
    const categories = Array.isArray(res?.data?.categories) ? res.data.categories : [];
    if (!res?.data?.challenge) {
      return { success: true, message: '🚫 Nenhum desafio encontrado para este grupo.', data: res.data };
    }
    const message = categories.length
      ? `📂 *Categorias do Desafio*:\n\n${categories.join(', ')}`
      : '📭 Este desafio ainda não possui categorias.';
    return { success: true, message, data: res.data };
  } catch (err) {
    const backendMsg = err?.response?.data;
    return {
      success: false,
      message: extractMessage(backendMsg, '❌ Não foi possível buscar as categorias.'),
      data: backendMsg,
    };
  }
}

module.exports = {
  registerCheckin,
  getRanking,
  addCategory,
  listCategories,
  listChallenges,
};
