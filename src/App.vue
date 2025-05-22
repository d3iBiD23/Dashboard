<template>
  <ion-app>
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay" class="porsche-menu">
        <ion-content class="porsche-menu-content">
          <div class="porsche-header">
            <img src="/porsche-logo.svg" alt="Porsche Logo" class="porsche-logo" />
          </div>
          <ion-list id="inbox-list" class="porsche-list">
            <div class="menu-header">
              <ion-list-header>Dashboard</ion-list-header>
              <ion-note>Data Visualization</ion-note>
            </div>

            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item @click="selectedIndex = i" router-direction="root" :router-link="p.url" lines="none"
                :detail="false" class="porsche-item" :class="{ selected: selectedIndex === i }">
                <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>

          <div class="porsche-footer">
            <div class="version">v1.0.0</div>
          </div>
        </ion-content>
      </ion-menu>
      <ion-router-outlet id="main-content"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu, IonMenuToggle, IonNote, IonRouterOutlet, IonSplitPane, } from '@ionic/vue';
import { rocketOutline, rocketSharp, pulseOutline, pulseSharp, speedometerOutline, speedometerSharp } from 'ionicons/icons';
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';

const selectedIndex = ref(0);
const appPages = [
  {
    title: 'Business Dashboard',
    url: '/business',
    iosIcon: rocketOutline,
    mdIcon: rocketSharp,
  },
  {
    title: 'Technical Dashboard',
    url: '/technical',
    iosIcon: pulseOutline,
    mdIcon: pulseSharp,
  },
  {
    title: 'KPIs',
    url: '/kpi',
    iosIcon: speedometerOutline,
    mdIcon: speedometerSharp,
  }
];
const route = useRoute();

// 🔄 Función para actualizar el `selectedIndex` según la URL actual
const currentPath = computed(() => route.path);

// Ejecutar cuando la app carga
onMounted(() => {
  const index = appPages.findIndex(page => page.url === currentPath.value);
  selectedIndex.value = index !== -1 ? index : 0;
});

// Ejecutar cada vez que cambia la ruta
watch(currentPath, () => {
  const index = appPages.findIndex(page => page.url === currentPath.value);
  selectedIndex.value = index !== -1 ? index : 0;
});
</script>

<style scoped>
/* Estilos de Porsche */
.porsche-menu {
  --background: #FFFFFF;
  --width: 280px;
}

.porsche-menu-content {
  --background: #FFFFFF;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.porsche-header {
  background-color: #FFDA00;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.porsche-logo {
  height: 40px;
  width: auto;
}

.porsche-list {
  background: #FFFFFF;
  flex: 1;
}

.menu-header {
  padding: 16px 16px 8px 16px;
}

.porsche-item {
  --background: #FFFFFF;
  --color: #333333;
  margin: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 48px;
  transition: all 0.2s ease;
}

.porsche-item.selected {
  --background: rgba(255, 218, 0, 0.15);
  --color: #000000;
  font-weight: 600;
}

.porsche-item.selected ion-icon {
  color: #000000;
}

.porsche-item ion-icon {
  margin-right: 12px;
  font-size: 20px;
}

.porsche-footer {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 12px;
  border-top: 1px solid #f0f0f0;
}

ion-split-pane {
  --side-width: 280px;
  --side-max-width: 280px;
}

ion-menu.md ion-list {
  padding: 0;
}

ion-menu.md ion-note {
  margin-bottom: 16px;
  color: #666666;
  font-size: 14px;
}

ion-menu.md ion-list-header {
  font-size: 20px;
  font-weight: 600;
  min-height: 20px;
  color: #000000;
  padding: 0;
  margin-bottom: 4px;
}

ion-menu.ios ion-content {
  --padding-bottom: 20px;
}

ion-menu.ios ion-list {
  padding: 0;
}

ion-menu.ios ion-note {
  line-height: 24px;
  margin-bottom: 12px;
  color: #666666;
}

ion-menu.ios ion-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 50px;
}

ion-menu.ios ion-item ion-icon {
  font-size: 24px;
  color: #000000;
}

ion-note {
  display: inline-block;
  font-size: 14px;
  color: #666666;
}
</style>