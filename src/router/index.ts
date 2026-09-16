import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { isAuthenticated } from '@/services/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/', redirect: '/login'
  },
  { path: '/login', component: () => import('@/views/LoginPage.vue'), meta: { guest: true } },
  { path: '/cadastro', component: () => import('@/views/RegisterPage.vue'), meta: { guest: true } },
  { path: '/home', redirect: '/tabs/tab1' },
  {
    path: '/tabs/',
    component: () => import('@/views/TabsPage.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/tabs/tab1' },
      { path: 'tab1', component: () => import('@/views/Tab1Page.vue') },
      { path: 'tab2', component: () => import('@/views/Tab2Page.vue') },
      { path: 'tab3', component: () => import('@/views/Tab3Page.vue') }
    ]
  },
  { path: '/sobre', component: () => import('@/views/AboutPage.vue'), meta: { requiresAuth: true } },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to) => {
  const authenticated = await isAuthenticated();
  if (to.meta.requiresAuth && !authenticated) return '/login';
  if (to.meta.guest && authenticated) return '/home';
  return true;
});

export default router
