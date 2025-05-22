<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar class="porsche-toolbar">
                <ion-buttons slot="start">
                    <ion-menu-button color="dark"></ion-menu-button>
                </ion-buttons>
                <ion-title class="ion-text-center">
                    <div class="title-container">
                        <span>Dashboard Técnico</span>
                    </div>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :scrollY="isMobile ? true : false" class="ion-no-padding porsche-content">
            <!-- Grid principal del Dashboard -->
            <div class="dashboard-background"></div>
            <ion-grid class="dashboard-grid">
                <!-- Fila 1: 3 Columnas -->
                <ion-row class="ion-row-1">
                    <!-- Columna 1: Chart.js - OBD Diagnosis Time -->
                    <ion-col size="12" size-md="4">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="speedometerOutline"></ion-icon>
                                <span>Tiempo de Diagnóstico OBD</span>
                            </div>
                            <div class="chart-container" ref="obdContainer">
                                <canvas ref="obdTimeChart"></canvas>
                            </div>
                        </div>
                    </ion-col>

                    <!-- Columna 2: ECharts - Appointment Booking Success -->
                    <ion-col size="12" size-md="4">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="calendarOutline"></ion-icon>
                                <span>Éxito de Citas</span>
                            </div>
                            <div class="chart-container" ref="appointmentContainer">
                                <div ref="appointmentChart" class="chart-element"></div>
                            </div>
                        </div>
                    </ion-col>

                    <!-- Columna 3: Real-time Chart - Loading Times -->
                    <ion-col size="12" size-md="4">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="timeOutline"></ion-icon>
                                <span>Tiempos de Carga</span>
                                <div class="live-indicator">LIVE</div>
                            </div>
                            <div class="chart-container" ref="loadingContainer">
                                <div ref="loadingTimesChart" class="real-time-chart"></div>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>

                <!-- Fila 2: 2 Columnas -->
                <ion-row class="ion-row-2">
                    <!-- Columna 1: ApexCharts - Map Scroll Stability -->
                    <ion-col size="12" size-md="6">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="mapOutline"></ion-icon>
                                <span>Estabilidad de Desplazamiento del Mapa</span>
                            </div>
                            <div class="chart-container" ref="mapScrollContainer">
                                <div ref="mapScrollChart" class="chart-element"></div>
                            </div>
                        </div>
                    </ion-col>

                    <!-- Columna 2: Chart.js - Connection Errors Analysis -->
                    <ion-col size="12" size-md="6">
                        <div class="box">
                            <div class="chart-title">
                                <ion-icon :icon="alertCircleOutline"></ion-icon>
                                <span>Análisis de Errores de Conexión</span>
                                <div class="error-status"
                                    :class="{ 'status-good': currentErrorRate < 5, 'status-warning': currentErrorRate >= 5 && currentErrorRate < 15, 'status-critical': currentErrorRate >= 15 }">
                                    {{ currentErrorRate }}%
                                </div>
                            </div>
                            <div class="chart-container" ref="connectionContainer">
                                <canvas ref="connectionErrorsChart"></canvas>
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
import { onMounted, ref, onBeforeUnmount, nextTick } from 'vue';
import Chart from 'chart.js/auto';
import * as echarts from 'echarts';
import ApexCharts from 'apexcharts';
import { speedometerOutline, calendarOutline, timeOutline, mapOutline, alertCircleOutline } from 'ionicons/icons';

// Añadir esta importación al principio del script
import { useMobile } from '@/hooks/use-mobile';

// Chart references
const obdTimeChart = ref<HTMLCanvasElement | null>(null);
const connectionErrorsChart = ref<HTMLCanvasElement | null>(null);
const mapScrollChart = ref<HTMLDivElement | null>(null);
const loadingTimesChart = ref<HTMLDivElement | null>(null);
const appointmentChart = ref<HTMLDivElement | null>(null);

// Añadir esta línea después de las referencias de los charts
const { isMobile } = useMobile();

// Container references for size detection
const obdContainer = ref<HTMLDivElement | null>(null);
const appointmentContainer = ref<HTMLDivElement | null>(null);
const loadingContainer = ref<HTMLDivElement | null>(null);
const mapScrollContainer = ref<HTMLDivElement | null>(null);
const connectionContainer = ref<HTMLDivElement | null>(null);

// Current error rate for status indicator
const currentErrorRate = ref(8.5);

// Chart instances
let chartInstances = {
    obdTime: null as Chart | null,
    connectionErrors: null as Chart | null,
    mapScroll: null as ApexCharts | null,
    loadingTimes: null as Chart | null,
    appointment: null as echarts.ECharts | null
};

