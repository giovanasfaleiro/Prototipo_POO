// ======================================================
// LANCAMENTOS.JS - LÓGICA ESPECÍFICA DE LANÇAMENTOS
// ======================================================

document.addEventListener('DOMContentLoaded', function () {
    
    function renderizarPaginaLancamentos() {
        // Chama a função de app.js para renderizar TODAS as transações
        // no elemento com id 'transaction-list-full'
        renderizarTransacoes('transaction-list-full'); 
    }
    
    // --- INICIALIZAÇÃO DA PÁGINA ---
    initAppStorage(); // Garante que os dados de exemplo existam no localStorage
    renderizarPaginaLancamentos(); // Executa a renderização da lista
    setupDeleteListeners('transaction-list-full', renderizarPaginaLancamentos); // Configura os botões de deletar
});