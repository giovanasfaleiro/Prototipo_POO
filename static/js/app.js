// ======================================================
// APP.JS - LÓGICA CENTRAL COMPARTILHADA
// ======================================================

// --- DADOS DE EXEMPLO ---
const transacoesExemplo = [
    { id: 1, descricao: 'Salário de Outubro', valor: 6200.00, tipo: 'Receita', categoria: 'Salário', data: '01/10/2025' },
    { id: 2, descricao: 'Freelance de Design', valor: 1250.50, tipo: 'Receita', categoria: 'Extra', data: '05/10/2025' },
    { id: 3, descricao: 'Aluguel', valor: 1500.00, tipo: 'Despesa', categoria: 'Moradia', data: '07/10/2025' },
    { id: 4, descricao: 'Supermercado', valor: 631.25, tipo: 'Despesa', categoria: 'Alimentação', data: '08/10/2025' },
];
const categoriasExemplo = ['Salário', 'Moradia', 'Alimentação', 'Extra', 'Lazer'];

// --- FUNÇÕES COMPARTILHADAS ---
function initAppStorage() {
    if (!localStorage.getItem('transacoes')) {
        localStorage.setItem('transacoes', JSON.stringify(transacoesExemplo));
    }
    if (!localStorage.getItem('categorias')) {
        localStorage.setItem('categorias', JSON.stringify(categoriasExemplo));
    }
}

function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderizarTransacoes(elementId, limit = null) {
    const transactionList = document.getElementById(elementId);
    if (!transactionList) return;
    const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
    transactionList.innerHTML = '';
    if (transacoes.length === 0) {
        transactionList.innerHTML = '<p class="text-center text-muted">Nenhuma transação encontrada.</p>';
        return;
    }
    const transacoesOrdenadas = [...transacoes].sort((a, b) => {
        const dataA = new Date(a.data.split('/').reverse().join('-'));
        const dataB = new Date(b.data.split('/').reverse().join('-'));
        return dataB - dataA;
    });
    const transacoesParaExibir = limit ? transacoesOrdenadas.slice(0, limit) : transacoesOrdenadas;
    transacoesParaExibir.forEach(t => {
        const itemClass = t.tipo === 'Receita' ? 'receita' : 'despesa';
        const sign = t.tipo === 'Receita' ? '+' : '-';
        const itemHTML = `
            <div class="transaction-item ${itemClass}">
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold">${t.descricao} <small class="fw-normal text-muted">(${t.categoria})</small></h6>
                    <small class="text-muted">${t.data}</small>
                </div>
                <div class="d-flex align-items-center">
                    <h6 class="mb-0 fw-bold transaction-value ${itemClass} me-3">${sign} ${formatCurrency(t.valor)}</h6>
                    <button class="btn btn-sm btn-delete" data-id="${t.id}" title="Apagar transação">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </div>
        `;
        transactionList.insertAdjacentHTML('beforeend', itemHTML);
    });
}

function deletarTransacao(id, callbackRender) {
    let transacoes = JSON.parse(localStorage.getItem('transacoes'));
    const transacoesAtualizadas = transacoes.filter(t => t.id !== id);
    localStorage.setItem('transacoes', JSON.stringify(transacoesAtualizadas));
    if (callbackRender) callbackRender();
}

function setupDeleteListeners(elementId, callbackRender) {
    const transactionList = document.getElementById(elementId);
    if (!transactionList) return;
    transactionList.addEventListener('click', function(event) {
        const deleteButton = event.target.closest('.btn-delete');
        if (deleteButton) {
            const transactionId = parseInt(deleteButton.dataset.id, 10);
            if (confirm('Tem certeza que deseja apagar esta transação?')) {
                deletarTransacao(transactionId, callbackRender);
            }
        }
    });
}

function carregarCategorias() {
    const selectCategoria = document.getElementById('transacaoCategoria');
    if (!selectCategoria) return;
    const categorias = JSON.parse(localStorage.getItem('categorias'));
    selectCategoria.innerHTML = '<option value="" selected disabled>Selecione...</option>';
    categorias.forEach(cat => {
        const novaOpcao = new Option(cat, cat);
        selectCategoria.add(novaOpcao, null);
    });
}

function setupCategoryModal() {
    const salvarCategoriaBtn = document.getElementById('salvarNovaCategoriaBtn');
    if (!salvarCategoriaBtn) return;
    const nomeNovaCategoriaInput = document.getElementById('novaCategoriaNome');
    const novaCategoriaModalEl = document.getElementById('novaCategoriaModal');
    const novaCategoriaModal = new bootstrap.Modal(novaCategoriaModalEl);
    salvarCategoriaBtn.addEventListener('click', function() {
        const nomeNovaCategoria = nomeNovaCategoriaInput.value.trim();
        if (nomeNovaCategoria) {
            const categorias = JSON.parse(localStorage.getItem('categorias'));
            if (!categorias.includes(nomeNovaCategoria)) {
                categorias.push(nomeNovaCategoria);
                localStorage.setItem('categorias', JSON.stringify(categorias));
                carregarCategorias();
                document.getElementById('transacaoCategoria').value = nomeNovaCategoria;
            }
            nomeNovaCategoriaInput.value = '';
            novaCategoriaModal.hide();
        }
    });
}

// ** FUNÇÃO CORRIGIDA/ADICIONADA AQUI **
// Adiciona a classe 'active' ao link de navegação da página atual
function highlightActiveLink() {
    // Pega o nome do arquivo da URL atual (ex: "dashboard.html")
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        // Compara o href do link com a página atual
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Chama a função para destacar o link ativo assim que a página carregar
document.addEventListener('DOMContentLoaded', highlightActiveLink);