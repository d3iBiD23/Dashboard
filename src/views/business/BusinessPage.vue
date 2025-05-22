<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar class="porsche-toolbar">
                <ion-buttons slot="start">
                    <ion-menu-button color="dark"></ion-menu-button>
                </ion-buttons>
                <ion-title class="ion-text-center">
                    <div class="title-container">
                        <img src="/porsche-logo.svg" alt="Porsche Logo" class="porsche-logo" />
                        <span>Business</span>
                    </div>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" class="ion-padding porsche-content">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Business</ion-title>
                </ion-toolbar>
            </ion-header>

            <!-- Grid principal del Dashboard -->
            <ion-grid class="dashboard-grid">
                <!-- 🟢 Fila 1: 4 Columnas -->
                <ion-row class="ion-row-1">
                    <ion-col size="6" size-lg="3">
                        <div class="box">
                            <div class="chart-title">Uso de Estadísticas</div>
                            <div class="chart-container">
                                <canvas ref="usageStatsChart"></canvas>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="6" size-lg="3">
                        <div class="box">
                            <div class="chart-title">Satisfacción de Usuario</div>
                            <div class="chart-container">
                                <canvas ref="satisfactionChart"></canvas>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="6" size-lg="3">
                        <div class="box">
                            <div class="chart-title">Adopción de Funcionalidades</div>
                            <div class="chart-container">
                                <div ref="featuresAdoptionChart" class="apex-chart-container"></div>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="6" size-lg="3">
                        <div class="box">
                            <div class="chart-title">Tasa de Abandono</div>
                            <div class="chart-container">
                                <canvas ref="churnRateChart"></canvas>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>

                <!-- 🔵 Fila 2: 2 Columnas -->
                <ion-row class="ion-row-2">
                    <ion-col size="12" size-lg="9">
                        <div class="box">
                            <div class="chart-title">Tendencia de Uso del Mapa de Estaciones</div>
                            <div class="chart-container">
                                <canvas ref="mapUsageChart"></canvas>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="12" size-lg="3">
                        <div class="box">
                            <div class="chart-title">Progreso de KPIs</div>
                            <div class="chart-container kpi-progress">
                                <div v-for="(kpi, index) in kpiProgress" :key="index" class="kpi-progress-item">
                                    <div class="kpi-name">{{ kpi.name }}</div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar"
                                            :style="{ width: `${kpi.progress}%`, backgroundColor: getProgressColor(kpi.progress) }">
                                        </div>
                                    </div>
                                    <div class="progress-text">{{ kpi.progress }}%</div>
                                </div>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>

                <!-- 🟠 Fila 3: 2 Columnas -->
                <ion-row class="ion-row-3">
                    <ion-col size="12" size-lg="6">
                        <div class="box">
                            <div class="chart-title">Correlación Uso vs Satisfacción</div>
                            <div class="chart-container">
                                <div ref="correlationChart" class="apex-chart-container"></div>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="12" size-lg="6">
                        <div class="box">
                            <div class="chart-title">Resumen de KPIs de Negocio</div>
                            <div class="chart-container kpi-summary">
                                <div v-for="(kpi, index) in businessKpis" :key="index" class="kpi-summary-item">
                                    <div class="kpi-summary-title">{{ kpi.title }}</div>
                                    <div class="kpi-summary-description">{{ getKpiMetric(kpi) }}</div>
                                </div>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol } from '@ionic/vue';
import { ref, onMounted, reactive } from 'vue';
import Chart from 'chart.js/auto';
import ApexCharts from 'apexcharts';

// Interfaces
interface SmartElement {
    letter: string;
    content: string;
}

interface SmartGoal {
    id: number;
    title: string;
    description: string;
    smart: SmartElement[];
}

interface KpiProgress {
    name: string;
    progress: number;
}

// Referencias para los charts
const usageStatsChart = ref<HTMLCanvasElement | null>(null);
const satisfactionChart = ref<HTMLCanvasElement | null>(null);
const mapUsageChart = ref<HTMLCanvasElement | null>(null);
const churnRateChart = ref<HTMLCanvasElement | null>(null);
const featuresAdoptionChart = ref<HTMLCanvasElement | null>(null);
const correlationChart = ref<HTMLCanvasElement | null>(null);

