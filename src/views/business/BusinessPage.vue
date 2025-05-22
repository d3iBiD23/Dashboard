<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar class="porsche-toolbar">
                <ion-buttons slot="start">
                    <ion-menu-button color="dark"></ion-menu-button>
                </ion-buttons>
                <ion-title class="ion-text-center">
                    <div class="title-container">
                        <span>Dashboard de Negocio</span>
                    </div>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :scrollY="isMobile ? true : false" class="ion-no-padding porsche-content">
            <!-- Grid principal del Dashboard -->
            <div class="dashboard-background"></div>
            <ion-grid class="dashboard-grid">
                <!-- Fila 1: 2 Columnas principales -->
                <ion-row class="ion-row-1">
                    <!-- Columna 1: Gráfico de líneas (Chart.js) - Tendencia de Uso del Mapa -->
                    <ion-col size="12" size-md="8">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="mapOutline"></ion-icon>
                                <span>Tendencia de Uso del Mapa de Estaciones</span>
                            </div>
                            <div class="chart-container" ref="mapUsageContainer">
                                <canvas ref="mapUsageChart"></canvas>
                            </div>
                        </div>
                    </ion-col>

                    <!-- Columna 2: Gráfico circular (Chart.js) - Satisfacción de Usuario -->
                    <ion-col size="12" size-md="4">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="happyOutline"></ion-icon>
                                <span>Satisfacción de Usuario</span>
                            </div>
                            <div class="chart-container" ref="satisfactionContainer">
                                <canvas ref="satisfactionChart"></canvas>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>

                <!-- Fila 2: 3 Columnas -->
                <ion-row class="ion-row-2">
                    <!-- Columna 1: Gráfico de área (ApexCharts) - Adopción de Funcionalidades -->
                    <ion-col size="12" size-md="4">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="appsOutline"></ion-icon>
                                <span>Adopción de Funcionalidades</span>
                            </div>
                            <div class="chart-container" ref="featuresContainer">
                                <div ref="featuresAdoptionChart" class="chart-element"></div>
                            </div>
                        </div>
                    </ion-col>

                    <!-- Columna 2: Gráfico de líneas (Chart.js) - Tasa de Abandono -->
                    <ion-col size="12" size-md="4">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="exitOutline"></ion-icon>
                                <span>Tasa de Abandono</span>
                            </div>
                            <div class="chart-container" ref="churnContainer">
                                <canvas ref="churnRateChart"></canvas>
                            </div>
                        </div>
                    </ion-col>

                    <!-- Columna 3: Gráfico de dispersión (ApexCharts) - Correlación Uso vs Satisfacción -->
                    <ion-col size="12" size-md="4">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="analyticsOutline"></ion-icon>
                                <span>Correlación Uso vs Satisfacción</span>
                            </div>
                            <div class="chart-container" ref="correlationContainer">
                                <div ref="correlationChart" class="chart-element"></div>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>
            </ion-grid>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/vue';
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import ApexCharts from 'apexcharts';
import { mapOutline, happyOutline, appsOutline, exitOutline, analyticsOutline } from 'ionicons/icons';
import { useMobile } from '@/hooks/use-mobile';

// Referencias para los charts
const mapUsageChart = ref<HTMLCanvasElement | null>(null);
const satisfactionChart = ref<HTMLCanvasElement | null>(null);
const churnRateChart = ref<HTMLCanvasElement | null>(null);
const featuresAdoptionChart = ref<HTMLDivElement | null>(null);
const correlationChart = ref<HTMLDivElement | null>(null);
const { isMobile } = useMobile();

// Container references for size detection
const mapUsageContainer = ref<HTMLDivElement | null>(null);
const satisfactionContainer = ref<HTMLDivElement | null>(null);
const churnContainer = ref<HTMLDivElement | null>(null);
const featuresContainer = ref<HTMLDivElement | null>(null);
const correlationContainer = ref<HTMLDivElement | null>(null);

// Chart instances para limpiar al desmontar
let chartInstances = {
    mapUsage: null as Chart | null,
    satisfaction: null as Chart | null,
    churnRate: null as Chart | null,
    featuresAdoption: null as ApexCharts | null,
    correlation: null as ApexCharts | null
};

let resizeObserver: ResizeObserver | null = null;
let isMounted = ref(true);

