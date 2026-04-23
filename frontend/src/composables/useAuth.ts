import { h, computed } from 'vue'
import router from '@/router' 
import { API_BASE_URL } from '@/lib/api-config'
import { toast } from 'vue-sonner'
import { XCircle } from 'lucide-vue-next'
import { user, token, lastActivity, isSessionExpired } from './authState'

const INACTIVITY_LIMIT = 2 * 60 * 1000 // 30 minutes

export function useAuth() {
  const setAuth = (newToken: string, newUser: any) => {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    resetInactivityTimer()
  }

  const clearAuth = () => {
    const currentPath = router.currentRoute.value.fullPath
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    if (currentPath && currentPath !== '/') {
      router.replace({ name: 'login', query: { redirect: currentPath } })
    } else {
      router.replace('/')
    }
  }

  const login = async (username: string, password: string, redirectPath?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại')
      }

      setAuth(data.access_token, data.user)

      // Ưu tiên redirectPath truyền vào, sau đó mới đến query từ router, cuối cùng là /users
      const target = redirectPath || (router.currentRoute.value.query.redirect as string)
      
      if (target && target !== '/' && target !== '/login') {
        router.push(target)
      } else {
        router.push('/users')
      }
      return true
    } catch (err: any) {
      toast('Lỗi', {
        description: err.message,
        icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
        position: 'top-center',
      })
      return false
    }
  }

  const logout = () => {
    clearAuth()
  }

  const resetInactivityTimer = () => {
    lastActivity.value = Date.now()
  }

  const checkInactivity = () => {
    if (token.value && Date.now() - lastActivity.value > INACTIVITY_LIMIT) {
      isSessionExpired.value = true
    }
  }

  const can = (action: string, subject: string) => {
    if (!user.value || !user.value.roles || !Array.isArray(user.value.roles)) return false
    
    // Admin has all permissions
    try {
      const isAdmin = user.value.roles.some((role: any) => 
        role?.name?.toLowerCase() === 'admin'
      )
      if (isAdmin) return true

      // Check permissions in all roles
      return user.value.roles.some((role: any) => 
        Array.isArray(role.permissions) && role.permissions.some((p: any) => 
          (p.action === 'manage' || p.action === action) && 
          (p.subject === 'all' || p.subject === subject)
        )
      )
    } catch (e) {
      console.error('Permission check error:', e)
      return false
    }
  }

  return {
    user,
    token,
    login,
    logout,
    can,
    checkInactivity,
    resetInactivityTimer,
    isSessionExpired,
    isAuthenticated: computed(() => !!token.value)
  }
}

// Sync across tabs
window.addEventListener('storage', (event) => {
  if (event.key === 'token') {
    token.value = event.newValue
  }
  if (event.key === 'user') {
    if (event.newValue) {
      try {
        user.value = JSON.parse(event.newValue)
      } catch (e) {
        user.value = null
      }
    } else {
      user.value = null
    }
  }
})
