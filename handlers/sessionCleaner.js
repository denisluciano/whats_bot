const fs = require('fs');
const path = require('path');

// Função para limpar arquivos temporários da pasta da sessão
const limparSessao = () => {
    const pastaSessao = path.join(__dirname, '../.wwebjs_auth');
    const tempPatterns = ['.log', '.tmp', '.ldb', '.sqlite-journal'];

    const deletarTemporarios = (dir) => {
        if (!fs.existsSync(dir)) return;

        fs.readdirSync(dir).forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                deletarTemporarios(fullPath);
            } else if (tempPatterns.some(ext => fullPath.endsWith(ext))) {
                try {
                    fs.unlinkSync(fullPath);
                } catch (err) {
                    console.warn(`⚠️ Não foi possível deletar ${fullPath}:`, err.message);
                }
            }
        });
    };

    console.log(`[${new Date().toLocaleString()}] 🧹 Iniciando limpeza da pasta de sessão...`);

    deletarTemporarios(pastaSessao);

    console.log(`[${new Date().toLocaleString()}] ✅ Limpeza da sessão concluída.`);
};

module.exports = { limparSessao };
