
document.addEventListener('DOMContentLoaded', function () {

    // --- DADOS DE EXEMPLO ---
    const transacoesExemplo = [
        { id: 1, descricao: 'Salário de Outubro', valor: 6200.00, tipo: 'Receita', categoria: 'Salário', data: '01/10/2025' },
        { id: 2, descricao: 'Freelance de Design', valor: 1250.50, tipo: 'Receita', categoria: 'Extra', data: '05/10/2025' },
        { id: 3, descricao: 'Aluguel', valor: 1500.00, tipo: 'Despesa', categoria: 'Moradia', data: '07/10/2025' },
        { id: 4, descricao: 'Supermercado', valor: 631.25, tipo: 'Despesa', categoria: 'Alimentação', data: '08/10/2025' },
    ];
    const categoriasExemplo = ['Salário', 'Moradia', 'Alimentação', 'Extra', 'Lazer'];

    // --- FUNÇÕES COMPARTILHADAS (app.js) ---
    function initAppStorage() {
        if (!localStorage.getItem('transacoes')) {
            localStorage.setItem('transacoes', JSON.stringify(transacoesExemplo));
        }
        if (!localStorage.getItem('categorias')) {
            localStorage.setItem('categorias', JSON.stringify(categoriasExemplo));
        }
    }

    function formatCurrency(value) {
        // Verifica se o valor é um número antes de formatar
        if (typeof value !== 'number' || isNaN(value)) {
            value = 0; // Define como 0 se não for um número válido
        }
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function renderizarTransacoes(elementId, limit = null) {
        const transactionList = document.getElementById(elementId);
        if (!transactionList) return; // Se o elemento não existe na página, não faz nada
        const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
        transactionList.innerHTML = '';
        if (transacoes.length === 0) {
            transactionList.innerHTML = '<p class="text-center text-muted">Nenhuma transação encontrada.</p>';
            return;
        }
        // Ordena as transações pela data (mais recentes primeiro)
        const transacoesOrdenadas = [...transacoes].sort((a, b) => {
            // Converte a data dd/mm/yyyy para yyyy-mm-dd para comparação correta
            const dataA = a.data ? new Date(a.data.split('/').reverse().join('-')) : new Date(0);
            const dataB = b.data ? new Date(b.data.split('/').reverse().join('-')) : new Date(0);
            return dataB - dataA; // Ordena do mais recente para o mais antigo
        });
        const transacoesParaExibir = limit ? transacoesOrdenadas.slice(0, limit) : transacoesOrdenadas;
        transacoesParaExibir.forEach(t => {
            const itemClass = t.tipo === 'Receita' ? 'receita' : 'despesa';
            const sign = t.tipo === 'Receita' ? '+' : '-';
            const categoriaDisplay = t.categoria ? `<small class="fw-normal text-muted">(${t.categoria})</small>` : ''; // Mostra categoria se existir
            const itemHTML = `
                <div class="transaction-item ${itemClass}">
                    <div class="flex-grow-1">
                        <h6 class="mb-0 fw-bold">${t.descricao || 'Sem descrição'} ${categoriaDisplay}</h6>
                        <small class="text-muted">${t.data || 'Sem data'}</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <h6 class="mb-0 fw-bold transaction-value ${itemClass} me-3">${sign} ${formatCurrency(t.valor)}</h6>
                        <button class="btn btn-sm btn-delete text-danger" data-id="${t.id}" title="Apagar transação">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </div>
                </div>
            `;
            transactionList.insertAdjacentHTML('beforeend', itemHTML);
        });
    }

    function deletarTransacao(id, callbackRender) {
        let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
        const transacoesAtualizadas = transacoes.filter(t => t.id !== id);
        localStorage.setItem('transacoes', JSON.stringify(transacoesAtualizadas));
        if (callbackRender) callbackRender(); // Re-renderiza a lista após deletar
    }

    // Função para configurar os botões de deletar em uma lista específica
    function setupDeleteListeners(elementId, callbackRender) {
        const transactionList = document.getElementById(elementId);
        if (!transactionList) return; // Sai se a lista não existe nesta página

        // Usa delegação de eventos para performance
        transactionList.addEventListener('click', function(event) {
            const deleteButton = event.target.closest('.btn-delete');
            if (deleteButton) {
                const transactionId = parseInt(deleteButton.dataset.id, 10);
                if (!isNaN(transactionId) && confirm('Tem certeza que deseja apagar esta transação?')) {
                    deletarTransacao(transactionId, callbackRender);
                }
            }
        });
    }

    function carregarCategorias() {
        const selectCategoria = document.getElementById('transacaoCategoria');
        if (!selectCategoria) return; // Sai se o select não existe nesta página

        const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
        selectCategoria.innerHTML = '<option value="" selected disabled>Selecione...</option>';
        categorias.forEach(cat => {
            const novaOpcao = new Option(cat, cat);
            selectCategoria.add(novaOpcao, null);
        });
    }

    function setupCategoryModal() {
        const salvarCategoriaBtn = document.getElementById('salvarNovaCategoriaBtn');
        const nomeNovaCategoriaInput = document.getElementById('novaCategoriaNome');
        const novaCategoriaModalEl = document.getElementById('novaCategoriaModal');
        const selectCategoriaTransacao = document.getElementById('transacaoCategoria'); // Referência ao select principal

        // Sai se os elementos do modal não existirem nesta página
        if (!salvarCategoriaBtn || !nomeNovaCategoriaInput || !novaCategoriaModalEl || !selectCategoriaTransacao) return;

        const novaCategoriaModal = new bootstrap.Modal(novaCategoriaModalEl);

        salvarCategoriaBtn.addEventListener('click', function() {
            const nomeNovaCategoria = nomeNovaCategoriaInput.value.trim();
            if (nomeNovaCategoria) {
                const categorias = JSON.parse(localStorage.getItem('categorias')) || [];
                if (!categorias.includes(nomeNovaCategoria)) {
                    categorias.push(nomeNovaCategoria);
                    localStorage.setItem('categorias', JSON.stringify(categorias));
                    carregarCategorias(); // Recarrega todas as categorias no select
                    // Seleciona a categoria recém-criada
                    selectCategoriaTransacao.value = nomeNovaCategoria;
                } else {
                    // Se já existe, apenas seleciona
                    selectCategoriaTransacao.value = nomeNovaCategoria;
                }
                nomeNovaCategoriaInput.value = ''; // Limpa o input
                nomeNovaCategoriaInput.classList.remove('is-invalid'); // Remove erro se houver
                novaCategoriaModal.hide(); // Fecha o modal
            } else {
                 nomeNovaCategoriaInput.classList.add('is-invalid'); // Mostra erro se vazio
            }
        });

         // Limpa a validação de erro quando o usuário digita
        nomeNovaCategoriaInput.addEventListener('input', function() {
            if (nomeNovaCategoriaInput.classList.contains('is-invalid')) {
                nomeNovaCategoriaInput.classList.remove('is-invalid');
            }
        });
    }

    // Adiciona a classe 'active' ao link de navegação da página atual
    function highlightActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html'; // Assume dashboard se for a raiz
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            // Remove a classe 'active' de todos primeiro
            link.classList.remove('active');
            // Adiciona 'active' se o href do link corresponder à página atual
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // --- LÓGICA ESPECÍFICA DE CADA PÁGINA ---

    // 1. Lógica do DASHBOARD (baseado em script.js)
    const dashboardElement = document.getElementById('saldo-atual'); // Elemento único do dashboard
    if (dashboardElement) {
        const novaTransacaoModal = new bootstrap.Modal(document.getElementById('novaTransacaoModal'));
        const formNovaTransacao = document.getElementById('formNovaTransacao');
        const transacaoDataInput = document.getElementById('transacaoData');

        function setDefaultDate() {
            if (!transacaoDataInput) return;
            const today = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD
            transacaoDataInput.value = today;
        }

        function atualizarCardsDashboard() {
            const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
            const hoje = new Date();
            const mesAtual = hoje.getMonth();
            const anoAtual = hoje.getFullYear();

            const transacoesDoMes = transacoes.filter(t => {
                if (!t.data) return false;
                const [dia, mes, ano] = t.data.split('/');
                if (!dia || !mes || !ano) return false; // Pula se a data for inválida
                const dataDaTransacao = new Date(ano, mes - 1, dia); // Mês é 0-11
                return dataDaTransacao.getMonth() === mesAtual && dataDaTransacao.getFullYear() === anoAtual;
            });

            const totalReceitas = transacoesDoMes
                .filter(t => t.tipo === 'Receita')
                .reduce((acc, t) => acc + t.valor, 0);

            const totalDespesas = transacoesDoMes
                .filter(t => t.tipo === 'Despesa')
                .reduce((acc, t) => acc + t.valor, 0);

            const saldoAtual = totalReceitas - totalDespesas;

            document.getElementById('saldo-atual').textContent = formatCurrency(saldoAtual);
            document.getElementById('total-receitas').textContent = formatCurrency(totalReceitas);
            document.getElementById('total-despesas').textContent = formatCurrency(totalDespesas);
        }

        function renderizarPaginaDashboard() {
            renderizarTransacoes('transaction-list', 5); // Mostra só as 4 últimas no dashboard
            atualizarCardsDashboard(); // Atualiza os cards
        }

        if (formNovaTransacao) {
            formNovaTransacao.addEventListener('submit', function(event) {
                event.preventDefault();

                const dateValue = transacaoDataInput.value;
                let dataFormatada = '';
                if (dateValue) {
                    const [year, month, day] = dateValue.split('-');
                    dataFormatada = `${day}/${month}/${year}`;
                } else {
                    dataFormatada = new Date().toLocaleDateString('pt-BR'); // Usa data atual se não preenchida
                }

                const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
                const novaTransacao = {
                    id: Date.now(),
                    descricao: document.getElementById('transacaoDescricao').value,
                    valor: parseFloat(document.getElementById('transacaoValor').value),
                    tipo: document.getElementById('transacaoTipo').value,
                    categoria: document.getElementById('transacaoCategoria').value,
                    data: dataFormatada,
                };
                transacoes.push(novaTransacao);
                localStorage.setItem('transacoes', JSON.stringify(transacoes));

                renderizarPaginaDashboard(); // Re-renderiza o dashboard
                formNovaTransacao.reset();
                setDefaultDate();
                novaTransacaoModal.hide();
            });
        }
        
        // Inicialização específica do Dashboard
        setDefaultDate();
        renderizarPaginaDashboard();
        // Configura delete para a lista do dashboard, re-renderizando o dashboard
        setupDeleteListeners('transaction-list', renderizarPaginaDashboard);
    }

    // 2. Lógica de LANÇAMENTOS 
    const lancamentosListElement = document.getElementById('transaction-list-full'); // ID único da lista em lancamentos.html
    if (lancamentosListElement) {
        
        function renderizarPaginaLancamentos() {
            // Renderiza TODAS as transações
            renderizarTransacoes('transaction-list-full'); 
        }

        // Inicialização da página de Lançamentos
        renderizarPaginaLancamentos();
        // Configura delete para a lista completa, re-renderizando a lista completa
        setupDeleteListeners('transaction-list-full', renderizarPaginaLancamentos);
    }

    // 3. Lógica de RELATÓRIOS (baseado em relatorios.js)
    const categoryChartElement = document.getElementById('categoryChart');
    const incomeExpenseChartElement = document.getElementById('incomeExpenseChart');
    if (categoryChartElement && incomeExpenseChartElement) {
        const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];

        function renderCategoryChart() {
            const ctx = categoryChartElement.getContext('2d');
            const despesas = transacoes.filter(t => t.tipo === 'Despesa');
            
            const gastosPorCategoria = {};
            despesas.forEach(d => {
                const categoria = d.categoria || 'Sem Categoria'; // Agrupa itens sem categoria
                if (gastosPorCategoria[categoria]) {
                    gastosPorCategoria[categoria] += d.valor;
                } else {
                    gastosPorCategoria[categoria] = d.valor;
                }
            });

            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(gastosPorCategoria),
                    datasets: [{
                        label: 'Gasto',
                        data: Object.values(gastosPorCategoria),
                        backgroundColor: [
                            '#e13a3e', '#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb', '#9966ff', '#c9cbcf'
                        ],
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { position: 'top' } }
                }
            });
        }

        function renderIncomeExpenseChart() {
            const ctx = incomeExpenseChartElement.getContext('2d');
            
            // Simplificado para agrupar tudo em um mês
            const totalReceitas = transacoes
                .filter(t => t.tipo === 'Receita')
                .reduce((acc, t) => acc + t.valor, 0);
            const totalDespesas = transacoes
                .filter(t => t.tipo === 'Despesa')
                .reduce((acc, t) => acc + t.valor, 0);

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Mês Atual (Exemplo)'], 
                    datasets: [{
                        label: 'Receitas', data: [totalReceitas], backgroundColor: '#28a745'
                    }, {
                        label: 'Despesas', data: [totalDespesas], backgroundColor: '#e13a3e'
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        }

        renderCategoryChart();
        renderIncomeExpenseChart();
    }

    // 4. Lógica do PERFIL (baseado em perfil.js)
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        // Dados fictícios, pois não temos login real
        const usuarioFicticio = {
            nome: "Giovana", tipo: "Pessoa Física", cpf: "123.456.789-00", dataNascimento: "15/05/1995"
        };
        document.getElementById('user-name').textContent = `${usuarioFicticio.nome} (${usuarioFicticio.tipo})`;
        document.getElementById('user-cpf').textContent = usuarioFicticio.cpf;
        document.getElementById('user-birthdate').textContent = usuarioFicticio.dataNascimento;
    }

    // 5. LÓGICA DO CADASTRO 
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o envio do formulário

            // Coleta os dados do formulário
            const usuario = {
                nome: document.getElementById('cadastro-nome').value,
                cpf: document.getElementById('cadastro-cpf').value,
                dataNascimento: document.getElementById('cadastro-nascimento').value,
                email: document.getElementById('cadastro-email').value,
                // NOTA: Em um app real, a senha seria criptografada antes de salvar!
            };

            // Salva o objeto do usuário no localStorage
            localStorage.setItem('usuario', JSON.stringify(usuario));

            // Avisa o usuário e redireciona para a página de login
            alert('Cadastro realizado com sucesso! Você será redirecionado para a página de login.');
            window.location.href = '/login'; // Usa a rota do Flask
        });
    }

    // 6. LÓGICA DO PERFIL 
    const perfilUserNameElement = document.getElementById('user-name');
    if (perfilUserNameElement) {
        // Tenta carregar os dados do usuário do localStorage
        const usuarioString = localStorage.getItem('usuario');
        
        if (usuarioString) {
            const usuario = JSON.parse(usuarioString);

            // Converte a data yyyy-mm-dd para dd/mm/yyyy
            const [ano, mes, dia] = usuario.dataNascimento.split('-');
            const dataFormatada = `${dia}/${mes}/${ano}`;

            // Preenche os campos na página com os dados salvos
            document.getElementById('user-name').textContent = usuario.nome;
            document.getElementById('user-email').textContent = usuario.email;
            document.getElementById('user-cpf').textContent = usuario.cpf;
            document.getElementById('user-birthdate').textContent = dataFormatada;
        } else {
            // Se não encontrar dados, exibe uma mensagem padrão
            document.getElementById('user-name').textContent = "Nenhum usuário encontrado";
        }
    }

    // --- INICIALIZAÇÃO GERAL (roda em todas as páginas) ---
    initAppStorage(); 
    carregarCategorias(); 
    setupCategoryModal(); 
    highlightActiveLink(); 


}); // Fim do DOMContentLoaded