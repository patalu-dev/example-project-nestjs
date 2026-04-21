<script setup lang="ts">
import { ref, reactive, h, watchEffect } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, XCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

import { useAuth } from '@/composables/useAuth'

const { login: authLogin, token } = useAuth()
const router = useRouter()
const route = useRoute()
const loading = ref(false)
const showLoading = ref(false)
let loadingTimeout: any = null

const form = reactive({
  username: '',
  password: '',
})

// Tự động chuyển hướng nếu đã đăng nhập
watchEffect(() => {
  if (token.value && (route.name === 'login' || route.path === '/')) {
    const redirect = route.query.redirect as string
    if (redirect && redirect !== '/' && redirect !== '/login') {
      router.push(redirect)
    } else {
      router.push('/users')
    }
  }
})

const handleLogin = async () => {
  if (!form.username || !form.password) {
    toast('Thông báo', {
      description: 'Vui lòng nhập đầy đủ username và mật khẩu',
      icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
      position: 'top-center',
    });
    return
  }

  loading.value = true
  loadingTimeout = setTimeout(() => {
    showLoading.value = true
  }, 1000)

  // Lấy redirect từ query
  const redirect = route.query.redirect as string
  await authLogin(form.username, form.password, redirect)

  loading.value = false
  if (loadingTimeout) clearTimeout(loadingTimeout)
  showLoading.value = false
}
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <Card>
        <CardHeader class="text-center">
          <CardTitle class="text-xl">Chào mừng trở lại</CardTitle>
          <CardDescription>
            Đăng nhập bằng tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form @submit.prevent="handleLogin">
            <FieldGroup class="grid gap-6">
              <Field class="grid gap-2">
                <FieldLabel for="username">Tài khoản</FieldLabel>
                <Input id="username" v-model="form.username" type="text" placeholder="Nhập tài khoản" required />
              </Field>
              <Field class="grid gap-2">
                <div class="flex items-center">
                  <FieldLabel for="password">Mật khẩu</FieldLabel>
                </div>
                <Input id="password" v-model="form.password" type="password" placeholder="Nhập mật khẩu" required />
              </Field>
              <div class="flex flex-col gap-3 my-3">
                <Button type="submit" class="w-full" :disabled="loading">
                  <template v-if="showLoading">
                    <Loader2 class="animate-spin" /> Đang đăng nhập...
                  </template>
                  <template v-else>
                    Đăng nhập
                  </template>
                </Button>
              </div>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
