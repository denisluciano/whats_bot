const nodeHtmlToImage = require('node-html-to-image');

// Month names in Portuguese (pt-BR)
const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Generate a monthly calendar PNG as a Buffer
 * @param {{
 *   year: number,
 *   month: number, // 1-12
 *   checkedDays: Set<number> | number[],
 *   title?: string,
 *   userName?: string,
 *   challenge?: { id?: string|number, name?: string, startDate?: string|Date, endDate?: string|Date }
 * }} params
 */
async function generateMonthlyCalendarImage({ year, month, checkedDays, title, userName, challenge }) {
  if (!year || !month) throw new Error('year and month are required');
  const checked = new Set(Array.isArray(checkedDays) ? checkedDays : Array.from(checkedDays || []));

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  // Sunday-first index (0..6)
  const jsWeekday = firstDay.getDay(); // 0=Sun..6=Sat
  const mondayFirstOffset = jsWeekday; // 0 if Sunday

  const totalCells = Math.ceil((mondayFirstOffset + daysInMonth) / 7) * 7; // 35 or 42

  // Today context
  const now = new Date();
  const isCurrentMonth = (year === now.getFullYear() && month === (now.getMonth() + 1));
  const todayDay = now.getDate();

  // Build cells content
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - mondayFirstOffset + 1; // Day in month
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const isChecked = inMonth && checked.has(dayNum);
    let status = 'none';
    if (inMonth && isCurrentMonth) {
      if (dayNum < todayDay) status = 'past';
      else if (dayNum > todayDay) status = 'future';
      else status = 'today';
    }
    cells.push({ inMonth, dayNum: inMonth ? dayNum : '', isChecked, status });
  }

  const monthName = MONTH_NAMES_PT[month - 1];
  const headerTitle = title || `${monthName} de ${year}`;
  const completedInMonth = (Array.isArray(checkedDays) ? new Set(checkedDays) : checked).size;
  const progressPct = Math.round((completedInMonth / daysInMonth) * 100);

  const challengeName = challenge?.name || '';
  const startLabel = challenge?.startDate ? new Date(challenge.startDate).toLocaleDateString('pt-BR') : '';
  const endLabel = challenge?.endDate ? new Date(challenge.endDate).toLocaleDateString('pt-BR') : '';
  const challengePeriod = startLabel && endLabel ? `${startLabel} — ${endLabel}` : '';
  const userLabel = userName || '';

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        :root {
          --primary-1: #FFD400;
          --primary-2: #FFDD3C;
          --primary-3: #FFEA61;
          --primary-4: #EBE389;
          --neutral-0: #000000;
          --neutral-10: #FFFFFF;
          --gray-1: #969393;
          --gray-2: #B5B1B1;
          --gray-3: #D9D9D9;
          --gray-4: #F0F1F5;
          --comp-green: #5ADE6F;
          --comp-blue: #5786EB;
          --comp-brown: #4F200D;
          --error-1: #FF2C2C;
          --error-2: #FF7081;
          --success-1: #007E33;
          --success-2: #00C851;
        }
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; background: var(--gray-4); }
        .story { width: 1080px; height: 1920px; background: linear-gradient(180deg, rgba(255,221,60,0.25), rgba(240,241,245,1)); padding: 24px 48px 48px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .card { width: 960px; background: var(--neutral-10); color: var(--neutral-0); border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.18); padding: 28px 32px; border: 1px solid var(--gray-3); }
        .hero { background: linear-gradient(135deg, rgba(255,212,0,0.15), rgba(255,234,97,0.15)); border: 1px solid rgba(217,217,217,0.6); border-radius: 16px; padding: 28px; margin-bottom: 22px; }
        .hero .challenge { font-size: 30px; font-weight: 800; color: var(--comp-brown); letter-spacing: 0.2px; }
        .hero .meta { margin-top: 10px; font-size: 18px; color: var(--gray-1); display: flex; gap: 10px; flex-wrap: wrap; }
        .hero .progress-wrap { margin-top: 18px; }
        .progress { width: 100%; height: 14px; background: var(--gray-4); border-radius: 999px; border: 1px solid var(--gray-3); overflow: hidden; }
        .progress .bar { height: 100%; background: linear-gradient(90deg, var(--success-2), var(--comp-green)); }
        .progress-label { margin-top: 12px; font-size: 17px; color: var(--gray-1); }
        .header { display: flex; align-items: baseline; justify-content: space-between; margin: 10px 0 12px; }
        .title { font-size: 26px; font-weight: 800; letter-spacing: 0.3px; color: var(--comp-brown); padding-left: 12px; border-left: 6px solid var(--primary-1); }
        .legend { font-size: 13px; color: var(--gray-1); display: flex; gap: 16px; }
        .legend .item { display: inline-flex; align-items: center; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        .dot.checked { background: var(--success-2); }
        .dot.empty { background: var(--gray-3); }
        .dot.error { background: var(--error-2); }
        .dot.future { background: var(--gray-3); }

        .weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin: 14px 0 6px; font-size: 13px; color: var(--gray-1); }
        .weekdays .day { text-align: center; padding: 8px 0; }

        .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 12px; }
        .cell { border-radius: 14px; height: 150px; padding: 12px; position: relative; background: linear-gradient(180deg, var(--gray-4), var(--neutral-10)); border: 1px solid var(--gray-3); }
        .cell.out { opacity: 0.35; filter: grayscale(0.2); }
        .cell.today { box-shadow: inset 0 0 0 2px var(--primary-2); }
        .cell .num { position: absolute; top: 10px; right: 12px; font-size: 14px; color: var(--gray-1); font-weight: 600; }
        .pill { position: absolute; left: 10px; bottom: 10px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.3px; }
        .pill.checked { background: rgba(0,200,81,0.12); color: var(--success-1); border: 1px solid rgba(0,200,81,0.35); }
        .pill.error { background: rgba(255,44,44,0.12); color: var(--error-1); border: 1px solid rgba(255,44,44,0.35); }
        .pill.future { background: rgba(240,241,245,0.65); color: var(--gray-1); border: 1px solid rgba(217,217,217,0.6); }
        .pill.empty { background: rgba(217,217,217,0.25); color: var(--gray-1); border: 1px solid rgba(217,217,217,0.5); }

        .footer { margin-top: 16px; font-size: 12px; color: var(--gray-2); text-align: right; }
      </style>
    </head>
    <body>
      <div class="story">
        <div class="card">
          <div class="hero">
            <div class="challenge">${challengeName || 'Seus check-ins'}</div>
            <div class="meta">
              ${userLabel ? `<span class=\"user\">${userLabel}</span><span>•</span>` : ''}
              <span class="period">${monthName} de ${year}</span>
              ${challengePeriod ? `<span>•</span><span>${challengePeriod}</span>` : ''}
            </div>
            <div class="progress-wrap">
              <div class="progress"><div class="bar" style="width: ${progressPct}%"></div></div>
              <div class="progress-label">Feitos no mês: ${completedInMonth} / ${daysInMonth} (${progressPct}%)</div>
            </div>
          </div>
          <div class="header">
            <div class="title">${headerTitle}</div>
            <div class="legend">
              <span class="item"><span class="dot checked"></span> Check-in</span>
              <span class="item"><span class="dot error"></span> Atrasado</span>
              <span class="item"><span class="dot future"></span> Futuro</span>
            </div>
          </div>
        <div class="weekdays">
          <div class="day">Dom</div>
          <div class="day">Seg</div>
          <div class="day">Ter</div>
          <div class="day">Qua</div>
          <div class="day">Qui</div>
          <div class="day">Sex</div>
          <div class="day">Sáb</div>
        </div>
        <div class="grid">
          ${cells.map(c => `
            <div class="cell ${c.inMonth ? '' : 'out'} ${c.status === 'today' ? 'today' : ''}">
              <div class="num">${c.dayNum || ''}</div>
              ${c.inMonth ? `<div class="pill ${c.isChecked ? 'checked' : (c.status === 'past' ? 'error' : (c.status === 'future' ? 'future' : 'empty'))}">${c.isChecked ? 'Feito' : 'Vazio'}</div>` : ''}
            </div>
          `).join('')}
        </div>
        </div>
      </div>
    </body>
  </html>`;

  const buffer = await nodeHtmlToImage({
    html,
    type: 'png',
    quality: 100,
    selector: '.story',
    beforeScreenshot: async (page) => {
      await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 2 });
      await page.addStyleTag({ content: 'html,body{margin:0;padding:0;} .story{margin:0 auto;}' });
    },
    puppeteerArgs: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  return buffer;
}

module.exports = { generateMonthlyCalendarImage, MONTH_NAMES_PT };
