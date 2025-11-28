document.addEventListener('DOMContentLoaded', function () {
    
    function renderizarPaginaLancamentos() {
        renderizarTransacoes('transaction-list-full'); 
    }
    
    initAppStorage();
    renderizarPaginaLancamentos();
    setupDeleteListeners('transaction-list-full', renderizarPaginaLancamentos);
});