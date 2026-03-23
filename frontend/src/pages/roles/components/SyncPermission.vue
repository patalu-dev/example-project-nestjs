<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShieldAlert, Save, Loader2, XCircle, CheckCircle, Search } from 'lucide-vue-next'
import { h, ref, watch, computed } from 'vue'
import { toast } from 'vue-sonner';
import { request } from '@/lib/api'

const props = defineProps<{
    role: any
}>()

const emit = defineEmits(['success'])

const loading = ref(false)
const fetching = ref(false)
const isOpen = ref(false)
const permissions = ref<any[]>([])
const selectedPermissionIds = ref<number[]>([])
const searchQuery = ref('')

const fetchPermissions = async () => {
    fetching.value = true
    try {
        const response = await request('/permissions?limit=1000')
        if (!response.ok) throw new Error('Failed to fetch permissions')
        const data = await response.json()
        permissions.value = data.items || []
    } catch (err) {
        console.error(err)
        toast('Lỗi', { description: 'Không thể tải danh sách permission', icon: h(XCircle, { class: 'text-red-500 w-5 h-5' }) })
    } finally {
        fetching.value = false
    }
}

watch(isOpen, async (newVal) => {
    if (newVal) {
        // Pre-fill selected
        if (props.role && props.role.permissions) {
            selectedPermissionIds.value = props.role.permissions.map((p: any) => p.id)
        } else {
            selectedPermissionIds.value = []
        }
        searchQuery.value = ''
        await fetchPermissions()
    }
})

// Group permissions by subject for better UI
const groupedPermissions = computed(() => {
    const groups: Record<string, any[]> = {}

    // Filter by search query
    const query = searchQuery.value.toLowerCase()
    const filtered = permissions.value.filter(p => {
        if (!query) return true
        return p.subject?.toLowerCase().includes(query) ||
            p.action?.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
    })

    for (const p of filtered) {
        const subject = p.subject || 'Khác';
        if (!groups[subject]) {
            groups[subject] = [];
        }
        groups[subject]!.push(p);
    }
    return groups
})

const isAllSubjectSelected = (perms: any[]) => {
    return perms.length > 0 && perms.every((p: any) => selectedPermissionIds.value.includes(p.id))
}

const toggleSubject = (perms: any[]) => {
    const permIds = perms.map(p => p.id)
    if (isAllSubjectSelected(perms)) {
        selectedPermissionIds.value = selectedPermissionIds.value.filter(id => !permIds.includes(id))
    } else {
        const newSelected = new Set(selectedPermissionIds.value)
        permIds.forEach(id => newSelected.add(id))
        selectedPermissionIds.value = Array.from(newSelected)
    }
}

const handleSubmit = async () => {
    loading.value = true

    try {
        const response = await request(`/roles/${props.role.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                permissionIds: selectedPermissionIds.value,
            }),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Có lỗi xảy ra khi cập nhật quyền')
        }

        isOpen.value = false
        emit('success')

        toast('Thông báo', {
            description: 'Đồng bộ quyền thành công',
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
        loading.value = false
    }
}
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogTrigger as-child>
            <Button variant="outline" size="icon-sm" title="Phân quyền">
                <ShieldAlert class="w-4 h-4" />
            </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-5xl w-[90vw] max-h-[85vh] flex flex-col p-0">
            <DialogHeader class="px-6 py-4 pb-0">
                <DialogTitle class="text-xl">Phân quyền Role: <span class="text-blue-600">{{ role.name }}</span>
                </DialogTitle>
                <DialogDescription>
                    Chọn các thao tác (Action) tương ứng với từng đối tượng (Subject).
                </DialogDescription>
                <div class="mt-4 relative">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input v-model="searchQuery" placeholder="Tìm kiếm theo action, subject hoặc mô tả..."
                        class="pl-9 w-full" />
                </div>
            </DialogHeader>
            <div class="flex-1 overflow-y-auto px-6 py-2">
                <div v-if="fetching" class="flex items-center justify-center py-12">
                    <Loader2 class="w-8 h-8 text-gray-400 animate-spin" />
                </div>
                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="(perms, subject) in groupedPermissions" :key="subject"
                        class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3
                            class="font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2 flex items-center justify-between gap-2">
                            <span class="text-gray-800 text-sm px-2.5 py-0.5 rounded">{{ subject.toUpperCase() }}</span>
                            <Button variant="ghost" size="sm"
                                class="h-6 text-xs px-2 hover:text-gray-700 hover:bg-gray-100"
                                @click="toggleSubject(perms)">
                                {{ isAllSubjectSelected(perms) ? 'Bỏ chọn' : 'Chọn tất cả' }}
                            </Button>
                        </h3>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <label v-for="permission in perms" :key="permission.id"
                                class="flex items-start gap-2.5 p-2 rounded cursor-pointer hover:bg-white hover:ring-1 hover:ring-blue-100 transition-colors"
                                :class="{ 'bg-white shadow-sm ring-1 ring-blue-100': selectedPermissionIds.includes(permission.id) }">
                                <input type="checkbox" :value="permission.id" v-model="selectedPermissionIds"
                                    class="mt-1 flex-shrink-0 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                <div class="flex-1 min-w-0">
                                    <h4 class="text-[14px] text-gray-900 capitalize">{{ permission.action
                                    }}</h4>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter class="px-6 py-4 border-t">
                <Button variant="outline" @click="isOpen = false">Hủy bỏ</Button>
                <Button @click="handleSubmit" :disabled="loading">
                    <template v-if="loading">
                        <Loader2 class="w-4 h-4 animate-spin" /> Đang lưu...
                    </template>
                    <template v-else>
                        <Save class="w-4 h-4" /> Lưu thay đổi
                    </template>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