// Datos de KPIs de negocio
const businessKpis = reactive<SmartGoal[]>([
    {
        id: 1,
        title: "Uso de estadísticas de conducción",
        description: "Lograr que el 70% de los usuarios activos utilicen la funcionalidad de \"Estadísticas de conducción\" semanalmente en los próximos 4 meses.",
        smart: [
            { letter: "S", content: "Aumentar el uso de la funcionalidad de estadísticas de conducción" },
            { letter: "M", content: "70% de usuarios activos" },
            { letter: "A", content: "mediante mejoras en la visibilidad y utilidad de la función" },
            { letter: "R", content: "KPI: Porcentaje de usuarios que consultan estadísticas de conducción al menos una vez por semana" },
            { letter: "T", content: "en los próximos 4 meses" }
        ]
    },
    {
        id: 2,
        title: "Uso del mapa de estaciones de carga",
        description: "Incrementar en un 30% el uso del mapa de estaciones de carga entre usuarios de vehículos eléctricos en 6 meses.",
        smart: [
            { letter: "S", content: "Incrementar el uso del mapa de estaciones de carga" },
            { letter: "M", content: "Aumento del 30% entre usuarios de vehículos eléctricos" },
            { letter: "A", content: "mediante mejoras en la interfaz y datos actualizados" },
            { letter: "R", content: "KPI: Número de sesiones de usuarios que utilizan el mapa por mes" },
            { letter: "T", content: "en 6 meses" }
        ]
    },
    {
        id: 3,
        title: "Satisfacción del usuario",
        description: "Alcanzar una puntuación promedio de satisfacción del usuario de 4,5/5 en la Play Store y App Store para final de año.",
        smart: [
            { letter: "S", content: "Mejorar la satisfacción del usuario" },
            { letter: "M", content: "Puntuación promedio de 4,5/5" },
            { letter: "A", content: "mediante mejoras en la experiencia de usuario y resolución de problemas" },
            { letter: "R", content: "KPI: Valoración media de la app en plataformas de descarga" },
            { letter: "T", content: "para final de año" }
        ]
    },
    {
        id: 4,
        title: "Adopción de funcionalidades",
        description: "Conseguir que el 50% de los propietarios de Porsche utilicen al menos 3 funcionalidades diferentes en el primer mes tras la descarga.",
        smart: [
            { letter: "S", content: "Aumentar la adopción de múltiples funcionalidades" },
            { letter: "M", content: "50% de propietarios usando al menos 3 funcionalidades" },
            { letter: "A", content: "mediante tutoriales y mejoras en la navegación" },
            { letter: "R", content: "KPI: Número promedio de funcionalidades usadas por usuario en su primer mes" },
            { letter: "T", content: "en el primer mes tras la descarga" }
        ]
    },
    {
        id: 5,
        title: "Reducción de tasa de abandono",
        description: "Reducir la tasa de abandono de la app (churn rate) en un 15% en los próximos 6 meses.",
        smart: [
            { letter: "S", content: "Reducir la tasa de abandono de la app" },
            { letter: "M", content: "Reducción del 15% en la tasa de abandono" },
            { letter: "A", content: "mediante mejoras en la retención y engagement" },
            { letter: "R", content: "KPI: Porcentaje de usuarios que desinstalan la app dentro de los 30 días posteriores a la instalación" },
            { letter: "T", content: "en los próximos 6 meses" }
        ]
    }
]);

// Datos de progreso de KPIs
const kpiProgress = reactive<KpiProgress[]>([
    { name: "Uso de estadísticas", progress: 45 },
    { name: "Uso del mapa", progress: 62 },
    { name: "Satisfacción", progress: 78 },
    { name: "Adopción", progress: 35 },
    { name: "Reducción abandono", progress: 50 }
]);

// Función para obtener el color según el progreso
const getProgressColor = (progress: number): string => {
    if (progress < 30) return '#ff4961';
    if (progress < 70) return '#FFDA00'; // Amarillo Porsche
    return '#2fdf75';
};

// Función para extraer la métrica KPI de un SmartGoal
const getKpiMetric = (kpi: SmartGoal): string => {
    const rElement = kpi.smart.find(element => element.letter === 'R');
    return rElement ? rElement.content : '';
};