// Real-time data interval
let realTimeInterval: NodeJS.Timeout | null = null;
let resizeObserver: ResizeObserver | null = null;

// Component mounted flag
let isMounted = ref(true);

// Detectar si es dispositivo móvil
// const checkIfMobile = () => {
//     isMobile.value = window.innerWidth < 768;
// };

onMounted(async () => {
    try {
        // Detectar si es dispositivo móvil
        // checkIfMobile();
        // window.addEventListener('resize', checkIfMobile);

        // Wait for DOM to be fully rendered
        await nextTick();

        // Wait a bit more for layout calculations
        await new Promise(resolve => setTimeout(resolve, 100));

        // Initialize charts with proper size detection
        await initializeChartsWithSizeDetection();

        // Setup resize observer for responsive behavior
        setupResizeObserver();

        // Handle window resize for responsive charts
        window.addEventListener('resize', handleResize);
    } catch (error) {
        console.error('Error al inicializar gráficos:', error);
    }
});

onBeforeUnmount(() => {
    // Set mounted flag to false
    isMounted.value = false;

    // Clean up chart instances and event listeners
    cleanupCharts();

    // Clear real-time interval
    if (realTimeInterval) {
        clearInterval(realTimeInterval);
        realTimeInterval = null;
    }

    // Disconnect resize observer
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }

    // Remove event listeners
    window.removeEventListener('resize', handleResize);
    // window.removeEventListener('resize', checkIfMobile);
});

// Setup ResizeObserver to detect when containers are properly sized
const setupResizeObserver = () => {
    if (typeof ResizeObserver === 'undefined') return;

    resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                // Container has proper dimensions, reinitialize if needed
                const element = entry.target as HTMLElement;
                if (element === obdContainer.value && !chartInstances.obdTime) {
                    initOBDTimeChart();
                } else if (element === appointmentContainer.value && !chartInstances.appointment) {
                    initAppointmentChart();
                } else if (element === loadingContainer.value && !chartInstances.loadingTimes) {
                    initLoadingTimesChart();
                } else if (element === mapScrollContainer.value && !chartInstances.mapScroll) {
                    initMapScrollChart();
                } else if (element === connectionContainer.value && !chartInstances.connectionErrors) {
                    initConnectionErrorsChart();
                }
            }
        });
    });

    // Observe all containers
    if (obdContainer.value) resizeObserver.observe(obdContainer.value);
    if (appointmentContainer.value) resizeObserver.observe(appointmentContainer.value);
    if (loadingContainer.value) resizeObserver.observe(loadingContainer.value);
    if (mapScrollContainer.value) resizeObserver.observe(mapScrollContainer.value);
    if (connectionContainer.value) resizeObserver.observe(connectionContainer.value);
};