// Setup ResizeObserver to detect when containers are properly sized
const setupResizeObserver = () => {
    if (typeof ResizeObserver === 'undefined') return;

    resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                const element = entry.target as HTMLElement;
                if (element === mapUsageContainer.value && !chartInstances.mapUsage) {
                    initMapUsageChart();
                } else if (element === satisfactionContainer.value && !chartInstances.satisfaction) {
                    initSatisfactionChart();
                } else if (element === churnContainer.value && !chartInstances.churnRate) {
                    initChurnRateChart();
                } else if (element === featuresContainer.value && !chartInstances.featuresAdoption) {
                    initFeaturesAdoptionChart();
                } else if (element === correlationContainer.value && !chartInstances.correlation) {
                    initCorrelationChart();
                }
            }
        });
    });

    // Observe all containers
    if (mapUsageContainer.value) resizeObserver.observe(mapUsageContainer.value);
    if (satisfactionContainer.value) resizeObserver.observe(satisfactionContainer.value);
    if (churnContainer.value) resizeObserver.observe(churnContainer.value);
    if (featuresContainer.value) resizeObserver.observe(featuresContainer.value);
    if (correlationContainer.value) resizeObserver.observe(correlationContainer.value);
};

// Initialize charts with size detection
const initializeChartsWithSizeDetection = async () => {
    const maxRetries = 5;
    const retryDelay = 200;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Check if containers have proper dimensions
            const containersReady = [
                mapUsageContainer.value,
                satisfactionContainer.value,
                churnContainer.value,
                featuresContainer.value,
                correlationContainer.value
            ].every(container => {
                if (!container) return false;
                const rect = container.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            });

            if (containersReady) {
                await initializeCharts();
                break;
            } else if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        } catch (error) {
            console.error(`Chart initialization attempt ${attempt + 1} failed:`, error);
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
};

// Initialize all charts
const initializeCharts = async () => {
    try {
        await Promise.all([
            initMapUsageChart(),
            initSatisfactionChart(),
            initChurnRateChart(),
            initFeaturesAdoptionChart(),
            initCorrelationChart()
        ]);
    } catch (error) {
        console.error('Error in chart initialization:', error);
    }
};

// Utility function to get container dimensions
const getContainerDimensions = (container: HTMLElement | null) => {
    if (!container) return { width: 0, height: 0 };
    const rect = container.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
};

// Manejar el redimensionamiento de la ventana
const handleResize = () => {
    if (!isMounted.value) return;

    setTimeout(() => {
        if (chartInstances.featuresAdoption) chartInstances.featuresAdoption.render();
        if (chartInstances.correlation) chartInstances.correlation.render();
        if (chartInstances.mapUsage) chartInstances.mapUsage.resize();
        if (chartInstances.satisfaction) chartInstances.satisfaction.resize();
        if (chartInstances.churnRate) chartInstances.churnRate.resize();
    }, 100);
};

