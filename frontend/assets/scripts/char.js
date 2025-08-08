Chart.defaults.color = '#0000000'
Chart.defaults.font.size = 13;

const mostOfferedCategories = [
    'Limpieza',
    'Organizar eventos',
    'Jardinero',
    'Trabajo pesado',
    'Renovación de fachadas'
];

const statisticsOfferedCategories = [35, 23, 23, 15, 11];

const colors = ['#0074D9', '#FF851B', '#2E86C1', '#FFB800', '#E91E63'];

const OfferedChart = document.getElementById('doughnutOfferedChart').getContext('2d');

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const userLogins = [100, 150, 200, 250, 300, 350, 450, 500, 600, 900, 1100, 1300];

const offersPosted = [5, 10, 20, 30, 40, 34, 60, 70, 55, 89, 100, 150];

const offersApplied = [20, 35, 40, 20, 35, 40, 20, 55, 60, 52, 53, 80];

new Chart(document.getElementById('doughnutOfferedChart'), {
    type: 'doughnut',
    data: {
        labels: mostOfferedCategories,
        datasets: [{
            data: statisticsOfferedCategories,
            backgroundColor: colors,
            borderWidth: 0,
            hoverOffset: 10
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 10
                }
            },
            tooltip: {
                enabled: true
            }
        }
    }
});

// Gráfico 1: Ingresos de usuarios
new Chart(document.getElementById('userLoginChart'), {
    type: 'line',
    data: {
        labels: months,
        datasets: [{
            label: 'Usuarios ingresados',
            data: userLogins,
            backgroundColor: 'rgba(78, 115, 223, 0.4)',
            tension: .5,
            fill: true,
            pointBorderWidth: 6
        }]
    },
    options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: true
            },
            tooltip: {
                enabled: true
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        },
        
    }
});

// Gráfico 2: Postulaciones y aplicaciones
new Chart(document.getElementById('offerApplicationsChart'), {
    type: 'line',
    data: {
        labels: months,
        datasets: [
            {
                label: 'Ofertas publicadas',
                data: offersPosted,
                backgroundColor: '#1cc88a',
                tension: .5,
                pointBorderWidth: 5
            },
            {
                label: 'Usuarios postulados',
                data: offersApplied,
                backgroundColor: '#a3e6cd',
                tension: .5,
                pointBorderWidth: 5
            }
        ]
    },
    options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            },
            tooltip: {
                enabled: true
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});