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
                        <span>Technical</span>
                    </div>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true" class="ion-padding porsche-content">
            <ion-header collapse="condense">
                <ion-toolbar>
                    <ion-title size="large">Technical</ion-title>
                </ion-toolbar>
            </ion-header>

            <!-- Grid principal del Dashboard -->
            <ion-grid class="dashboard-grid">
                <!-- 🟢 Fila 1: 3 Columnas -->
                <ion-row class="ion-row-1">
                    <ion-col size="12" size-lg="4">
                        <div class="box">
                            <div class="chart-title">OBD Diagnosis Time</div>
                            <div class="chart-container">
                                <!-- Chart.js - OBD Diagnosis Time -->
                                <canvas ref="obdTimeChart"></canvas>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="6" size-lg="4">
                        <div class="box">
                            <div class="chart-title">Connection Errors</div>
                            <div class="chart-container">
                                <!-- Custom Chart - Connection Errors -->
                                <div ref="connectionErrorsChart" class="custom-chart"></div>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="6" size-lg="4">
                        <div class="box">
                            <div class="chart-title">Map Scroll Stability</div>
                            <div class="chart-container">
                                <!-- ApexCharts - Map Scroll Stability -->
                                <div ref="mapScrollChart"></div>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>

                <!-- 🔵 Fila 2: 2 Columnas -->
                <ion-row class="ion-row-2">
                    <ion-col size="12" size-md="3" push-md="9">
                        <div class="box">
                            <div class="chart-title">Loading Times</div>
                            <div class="chart-container">
                                <!-- Real-time Chart - Loading Times -->
                                <div ref="loadingTimesChart" class="real-time-chart"></div>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="12" size-md="9" pull-md="3">
                        <div class="box">
                            <div class="chart-title">Appointment Booking Success</div>
                            <div class="chart-container">
                                <!-- ECharts - Appointment Booking Success -->
                                <div ref="appointmentChart" style="height: 100%; width: 100%;"></div>
                            </div>
                        </div>
                    </ion-col>
                </ion-row>

                <!-- 🟠 Fila 3: 3 Columnas -->
                <ion-row class="ion-row-3">
                    <ion-col size="12" size-lg="4.5">
                        <div class="box">
                            <div class="chart-title">User Satisfaction</div>
                            <div class="chart-container">
                                <!-- ApexCharts - User Satisfaction -->
                                <div ref="satisfactionChart"></div>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="12" size-lg="4.5">
                        <div class="box">
                            <div class="chart-title">Feature Adoption</div>
                            <div class="chart-container">
                                <!-- ECharts - Feature Adoption -->
                                <div ref="featureAdoptionChart" style="height: 100%; width: 100%;"></div>
                            </div>
                        </div>
                    </ion-col>
                    <ion-col size="12" size-lg="3">
                        <div class="box">
                            <div class="chart-title">App Retention</div>
                            <div class="chart-container">
                                <!-- Chart.js - App Retention -->
                                <canvas ref="retentionChart"></canvas>
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
import { onMounted, ref, onBeforeUnmount } from 'vue';
import Chart from 'chart.js/auto';
import * as echarts from 'echarts';
import ApexCharts from 'apexcharts';

// Chart references
const obdTimeChart = ref<HTMLCanvasElement | null>(null);
const connectionErrorsChart = ref<HTMLCanvasElement | null>(null);
const mapScrollChart = ref<HTMLCanvasElement | null>(null);
const loadingTimesChart = ref<HTMLCanvasElement | null>(null);
const appointmentChart = ref<HTMLCanvasElement | null>(null);
const satisfactionChart = ref<HTMLCanvasElement | null>(null);
const featureAdoptionChart = ref<HTMLCanvasElement | null>(null);
const retentionChart = ref<HTMLCanvasElement | null>(null);

// Chart instances
let chartInstances = {
    obdTime: null as Chart | null,
    connectionErrors: null as any,
    mapScroll: null as ApexCharts | null,
    loadingTimes: null as any,
    appointment: null as echarts.ECharts | null,
    satisfaction: null as ApexCharts | null,
    featureAdoption: null as echarts.ECharts | null,
    retention: null as Chart | null
};

// Real-time data interval
let realTimeInterval: number | null = null;

onMounted(() => {
    // Initialize all charts
    initOBDTimeChart();
    initConnectionErrorsChart();
    initMapScrollChart();
    initLoadingTimesChart();
    initAppointmentChart();
    initSatisfactionChart();
    initFeatureAdoptionChart();
    initRetentionChart();

    // Handle window resize for responsive charts
    window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
    // Clean up chart instances and event listeners
    if (chartInstances.obdTime) chartInstances.obdTime.destroy();
    if (chartInstances.mapScroll) chartInstances.mapScroll.destroy();
    if (chartInstances.satisfaction) chartInstances.satisfaction.destroy();
    if (chartInstances.appointment) chartInstances.appointment.dispose();
    if (chartInstances.featureAdoption) chartInstances.featureAdoption.dispose();
    if (chartInstances.retention) chartInstances.retention.destroy();

    // Clear real-time interval
    if (realTimeInterval) clearInterval(realTimeInterval);

    // Remove event listeners
    window.removeEventListener('resize', handleResize);
});

