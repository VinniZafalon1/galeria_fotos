import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { isAuthenticated } from '@/services/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/', redirect: '/login'
  },
  { path: '/login', component: () => import('@/views/LoginPage.vue'), meta: { guest: true } },
  { path: '/cadastro', component: () => import('@/views/RegisterPage.vue'), meta: { guest: true } },
  { path: '/home', component: () => import('@/views/HomePage.vue'), meta: { requiresAuth: true } },
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
