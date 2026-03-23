<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pencil, Save, Loader2, XCircle, CheckCircle } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { h, ref, watch } from 'vue'
import { toast } from 'vue-sonner';
import { request } from '@/lib/api'

const props = defineProps<{
    permission: any
}>()

const emit = defineEmits(['success'])

const action = ref('')
const subject = ref('')
const description = ref('')
const loading = ref(false)
const showLoading = ref(false)
let loadingTimeout: any = null
const isOpen = ref(false)

const errors = ref({
    action: '',
    subject: '',
})

const actionOptions = ['manage', 'create', 'read', 'update', 'delete']

watch(isOpen, (newVal) => {
    if (newVal && props.permission) {
        action.value = props.permission.action
        subject.value = props.permission.subject
        description.value = props.permission.description || ''
        errors.value = { action: '', subject: '' }
    }
})

const handleSubmit = async () => {
    // Reset errors
    errors.value.action = ''
    errors.value.subject = ''

    // Validate
    let hasError = false
    if (!action.value) {
        errors.value.action = 'Action không được để trống'
        hasError = true
    }
    if (!subject.value.trim()) {
        errors.value.subject = 'Subject không được để trống'
        hasError = true
    }

    if (hasError) return

    loading.value = true
    loadingTimeout = setTimeout(() => {
        showLoading.value = true
    }, 1000)

    try {
        const response = await request(`/permissions/${props.permission.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action.value,
                subject: subject.value.trim(),
                description: description.value.trim() || null,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật permission')
        }

        // Close dialog
        isOpen.value = false

        // Notify parent to refresh list
        emit('success')

        toast('Thông báo', {
            description: 'Cập nhật permission thành công',
            icon: h(CheckCircle, { class: 'text-green-500 w-5 h-5' }),
            position: 'top-center',
        });
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
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <Button variant="outline" size="icon-sm" class="hover:bg-gray-100" title="Cập nhật">
                <Pencil class="w-4 h-4" />
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Cập nhật Permission</DialogTitle>
                <DialogDescription>
                    Chỉnh sửa thông tin permission.
                </DialogDescription>
            </DialogHeader>
            <div class="mt-3 grid gap-4">
                <div class="grid gap-2">
                    <Label class="text-gray-800">Action <span class="text-red-500">*</span></Label>
                    <Select v-model="action" @update:model-value="errors.action = ''">
                        <SelectTrigger class="w-full" :class="{ 'border-red-500': errors.action }">
                            <SelectValue placeholder="Chọn action" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem v-for="opt in actionOptions" :key="opt" :value="opt">
                                    {{ opt }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <p v-if="errors.action" class="text-[13px] text-red-500">{{ errors.action }}</p>
                </div>
                <div class="grid gap-2">
                    <Label class="text-gray-800">Subject <span class="text-red-500">*</span></Label>
                    <Input v-model="subject" placeholder="VD: User, Role, all..." :disabled="loading"
                        :class="{ 'border-red-500': errors.subject }" @update:model-value="errors.subject = ''" />
                    <p v-if="errors.subject" class="text-[13px] text-red-500">{{ errors.subject }}</p>
                </div>
                <div class="grid gap-2">
                    <Label class="text-gray-800">Mô tả</Label>
                    <Input v-model="description" placeholder="VD: Cập nhật người dùng" :disabled="loading" />
                </div>
            </div>
            <DialogFooter>
                <Button class="mt-3" @click="handleSubmit" :disabled="loading">
                    <template v-if="showLoading">
                        <Loader2 class="animate-spin" /> Đang lưu...
                    </template>
                    <template v-else>
                        <Save /> Lưu
                    </template>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