// Handle window resize
const handleResize = () => {
    if (chartInstances.appointment) chartInstances.appointment.resize();
    if (chartInstances.featureAdoption) chartInstances.featureAdoption.resize();
    if (chartInstances.mapScroll) chartInstances.mapScroll.render();
    if (chartInstances.satisfaction) chartInstances.satisfaction.render();
};

// 1. Chart.js - OBD Diagnosis Time (Line Chart)
const initOBDTimeChart = () => {
    if (!obdTimeChart.value) return;

    const ctx = obdTimeChart.value.getContext('2d')!;
    if (!ctx) return;

    // Data for OBD Diagnosis Time (target: < 3 seconds)
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = [5.2, 4.8, 4.1, 3.7, 3.2, 2.9];

    chartInstances.obdTime = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'OBD Diagnosis Time (seconds)',
                data: data,
                borderColor: '#FFDA00', // Amarillo Porsche
                backgroundColor: 'rgba(255, 218, 0, 0.1)', // Amarillo Porsche transparente
                tension: 0.4,
                fill: true
            }, {
                label: 'Target',
                data: [3, 3, 3, 3, 3, 3],
                borderColor: '#000000', // Negro
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
                        color: '#000000' // Negro
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    min: 0,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)' // Líneas de cuadrícula sutiles
                    },
                    ticks: {
                        color: '#000000' // Negro
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)' // Líneas de cuadrícula sutiles
                    },
                    ticks: {
                        color: '#000000' // Negro
                    }
                }
            }
        }
    });
};

// 2. Custom Chart - Connection Errors (Bar Chart)
const initConnectionErrorsChart = () => {
    if (!connectionErrorsChart.value) return;

    // Data for Connection Errors (target: 90% reduction)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const errors = [120, 105, 82, 45, 23, 12];
    const maxErrors = Math.max(...errors);

    // Create custom chart
    const container = connectionErrorsChart.value;
    container.innerHTML = '';

    // Create chart title and container
    const chartContainer = document.createElement('div');
    chartContainer.style.height = '100%';
    chartContainer.style.display = 'flex';
    chartContainer.style.flexDirection = 'column';
    chartContainer.style.padding = '10px';
    container.appendChild(chartContainer);

    // Create bars container
    const barsContainer = document.createElement('div');
    barsContainer.style.display = 'flex';
    barsContainer.style.alignItems = 'flex-end';
    barsContainer.style.justifyContent = 'space-between';
    barsContainer.style.height = '80%';
    barsContainer.style.marginTop = '10px';
    chartContainer.appendChild(barsContainer);

    // Create x-axis labels
    const labelsContainer = document.createElement('div');
    labelsContainer.style.display = 'flex';
    labelsContainer.style.justifyContent = 'space-between';
    labelsContainer.style.marginTop = '5px';
    chartContainer.appendChild(labelsContainer);

    // Create bars and labels
    months.forEach((month, index) => {
        // Create bar
        const barWrapper = document.createElement('div');
        barWrapper.style.display = 'flex';
        barWrapper.style.flexDirection = 'column';
        barWrapper.style.alignItems = 'center';
        barWrapper.style.width = `${100 / months.length - 5}%`;

        // Create value label
        const valueLabel = document.createElement('div');
        valueLabel.textContent = errors[index].toString();
        valueLabel.style.color = '#000000'; // Negro
        valueLabel.style.fontSize = '10px';
        valueLabel.style.marginBottom = '5px';
        barWrapper.appendChild(valueLabel);

        // Create bar
        const bar = document.createElement('div');
        const height = (errors[index] / maxErrors) * 100;
        bar.style.height = `${height}%`;
        bar.style.width = '100%';
        bar.style.backgroundColor = '#FFDA00'; // Amarillo Porsche
        bar.style.borderRadius = '4px';
        bar.style.transition = 'height 0.5s ease';
        barWrapper.appendChild(bar);

        barsContainer.appendChild(barWrapper);

        // Create month label
        const label = document.createElement('div');
        label.textContent = month;
        label.style.width = `${100 / months.length - 5}%`;
        label.style.textAlign = 'center';
        label.style.color = '#000000'; // Negro
        label.style.fontSize = '12px';
        labelsContainer.appendChild(label);
    });

    // Store reference to custom chart
    chartInstances.connectionErrors = container;
};

