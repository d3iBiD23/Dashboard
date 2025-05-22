<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar class="porsche-toolbar">
                <ion-buttons slot="start">
                    <ion-menu-button color="dark"></ion-menu-button>
                </ion-buttons>
                <ion-title class="ion-text-center">
                    <div class="title-container">
                        <span>KPIs</span>
                    </div>
                </ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-content :scrollY="true" class="porsche-content">
            <div class="dashboard-background"></div>
            <div class="kpi-container">
                <h1 class="section-title">KPIs de Negocio</h1>
                <ion-accordion-group expand="inset" :multiple="true" class="porsche-accordion">
                    <ion-accordion v-for="item in businessKpis" :key="item.id" :value="item.id.toString()">
                        <ion-item slot="header" class="porsche-accordion-header">
                            <ion-label>{{ item.id }}. {{ item.title }}</ion-label>
                        </ion-item>
                        <div class="ion-padding porsche-accordion-content" slot="content">
                            <p v-html="item.description"></p>
                            <ion-list :inset="true" class="porsche-list">
                                <ion-item v-for="(element, index) in item.smart" :key="index" class="porsche-list-item">
                                    <ion-label><span class="smart-letter">{{ element.letter }}</span> → {{
                                        element.content
                                    }}</ion-label>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>

                <h1 class="section-title">KPIs Técnicos</h1>
                <ion-accordion-group expand="inset" :multiple="true" class="porsche-accordion">
                    <ion-accordion v-for="item in technicalKpis" :key="item.id" :value="item.id.toString()">
                        <ion-item slot="header" class="porsche-accordion-header">
                            <ion-label>{{ item.id }}. {{ item.title }}</ion-label>
                        </ion-item>
                        <div class="ion-padding porsche-accordion-content" slot="content">
                            <p>{{ item.description }}</p>
                            <ion-list :inset="true" class="porsche-list">
                                <ion-item v-for="(element, index) in item.smart" :key="index" class="porsche-list-item">
                                    <ion-label><span class="smart-letter">{{ element.letter }}</span> → {{
                                        element.content
                                    }}</ion-label>
                                </ion-item>
                            </ion-list>
                        </div>
                    </ion-accordion>
                </ion-accordion-group>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonList } from '@ionic/vue';
import { ref } from 'vue';

// Definición de la estructura de datos para un objetivo SMART
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

