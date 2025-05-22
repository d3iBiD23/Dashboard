import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/business'
  },
  {
    path: '/business',
    component: () => import ('../views/business/BusinessPage.vue')
  },
  {
    path: '/technical',
    component: () => import ('../views/technical/TechnicalPage.vue')
  },
  {
    path: '/kpi',
    component: () => import ('../views/kpi/KpiPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
