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
              <ion-list-header class="montserrat-font">PorscheLink</ion-list-header>
              <ion-note class="montserrat-font">PorscheLink Dashboard</ion-note>
            </div>

            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in appPages" :key="i">
              <ion-item @click="setSelectedIndex(i)" router-direction="root" :router-link="p.url" lines="none"
                :detail="false" class="porsche-item" :class="{ selected: selectedIndex === i }">
                <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label class="montserrat-font">{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>
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
    title: 'Dashboard Negocio',
    url: '/business',
    iosIcon: rocketOutline,
    mdIcon: rocketSharp,
  },
  {
    title: 'Dashboard Técnico',
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

const currentPath = computed(() => route.path);

onMounted(() => {
  updateSelectedIndex();
  document.documentElement.classList.add('montserrat-root');
});

watch(currentPath, () => {
  updateSelectedIndex();
});

const updateSelectedIndex = () => {
  const index = appPages.findIndex(page => page.url === currentPath.value);
  selectedIndex.value = index !== -1 ? index : 0;
};

const setSelectedIndex = (index: number) => {
  selectedIndex.value = index;
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');

:root {
  --ion-font-family: 'Montserrat', sans-serif;
}

.montserrat-font {
  font-family: 'Montserrat', sans-serif !important;
}

.montserrat-root * {
  font-family: 'Montserrat', sans-serif !important;
}

ion-title,
ion-label,
ion-list-header,
ion-note,
ion-button,
ion-item,
ion-menu-toggle,
ion-card-title,
ion-card-subtitle,
ion-card-content,
ion-toolbar,
ion-header,
ion-footer,
ion-segment-button,
ion-tab-button,
ion-badge,
ion-chip,
ion-alert,
ion-toast,
ion-modal,
ion-popover,
ion-action-sheet,
ion-select,
ion-select-option,
ion-datetime,
ion-picker,
ion-range,
ion-toggle,
ion-checkbox,
ion-radio,
ion-searchbar,
ion-input,
ion-textarea {
  font-family: 'Montserrat', sans-serif !important;
}

h1,
h2,
h3,
h4,
h5,
h6,
p,
span,
div,
a,
button,
input,
select,
textarea,
label {
  font-family: 'Montserrat', sans-serif !important;
}
</style>

<style scoped>
:root {
  --porsche-yellow: #FFDA00;
  --porsche-yellow-light: #FFE866;
  --porsche-yellow-dark: #FFB800;
  --porsche-black: #000000;
  --porsche-gray-dark: #333333;
  --porsche-gray: #666666;
  --porsche-gray-light: #EEEEEE;
}

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
  background: linear-gradient(135deg, var(--porsche-yellow) 0%, var(--porsche-yellow-dark) 100%);
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.porsche-logo {
  height: rem;
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.porsche-list {
  background: #FFFFFF;
  flex: 1;
  padding-top: 16px;
}

.menu-header {
  padding: 0 20px 16px;
}

ion-list-header {
  font-size: 22px;
  font-weight: 700;
  color: var(--porsche-black);
  letter-spacing: 0.5px;
  padding: 0;
  margin-bottom: 4px;
}

ion-note {
  color: var(--porsche-gray);
  font-size: 14px;
  font-weight: 400;
}

.porsche-item {
  --background: transparent;
  --color: var(--porsche-gray-dark);
  margin: 8px 16px;
  border-radius: 12px;
  font-weight: 500;
  --padding-start: 16px;
  --padding-end: 16px;
  --min-height: 52px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;
}

.porsche-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--porsche-yellow) 0%, var(--porsche-yellow-dark) 100%);
  opacity: 0;
  transition: all 0.3s ease;
}

.porsche-item.selected {
  --background: linear-gradient(90deg, rgba(255, 218, 0, 0.15) 0%, rgba(255, 184, 0, 0.15) 100%);
  --color: var(--porsche-black);
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.porsche-item.selected::before {
  width: 4px;
  opacity: 1;
}

.porsche-item ion-icon {
  margin-right: 12px;
  font-size: 22px;
  color: var(--porsche-gray);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.porsche-item.selected ion-icon {
  color: var(--porsche-yellow-dark);
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(255, 184, 0, 0.3));
}

.porsche-item:hover:not(.selected) {
  --background: rgba(255, 218, 0, 0.05);
  transform: translateX(4px);
}

.porsche-item:hover:not(.selected) ion-icon {
  color: var(--porsche-yellow-dark);
}

ion-split-pane {
  --side-width: 280px;
  --side-max-width: 280px;
}
</style>