// Inicializar los gráficos cuando el componente esté montado
onMounted(() => {
    // 1. Gráfico de barras verticales (Chart.js) - Uso de estadísticas
    if (usageStatsChart.value) {
        const ctx = usageStatsChart.value.getContext('2d')!;
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: '% Usuarios',
                    data: [35, 40, 45, 52, 58, 65],
                    backgroundColor: 'rgba(255, 218, 0, 0.7)', // Amarillo Porsche
                    borderColor: 'rgba(255, 218, 0, 1)', // Amarillo Porsche
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            color: '#000000' // Negro para mejor contraste
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)' // Líneas de cuadrícula sutiles
                        }
                    },
                    x: {
                        ticks: {
                            color: '#000000' // Negro para mejor contraste
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)' // Líneas de cuadrícula sutiles
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#000000' // Negro para mejor contraste
                        }
                    }
                }
            }
        });
    }

    // 2. Gráfico circular (Chart.js) - Satisfacción de usuario
    if (satisfactionChart.value) {
        const ctx = satisfactionChart.value.getContext('2d')!;
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['5★', '4★', '3★', '2★', '1★'],
                datasets: [{
                    data: [45, 30, 15, 7, 3],
                    backgroundColor: [
                        'rgba(255, 218, 0, 0.9)', // Amarillo Porsche
                        'rgba(255, 218, 0, 0.7)',
                        'rgba(255, 218, 0, 0.5)',
                        'rgba(255, 218, 0, 0.3)',
                        'rgba(255, 218, 0, 0.1)'
                    ],
                    borderColor: [
                        'rgba(255, 218, 0, 1)', // Amarillo Porsche
                        'rgba(255, 218, 0, 1)',
                        'rgba(255, 218, 0, 1)',
                        'rgba(255, 218, 0, 1)',
                        'rgba(255, 218, 0, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#000000' // Negro para mejor contraste
                        }
                    }
                }
            }
        });
    }

    // 3. Gráfico de área (ApexCharts) - Adopción de funcionalidades
    if (featuresAdoptionChart.value) {
        const options = {
            series: [{
                name: '1 función',
                data: [80, 82, 85, 88, 90, 92]
            }, {
                name: '2 funciones',
                data: [65, 68, 70, 72, 75, 78]
            }, {
                name: '3+ funciones',
                data: [30, 32, 35, 38, 42, 48]
            }],
            chart: {
                type: 'area',
                height: '100%',
                toolbar: {
                    show: false
                },
                foreColor: '#000000' // Negro para mejor contraste
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2
            },
            xaxis: {
                categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            },
            tooltip: {
                theme: 'light' // Tema claro para el tooltip
            },
            colors: ['#FFDA00', '#D5B800', '#AA9600'], // Variaciones del amarillo Porsche
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 90, 100]
                }
            }
        };

        const chart = new ApexCharts(featuresAdoptionChart.value, options);
        chart.render();
    }

    // 4. Gráfico de líneas (Chart.js) - Tasa de abandono
    if (churnRateChart.value) {
        const ctx = churnRateChart.value.getContext('2d')!;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Tasa de abandono (%)',
                    data: [18, 17.5, 16.8, 16, 15.2, 14.5],
                    fill: false,
                    borderColor: '#000000', // Negro para contraste
                    tension: 0.1,
                    pointBackgroundColor: '#FFDA00' // Amarillo Porsche
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 10,
                        max: 20,
                        ticks: {
                            color: '#000000' // Negro para mejor contraste
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)' // Líneas de cuadrícula sutiles
                        }
                    },
                    x: {
                        ticks: {
                            color: '#000000' // Negro para mejor contraste
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)' // Líneas de cuadrícula sutiles
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#000000' // Negro para mejor contraste
                        }
                    }
                }
            }
        });
    }

    // 5. Gráfico de líneas (Chart.js) - Uso del mapa de estaciones
    if (mapUsageChart.value) {
        const ctx = mapUsageChart.value.getContext('2d')!;
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'Sesiones 2023',
                    data: [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300],
                    borderColor: '#000000', // Negro para contraste
                    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Negro transparente
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Sesiones 2024',
                    data: [1500, 1650, 1800, 1950, 2100, 2250, null, null, null, null, null, null],
                    borderColor: '#FFDA00', // Amarillo Porsche
                    backgroundColor: 'rgba(255, 218, 0, 0.1)', // Amarillo Porsche transparente
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Objetivo 2024',
                    data: [1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600],
                    borderColor: '#AA9600', // Amarillo Porsche oscuro
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            color: '#000000' // Negro para mejor contraste
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)' // Líneas de cuadrícula sutiles
                        }
                    },
                    x: {
                        ticks: {
                            color: '#000000' // Negro para mejor contraste
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)' // Líneas de cuadrícula sutiles
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#000000' // Negro para mejor contraste
                        }
                    }
                }
            }
        });
    }

    // 6. Gráfico de dispersión (ApexCharts) - Correlación uso vs satisfacción
    if (correlationChart.value) {
        const options = {
            series: [{
                name: "Usuarios",
                data: [
                    { x: 10, y: 2.5, z: 'Grupo A' },
                    { x: 15, y: 3.0, z: 'Grupo B' },
                    { x: 25, y: 3.2, z: 'Grupo C' },
                    { x: 35, y: 3.5, z: 'Grupo D' },
                    { x: 45, y: 3.8, z: 'Grupo E' },
                    { x: 55, y: 4.0, z: 'Grupo F' },
                    { x: 65, y: 4.2, z: 'Grupo G' },
                    { x: 75, y: 4.5, z: 'Grupo H' },
                    { x: 85, y: 4.7, z: 'Grupo I' },
                ]
            }],
            chart: {
                height: '100%',
                type: 'scatter',
                zoom: {
                    enabled: true,
                    type: 'xy'
                },
                foreColor: '#000000' // Negro para mejor contraste
            },
            xaxis: {
                title: {
                    text: 'Frecuencia de uso semanal (%)',
                    style: {
                        color: '#000000' // Negro para mejor contraste
                    }
                },
                tickAmount: 10,
                min: 0,
                max: 100
            },
            yaxis: {
                title: {
                    text: 'Puntuación de satisfacción',
                    style: {
                        color: '#000000' // Negro para mejor contraste
                    }
                },
                min: 1,
                max: 5
            },
            markers: {
                size: 15,
                colors: ['#FFDA00'], // Amarillo Porsche
                strokeColors: '#000000', // Borde negro
                strokeWidth: 2
            },
            tooltip: {
                theme: 'light', // Tema claro para el tooltip
                y: {
                    formatter: function (val: number) {
                        return val.toFixed(1) + ' / 5.0';
                    }
                },
                x: {
                    formatter: function (val: number) {
                        return val + '%';
                    }
                }
            }
        };

        const chart = new ApexCharts(correlationChart.value, options);
        chart.render();
    }
});
</script>

