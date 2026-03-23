<script setup lang="ts">
import { ref, h } from 'vue'
import { useBreadcrumb } from '@/composables/useBreadcrumb'
import { Button } from '@/components/ui/button'
import { Save, CheckCircle, XCircle } from 'lucide-vue-next'
import { request } from '@/lib/api'
import { useRouter } from 'vue-router'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { toast } from 'vue-sonner'

const { setBreadcrumbs } = useBreadcrumb()
const router = useRouter()

setBreadcrumbs([
    { title: 'Thay đổi mật khẩu' },
])

// State
const loading = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')

const submit = async () => {
    if (!newPassword.value) {
        toast('Lỗi', {
            description: 'Vui lòng nhập mật khẩu mới',
            icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
            position: 'top-center'
        })
        return
    }

    if (newPassword.value !== confirmPassword.value) {
        toast('Lỗi', {
            description: 'Mật khẩu nhập lại không khớp',
            icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
            position: 'top-center'
        })
        return
    }

    loading.value = true
    try {
        const response = await request('/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword: newPassword.value }),
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Có lỗi xảy ra khi đổi mật khẩu')
        }

        toast('Thành công', {
            description: 'Mật khẩu đã được thay đổi',
            icon: h(CheckCircle, { class: 'text-green-500 w-5 h-5' }),
            position: 'top-center'
        })

        // Quay lại trang users hoặc trang chủ
        router.push('/users')
    } catch (err: any) {
        toast('Lỗi', {
            description: err.message,
            icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
            position: 'top-center'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="flex flex-1 flex-col gap-4 p-4 pt-3">
        <div class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 mt-4">
            <div className="flex items-center justify-center">
                <Card class="mb-6 w-[90vw] md:w-[80vw] lg:w-1/2">
                    <form @submit.prevent="submit" class="flex flex-col gap-6">
                        <CardHeader>
                            <CardTitle>Thay đổi mật khẩu</CardTitle>
                            <CardDescription>Nhập thông tin để thay đổi</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div class="mt-1 grid gap-4">
                                <div class="grid gap-2">
                                    <Label for="password">Mật khẩu mới</Label>
                                    <Input id="password" type="password" v-model="newPassword" autocomplete="password"
                                        placeholder="Nhập mật khẩu" :tabindex="1" />
                                </div>
                                <div class="grid gap-2">
                                    <Label for="confirm">Xác nhận mật khẩu mới</Label>
                                    <Input id="confirm" type="password" v-model="confirmPassword" autocomplete="confirm"
                                        placeholder="Nhập lại" />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter class="flex justify-between px-6">
                            <Button type="submit" :disabled="loading">
                                <Spinner v-if="loading" />
                                <Save v-else />Lưu
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom styles if needed */
</style>
