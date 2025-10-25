Honey Money - Seu Controle Financeiro Pessoal

Projeto de aplicativo web para controle financeiro pessoal, construído com Flask e JavaScript (utilizando Local Storage para persistência de dados no navegador).

Funcionalidades

Dashboard com resumo financeiro (Saldo, Receitas, Despesas).

Cadastro e visualização de transações (Receitas e Despesas).

Cadastro de categorias.

Página de Lançamentos com histórico completo.

Página de Relatórios (exemplo com gráficos).

Página de Perfil (dados do usuário).

Armazenamento local de dados usando o Local Storage do navegador.

Pré-requisitos

Python 3: Certifique-se de que você tem o Python 3 instalado. Você pode baixá-lo em python.org. Durante a instalação no Windows, marque a opção "Add python.exe to PATH". Para verificar se está instalado, abra o terminal e digite:

py --version
# ou
python --version


Como Configurar e Executar o Projeto

Siga estes passos para colocar o Honey Money para rodar na sua máquina:

1. Clone ou Baixe o Projeto:

Se estiver usando Git:

git clone <url-do-seu-repositorio>
cd HoneyMoney 


Ou baixe o arquivo ZIP e extraia-o.

2. Navegue até a Pasta do Projeto:

Abra seu terminal (como o PowerShell, CMD ou o terminal integrado do VS Code) e navegue até a pasta onde você extraiu ou clonou os arquivos do projeto:

cd caminho/para/HoneyMoney


(Substitua caminho/para/HoneyMoney pelo caminho real no seu computador)

3. Crie um Ambiente Virtual:

É altamente recomendado criar um ambiente virtual isolado para as dependências do projeto. Isso evita conflitos com outros projetos Python.

py -m venv .venv


(Isso criará uma pasta chamada .venv dentro do seu projeto)

4. Ative o Ambiente Virtual:

No Windows (PowerShell):

.\.venv\Scripts\activate


Observação: Se você receber um erro sobre a execução de scripts desabilitada, execute o seguinte comando uma vez no PowerShell como administrador ou na sessão atual para permitir a ativação:

Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process


Depois, tente ativar novamente.

No macOS ou Linux:

source .venv/bin/activate


Você saberá que o ambiente está ativo pois (.venv) aparecerá no início do prompt do seu terminal.

5. Instale as Dependências:

Com o ambiente virtual ativo, instale o Flask:

py -m pip install flask


(O py -m pip é a forma mais segura de chamar o instalador no Windows)

6. Execute a Aplicação Flask:

Agora, você pode iniciar o servidor web:

flask run

ou

python app.py


7. Acesse no Navegador:

O terminal mostrará uma mensagem indicando que o servidor está rodando, geralmente em http://127.0.0.1:5000. Abra seu navegador e acesse esse endereço.

Você deverá ver a página de login do Honey Money!

Estrutura do Projeto

/HoneyMoney/
├── app.py                 # <-- Servidor Flask
│
├── /static/               # <-- Pasta para arquivos estáticos
│   ├── /css/styles.css    # <-- Estilos CSS
│   ├── /js/main.js        # <-- Todo o código JavaScript
│   └── /img/              # <-- Imagens (logos, etc.)
│       ├── 1.png
│       └── 2.png
│
└── /templates/            # <-- Pasta para arquivos HTML
    ├── login.html
    ├── register.html      # <-- (Se você criou a página de registro)
    ├── dashboard.html
    ├── lancamentos.html
    ├── relatorios.html
    └── perfil.html
