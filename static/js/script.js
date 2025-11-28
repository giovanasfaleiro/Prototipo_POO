document.addEventListener('DOMContentLoaded', function () {
    const novaTransacaoModal = new bootstrap.Modal(document.getElementById('novaTransacaoModal'));
    const formNovaTransacao = document.getElementById('formNovaTransacao');
    const transacaoDataInput = document.getElementById('transacaoData');

    function setDefaultDate() {
        const today = new Date().toLocaleDateString('en-CA');
        transacaoDataInput.value = today;
    }
    
    function atualizarCards() {
        const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        const transacoesDoMes = transacoes.filter(t => {
            const [dia, mes, ano] = t.data.split('/');
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
        renderizarTransacoes('transaction-list', 4);
        atualizarCards();
    }
    
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
    
    initAppStorage(); 
    carregarCategorias(); 
    setupCategoryModal(); 
    setDefaultDate();
    renderizarPaginaDashboard(); 
    setupDeleteListeners('transaction-list', renderizarPaginaDashboard); 
});