# 📚 Bot de Check-in e Ranking de Desafios

Este projeto é um bot que gerencia check-ins e rankings para desafios em grupos. Ele permite que os participantes registrem suas atividades diárias (check-ins) e visualizem um ranking baseado na consistência desses check-ins. O bot é integrado ao WhatsApp para facilitar a interação com os usuários.

## 🚀 Funcionalidades

- **Check-in diário**: Os usuários podem registrar suas atividades diárias usando comandos como `ta pago <categoria>`.
- **Ranking**: O bot gera um ranking diário ou geral com base nos check-ins registrados.
- **Categorias personalizadas**: Cada desafio pode ter categorias específicas, como "Leitura", "Exercícios", etc.
- **Notificações automáticas**: Envia o ranking diariamente às 06:30 (timezone `America/Sao_Paulo`) para os grupos com desafio ativo.
- **Integração com back-end HTTP**: Todas as operações (check-ins, ranking, categorias, desafios) são feitas via API. O armazenamento em banco de dados é responsabilidade do back-end.

## 🛠️ Tecnologias Utilizadas

- **Node.js**: Ambiente de execução do bot.
- **whatsapp-web.js**: Integração com o WhatsApp Web.
- **axios**: Cliente HTTP para comunicação com o back-end.
- **moment-timezone**: Manipulação de datas e fuso horário.
- **node-cron**: Agendamento de tarefas (envio diário de ranking).
- **dotenv**: Carregamento de variáveis de ambiente.
- **qrcode**: Geração do QR Code para autenticação.

---

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

1. **Node.js** (versão 16 ou superior).
2. **Conta do WhatsApp** para configurar o bot.
3. **Um back-end HTTP acessível** configurado em `BOT_API_BASE`.

---

## 📋 Estrutura do projeto

.
├── handlers/                # Manipuladores (mensagens e cron)
│   ├── cronHandler.js
│   └── messageHandler.js
├── services/                # Comunicação com o back-end
│   ├── apiClient.js
│   └── backendService.js
├── utils/                   # Utilitários (datas, normalização de texto)
│   ├── dateUtils.js
│   └── textUtils.js
├── .env.exemple             # Exemplo de variáveis de ambiente
├── README.md                # Documentação do projeto
├── package.json             # Dependências e scripts
├── package-lock.json        # Lockfile do npm
└── index.js                 # Ponto de entrada do bot

---

## 🛠️ Configuração do Projeto

### 1. Clone o repositório

```bash
git clone git@github.com:denisluciano/whats_bot.git
cd whats_bot
```

### 2. instalar pacotes

```bash
npm install
```

### 3. configurar variáveis de ambiente (.env)

Crie um arquivo `.env` na raiz do projeto (baseie-se em `.env.exemple`) e configure:

- BOT_API_BASE: Base URL do back-end. Ex.: http://localhost:3000
- BOT_TOKEN: Token usado no header Authorization: Bearer <token> em todas as requisições ao back-end (opcional)
- LIMIT_DAYS_RETROACTIVE: Janela retroativa, em dias, aceita para check-ins manualmente datados (default: 7)

O cliente Axios em `services/apiClient.js` usa essas variáveis para montar as chamadas:

- POST {BOT_API_BASE}/checkins/date body: { groupId, senderWhatsAppId, userName, category, date }
- GET  {BOT_API_BASE}/ranking?groupId=...
- POST {BOT_API_BASE}/categorias body: { groupId, categoryName, senderWhatsAppId }
- GET  {BOT_API_BASE}/categorias?groupId=...
- GET  {BOT_API_BASE}/desafios  (usado pelo cron para obter desafios ativos)

### 4. executar projeto

```bash
npm start
```

## 📖 Comandos do bot

- `ta pago <categoria> [DD/MM/YYYY|ontem]`
  - Exemplos: `ta pago leitura`, `ta pago leitura 01/01/2025`, `ta pago leitura ontem`
  - Regras: sem data futura; respeita a janela de `LIMIT_DAYS_RETROACTIVE` dias; formato `DD/MM/YYYY`
- `!ranking` — retorna o ranking do desafio ativo do grupo
- `!addcategoria <categoria>` — adiciona uma categoria ao desafio atual
- `!todascategorias` — lista todas as categorias do desafio atual
- `id do grupo` — retorna o identificador do grupo (para configurar no back-end, se necessário)

## 🕒 Agendamento (cron)

- Agendado diariamente às 06:30 no fuso `America/Sao_Paulo`.
- O envio percorre os desafios ativos (conforme `/desafios`) e publica o ranking em cada grupo.
- Para alterar o horário, edite `index.js` na expressão: `cron.schedule('30 6 * * *', ...)`.

## 🔐 Login e sessão (QR Code)

- Ao iniciar, um QR Code é gerado e salvo como arquivo `qrcode.png`. Escaneie pelo WhatsApp para autenticar.
- A sessão é mantida via `LocalAuth` (pasta `.wwebjs_auth`).
- Ao alternar entre ambientes (ex.: Local -> Produção), apague a pasta `.wwebjs_auth` antes de rodar para evitar reprocessar mensagens antigas.