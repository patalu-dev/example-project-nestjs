<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, XCircle, CheckCircle } from 'lucide-vue-next'
import { h, ref } from 'vue'
import { toast } from 'vue-sonner'
import { request } from '@/lib/api'

const props = defineProps<{
    permission: any
}>()

const emit = defineEmits(['success'])

const loading = ref(false)
const isOpen = ref(false)

const handleDelete = async () => {
    loading.value = true

    try {
        const response = await request(`/permissions/${props.permission.id}`, {
            method: 'DELETE',
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi xóa permission')
        }

        isOpen.value = false
        emit('success')

        toast('Thông báo', {
            description: 'Xóa permission thành công',
            icon: h(CheckCircle, { class: 'text-green-500 w-5 h-5' }),
            position: 'top-center',
        })
    } catch (err: any) {
        toast('Thông báo', {
            description: err.message,
            icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }),
            position: 'top-center',
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <AlertDialog v-model:open="isOpen">
        <AlertDialogTrigger as-child>
            <Button variant="outline" size="icon-sm" class="hover:bg-gray-100" title="Xóa">
                <Trash2 class="w-4 h-4" />
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa permission này? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="loading">Hủy</AlertDialogCancel>
                <Button variant="destructive" @click="handleDelete" :disabled="loading"
                    :class="{ 'opacity-80': loading }">
                    <template v-if="loading">
                        <Loader2 class="w-4 h-4 mr-2 animate-spin" /> Đang xóa...
                    </template>
                    <template v-else>
                        Xóa
                    </template>
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
