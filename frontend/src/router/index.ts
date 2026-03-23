import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/pages/LoginForm.vue'),
    },
    {
      path: '/users',
      name: 'users.index',
      component: () => import('@/pages/users/Index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/roles',
      name: 'roles.index',
      component: () => import('@/pages/roles/Index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/permissions',
      name: 'permissions.index',
      component: () => import('@/pages/permissions/Index.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('@/pages/users/components/ChangePasswordAccount.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const { token } = useAuth()

  if (to.meta.requiresAuth && !token.value) {
    next({ name: 'login' })
  } else if (to.name === 'login' && token.value) {
    next({ name: 'users.index' })
  } else {
    next()
  }
})

export default router
