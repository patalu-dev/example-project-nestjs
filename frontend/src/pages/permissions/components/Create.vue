<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Save, Loader2, XCircle, CheckCircle } from 'lucide-vue-next'
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
import { h, ref, onMounted } from 'vue'
import { toast } from 'vue-sonner';
import { request } from '@/lib/api'

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

const actionOptions = ref(['manage', 'create', 'read', 'update', 'delete'])
const subjectOptions = ref(['all', 'User', 'Role', 'Permission'])

const fetchOptions = async () => {
    try {
        const [actionsRes, subjectsRes] = await Promise.all([
            request('/permissions/actions'),
            request('/permissions/subjects')
        ])

        if (actionsRes.ok) {
            const actions = await actionsRes.json()
            if (Array.isArray(actions)) {
                actionOptions.value = Array.from(new Set([...actionOptions.value, ...actions]))
            }
        }

        if (subjectsRes.ok) {
            const subjects = await subjectsRes.json()
            if (Array.isArray(subjects)) {
                subjectOptions.value = Array.from(new Set([...subjectOptions.value, ...subjects]))
            }
        }
    } catch (e) {
        console.error('Failed to fetch options:', e)
    }
}

onMounted(() => {
    fetchOptions()
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
        const response = await request('/permissions', {
            method: 'POST',
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
            throw new Error(errorData.message || 'Có lỗi xảy ra khi thêm permission')
        }

        // Reset form
        action.value = ''
        subject.value = ''
        description.value = ''

        // Close dialog
        isOpen.value = false

        // Notify parent to refresh list
        emit('success')

        toast('Thông báo', {
            description: 'Thêm permission thành công',
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
            <Button class="w-full md:w-auto" @click="isOpen = true">
                <Plus /> Thêm mới
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Thêm Permission</DialogTitle>
                <DialogDescription>
                    Tạo permission mới để gán vào role.
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
                    <Select v-model="subject" @update:model-value="errors.subject = ''">
                        <SelectTrigger class="w-full" :class="{ 'border-red-500': errors.subject }">
                            <SelectValue placeholder="Chọn subject" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem v-for="opt in subjectOptions" :key="opt" :value="opt">
                                    {{ opt }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <p v-if="errors.subject" class="text-[13px] text-red-500">{{ errors.subject }}</p>
                </div>
                <div class="grid gap-2">
                    <Label class="text-gray-800">Mô tả</Label>
                    <Input v-model="description" placeholder="VD: Tạo người dùng mới" :disabled="loading" />
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
