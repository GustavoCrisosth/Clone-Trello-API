API RESTful completa para uma aplicação Kanban de gestão de tarefas, inspirada no Trello e Asana. O projeto foi construído do zero com foco em segurança, escalabilidade e integridade dos dados, servindo como a espinha dorsal para qualquer interface front-end."

Principais Funcionalidades Implementadas:

Autenticação Segura: Sistema completo de registro e login usando tokens JWT e criptografia de senhas com bcrypt.

CRUD Relacional: Endpoints completos para criar, ler, atualizar e deletar Quadros, Listas e Cartões, gerenciando as associações complexas entre eles.

Lógica de "Arrastar e Soltar" (Drag-and-Drop): Um endpoint PATCH avançado que utiliza Transações SQL para reordenar tarefas e movê-las entre listas de forma atômica, garantindo que a ordem nunca seja corrompida.

Validação e Segurança: Validação de entrada em todas as rotas usando Zod e middlewares de permissão que garantem que um usuário só possa modificar seus próprios recursos.

Stack de Tecnologias:

Back-end: Node.js, Express.js

Banco de Dados: PostgreSQL

ORM: Sequelize

Autenticação: JSON Web Tokens (JWT)

Validação: Zod