// 1. Gráfico de líneas (Chart.js) - Uso del mapa de estaciones
const initMapUsageChart = async () => {
    if (!mapUsageChart.value || !isMounted.value || chartInstances.mapUsage) return;

    try {
        const containerDims = getContainerDimensions(mapUsageContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        const ctx = mapUsageChart.value.getContext('2d');
        if (!ctx) return;

        // Set canvas size explicitly
        mapUsageChart.value.width = containerDims.width;
        mapUsageChart.value.height = containerDims.height;

        chartInstances.mapUsage = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
                datasets: [{
                    label: 'Sesiones 2023',
                    data: [1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300],
                    borderColor: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Sesiones 2024',
                    data: [1500, 1650, 1800, 1950, 2100, 2250, null, null, null, null, null, null],
                    borderColor: '#FFDA00',
                    backgroundColor: 'rgba(255, 218, 0, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Objetivo 2024',
                    data: [1500, 1600, 1700, 1800, 1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600],
                    borderColor: '#AA9600',
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
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#000000',
                            boxWidth: 12,
                            padding: 10,
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        titleFont: {
                            family: "'Montserrat', sans-serif",
                            size: 12,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Montserrat', sans-serif",
                            size: 11
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error initializing Map Usage Chart:', error);
    }
};

// 2. Gráfico circular (Chart.js) - Satisfacción de usuario
const initSatisfactionChart = async () => {
    if (!satisfactionChart.value || !isMounted.value || chartInstances.satisfaction) return;

    try {
        const containerDims = getContainerDimensions(satisfactionContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        const ctx = satisfactionChart.value.getContext('2d');
        if (!ctx) return;

        // Set canvas size explicitly
        satisfactionChart.value.width = containerDims.width;
        satisfactionChart.value.height = containerDims.height;

        chartInstances.satisfaction = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['5★', '4★', '3★', '2★', '1★'],
                datasets: [{
                    data: [45, 30, 15, 7, 3],
                    backgroundColor: [
                        'rgba(255, 218, 0, 0.9)',
                        'rgba(255, 184, 0, 0.8)',
                        'rgba(255, 184, 0, 0.6)',
                        'rgba(255, 184, 0, 0.4)',
                        'rgba(255, 184, 0, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 218, 0, 1)',
                        'rgba(255, 184, 0, 1)',
                        'rgba(255, 184, 0, 1)',
                        'rgba(255, 184, 0, 1)',
                        'rgba(255, 184, 0, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#000000',
                            boxWidth: 12,
                            padding: 8,
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        },
                        titleFont: {
                            family: "'Montserrat', sans-serif",
                            size: 12,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Montserrat', sans-serif",
                            size: 11
                        }
                    }
                },
                cutout: '60%'
            }
        });
    } catch (error) {
        console.error('Error initializing Satisfaction Chart:', error);
    }
};

// 3. Gráfico de área (ApexCharts) - Adopción de funcionalidades
const initFeaturesAdoptionChart = async () => {
    if (!featuresAdoptionChart.value || !isMounted.value || chartInstances.featuresAdoption) return;

    try {
        const containerDims = getContainerDimensions(featuresContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        // Set explicit dimensions
        featuresAdoptionChart.value.style.width = `${containerDims.width}px`;
        featuresAdoptionChart.value.style.height = `${containerDims.height}px`;

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
                height: containerDims.height,
                width: containerDims.width,
                toolbar: {
                    show: false
                },
                fontFamily: "'Montserrat', sans-serif",
                foreColor: '#000000'
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
                labels: {
                    style: {
                        colors: '#000000',
                        fontSize: '10px',
                        fontFamily: "'Montserrat', sans-serif",
                    }
                }
            },
            tooltip: {
                theme: 'light',
                style: {
                    fontSize: '12px',
                    fontFamily: "'Montserrat', sans-serif",
                }
            },
            colors: ['#FFDA00', '#FFB800', '#FF9500'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.3,
                    stops: [0, 90, 100],
                    colorStops: [
                        [
                            {
                                offset: 0,
                                color: "#FFDA00",
                                opacity: 0.7
                            },
                            {
                                offset: 100,
                                color: "#FFDA00",
                                opacity: 0.3
                            }
                        ],
                        [
                            {
                                offset: 0,
                                color: "#FFB800",
                                opacity: 0.7
                            },
                            {
                                offset: 100,
                                color: "#FFB800",
                                opacity: 0.3
                            }
                        ],
                        [
                            {
                                offset: 0,
                                color: "#FF9500",
                                opacity: 0.7
                            },
                            {
                                offset: 100,
                                color: "#FF9500",
                                opacity: 0.3
                            }
                        ]
                    ]
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetY: 0,
                fontSize: '11px',
                fontFamily: "'Montserrat', sans-serif",
                itemMargin: {
                    horizontal: 8,
                    vertical: 0
                }
            }
        };

        chartInstances.featuresAdoption = new ApexCharts(featuresAdoptionChart.value, options);
        await chartInstances.featuresAdoption.render();
    } catch (error) {
        console.error('Error initializing Features Adoption Chart:', error);
    }
};

// 4. Gráfico de líneas (Chart.js) - Tasa de abandono
const initChurnRateChart = async () => {
    if (!churnRateChart.value || !isMounted.value || chartInstances.churnRate) return;

    try {
        const containerDims = getContainerDimensions(churnContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        const ctx = churnRateChart.value.getContext('2d');
        if (!ctx) return;

        // Set canvas size explicitly
        churnRateChart.value.width = containerDims.width;
        churnRateChart.value.height = containerDims.height;

        chartInstances.churnRate = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                datasets: [{
                    label: 'Tasa de abandono (%)',
                    data: [18, 17.5, 16.8, 16, 15.2, 14.5],
                    fill: false,
                    borderColor: '#000000',
                    tension: 0.1,
                    pointBackgroundColor: '#FFDA00',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 12,
                        max: 20,
                        ticks: {
                            color: '#000000',
                            stepSize: 2,
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        titleFont: {
                            family: "'Montserrat', sans-serif",
                            size: 12,
                            weight: 'bold'
                        },
                        bodyFont: {
                            family: "'Montserrat', sans-serif",
                            size: 11
                        }
                    }
                }
            }
        });

        // Add target line manually using afterDraw hook
        const chart = chartInstances.churnRate;
        if (chart) {
            const targetValue = 15.3;
            // @ts-ignore
            const originalAfterDraw = chart.options.plugins?.afterDraw;

            chart.options.plugins = chart.options.plugins || {};
            // @ts-ignore
            chart.options.plugins.afterDraw = (chart) => {
                if (originalAfterDraw) originalAfterDraw(chart);

                const ctx = chart.ctx;
                const yAxis = chart.scales.y;
                const yPos = yAxis.getPixelForValue(targetValue);

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(chart.chartArea.left, yPos);
                ctx.lineTo(chart.chartArea.right, yPos);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#FFDA00';
                ctx.setLineDash([5, 5]);
                ctx.stroke();

                ctx.fillStyle = '#000000';
                ctx.font = "10px 'Montserrat', sans-serif";
                ctx.textAlign = 'right';
                ctx.fillText('Objetivo', chart.chartArea.right - 5, yPos - 5);
                ctx.restore();
            };
        }
    } catch (error) {
        console.error('Error initializing Churn Rate Chart:', error);
    }
};