// Initialize charts with size detection
const initializeChartsWithSizeDetection = async () => {
    const maxRetries = 5;
    const retryDelay = 200;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            // Check if containers have proper dimensions
            const containersReady = [
                obdContainer.value,
                appointmentContainer.value,
                loadingContainer.value,
                mapScrollContainer.value,
                connectionContainer.value
            ].every(container => {
                if (!container) return false;
                const rect = container.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            });

            if (containersReady) {
                await initializeCharts();
                break;
            } else if (attempt < maxRetries - 1) {
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        } catch (error) {
            console.error(`Intento de inicialización de gráficos ${attempt + 1} falló:`, error);
            if (attempt < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
    }
};

// Initialize all charts with error handling
const initializeCharts = async () => {
    try {
        await Promise.all([
            initOBDTimeChart(),
            initAppointmentChart(),
            initLoadingTimesChart(),
            initMapScrollChart(),
            initConnectionErrorsChart()
        ]);
    } catch (error) {
        console.error('Error en la inicialización de gráficos:', error);
    }
};

// Clean up all chart instances
const cleanupCharts = () => {
    try {
        if (chartInstances.obdTime) {
            chartInstances.obdTime.destroy();
            chartInstances.obdTime = null;
        }
        if (chartInstances.mapScroll) {
            chartInstances.mapScroll.destroy();
            chartInstances.mapScroll = null;
        }
        if (chartInstances.appointment) {
            chartInstances.appointment.dispose();
            chartInstances.appointment = null;
        }
        if (chartInstances.loadingTimes) {
            chartInstances.loadingTimes.destroy();
            chartInstances.loadingTimes = null;
        }
        if (chartInstances.connectionErrors) {
            chartInstances.connectionErrors.destroy();
            chartInstances.connectionErrors = null;
        }
    } catch (error) {
        console.error('Error al limpiar gráficos:', error);
    }
};

// Handle window resize
const handleResize = () => {
    if (!isMounted.value) return;

    try {
        // Debounce resize events
        setTimeout(() => {
            if (chartInstances.appointment) chartInstances.appointment.resize();
            if (chartInstances.mapScroll) chartInstances.mapScroll.render();
            if (chartInstances.obdTime) chartInstances.obdTime.resize();
            if (chartInstances.loadingTimes) chartInstances.loadingTimes.resize();
            if (chartInstances.connectionErrors) chartInstances.connectionErrors.resize();
        }, 100);
    } catch (error) {
        console.error('Error al manejar el redimensionamiento:', error);
    }
};

// Utility function to get container dimensions
const getContainerDimensions = (container: HTMLElement | null) => {
    if (!container) return { width: 0, height: 0 };
    const rect = container.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
};

// 1. Chart.js - OBD Diagnosis Time (Line Chart)
const initOBDTimeChart = async () => {
    if (!obdTimeChart.value || !isMounted.value || chartInstances.obdTime) return;

    try {
        const containerDims = getContainerDimensions(obdContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        const ctx = obdTimeChart.value.getContext('2d');
        if (!ctx) return;

        // Set canvas size explicitly
        obdTimeChart.value.width = containerDims.width;
        obdTimeChart.value.height = containerDims.height;

        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const data = [5.2, 4.8, 4.1, 3.7, 3.2, 2.9];

        chartInstances.obdTime = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tiempo OBD (segundos)',
                    data: data,
                    borderColor: '#FFDA00',
                    backgroundColor: 'rgba(255, 218, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Objetivo',
                    data: [3, 3, 3, 3, 3, 3],
                    borderColor: '#000000',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
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
                },
                scales: {
                    y: {
                        min: 0,
                        max: 6,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#000000',
                            stepSize: 1,
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error al inicializar el gráfico de Tiempo OBD:', error);
    }
};

// 2. ECharts - Appointment Booking Success (Stacked Bar Chart)
const initAppointmentChart = async () => {
    if (!appointmentChart.value || !isMounted.value || chartInstances.appointment) return;

    try {
        const containerDims = getContainerDimensions(appointmentContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        // Set explicit dimensions
        appointmentChart.value.style.width = `${containerDims.width}px`;
        appointmentChart.value.style.height = `${containerDims.height}px`;

        chartInstances.appointment = echarts.init(appointmentChart.value, null, {
            width: containerDims.width,
            height: containerDims.height
        });

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            legend: {
                data: ['Exitosas', 'Fallidas'],
                textStyle: {
                    color: '#000000',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 11
                },
                top: 0,
                itemWidth: 12,
                itemHeight: 12
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 0, 0, 0.2)'
                    }
                },
                axisLabel: {
                    color: '#000000',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 10
                }
            },
            yAxis: {
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: 'rgba(0, 0, 0, 0.2)'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                axisLabel: {
                    color: '#000000',
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 10
                }
            },
            series: [
                {
                    name: 'Exitosas',
                    type: 'bar',
                    stack: 'total',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [120, 132, 145, 160, 178, 190],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#FFDA00' },
                            { offset: 1, color: '#FFB800' }
                        ])
                    }
                },
                {
                    name: 'Fallidas',
                    type: 'bar',
                    stack: 'total',
                    emphasis: {
                        focus: 'series'
                    },
                    data: [45, 40, 35, 30, 25, 20],
                    itemStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: '#333333' },
                            { offset: 1, color: '#000000' }
                        ])
                    }
                }
            ]
        };

        chartInstances.appointment.setOption(option);
    } catch (error) {
        console.error('Error al inicializar el gráfico de Citas:', error);
    }
};