// Array de objetivos SMART para KPIs de Negocio
const businessKpis = ref<SmartGoal[]>([
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

// Array de objetivos SMART para KPIs Técnicos
const technicalKpis = ref<SmartGoal[]>([
    {
        id: 1,
        title: "Optimización del tiempo de diagnóstico OBD",
        description: "Optimizar el tiempo de carga del diagnóstico OBD a menos de 3 segundos antes de fin de trimestre.",
        smart: [
            { letter: "S", content: "Optimizar el tiempo de carga del diagnóstico OBD" },
            { letter: "M", content: "Reducir a menos de 3 segundos" },
            { letter: "A", content: "mediante mejoras en el procesamiento y optimización del código" },
            { letter: "R", content: "KPI: Tiempo medio de carga de la pantalla de diagnóstico" },
            { letter: "T", content: "antes de fin de trimestre" }
        ]
    },
    {
        id: 2,
        title: "Reducción de errores de conexión",
        description: "Reducir los errores de conexión al sistema de control remoto en un 90% en los próximos 2 meses.",
        smart: [
            { letter: "S", content: "Reducir los errores de conexión al sistema de control remoto" },
            { letter: "M", content: "Reducción del 90% en errores de conexión" },
            { letter: "A", content: "mediante mejoras en la gestión de conexiones y manejo de errores" },
            { letter: "R", content: "KPI: Número de errores de conexión detectados por semana" },
            { letter: "T", content: "en los próximos 2 meses" }
        ]
    },
    {
        id: 3,
        title: "Estabilidad del scroll en mapa",
        description: "Incrementar en un 20% la estabilidad del scroll en el mapa interactivo en los próximos 3 meses.",
        smart: [
            { letter: "S", content: "Incrementar la estabilidad del scroll en el mapa interactivo" },
            { letter: "M", content: "Mejora del 20% en la estabilidad" },
            { letter: "A", content: "mediante optimización de renderizado y gestión de memoria" },
            { letter: "R", content: "KPI: Porcentaje de sesiones con desplazamiento de mapa exitoso sin errores de renderizado" },
            { letter: "T", content: "en los próximos 3 meses" }
        ]
    },
    {
        id: 4,
        title: "Tasa de éxito en programación de citas",
        description: "Aumentar en un 25% la tasa de éxito en la programación de citas desde la app en 3 meses.",
        smart: [
            { letter: "S", content: "Aumentar la tasa de éxito en la programación de citas" },
            { letter: "M", content: "Incremento del 25% en la tasa de éxito" },
            { letter: "A", content: "mediante mejoras en la interfaz y procesos de comunicación" },
            { letter: "R", content: "KPI: Número de citas programadas vs. intentos fallidos" },
            { letter: "T", content: "en 3 meses" }
        ]
    },
    {
        id: 5,
        title: "Reducción de tiempos de carga prolongados",
        description: "Reducir el número de pantallas con pantallas de carga (\"after delay\") superiores a 2 segundos en un 50% en 2 meses.",
        smart: [
            { letter: "S", content: "Reducir el número de pantallas con tiempos de carga prolongados" },
            { letter: "M", content: "Reducción del 50% en pantallas con carga superior a 2 segundos" },
            { letter: "A", content: "mediante optimización de código y mejora de carga asincrónica" },
            { letter: "R", content: "KPI: Tiempo promedio de carga de las pantallas críticas" },
            { letter: "T", content: "en 2 meses" }
        ]
    }
]);
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

.kpi-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}

.section-title {
    color: var(--porsche-black);
    font-weight: 700;
    font-size: 28px;
    margin: 24px 0 16px;
    position: relative;
    display: inline-block;
    letter-spacing: 0.5px;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, var(--porsche-yellow) 0%, var(--porsche-yellow-dark) 100%);
    border-radius: 2px;
}

.porsche-accordion {
    --ion-item-background: transparent;
    margin-bottom: 30px;
}

.porsche-accordion-header {
    --background: #FFFFFF;
    --color: var(--porsche-black);
    border-radius: 12px;
    margin-bottom: 8px;
    font-weight: 500;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    overflow: hidden;
}

.porsche-accordion-header:hover {
    --background: #FAFAFA;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.porsche-accordion-content {
    background-color: #FFFFFF;
    color: var(--porsche-black);
    border-radius: 0 0 12px 12px;
    margin-top: -8px;
    margin-bottom: 16px;
    padding: 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
    line-height: 1.6;
}

.porsche-list {
    background-color: transparent;
    margin-top: 16px;
}

.porsche-list-item {
    --background: transparent;
    --color: var(--porsche-black);
    --border-color: rgba(0, 0, 0, 0.05);
    --padding-start: 0;
    --inner-padding-end: 0;
    margin-bottom: 8px;
}

.smart-letter {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    line-height: 28px;
    text-align: center;
    background: linear-gradient(135deg, var(--porsche-yellow) 0%, var(--porsche-yellow-dark) 100%);
    color: var(--porsche-black);
    border-radius: 50%;
    margin-right: 12px;
    font-weight: 700;
    box-shadow: 0 2px 8px rgba(255, 218, 0, 0.3);
}

/* Estilos mejorados para el estado activo del acordeón */
ion-accordion.accordion-expanding ion-item[slot='header'],
ion-accordion.accordion-expanded ion-item[slot='header'] {
    --background: #FFFFFF;
    --color: var(--porsche-black);
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* Añadir un borde izquierdo para mayor énfasis visual */
ion-accordion.accordion-expanded ion-item[slot='header'] {
    border-left: 4px solid var(--porsche-yellow);
    --padding-start: 12px;
}

/* Mejorar la visibilidad del texto en el estado activo */
ion-accordion.accordion-expanded ion-item[slot='header'] ion-label {
    font-weight: 700;
    color: var(--porsche-black);
}

p {
    margin-bottom: 16px;
    line-height: 1.6;
    color: var(--porsche-gray);
}
</style>