// 5. Gráfico de dispersión (ApexCharts) - Correlación uso vs satisfacción
const initCorrelationChart = async () => {
    if (!correlationChart.value || !isMounted.value || chartInstances.correlation) return;

    try {
        const containerDims = getContainerDimensions(correlationContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        // Set explicit dimensions
        correlationChart.value.style.width = `${containerDims.width}px`;
        correlationChart.value.style.height = `${containerDims.height}px`;

        const options = {
            series: [{
                name: "Usuarios",
                data: [
                    { x: 10, y: 2.5 },
                    { x: 15, y: 3.0 },
                    { x: 25, y: 3.2 },
                    { x: 35, y: 3.5 },
                    { x: 45, y: 3.8 },
                    { x: 55, y: 4.0 },
                    { x: 65, y: 4.2 },
                    { x: 75, y: 4.5 },
                    { x: 85, y: 4.7 },
                ]
            }],
            chart: {
                height: containerDims.height,
                width: containerDims.width,
                type: 'scatter',
                zoom: {
                    enabled: true,
                    type: 'xy'
                },
                fontFamily: "'Montserrat', sans-serif",
                foreColor: '#000000'
            },
            xaxis: {
                title: {
                    text: 'Frecuencia de uso (%)',
                    style: {
                        color: '#000000',
                        fontSize: '11px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600
                    }
                },
                tickAmount: 5,
                min: 0,
                max: 100,
                labels: {
                    style: {
                        colors: '#000000',
                        fontSize: '10px',
                        fontFamily: "'Montserrat', sans-serif",
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Satisfacción',
                    style: {
                        color: '#000000',
                        fontSize: '11px',
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600
                    }
                },
                min: 1,
                max: 5,
                tickAmount: 4,
                labels: {
                    style: {
                        colors: '#000000',
                        fontSize: '10px',
                        fontFamily: "'Montserrat', sans-serif",
                    }
                }
            },
            markers: {
                size: 12,
                colors: ['#FFDA00'],
                strokeColors: '#000000',
                strokeWidth: 2,
                hover: {
                    size: 14,
                    sizeOffset: 2
                }
            },
            tooltip: {
                theme: 'light',
                style: {
                    fontSize: '12px',
                    fontFamily: "'Montserrat', sans-serif",
                },
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
            },
            grid: {
                borderColor: 'rgba(0, 0, 0, 0.05)',
                row: {
                    colors: ['transparent']
                }
            }
        };

        chartInstances.correlation = new ApexCharts(correlationChart.value, options);
        await chartInstances.correlation.render();
    } catch (error) {
        console.error('Error initializing Correlation Chart:', error);
    }
};

// Inicializar los gráficos cuando el componente esté montado
onMounted(async () => {
    try {
        // Wait for DOM to be fully rendered
        await nextTick();

        // Wait a bit more for layout calculations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize charts with proper size detection
        await initializeChartsWithSizeDetection();

        // Setup resize observer for responsive behavior
        setupResizeObserver();

        // Manejar el redimensionamiento de la ventana
        window.addEventListener('resize', handleResize);
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
});

onBeforeUnmount(() => {
    isMounted.value = false;

    // Limpiar instancias de gráficos
    if (chartInstances.mapUsage) chartInstances.mapUsage.destroy();
    if (chartInstances.satisfaction) chartInstances.satisfaction.destroy();
    if (chartInstances.churnRate) chartInstances.churnRate.destroy();
    if (chartInstances.featuresAdoption) chartInstances.featuresAdoption.destroy();
    if (chartInstances.correlation) chartInstances.correlation.destroy();

    // Disconnect resize observer
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    // Eliminar event listeners
    window.removeEventListener('resize', handleResize);
});
</script>

<style>
/* Importar fuentes de Google */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
</style>

<style scoped>
/* Estilos modernos de Porsche */
:root {
    --porsche-yellow: #FFDA00;
    --porsche-yellow-light: #FFE866;
    --porsche-yellow-dark: #FFB800;
    --porsche-black: #000000;
    --porsche-gray-dark: #333333;
    --porsche-gray: #666666;
    --porsche-gray-light: #EEEEEE;
}

* {
    font-family: 'Montserrat', sans-serif;
}

.porsche-toolbar {
    --background: var(--porsche-yellow);
    --color: var(--porsche-black);
    --border-color: transparent;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    height: 60px;
}

.title-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
}

.porsche-content {
    --background: #f8f9fa;
    --color: var(--porsche-black);
    --overflow: hidden;
    font-family: 'Montserrat', sans-serif;
}

.dashboard-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    z-index: -1;
}

.dashboard-grid {
    height: calc(100vh - 60px);
    display: flex;
    flex-direction: column;
    padding: 12px;
    overflow: hidden;
    z-index: 1;
}

ion-row {
    overflow: hidden;
}

.ion-row-1 {
    flex: 1;
    margin-bottom: 12px;
    height: calc(50% - 6px);
    min-height: 0;
    max-height: none;
}

.ion-row-2 {
    flex: 1;
    height: calc(50% - 6px);
    min-height: 0;
    max-height: none;
}

ion-col {
    height: 100%;
    --ion-grid-column-padding: 6px;
}

.box {
    background: #FFFFFF;
    height: 100%;
    overflow: hidden;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    padding: 16px;
    color: var(--porsche-black);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
    border: none;
    transition: all 0.3s ease;
    position: relative;
}

.box:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
}

