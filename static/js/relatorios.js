document.addEventListener('DOMContentLoaded', function() {
    const transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];

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

    function renderIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart').getContext('2d');

        const totalReceitas = transacoes
            .filter(t => t.tipo === 'Receita')
            .reduce((acc, t) => acc + t.valor, 0);

        const totalDespesas = transacoes
            .filter(t => t.tipo === 'Despesa')
            .reduce((acc, t) => acc + t.valor, 0);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Outubro 2025'],
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

    renderCategoryChart();
    renderIncomeExpenseChart();
});