// 3. ApexCharts - Map Scroll Stability (Area Chart)
const initMapScrollChart = () => {
    if (!mapScrollChart.value) return;

    // Data for Map Scroll Stability (target: 20% improvement)
    const options = {
        series: [{
            name: 'Stability Score',
            data: [72, 74, 78, 83, 87, 90]
        }],
        chart: {
            type: 'area',
            height: '100%',
            toolbar: {
                show: false
            },
            foreColor: '#000000' // Negro
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 3
        },
        colors: ['#FFDA00'], // Amarillo Porsche
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            labels: {
                style: {
                    colors: '#000000' // Negro
                }
            }
        },
        yaxis: {
            min: 60,
            max: 100,
            labels: {
                style: {
                    colors: '#000000' // Negro
                }
            }
        },
        grid: {
            borderColor: 'rgba(0, 0, 0, 0.1)', // Negro transparente
            row: {
                colors: ['transparent']
            }
        },
        tooltip: {
            theme: 'light' // Tema claro
        }
    };

    chartInstances.mapScroll = new ApexCharts(mapScrollChart.value, options);
    chartInstances.mapScroll.render();
};

// 4. Real-time Chart - Loading Times
const initLoadingTimesChart = () => {
    if (!loadingTimesChart.value) return;

    const container = loadingTimesChart.value;
    container.innerHTML = '';

    // Create chart elements
    const chartHeader = document.createElement('div');
    chartHeader.style.display = 'flex';
    chartHeader.style.justifyContent = 'space-between';
    chartHeader.style.marginBottom = '10px';
    container.appendChild(chartHeader);

    // Current value display
    const valueDisplay = document.createElement('div');
    valueDisplay.style.fontSize = '24px';
    valueDisplay.style.fontWeight = 'bold';
    valueDisplay.style.color = '#000000'; // Negro
    valueDisplay.textContent = '2.3s';
    chartHeader.appendChild(valueDisplay);

    // Status indicator
    const statusIndicator = document.createElement('div');
    statusIndicator.style.display = 'flex';
    statusIndicator.style.alignItems = 'center';
    statusIndicator.style.gap = '5px';
    chartHeader.appendChild(statusIndicator);

    const statusDot = document.createElement('div');
    statusDot.style.width = '10px';
    statusDot.style.height = '10px';
    statusDot.style.borderRadius = '50%';
    statusDot.style.backgroundColor = '#FFDA00'; // Amarillo Porsche
    statusIndicator.appendChild(statusDot);

    const statusText = document.createElement('div');
    statusText.style.color = '#000000'; // Negro
    statusText.textContent = 'Live';
    statusIndicator.appendChild(statusText);

    // Chart container
    const chartArea = document.createElement('div');
    chartArea.style.height = 'calc(100% - 40px)';
    chartArea.style.position = 'relative';
    chartArea.style.overflow = 'hidden';
    container.appendChild(chartArea);

    // Create line chart
    const lineChart = document.createElement('canvas');
    lineChart.style.width = '100%';
    lineChart.style.height = '100%';
    chartArea.appendChild(lineChart);

    // Initialize Chart.js for real-time data
    const ctx = lineChart.getContext('2d');
    if (!ctx) return;

    // Initial data
    const maxDataPoints = 20;
    const initialData = Array.from({ length: maxDataPoints }, () => Math.random() * 2 + 1);

    const realTimeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: maxDataPoints }, (_, i) => ''),
            datasets: [{
                label: 'Loading Time (s)',
                data: initialData,
                borderColor: '#FFDA00', // Amarillo Porsche
                backgroundColor: 'rgba(255, 218, 0, 0.1)', // Amarillo Porsche transparente
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: false,
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

    // Update real-time data
    realTimeInterval = window.setInterval(() => {
        // Generate new data point
        const newValue = Math.random() * 2 + 1;

        // Update chart data
        realTimeChart.data.datasets[0].data.push(newValue);
        realTimeChart.data.datasets[0].data.shift();

        // Update value display
        valueDisplay.textContent = `${newValue.toFixed(1)}s`;

        // Update status color based on value
        if (newValue > 3) {
            statusDot.style.backgroundColor = '#000000'; // Negro para error
        } else if (newValue > 2) {
            statusDot.style.backgroundColor = '#AA9600'; // Amarillo Porsche oscuro para advertencia
        } else {
            statusDot.style.backgroundColor = '#FFDA00'; // Amarillo Porsche para normal
        }

        realTimeChart.update();
    }, 1000);

    // Store reference
    chartInstances.loadingTimes = realTimeChart;
};

// 5. ECharts - Appointment Booking Success (Stacked Bar Chart)
const initAppointmentChart = () => {
    if (!appointmentChart.value) return;

    // Initialize ECharts instance
    chartInstances.appointment = echarts.init(appointmentChart.value);

    // Data for Appointment Booking Success (target: 25% increase)
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['Successful', 'Failed'],
            textStyle: {
                color: '#000000' // Negro
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            axisLine: {
                lineStyle: {
                    color: 'rgba(0, 0, 0, 0.3)' // Negro transparente
                }
            },
            axisLabel: {
                color: '#000000' // Negro
            }
        },
        yAxis: {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: 'rgba(0, 0, 0, 0.3)' // Negro transparente
                }
            },
            splitLine: {
                lineStyle: {
                    color: 'rgba(0, 0, 0, 0.1)' // Negro muy transparente
                }
            },
            axisLabel: {
                color: '#000000' // Negro
            }
        },
        series: [
            {
                name: 'Successful',
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: [120, 132, 145, 160, 178, 190],
                itemStyle: {
                    color: '#FFDA00' // Amarillo Porsche
                }
            },
            {
                name: 'Failed',
                type: 'bar',
                stack: 'total',
                emphasis: {
                    focus: 'series'
                },
                data: [45, 40, 35, 30, 25, 20],
                itemStyle: {
                    color: '#000000' // Negro
                }
            }
        ]
    };

    // Set chart options
    chartInstances.appointment.setOption(option);
};

