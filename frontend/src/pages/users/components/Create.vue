<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, Save, Loader2, XCircle, CheckCircle } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { h, ref, watch } from 'vue'
import { toast } from 'vue-sonner';
import { request } from '@/lib/api'

const emit = defineEmits(['success'])

const name = ref('')
const username = ref('')
const email = ref('')
const roleIds = ref<number[]>([])
const roles = ref<any[]>([])
const loading = ref(false)
const showLoading = ref(false)
let loadingTimeout: any = null
const isOpen = ref(false)

const errors = ref({
    name: '',
    username: '',
    roles: '',
})

const fetchRoles = async () => {
    try {
        const response = await request('/roles')
        if (response.ok) {
            const result = await response.json()
            roles.value = result.items || []
            const defaultRole = roles.value.find(r => r.name === 'user')
            if (defaultRole) roleIds.value = [defaultRole.id]
        }
    } catch (err) {
        console.error('Lỗi khi lấy danh sách role:', err)
    }
}

watch(() => isOpen.value, (val: boolean) => {
    if (val && roles.value.length === 0) {
        fetchRoles()
    }
})

const handleSubmit = async () => {
    // Reset errors
    errors.value.name = ''
    errors.value.username = ''

    // Validate
    let hasError = false
    if (!name.value) {
        errors.value.name = 'Họ tên không được để trống'
        hasError = true
    }
    if (!username.value) {
        errors.value.username = 'Username không được để trống'
        hasError = true
    }
    if (roleIds.value.length === 0) {
        errors.value.roles = 'Vui lòng chọn ít nhất một quyền'
        hasError = true
    }

    if (hasError) return

    loading.value = true
    loadingTimeout = setTimeout(() => {
        showLoading.value = true
    }, 1000)

    try {
        const response = await request(`/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name.value,
                username: username.value,
                email: email.value || null,
                password: '123456',
                isActive: true,
                roleIds: roleIds.value
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi lưu người dùng')
        }

        // Reset form
        name.value = ''
        username.value = ''
        email.value = ''

        // Close dialog
        isOpen.value = false

        // Notify parent to refresh list
        emit('success')

        toast('Thông báo', {
            description: 'Thêm mới thành công',
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
                <DialogTitle>Thêm người dùng</DialogTitle>
                <DialogDescription>
                    Nhập thông tin chi tiết cho người dùng mới.
                </DialogDescription>
            </DialogHeader>
            <div class="mt-3 grid gap-4">
                <div class="grid gap-2">
                    <Label for="name_create" class="text-gray-800">Họ tên <span class="text-red-500">*</span></Label>
                    <Input id="name_create" v-model="name" placeholder="Nhập họ tên" :disabled="loading"
                        :class="{ 'border-red-500': errors.name }" @update:model-value="errors.name = ''" />
                    <p v-if="errors.name" class="text-[13px] text-red-500">{{ errors.name }}</p>
                </div>
                <div class="grid gap-2">
                    <Label for="username_create" class="text-gray-800">Username <span
                            class="text-red-500">*</span></Label>
                    <Input id="username_create" v-model="username" placeholder="Nhập username" :disabled="loading"
                        :class="{ 'border-red-500': errors.username }" @update:model-value="errors.username = ''" />
                    <p v-if="errors.username" class="text-[13px] text-red-500">{{ errors.username }}</p>
                </div>
                <div class="grid gap-2">
                    <Label for="email_create" class="text-gray-800">Email</Label>
                    <Input id="email_create" v-model="email" type="email" placeholder="Nhập email"
                        :disabled="loading" />
                </div>
                <div class="grid gap-2 mb-2">
                    <Label for="role_create" class="text-gray-800">Quyền hạn <span class="text-red-500">*</span></Label>
                    <Select v-model="roleIds" multiple @update:model-value="errors.roles = ''">
                        <SelectTrigger id="role_create" class="w-full" :class="{ 'border-red-500': errors.roles }">
                            <SelectValue placeholder="Chọn quyền hạn">
                                <template v-if="roleIds.length > 0">
                                    <div class="flex flex-wrap gap-1">
                                        <div v-for="id in roleIds" :key="id"
                                            class="bg-gray-200 text-gray-800 px-2 py-0.5 rounded text-xs font-medium">
                                            {{roles.find(r => r.id === id)?.name}}
                                        </div>
                                    </div>
                                </template>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Quyền hạn</SelectLabel>
                                <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
                                    {{ role.name }}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <p v-if="errors.roles" class="text-[13px] text-red-500">{{ errors.roles }}</p>
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