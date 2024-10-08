# Projeto de Ranking de Check-ins de Idiomas para WhatsApp

Este é um bot para WhatsApp que permite que usuários façam check-ins diários ao estudarem diferentes idiomas. O bot utiliza o `whatsapp-web.js` para interagir com o WhatsApp, registrando as atividades de estudo em um banco de dados MongoDB e fornecendo rankings diários, semanais, mensais e anuais para acompanhar o progresso.

## Como Funciona

Os usuários podem fazer check-ins enviando mensagens no formato `ta pago <idioma>` para registrar sua atividade de estudo. O bot salva esses registros no MongoDB e gera rankings de frequência para cada idioma, permitindo que os usuários acompanhem seu progresso geral, anual, mensal e semanal. Somente um check-in por idioma é contabilizado por dia, mesmo que o usuário estude mais de um idioma no mesmo dia.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução para o JavaScript do lado do servidor.
- **whatsapp-web.js**: Biblioteca para interagir com a API do WhatsApp Web.
- **MongoDB**: Banco de dados NoSQL para armazenar os check-ins dos usuários.
- **Mongoose**: Biblioteca para modelagem de dados do MongoDB no Node.js.
- **dotenv**: Gerenciamento de variáveis de ambiente para configuração do projeto.

## Recursos

- Registro de check-ins diários por idioma.
- Validação para permitir check-ins apenas para idiomas suportados.
- Ranking por usuário dividido em períodos: geral, anual, mensal e semanal.
- Suporte a múltiplos idiomas, com contagem de apenas um check-in por idioma por dia.

