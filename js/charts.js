/**
 * Configurações de Gráficos (Chart.js)
 */
const Charts = {
    initVendasChart(ctx, labels = [], data = []) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length ? labels : ['18h', '19h', '20h', '21h', '22h', '23h', '00h'],
                datasets: [{
                    label: 'Vendas (R$)',
                    data: data.length ? data : [120, 450, 890, 1200, 950, 600, 200],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#a0a0a0' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#a0a0a0' }
                    }
                }
            }
        });
    },

    initProdutosChart(ctx, labels = [], data = []) {
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length ? labels : ['Pizza Calabresa', 'X-Burger', 'Pizza 4 Queijos', 'Batata Frita', 'Refrigerante'],
                datasets: [{
                    data: data.length ? data : [35, 25, 20, 15, 40],
                    backgroundColor: [
                        '#e74c3c',
                        '#f39c12',
                        '#f1c40f',
                        '#2ecc71',
                        '#3498db'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a0a0a0', padding: 20 }
                    }
                }
            }
        });
    }
};
