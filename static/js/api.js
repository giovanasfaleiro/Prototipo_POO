const API_BASE_URL = '/api';

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'same-origin',
            ...options
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisição');
        }

        return data;
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

// ==================== AUTENTICAÇÃO ====================

async function cadastrarUsuario(dados) {
    return await apiRequest('/cadastro', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function fazerLogin(email, senha) {
    return await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha })
    });
}

async function fazerLogout() {
    return await apiRequest('/logout', {
        method: 'POST'
    });
}

async function obterUsuarioAtual() {
    return await apiRequest('/usuario/atual');
}

async function atualizarMetaDespesa(meta) {
    return await apiRequest('/usuario/meta', {
        method: 'PUT',
        body: JSON.stringify({ meta_despesa_mensal: meta })
    });
}

// ==================== TRANSAÇÕES ====================

async function listarTransacoes() {
    return await apiRequest('/transacoes');
}

async function criarTransacao(dados) {
    return await apiRequest('/transacoes', {
        method: 'POST',
        body: JSON.stringify(dados)
    });
}

async function deletarTransacao(id) {
    return await apiRequest(`/transacoes/${id}`, {
        method: 'DELETE'
    });
}

async function atualizarTransacao(id, dados) {
    return await apiRequest(`/transacoes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dados)
    });
}

// ==================== CATEGORIAS ====================

async function listarCategorias() {
    return await apiRequest('/categorias');
}

async function criarCategoria(nome) {
    return await apiRequest('/categorias', {
        method: 'POST',
        body: JSON.stringify({ nome })
    });
}

async function deletarCategoria(id) {
    return await apiRequest(`/categorias/${id}`, {
        method: 'DELETE'
    });
}

// ==================== DASHBOARD E RELATÓRIOS ====================

async function obterEstatisticasDashboard() {
    return await apiRequest('/dashboard/estatisticas');
}

async function obterDespesasPorCategoria() {
    return await apiRequest('/relatorios/despesas-por-categoria');
}

async function obterReceitasVsDespesas() {
    return await apiRequest('/relatorios/receitas-vs-despesas');
}

