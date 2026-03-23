<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, CheckCircle, XCircle, Plus } from 'lucide-vue-next'
import { h, ref } from 'vue';
import { toast } from 'vue-sonner';
import { request } from '@/lib/api'

const emit = defineEmits(['success'])

const isOpen = ref(false)
const name = ref('')
const description = ref('')
const loading = ref(false)
const showLoading = ref(false)
let loadingTimeout: any = null
const errors = ref({
    name: '',
    description: '',
})

const handleSubmit = async () => {
    // Validate
    let hasError = false
    if (!name.value.trim()) {
        errors.value.name = 'Tên role không được để trống'
        hasError = true
    } else {
        errors.value.name = ''
    }

    if (hasError) return

    loading.value = true
    loadingTimeout = setTimeout(() => {
        showLoading.value = true
    }, 1000)

    try {
        const response = await request('/roles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name.value.trim(),
                description: description.value.trim(),
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi thêm role')
        }

        // Reset form
        name.value = ''
        description.value = ''
        isOpen.value = false

        // Notify parent to refresh list
        emit('success')

        toast('Thông báo', {
            description: 'Thêm role thành công',
            icon: h(CheckCircle, { class: 'text-green-500 w-5 h-5' }),
            position: 'top-center',
        });
    } catch (err: any) {
        toast('Lỗi', {
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
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <Button class="gap-2">
                <Plus class="w-4 h-4" />
                Thêm mới
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Thêm Role mới</DialogTitle>
                <DialogDescription>
                    Nhập thông tin cho role mới của bạn tại đây. Nhấn lưu khi hoàn tất.
                </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <div class="grid gap-2">
                    <Label for="name">Tên Role <span class="text-red-500">*</span></Label>
                    <Input id="name" v-model="name" placeholder="Ví dụ: admin, editor..." :disabled="loading"
                        :class="{ 'border-red-500': errors.name }" @update:model-value="errors.name = ''" />
                    <p v-if="errors.name" class="text-[13px] text-red-500 mt-[-4px]">{{ errors.name }}</p>
                </div>
                <div class="grid gap-2">
                    <Label for="description">Mô tả</Label>
                    <Input id="description" v-model="description" placeholder="Nhập mô tả ngắn gọn"
                        :disabled="loading" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit" :disabled="loading" @click="handleSubmit">
                    <template v-if="showLoading">
                        <Loader2 class="animate-spin mr-2 h-4 w-4" /> Đang lưu...
                    </template>
                    <template v-else>
                        Lưu thay đổi
                    </template>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>