.box::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, var(--porsche-yellow) 0%, var(--porsche-yellow-dark) 100%);
    border-radius: 12px 12px 0 0;
}

.chart-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
    text-align: left;
    color: var(--porsche-black);
    display: flex;
    align-items: center;
    gap: 8px;
    height: 24px;
    flex-shrink: 0;
    letter-spacing: 0.3px;
}

.chart-title span {
    flex: 1;
}

.chart-title ion-icon {
    font-size: 18px;
    color: var(--porsche-yellow-dark);
}

.chart-container {
    flex: 1;
    position: relative;
    width: 100%;
    height: calc(100% - 36px);
    overflow: hidden;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.5);
}

.chart-element {
    width: 100%;
    height: 100%;
}

/* Media queries para asegurar que los gráficos se vean bien en diferentes tamaños */
@media (max-width: 768px) {
    .dashboard-grid {
        height: 100%;
        overflow: hidden;
    }

    .ion-row-1,
    .ion-row-2 {
        height: 50%;
    }

    ion-col {
        height: auto;
    }

    .box {
        height: 100%;
    }
}

/* Ensure proper sizing for all chart containers */
canvas {
    max-width: 100%;
    max-height: 100%;
}

/* Reemplaza los estilos específicos para móvil con estos */
@media (max-width: 767px) {
    .dashboard-grid {
        height: auto;
        min-height: 100%;
        padding-bottom: 20px;
    }

    .ion-row-1,
    .ion-row-2 {
        height: auto;
        min-height: 300px;
        margin-bottom: 20px;
    }

    ion-col {
        height: 300px;
        margin-bottom: 20px;
    }

    .porsche-content {
        --overflow: auto;
    }
}
</style>
