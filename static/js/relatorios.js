document.addEventListener('DOMContentLoaded', function() {
    const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];

    // --- GRÁFICO 1: Despesas por Categoria (Gráfico de Rosca) ---
    function renderCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        const despesas = transacoes.filter(t => t.tipo === 'Despesa');
        
        const gastosPorCategoria = {};
        despesas.forEach(d => {
            if (gastosPorCategoria[d.categoria]) {
                gastosPorCategoria[d.categoria] += d.valor;
            } else {
                gastosPorCategoria[d.categoria] = d.valor;
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
                        '#e13a3e', '#ff6384', '#ff9f40', '#ffcd56', '#4bc0c0', '#36a2eb', '#9966ff'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // --- GRÁFICO 2: Receitas vs Despesas (Gráfico de Barras) ---
    function renderIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');

        // Para este exemplo, vamos agrupar tudo em um único mês (Outubro/2025)
        // Em uma aplicação real, você agruparia por vários meses.
        const totalReceitas = transacoes
            .filter(t => t.tipo === 'Receita')
            .reduce((acc, t) => acc + t.valor, 0);

        const totalDespesas = transacoes
            .filter(t => t.tipo === 'Despesa')
            .reduce((acc, t) => acc + t.valor, 0);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Outubro 2025'], // Em uma app real: ['Jan', 'Fev', 'Mar', ...]
                datasets: [{
                    label: 'Receitas',
                    data: [totalReceitas],
                    backgroundColor: '#28a745',
                    borderColor: '#28a745',
                    borderWidth: 1
                }, {
                    label: 'Despesas',
                    data: [totalDespesas],
                    backgroundColor: '#e13a3e',
                    borderColor: '#e13a3e',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Renderiza os gráficos
    renderCategoryChart();
    renderIncomeExpenseChart();
});