<style scoped>
/* Estilos de Porsche */
.porsche-toolbar {
    --background: #FFDA00;
    /* Amarillo Porsche */
    --color: #000000;
    --border-color: transparent;
}

.title-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.porsche-logo {
    height: 24px;
    width: auto;
}

.porsche-content {
    --background: #FFFFFF;
    /* Fondo blanco */
    --color: #000000;
    /* Texto negro */
}

ion-row {
    overflow: hidden;
}

ion-col {
    max-height: 100%;
    --ion-grid-column-padding: 10px;
}

/* El contenido real de cada columna */
.box {
    background: #FFFFFF;
    /* Fondo blanco */
    height: 100%;
    max-height: 100%;
    overflow: hidden;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    padding: 10px;
    color: #000000;
    /* Texto negro */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    /* Sombra sutil */
    border: 1px solid #EEEEEE;
    /* Borde sutil */
}

.chart-title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
    color: #000000;
    /* Texto negro */
}

.chart-container {
    flex: 1;
    position: relative;
    width: 100%;
    height: calc(100% - 30px);
}

.apex-chart-container {
    width: 100%;
    height: 100%;
}

/* KPI Progress Styles */
.kpi-progress {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 100%;
}

.kpi-progress-item {
    margin-bottom: 15px;
}

.kpi-name {
    font-size: 12px;
    margin-bottom: 5px;
    color: #000000;
    /* Texto negro */
}

.progress-bar-container {
    height: 8px;
    background-color: rgba(0, 0, 0, 0.1);
    /* Fondo gris sutil */
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 2px;
}

.progress-bar {
    height: 100%;
    border-radius: 4px;
}

.progress-text {
    font-size: 10px;
    text-align: right;
    color: #000000;
    /* Texto negro */
}

/* KPI Summary Styles */
.kpi-summary {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.kpi-summary-item {
    margin-bottom: 15px;
    padding: 10px;
    background-color: rgba(255, 218, 0, 0.05);
    /* Amarillo Porsche muy sutil */
    border-radius: 5px;
    border-left: 3px solid #FFDA00;
    /* Borde izquierdo amarillo Porsche */
}

.kpi-summary-title {
    font-weight: bold;
    margin-bottom: 5px;
    color: #000000;
    /* Texto negro */
}

.kpi-summary-description {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.7);
    /* Texto gris oscuro */
}

/* Aplicar altura total y por filas, solo en pantallas ≥ md */
@media (min-width: 992px) {
    ion-grid {
        height: 100%;
    }

    .ion-row-1 {
        height: 20%;
        max-height: 20%;
    }

    .ion-row-2 {
        height: 40%;
        max-height: 40%;
    }

    .ion-row-3 {
        height: 40%;
        max-height: 40%;
    }
}
</style>