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
import { RotateCcw, Loader2, CheckCircle, XCircle } from 'lucide-vue-next';
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

const handleRestore = async () => {
    loading.value = true
    loadingTimeout = setTimeout(() => {
        showLoading.value = true
    }, 1000)

    try {
        const response = await request(`/users/${props.user.id}/restore`, {
            method: 'POST',
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi khôi phục người dùng')
        }

        toast('Thông báo', {
            description: 'Khôi phục thành công',
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
            <Button variant="outline" size="icon-sm" class="hover:bg-gray-100" title="Khôi phục">
                <RotateCcw class="w-4 h-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Khôi phục người dùng</AlertDialogTitle>
                <AlertDialogDescription>
                    Bạn có chắc chắn muốn khôi phục người dùng <span class="font-semibold text-gray-900">{{ user.name
                    }}</span>?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="loading">Hủy</AlertDialogCancel>
                <AlertDialogAction @click.prevent="handleRestore" :disabled="loading"
                    class="bg-blue-600 hover:bg-blue-700">
                    <Loader2 v-if="showLoading" class="mr-2 h-4 w-4 animate-spin" />
                    {{ showLoading ? 'Đang khôi phục...' : 'Khôi phục' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
