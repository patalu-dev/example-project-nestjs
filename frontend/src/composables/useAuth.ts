import { ref, h, computed } from 'vue'
import router from '@/router' 
import { API_BASE_URL } from '@/lib/api-config'
import { toast } from 'vue-sonner'
import { XCircle } from 'lucide-vue-next'

const user = ref<any>(null)
const token = ref<string | null>(localStorage.getItem('token'))
const lastActivity = ref<number>(Date.now())
const INACTIVITY_LIMIT = 30 * 60 * 1000 // 30 minutes

// Load user from local storage if exists
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    user.value = JSON.parse(storedUser)
  } catch (e) {
    localStorage.removeItem('user')
  }
}

export function useAuth() {
  // const router = useRouter()

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
      router.push({ name: 'login', query: { redirect: currentPath } })
    } else {
      router.push('/')
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
      clearAuth()
      toast('Phiên làm việc hết hạn', {
        description: 'Bạn đã bị đăng xuất do không hoạt động trong 30 phút.',
        icon: h(XCircle, { class: 'text-orange-500 w-5 h-5' }),
        position: 'top-center',
      })
    }
  }

  return {
    user,
    token,
    login,
    logout,
    checkInactivity,
    resetInactivityTimer,
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
