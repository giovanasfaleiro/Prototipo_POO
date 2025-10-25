// ======================================================
// SCRIPT.JS - LÓGICA ESPECÍFICA DO DASHBOARD
// ======================================================

document.addEventListener('DOMContentLoaded', function () {
    // --- ELEMENTOS E MODAIS DA PÁGINA ---
    const novaTransacaoModal = new bootstrap.Modal(document.getElementById('novaTransacaoModal'));
    const formNovaTransacao = document.getElementById('formNovaTransacao');
    const transacaoDataInput = document.getElementById('transacaoData');

    // --- FUNÇÕES ESPECÍFICAS DO DASHBOARD ---

    function setDefaultDate() {
        const today = new Date().toLocaleDateString('en-CA');
        transacaoDataInput.value = today;
    }
    
    // ATUALIZADO: Agora calcula totais apenas para o mês atual
    function atualizarCards() {
        const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        // Filtra as transações para incluir apenas as do mês e ano atuais
        const transacoesDoMes = transacoes.filter(t => {
            const [dia, mes, ano] = t.data.split('/');
            // O mês no objeto Date é baseado em zero (0-11), então subtraímos 1
            const dataDaTransacao = new Date(ano, mes - 1, dia);
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
        renderizarTransacoes('transaction-list', 4); // Continua mostrando só as 4 últimas na lista
        atualizarCards(); // Mas os cards agora calculam com base no mês
    }
    
    // --- EVENT LISTENERS DO DASHBOARD ---
    
    formNovaTransacao.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const dateValue = transacaoDataInput.value; 
        const [year, month, day] = dateValue.split('-');
        const dataFormatada = `${day}/${month}/${year}`;
        
        const transacoes = JSON.parse(localStorage.getItem('transacoes'));
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
        
        renderizarPaginaDashboard();
        formNovaTransacao.reset();
        setDefaultDate();
        novaTransacaoModal.hide();
    });
    
    // --- INICIALIZAÇÃO DA PÁGINA ---
    initAppStorage(); 
    carregarCategorias(); 
    setupCategoryModal(); 
    setDefaultDate();
    renderizarPaginaDashboard(); 
    setupDeleteListeners('transaction-list', renderizarPaginaDashboard); 
});