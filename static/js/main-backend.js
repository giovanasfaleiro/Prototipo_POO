document.addEventListener('DOMContentLoaded', function () {

    function formatCurrency(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            value = 0;
        }
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    async function renderizarTransacoes(elementId, limit = null) {
        const transactionList = document.getElementById(elementId);
        if (!transactionList) return;

        try {
            const transacoes = await listarTransacoes();
            transactionList.innerHTML = '';

            if (transacoes.length === 0) {
                transactionList.innerHTML = '<p class="text-center text-muted">Nenhuma transação encontrada.</p>';
                return;
            }

            const transacoesOrdenadas = [...transacoes].sort((a, b) => {
                const dataA = a.data ? new Date(a.data.split('/').reverse().join('-')) : new Date(0);
                const dataB = b.data ? new Date(b.data.split('/').reverse().join('-')) : new Date(0);
                return dataB - dataA;
            });

            const transacoesParaExibir = limit ? transacoesOrdenadas.slice(0, limit) : transacoesOrdenadas;

            transacoesParaExibir.forEach(t => {
                const itemClass = t.tipo === 'Receita' ? 'receita' : 'despesa';
                const sign = t.tipo === 'Receita' ? '+' : '-';
                const categoriaDisplay = t.categoria ? `<small class="fw-normal text-muted">(${t.categoria})</small>` : '';
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
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            transactionList.innerHTML = '<p class="text-center text-danger">Erro ao carregar transações.</p>';
        }
    }

    function setupDeleteListeners(elementId, callbackRender) {
        const transactionList = document.getElementById(elementId);
        if (!transactionList) return;

        transactionList.addEventListener('click', async function(event) {
            const deleteButton = event.target.closest('.btn-delete');
            if (deleteButton) {
                const transactionId = parseInt(deleteButton.dataset.id, 10);
                if (!isNaN(transactionId) && confirm('Tem certeza que deseja apagar esta transação?')) {
                    try {
                        await deletarTransacao(transactionId);
                        if (callbackRender) callbackRender();
                    } catch (error) {
                        alert('Erro ao deletar transação: ' + error.message);
                    }
                }
            }
        });
    }

    async function carregarCategorias() {
        const selectCategoria = document.getElementById('transacaoCategoria');
        if (!selectCategoria) return;

        try {
            const categorias = await listarCategorias();
            selectCategoria.innerHTML = '<option value="" selected disabled>Selecione...</option>';
            categorias.forEach(cat => {
                const novaOpcao = new Option(cat.nome, cat.nome);
                selectCategoria.add(novaOpcao, null);
            });
        } catch (error) {
            console.error('Erro ao carregar categorias:', error);
        }
    }

    function setupCategoryModal() {
        const salvarCategoriaBtn = document.getElementById('salvarNovaCategoriaBtn');
        const nomeNovaCategoriaInput = document.getElementById('novaCategoriaNome');
        const novaCategoriaModalEl = document.getElementById('novaCategoriaModal');
        const selectCategoriaTransacao = document.getElementById('transacaoCategoria');

        if (!salvarCategoriaBtn || !nomeNovaCategoriaInput || !novaCategoriaModalEl || !selectCategoriaTransacao) return;

        const novaCategoriaModal = new bootstrap.Modal(novaCategoriaModalEl);

        salvarCategoriaBtn.addEventListener('click', async function() {
            const nomeNovaCategoria = nomeNovaCategoriaInput.value.trim();
            if (nomeNovaCategoria) {
                try {
                    await criarCategoria(nomeNovaCategoria);
                    await carregarCategorias();
                    selectCategoriaTransacao.value = nomeNovaCategoria;
                    nomeNovaCategoriaInput.value = '';
                    nomeNovaCategoriaInput.classList.remove('is-invalid');
                    novaCategoriaModal.hide();
                } catch (error) {
                    nomeNovaCategoriaInput.classList.add('is-invalid');
                    alert('Erro ao criar categoria: ' + error.message);
                }
            } else {
                nomeNovaCategoriaInput.classList.add('is-invalid');
            }
        });

        nomeNovaCategoriaInput.addEventListener('input', function() {
            if (nomeNovaCategoriaInput.classList.contains('is-invalid')) {
                nomeNovaCategoriaInput.classList.remove('is-invalid');
            }
        });
    }

    // ==================== LÓGICA DO DASHBOARD ====================
    const dashboardElement = document.getElementById('saldo-atual');
    if (dashboardElement) {
        const novaTransacaoModal = new bootstrap.Modal(document.getElementById('novaTransacaoModal'));
        const formNovaTransacao = document.getElementById('formNovaTransacao');
        const transacaoDataInput = document.getElementById('transacaoData');

        function setDefaultDate() {
            if (!transacaoDataInput) return;
            const today = new Date().toLocaleDateString('en-CA');
            transacaoDataInput.value = today;
        }

        async function atualizarCardsDashboard() {
            try {
                const estatisticas = await obterEstatisticasDashboard();
                document.getElementById('saldo-atual').textContent = formatCurrency(estatisticas.saldo_atual);
                document.getElementById('total-receitas').textContent = formatCurrency(estatisticas.total_receitas);
                document.getElementById('total-despesas').textContent = formatCurrency(estatisticas.total_despesas);

                const metaAlert = document.getElementById('meta-alert');
                if (metaAlert) {
                    if (estatisticas.meta_despesa_mensal != null && estatisticas.total_despesas > estatisticas.meta_despesa_mensal) {
                        metaAlert.classList.remove('d-none');
                    } else {
                        metaAlert.classList.add('d-none');
                    }
                }
            } catch (error) {
                console.error('Erro ao atualizar dashboard:', error);
            }
        }

        async function renderizarPaginaDashboard() {
            await renderizarTransacoes('transaction-list', 5);
            await atualizarCardsDashboard();
        }

        if (formNovaTransacao) {
            formNovaTransacao.addEventListener('submit', async function(event) {
                event.preventDefault();

                const dateValue = transacaoDataInput.value;
                const dataFormatada = dateValue || new Date().toISOString().split('T')[0];

                const dados = {
                    descricao: document.getElementById('transacaoDescricao').value,
                    valor: parseFloat(document.getElementById('transacaoValor').value),
                    tipo: document.getElementById('transacaoTipo').value,
                    categoria: document.getElementById('transacaoCategoria').value,
                    data: dataFormatada
                };

                try {
                    await criarTransacao(dados);
                    await renderizarPaginaDashboard();
                    formNovaTransacao.reset();
                    setDefaultDate();
                    novaTransacaoModal.hide();
                } catch (error) {
                    alert('Erro ao criar transação: ' + error.message);
                }
            });
        }

        setDefaultDate();
        renderizarPaginaDashboard();
        setupDeleteListeners('transaction-list', renderizarPaginaDashboard);
    }

    // ==================== LÓGICA DE LANÇAMENTOS ====================
    const lancamentosListElement = document.getElementById('transaction-list-full');
    if (lancamentosListElement) {
        async function renderizarPaginaLancamentos() {
            await renderizarTransacoes('transaction-list-full');
        }

        renderizarPaginaLancamentos();
        setupDeleteListeners('transaction-list-full', renderizarPaginaLancamentos);

        const formNovaTransacaoLanc = document.getElementById('formNovaTransacao');
        if (formNovaTransacaoLanc) {
            const novaTransacaoModalLanc = new bootstrap.Modal(document.getElementById('novaTransacaoModal'));
            const transacaoDataInputLanc = document.getElementById('transacaoData');

            function setDefaultDateLanc() {
                if (transacaoDataInputLanc) {
                    const today = new Date().toLocaleDateString('en-CA');
                    transacaoDataInputLanc.value = today;
                }
            }

            formNovaTransacaoLanc.addEventListener('submit', async function(event) {
                event.preventDefault();

                const dateValue = transacaoDataInputLanc.value;
                const dataFormatada = dateValue || new Date().toISOString().split('T')[0];

                const dados = {
                    descricao: document.getElementById('transacaoDescricao').value,
                    valor: parseFloat(document.getElementById('transacaoValor').value),
                    tipo: document.getElementById('transacaoTipo').value,
                    categoria: document.getElementById('transacaoCategoria').value,
                    data: dataFormatada
                };

                try {
                    await criarTransacao(dados);
                    await renderizarPaginaLancamentos();
                    formNovaTransacaoLanc.reset();
                    setDefaultDateLanc();
                    novaTransacaoModalLanc.hide();
                } catch (error) {
                    alert('Erro ao criar transação: ' + error.message);
                }
            });

            setDefaultDateLanc();
        }
    }

    // ==================== LÓGICA DE RELATÓRIOS ====================
    const categoryChartElement = document.getElementById('categoryChart');
    const incomeExpenseChartElement = document.getElementById('incomeExpenseChart');
    if (categoryChartElement && incomeExpenseChartElement) {
        async function renderCategoryChart() {
            try {
                const dados = await obterDespesasPorCategoria();
                const ctx = categoryChartElement.getContext('2d');

                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(dados),
                        datasets: [{
                            label: 'Gasto',
                            data: Object.values(dados),
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
            } catch (error) {
                console.error('Erro ao renderizar gráfico de categorias:', error);
            }
        }

        async function renderIncomeExpenseChart() {
            try {
                const dados = await obterReceitasVsDespesas();
                const ctx = incomeExpenseChartElement.getContext('2d');

                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Mês Atual'],
                        datasets: [{
                            label: 'Receitas',
                            data: [dados.receitas],
                            backgroundColor: '#28a745'
                        }, {
                            label: 'Despesas',
                            data: [dados.despesas],
                            backgroundColor: '#e13a3e'
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: { y: { beginAtZero: true } }
                    }
                });
            } catch (error) {
                console.error('Erro ao renderizar gráfico de receitas vs despesas:', error);
            }
        }

        renderCategoryChart();
        renderIncomeExpenseChart();
    }

    // ==================== LÓGICA DO PERFIL ====================
    const userNameElement = document.getElementById('user-name');
    if (userNameElement) {
        async function carregarPerfil() {
            try {
                const usuario = await obterUsuarioAtual();
                document.getElementById('user-name').textContent = `${usuario.nome} (${usuario.tipo})`;
                if (usuario.cpf) {
                    document.getElementById('user-cpf').textContent = usuario.cpf;
                } else {
                    document.getElementById('user-cpf').textContent = '---';
                }
                if (usuario.data_nascimento) {
                    document.getElementById('user-birthdate').textContent = usuario.data_nascimento;
                } else {
                    document.getElementById('user-birthdate').textContent = '---';
                }
                const emailElement = document.getElementById('user-email');
                if (emailElement) {
                    emailElement.textContent = usuario.email;
                }

                const metaInput = document.getElementById('meta-despesas');
                if (metaInput) {
                    metaInput.value = usuario.meta_despesa_mensal != null ? usuario.meta_despesa_mensal : '';
                }
            } catch (error) {
                console.error('Erro ao carregar perfil:', error);
                document.getElementById('user-name').textContent = "Erro ao carregar dados";
            }
        }

        carregarPerfil();

        const metaForm = document.getElementById('meta-form');
        if (metaForm) {
            metaForm.addEventListener('submit', async function(event) {
                event.preventDefault();
                const metaInput = document.getElementById('meta-despesas');
                const feedback = document.getElementById('meta-feedback');
                let value = metaInput.value;
                let meta = value === '' ? null : parseFloat(value);

                try {
                    await atualizarMetaDespesa(meta);
                    if (feedback) {
                        feedback.classList.remove('d-none');
                        setTimeout(() => feedback.classList.add('d-none'), 3000);
                    }
                } catch (error) {
                    alert('Erro ao salvar meta: ' + error.message);
                }
            });
        }
    }

    // ==================== INICIALIZAÇÃO GERAL ====================
    carregarCategorias();
    setupCategoryModal();
});

