import { useAuth } from '@/composables/useAuth'
import { API_BASE_URL } from './api-config'

export async function request(path: string, options: RequestInit = {}) {
  const { token, logout, resetInactivityTimer } = useAuth()
  
  const headers = new Headers(options.headers || {})
  if (token.value) {
    headers.set('Authorization', `Bearer ${token.value}`)
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  })

  // Reset timer on active response
  if (response.ok) {
    resetInactivityTimer()
  }
  
  if (response.status === 401) {
    logout()
    throw new Error('Phiên làm việc hết hạn hoặc chưa xác thực')
  }
  
  return response
}
