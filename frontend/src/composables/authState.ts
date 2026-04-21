import { ref } from 'vue'

export const user = ref<any>(null)
export const token = ref<string | null>(localStorage.getItem('token'))
export const lastActivity = ref<number>(Date.now())

// Initialize from local storage
const storedUser = localStorage.getItem('user')
if (storedUser) {
  try {
    user.value = JSON.parse(storedUser)
  } catch (e) {
    localStorage.removeItem('user')
  }
}
