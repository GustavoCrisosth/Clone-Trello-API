API TaskFlow (Clone do Trello/Asana)

API RESTful completa para uma aplicação Kanban de gestão de tarefas, inspirada no Trello e Asana. O projeto foi construído do zero com foco em segurança, escalabilidade e integridade dos dados, servindo como a espinha dorsal para qualquer interface front-end.

Esta API é consumida pelo Repositório do Front-end (React + TS).

 Links do Projeto
 
Aplicação no Ar (Front-end): [https://trello-clone-ui-one.vercel.app/]

Aviso Importante: O back-end está hospedado no plano gratuito do Render. A primeira inicialização (ao registrar-se ou fazer login) pode demorar 30-60 segundos para "acordar" o servidor. Após isso, o uso é instantâneo.


Stack de Tecnologias

Back-end: Node.js, Express.js

Banco de Dados: PostgreSQL

ORM: Sequelize (com Migrations)

Autenticação: JSON Web Tokens (JWT) & bcrypt


Principais Funcionalidades Implementadas

Autenticação Segura: Sistema completo de registro (/auth/register) e login (/auth/login) usando tokens JWT e criptografia de senhas com bcrypt.

CRUD Relacional: Endpoints completos para criar, ler, atualizar e deletar Quadros, Listas e Cartões, gerenciando as associações complexas entre eles.

Lógica de "Arrastar e Soltar" (Drag-and-Drop): Um endpoint PATCH /cards/:id/move avançado que utiliza Transações SQL para reordenar tarefas e movê-las entre listas de forma atômica, garantindo que a ordem nunca seja corrompida.

Validação e Segurança: Validação de entrada em todas as rotas usando Zod e middlewares de permissão que garantem que um usuário só possa modificar seus próprios recursos.


Local Setup (Como Rodar Localmente)

Clone este repositório:

Bash

git clone https://github.com/seu-usuario/trello-clone-api.git
cd trello-clone-api
Instale as dependências:

Bash

npm install
Crie um arquivo .env na raiz e adicione suas variáveis de banco de dados (PostgreSQL) e o JWT_SECRET:

Snippet de código

DB_USER=seu_usuario_postgres
DB_PASS=sua_senha_postgres
DB_NAME=trello_clone_db
DB_HOST=localhost
DB_DIALECT=postgres
JWT_SECRET=sua_chave_secreta_super_forte
Crie o banco de dados (trello_clone_db) no seu PostgreSQL.


Rode as migrações para criar as tabelas:

Bash

npx sequelize-cli db:migrate


Inicie o servidor de desenvolvimento:

Bash

npm run dev
O servidor estará rodando em http://localhost:3001.
