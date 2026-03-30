<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Lock, Unlock, CheckCircle, XCircle } from 'lucide-vue-next'
import { ref, h } from 'vue'
import { request } from '@/lib/api'
import { toast } from 'vue-sonner'

const props = defineProps({
    user: {
        type: Object,
        required: true
    }
})

const emit = defineEmits(['success'])
const loading = ref(false)
const showLoading = ref(false)
let loadingTimeout: any = null
const isOpen = ref(false)

const handleToggleStatus = async () => {
    loading.value = true
    loadingTimeout = setTimeout(() => {
        showLoading.value = true
    }, 1000)

    try {
        const response = await request(`/users/${props.user.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                isActive: !props.user.isActive
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật trạng thái')
        }

        toast('Thông báo', {
            description: `Đã ${!props.user.isActive ? 'kích hoạt' : 'khóa'} tài khoản thành công`,
            icon: h(CheckCircle, { class: 'text-green-500 w-5 h-5' }),
            position: 'top-center',
        });

        isOpen.value = false
        emit('success')
    } catch (err: any) {
        toast('Thông báo', {
            description: err.message,
            icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
            position: 'top-center',
        });
    } finally {
        if (loadingTimeout) clearTimeout(loadingTimeout)
        loading.value = false
        showLoading.value = false
    }
}
</script>

<template>
    <AlertDialog v-model:open="isOpen">
        <AlertDialogTrigger as-child>
            <Button variant="outline" size="icon-sm" class="hover:bg-gray-100" title="Đổi trạng thái">
                <Lock v-if="user.isActive" class="w-4 h-4" />
                <Unlock v-else class="w-4 h-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Thay đổi trạng thái</AlertDialogTitle>
                <AlertDialogDescription>
                    Bạn có chắc chắn muốn <span class="font-semibold text-gray-900">{{ user.isActive ? 'khóa' :
                        'kích hoạt' }}</span>
                    tài khoản của <span class="font-semibold text-gray-900">{{ user.username }}</span>?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="loading">Hủy</AlertDialogCancel>
                <AlertDialogAction @click.prevent="handleToggleStatus" :disabled="loading"
                    :class="user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'">
                    <template v-if="showLoading">
                        <Lock v-if="user.isActive" class="h-4 w-4 animate-spin" />
                        <Unlock v-else class="h-4 w-4 animate-spin" />
                    </template>
                    {{ showLoading ? 'Đang xử lý...' : 'Xác nhận' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
