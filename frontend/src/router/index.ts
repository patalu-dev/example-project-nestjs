import { createRouter, createWebHistory } from 'vue-router'
import { token, user } from '@/composables/authState'
import { h } from 'vue'
import { XCircle } from 'lucide-vue-next'

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
      meta: { requiresAuth: true, action: 'read', subject: 'User' },
    },
    {
      path: '/roles',
      name: 'roles.index',
      component: () => import('@/pages/roles/Index.vue'),
      meta: { requiresAuth: true, action: 'read', subject: 'Role' },
    },
    {
      path: '/permissions',
      name: 'permissions.index',
      component: () => import('@/pages/permissions/Index.vue'),
      meta: { requiresAuth: true, action: 'read', subject: 'Permission' },
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
  if (to.meta.requiresAuth && !token.value) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (to.name === 'login' && token.value) {
    next({ name: 'users.index' })
  } else if (to.meta.action && to.meta.subject) {
    // Logic can đơn giản cho router guard
    const isAdmin = user.value?.roles?.some((role: any) => 
      role?.name?.toLowerCase() === 'admin'
    )
    
    const hasPermission = isAdmin || user.value?.roles?.some((role: any) => 
      Array.isArray(role.permissions) && role.permissions.some((p: any) => 
        (p.action === 'manage' || p.action === to.meta.action) && 
        (p.subject === 'all' || p.subject === to.meta.subject)
      )
    )

    if (!hasPermission) {
      import('vue-sonner').then(({ toast }) => {
        toast.error('Bạn không có quyền truy cập vào chức năng này.', {
          icon: h(XCircle, { class: 'text-red-500 w-5 h-5' })
        })
      })
      
      // Nếu đang ở trang hiện tại mà muốn vào chính nó (hoặc trang login), redirect về dashboard
      if (to.name === 'login' || !_from.name) {
        next({ name: 'users.index' })
      } else {
        next(false) // Giữ nguyên trang hiện tại nếu chuyển từ trang khác sang
      }
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
