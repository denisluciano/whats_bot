const nodeHtmlToImage = require('node-html-to-image');

// Month names in Portuguese (pt-BR)
const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Generate a monthly calendar PNG as a Buffer
 * @param {{ year: number, month: number, checkedDays: Set<number> | number[], title?: string }} params
 * month is 1-12
 */
async function generateMonthlyCalendarImage({ year, month, checkedDays, title }) {
  if (!year || !month) throw new Error('year and month are required');
  const checked = new Set(Array.isArray(checkedDays) ? checkedDays : Array.from(checkedDays || []));

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  // Monday-first index (0..6)
  const jsWeekday = firstDay.getDay(); // 0=Sun..6=Sat
  const mondayFirstOffset = (jsWeekday + 6) % 7; // 0 if Monday

  const totalCells = Math.ceil((mondayFirstOffset + daysInMonth) / 7) * 7; // 35 or 42

  // Build cells content
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - mondayFirstOffset + 1; // Day in month
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    const isChecked = inMonth && checked.has(dayNum);
    cells.push({ inMonth, dayNum: inMonth ? dayNum : '', isChecked });
  }

  const monthName = MONTH_NAMES_PT[month - 1];
  const headerTitle = title || `${monthName} de ${year}`;

  const html = `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif; background: #0b1020; }
        .card { width: 900px; background: #0f172a; color: #e2e8f0; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); padding: 24px 28px; }
        .header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 12px; }
        .title { font-size: 28px; font-weight: 700; letter-spacing: 0.3px; }
        .legend { font-size: 13px; color: #94a3b8; display: flex; gap: 16px; }
        .legend .item { display: inline-flex; align-items: center; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
        .dot.checked { background: #22c55e; }
        .dot.empty { background: #334155; }

        .weekdays { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin: 14px 0 6px; font-size: 13px; color: #94a3b8; }
        .weekdays .day { text-align: center; padding: 8px 0; }

        .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
        .cell { border-radius: 12px; height: 100px; padding: 10px; position: relative; background: linear-gradient(180deg, rgba(30,41,59,0.85), rgba(15,23,42,0.95)); border: 1px solid rgba(148,163,184,0.08); }
        .cell.out { opacity: 0.35; filter: grayscale(0.2); }
        .cell .num { position: absolute; top: 10px; right: 12px; font-size: 13px; color: #94a3b8; }
        .pill { position: absolute; left: 10px; bottom: 10px; padding: 6px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.3px; }
        .pill.checked { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.35); }
        .pill.empty { background: rgba(51,65,85,0.25); color: #94a3b8; border: 1px solid rgba(148,163,184,0.25); }

        .footer { margin-top: 16px; font-size: 12px; color: #64748b; text-align: right; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="title">${headerTitle}</div>
          <div class="legend">
            <span class="item"><span class="dot checked"></span> Check-in</span>
            <span class="item"><span class="dot empty"></span> Sem check-in</span>
          </div>
        </div>
        <div class="weekdays">
          <div class="day">Seg</div>
          <div class="day">Ter</div>
          <div class="day">Qua</div>
          <div class="day">Qui</div>
          <div class="day">Sex</div>
          <div class="day">Sáb</div>
          <div class="day">Dom</div>
        </div>
        <div class="grid">
          ${cells.map(c => `
            <div class="cell ${c.inMonth ? '' : 'out'}">
              <div class="num">${c.dayNum || ''}</div>
              ${c.inMonth ? `<div class="pill ${c.isChecked ? 'checked' : 'empty'}">${c.isChecked ? 'Feito' : 'Vazio'}</div>` : ''}
            </div>
          `).join('')}
        </div>
        <div class="footer">Gerado automaticamente</div>
      </div>
    </body>
  </html>`;

  const buffer = await nodeHtmlToImage({
    html,
    type: 'png',
    quality: 100,
    puppeteerArgs: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  return buffer;
}

module.exports = { generateMonthlyCalendarImage, MONTH_NAMES_PT };