// 3. Real-time Chart - Loading Times
const initLoadingTimesChart = async () => {
    if (!loadingTimesChart.value || !isMounted.value || chartInstances.loadingTimes) return;

    try {
        const containerDims = getContainerDimensions(loadingContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        const container = loadingTimesChart.value;
        container.innerHTML = '';

        // Create chart elements
        const chartHeader = document.createElement('div');
        chartHeader.style.display = 'flex';
        chartHeader.style.justifyContent = 'space-between';
        chartHeader.style.marginBottom = '10px';
        chartHeader.style.height = '30px';
        container.appendChild(chartHeader);

        // Current value display
        const valueDisplay = document.createElement('div');
        valueDisplay.style.fontSize = '24px';
        valueDisplay.style.fontWeight = 'bold';
        valueDisplay.style.color = '#000000';
        valueDisplay.style.fontFamily = "'Montserrat', sans-serif";
        valueDisplay.textContent = '2.3s';
        chartHeader.appendChild(valueDisplay);

        // Chart container
        const chartArea = document.createElement('div');
        chartArea.style.height = `${containerDims.height - 40}px`;
        chartArea.style.position = 'relative';
        chartArea.style.overflow = 'hidden';
        container.appendChild(chartArea);

        // Create line chart
        const lineChart = document.createElement('canvas');
        lineChart.style.width = '100%';
        lineChart.style.height = '100%';
        lineChart.width = containerDims.width;
        lineChart.height = containerDims.height - 40;
        chartArea.appendChild(lineChart);

        // Initialize Chart.js for real-time data
        const ctx = lineChart.getContext('2d');
        if (!ctx) return;

        // Initial data
        const maxDataPoints = 20;
        const initialData = Array.from({ length: maxDataPoints }, () => Math.random() * 2 + 1);

        chartInstances.loadingTimes = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({ length: maxDataPoints }, (_, i) => ''),
                datasets: [{
                    label: 'Tiempo de Carga (s)',
                    data: initialData,
                    borderColor: '#FFDA00',
                    backgroundColor: 'rgba(255, 218, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 5,
                        display: false
                    },
                    x: {
                        display: false
                    }
                },
                elements: {
                    point: {
                        radius: 0
                    }
                },
                animation: {
                    duration: 0
                }
            }
        });

        // Update real-time data with proper cleanup
        realTimeInterval = setInterval(() => {
            if (!isMounted.value || !chartInstances.loadingTimes) {
                if (realTimeInterval) {
                    clearInterval(realTimeInterval);
                    realTimeInterval = null;
                }
                return;
            }

            try {
                const newValue = Math.random() * 2 + 1;
                chartInstances.loadingTimes.data.datasets[0].data.push(newValue);
                chartInstances.loadingTimes.data.datasets[0].data.shift();
                valueDisplay.textContent = `${newValue.toFixed(1)}s`;
                chartInstances.loadingTimes.update('none');
            } catch (error) {
                console.error('Error al actualizar el gráfico en tiempo real:', error);
                if (realTimeInterval) {
                    clearInterval(realTimeInterval);
                    realTimeInterval = null;
                }
            }
        }, 1000);
    } catch (error) {
        console.error('Error al inicializar el gráfico de Tiempos de Carga:', error);
    }
};

// 4. ApexCharts - Map Scroll Stability (Area Chart)
const initMapScrollChart = async () => {
    if (!mapScrollChart.value || !isMounted.value || chartInstances.mapScroll) return;

    try {
        const containerDims = getContainerDimensions(mapScrollContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        // Set explicit dimensions
        mapScrollChart.value.style.width = `${containerDims.width}px`;
        mapScrollChart.value.style.height = `${containerDims.height}px`;

        const options = {
            series: [{
                name: 'Puntuación de Estabilidad',
                data: [72, 74, 78, 83, 87, 90]
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
                width: 3
            },
            colors: ['#FFDA00'],
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 90, 100],
                    colorStops: [
                        {
                            offset: 0,
                            color: "#FFDA00",
                            opacity: 0.7
                        },
                        {
                            offset: 100,
                            color: "#FFB800",
                            opacity: 0.2
                        }
                    ]
                }
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
            yaxis: {
                min: 60,
                max: 100,
                labels: {
                    style: {
                        colors: '#000000',
                        fontSize: '10px',
                        fontFamily: "'Montserrat', sans-serif",
                    }
                }
            },
            grid: {
                borderColor: 'rgba(0, 0, 0, 0.05)',
                row: {
                    colors: ['transparent']
                }
            },
            tooltip: {
                theme: 'light',
                style: {
                    fontSize: '12px',
                    fontFamily: "'Montserrat', sans-serif",
                }
            },
            annotations: {
                yaxis: [{
                    y: 86.4,
                    borderColor: '#000000',
                    borderWidth: 2,
                    label: {
                        borderColor: '#000000',
                        style: {
                            color: '#fff',
                            background: '#000000',
                            fontSize: '10px',
                            fontFamily: "'Montserrat', sans-serif",
                        },
                        text: 'Objetivo'
                    }
                }]
            }
        };

        chartInstances.mapScroll = new ApexCharts(mapScrollChart.value, options);
        await chartInstances.mapScroll.render();
    } catch (error) {
        console.error('Error al inicializar el gráfico de Estabilidad del Mapa:', error);
    }
};


