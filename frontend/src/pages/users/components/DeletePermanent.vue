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
import { Trash2, Loader2, CheckCircle, XCircle } from 'lucide-vue-next';
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

const handleDeletePermanent = async () => {
    loading.value = true
    loadingTimeout = setTimeout(() => {
        showLoading.value = true
    }, 1000)

    try {
        const response = await request(`/users/${props.user.id}/permanent`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi xóa vĩnh viễn người dùng')
        }

        toast('Thông báo', {
            description: 'Xóa vĩnh viễn thành công',
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
            <Button variant="outline" size="icon-sm" class="hover:bg-gray-100" title="Xóa vĩnh viễn">
                <Trash2 class="w-4 h-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle class="text-red-600">Xác nhận xóa vĩnh viễn</AlertDialogTitle>
                <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa vĩnh viễn người dùng <span class="font-semibold text-gray-900">{{
                        user.name
                        }}</span>?
                    Hành động này <span class="font-bold text-red-600 italic">KHÔNG THỂ</span> hoàn tác và toàn bộ dữ
                    liệu người dùng sẽ bị xóa khỏi hệ thống.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="loading">Hủy</AlertDialogCancel>
                <AlertDialogAction @click.prevent="handleDeletePermanent" :disabled="loading"
                    class="bg-red-600 hover:bg-red-700 text-white">
                    <Loader2 v-if="showLoading" class="mr-2 h-4 w-4 animate-spin" />
                    {{ showLoading ? 'Đang xóa...' : 'Xác nhận xóa vĩnh viễn' }}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
