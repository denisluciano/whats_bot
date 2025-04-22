# 📚 Bot de Check-in e Ranking de Desafios

Este projeto é um bot que gerencia check-ins e rankings para desafios em grupos. Ele permite que os participantes registrem suas atividades diárias (check-ins) e visualizem um ranking baseado na consistência desses check-ins. O bot é integrado ao WhatsApp para facilitar a interação com os usuários.

## 🚀 Funcionalidades

- **Check-in diário**: Os usuários podem registrar suas atividades diárias usando comandos como `ta pago <categoria>`.
- **Ranking**: O bot gera um ranking diário ou geral com base nos check-ins registrados.
- **Categorias personalizadas**: Cada desafio pode ter categorias específicas, como "Leitura", "Exercícios", etc.
- **Notificações automáticas**: O bot pode enviar rankings diários automaticamente para os grupos.
- **Banco de dados**: Utiliza PostgreSQL para armazenar desafios, check-ins e usuários.

## 🛠️ Tecnologias Utilizadas

- **Node.js**: Ambiente de execução do bot.
- **Sequelize**: ORM para interação com o banco de dados PostgreSQL.
- **Moment-timezone**: Biblioteca para manipulação de datas e fusos horários.
- **WhatsApp Web JS**: Biblioteca para integração com o WhatsApp.
- **PostgreSQL**: Banco de dados relacional para armazenamento de dados.

---

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:

1. **Node.js** (versão 16 ou superior).
2. **PostgreSQL** (versão 12 ou superior).
3. **Conta do WhatsApp** para configurar o bot.

---

## 📋 Estrutura do projeto

.
├── config/                  # Configurações do banco de dados
├── controllers/             # Lógica de negócio (check-ins, ranking)
├── handlers/                # Manipuladores de mensagens e eventos
├── models/                  # Modelos do banco de dados (Challenge, Checkin, User)
├── utils/                   # Utilitários (normalização de texto, etc.)
├── .env                     # Variáveis de ambiente
├── README.md                # Documentação do projeto
├── package.json             # Dependências e scripts
└── index.js                # Ponto de entrada do bot

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

### 2. executar projeto

```bash
npm start
```

## Migrations

### 📦 Adicionar uma nova migration
```bash
npx sequelize-cli migration:generate --name nome-da-migration
```

### Rodar migrations

```bash
npx sequelize-cli db:migrate
```