// 6. ApexCharts - User Satisfaction (Radial Bar Chart)
const initSatisfactionChart = () => {
    if (!satisfactionChart.value) return;

    // Data for User Satisfaction (target: 4.5/5)
    const options = {
        series: [82],
        chart: {
            height: '100%',
            type: 'radialBar',
            foreColor: '#000000' // Negro
        },
        plotOptions: {
            radialBar: {
                hollow: {
                    size: '70%',
                },
                dataLabels: {
                    name: {
                        show: true,
                        color: '#000000', // Negro
                        fontSize: '16px',
                        offsetY: -10
                    },
                    value: {
                        show: true,
                        color: '#000000', // Negro
                        fontSize: '30px',
                        formatter: function (val: number) {
                            return (val / 100 * 5).toFixed(1) + '/5.0';
                        }
                    }
                },
                track: {
                    background: 'rgba(0, 0, 0, 0.1)' // Negro transparente
                }
            }
        },
        fill: {
            colors: ['#FFDA00'] // Amarillo Porsche
        },
        stroke: {
            lineCap: 'round'
        },
        labels: ['User Rating']
    };

    chartInstances.satisfaction = new ApexCharts(satisfactionChart.value, options);
    chartInstances.satisfaction.render();
};

// 7. ECharts - Feature Adoption (Pie Chart)
const initFeatureAdoptionChart = () => {
    if (!featureAdoptionChart.value) return;

    // Initialize ECharts instance
    chartInstances.featureAdoption = echarts.init(featureAdoptionChart.value);

    // Data for Feature Adoption (target: 50% using 3+ features)
    const option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
                color: '#000000' // Negro
            }
        },
        series: [
            {
                name: 'Feature Usage',
                type: 'pie',
                radius: '70%',
                center: ['60%', '50%'],
                data: [
                    { value: 35, name: '3+ Features' },
                    { value: 25, name: '2 Features' },
                    { value: 20, name: '1 Feature' },
                    { value: 20, name: 'No Features' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)' // Negro transparente
                    }
                },
                label: {
                    color: '#000000' // Negro
                },
                labelLine: {
                    lineStyle: {
                        color: 'rgba(0, 0, 0, 0.3)' // Negro transparente
                    }
                },
                itemStyle: {
                    color: function (params: any) {
                        const colorList = ['#FFDA00', '#D5B800', '#AA9600', '#000000']; // Variaciones de amarillo Porsche y negro
                        return colorList[params.dataIndex];
                    }
                }
            }
        ]
    };

    // Set chart options
    chartInstances.featureAdoption.setOption(option);
};

// 8. Chart.js - App Retention (Doughnut Chart)
const initRetentionChart = () => {
    if (!retentionChart.value) return;

    const ctx = retentionChart.value.getContext('2d')!;
    if (!ctx) return;

    // Data for App Retention (target: 15% reduction in churn)
    chartInstances.retention = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Retained', 'Churned'],
            datasets: [{
                data: [78, 22],
                backgroundColor: [
                    '#FFDA00', // Amarillo Porsche
                    '#000000' // Negro
                ],
                borderColor: [
                    '#FFFFFF', // Blanco
                    '#FFFFFF' // Blanco
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#000000', // Negro
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
};
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
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    padding: 0 5px;
    color: #000000;
    /* Texto negro */
}

.chart-container {
    flex: 1;
    width: 100%;
    height: calc(100% - 30px);
    position: relative;
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

/* Custom chart styles */
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
</style>