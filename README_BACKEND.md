# Honey Money - Backend Completo

Backend completo para o sistema de controle financeiro Honey Money, desenvolvido com Flask, SQLAlchemy e Flask-Login.

## Estrutura do Backend

```
Prototipo_POO/
├── app.py              # Aplicação Flask principal
├── models.py           # Modelos de banco de dados (Usuario, Transacao, Categoria)
├── routes.py           # Rotas de API REST
├── auth.py             # Funções de autenticação
├── config.py           # Configurações da aplicação
├── requirements.txt    # Dependências Python
└── honey_money.db      # Banco de dados SQLite (criado automaticamente)
```

## Instalação

1. **Crie um ambiente virtual** (recomendado):
```bash
py -m venv .venv
.\.venv\Scripts\activate  # Windows
# ou
source .venv/bin/activate  # Linux/Mac
```

2. **Instale as dependências**:
```bash
pip install -r requirements.txt
```

3. **Execute a aplicação**:
```bash
python app.py
```

O servidor será iniciado em `http://127.0.0.1:5000`

## Funcionalidades do Backend

### Autenticação
- **POST /api/cadastro** - Cadastro de usuário (PF ou PJ)
- **POST /api/login** - Login de usuário
- **POST /api/logout** - Logout
- **GET /api/usuario/atual** - Obter dados do usuário logado

### Transações
- **GET /api/transacoes** - Listar todas as transações do usuário
- **POST /api/transacoes** - Criar nova transação
- **PUT /api/transacoes/<id>** - Atualizar transação
- **DELETE /api/transacoes/<id>** - Deletar transação

### Categorias
- **GET /api/categorias** - Listar todas as categorias do usuário
- **POST /api/categorias** - Criar nova categoria
- **DELETE /api/categorias/<id>** - Deletar categoria

### Dashboard e Relatórios
- **GET /api/dashboard/estatisticas** - Estatísticas do dashboard (saldo, receitas, despesas)
- **GET /api/relatorios/despesas-por-categoria** - Despesas agrupadas por categoria
- **GET /api/relatorios/receitas-vs-despesas** - Totais de receitas e despesas

## Banco de Dados

O banco de dados SQLite é criado automaticamente na primeira execução. As tabelas são:

- **usuarios**: Dados dos usuários (PF e PJ)
- **transacoes**: Transações financeiras
- **categorias**: Categorias de transações

## Segurança

- Senhas são criptografadas usando `Werkzeug.security`
- Sessões gerenciadas com Flask-Login
- Rotas protegidas com decorator `@login_required`
- Validação de dados nas APIs

## Integração Frontend

O frontend foi atualizado para usar as APIs do backend através do arquivo `static/js/api.js`. Os templates HTML foram atualizados para incluir os scripts necessários.

## Notas

- O banco de dados SQLite será criado automaticamente na primeira execução
- Categorias padrão são criadas automaticamente no cadastro (Salário, Moradia, Alimentação, Extra, Lazer)
- As sessões são gerenciadas via cookies do Flask