// 5. Chart.js - Connection Errors Analysis (Mixed Chart)
const initConnectionErrorsChart = async () => {
    if (!connectionErrorsChart.value || !isMounted.value || chartInstances.connectionErrors) return;

    try {
        const containerDims = getContainerDimensions(connectionContainer.value);
        if (containerDims.width === 0 || containerDims.height === 0) return;

        const ctx = connectionErrorsChart.value.getContext('2d');
        if (!ctx) return;

        // Set canvas size explicitly
        connectionErrorsChart.value.width = containerDims.width;
        connectionErrorsChart.value.height = containerDims.height;

        const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const totalConnections = [1200, 1350, 1400, 1500, 1600, 1650];
        const failedConnections = [120, 105, 82, 45, 23, 12];
        const errorRates = failedConnections.map((failed, index) =>
            parseFloat(((failed / totalConnections[index]) * 100).toFixed(1))
        );

        // Update current error rate
        currentErrorRate.value = errorRates[errorRates.length - 1];

        chartInstances.connectionErrors = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Conexiones Totales',
                        data: totalConnections,
                        backgroundColor: 'rgba(255, 218, 0, 0.3)',
                        borderColor: '#FFDA00',
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Conexiones Fallidas',
                        data: failedConnections,
                        backgroundColor: 'rgba(220, 53, 69, 0.7)',
                        borderColor: '#dc3545',
                        borderWidth: 2,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Tasa de Error (%)',
                        data: errorRates,
                        type: 'line',
                        borderColor: '#000000',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 3,
                        pointBackgroundColor: '#000000',
                        pointBorderColor: '#FFDA00',
                        pointBorderWidth: 2,
                        pointRadius: 6,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#000000',
                            boxWidth: 12,
                            padding: 8,
                            usePointStyle: true,
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
                        },
                        callbacks: {
                            afterLabel: function (context) {
                                if (context.datasetIndex === 2) {
                                    return 'Objetivo: <10%';
                                }
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Conexiones',
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Tasa de Error (%)',
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        },
                        min: 0,
                        max: 20,
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            color: '#000000',
                            font: {
                                family: "'Montserrat', sans-serif",
                                size: 10
                            }
                        }
                    }
                }
            }
        });

        // Add target line annotation
        const chart = chartInstances.connectionErrors;
        if (chart) {
            const targetErrorRate = 10;
            // @ts-ignore
            const originalAfterDraw = chart.options.plugins?.afterDraw;

            chart.options.plugins = chart.options.plugins || {};
            // @ts-ignore
            chart.options.plugins.afterDraw = (chart) => {
                if (originalAfterDraw) originalAfterDraw(chart);

                const ctx = chart.ctx;
                const yAxis = chart.scales.y1;
                const yPos = yAxis.getPixelForValue(targetErrorRate);

                ctx.save();
                ctx.beginPath();
                ctx.moveTo(chart.chartArea.left, yPos);
                ctx.lineTo(chart.chartArea.right, yPos);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#dc3545';
                ctx.setLineDash([5, 5]);
                ctx.stroke();

                ctx.fillStyle = '#dc3545';
                ctx.font = "10px 'Montserrat', sans-serif";
                ctx.textAlign = 'right';
                ctx.fillText('Objetivo: <10%', chart.chartArea.right - 5, yPos - 5);
                ctx.restore();
            };
        }
    } catch (error) {
        console.error('Error al inicializar el gráfico de Análisis de Errores de Conexión:', error);
    }
};
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
    --porsche-success: #28a745;
    --porsche-warning: #ffc107;
    --porsche-danger: #dc3545;
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

.live-indicator {
    background: linear-gradient(90deg, var(--porsche-yellow) 0%, var(--porsche-yellow-dark) 100%);
    color: var(--porsche-black);
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 12px;
    margin-left: auto;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(255, 218, 0, 0.3);
    animation: pulse 1.5s infinite;
}

.error-status {
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 12px;
    margin-left: auto;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-good {
    background: linear-gradient(90deg, #d4edda 0%, #c3e6cb 100%);
    color: #155724;
}

.status-warning {
    background: linear-gradient(90deg, #fff3cd 0%, #ffeeba 100%);
    color: #856404;
}

.status-critical {
    background: linear-gradient(90deg, #f8d7da 0%, #f5c6cb 100%);
    color: #721c24;
}

@keyframes pulse {
    0% {
        opacity: 1;
        transform: scale(1);
    }

    50% {
        opacity: 0.8;
        transform: scale(1.05);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
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

.custom-chart {
    width: 100%;
    height: 100%;
}

.real-time-chart {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
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
