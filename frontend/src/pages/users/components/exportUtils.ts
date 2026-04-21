import { request } from '@/lib/api'
import { toast } from 'vue-sonner'

/**
 * Xuất danh sách người dùng ra file CSV
 * @param filters Bộ lọc hiện tại
 * @param showDeleted Trạng thái xem danh sách đã xóa hay chưa
 */
export const exportUsers = async (
    filters: any,
    showDeleted: boolean = false
) => {
    const toastId = toast.loading('Đang chuẩn bị dữ liệu xuất...', { position: 'top-center' })
    
    try {
        // Lấy toàn bộ dữ liệu theo bộ lọc (giới hạn lớn)
        const queryParams = new URLSearchParams()
        if (filters.name) queryParams.append('name', filters.name)
        if (filters.username) queryParams.append('username', filters.username)
        if (filters.email) queryParams.append('email', filters.email)
        if (filters.role && filters.role.length > 0) queryParams.append('role', filters.role.join(','))
        if (filters.status) queryParams.append('status', filters.status)
        if (showDeleted) queryParams.append('showDeleted', 'true')
        
        queryParams.append('page', '1')
        queryParams.append('limit', '5000') // Xuất tối đa 5000 bản ghi

        const response = await request(`/users?${queryParams.toString()}`)
        if (!response.ok) throw new Error('Không thể lấy dữ liệu xuất')
        
        const result = await response.json()
        const dataToExport = result.items || []

        if (dataToExport.length === 0) {
            toast.error('Không có dữ liệu để xuất', { id: toastId })
            return
        }

        // Tạo nội dung CSV với BOM (để hiển thị đúng tiếng Việt trong Excel)
        const csvRows = [
            // Tiêu đề cột
            ['STT', 'Họ tên', 'Tài khoản', 'Email', 'Vai trò', 'Trạng thái'].join(','),
            // Dữ liệu mapping
            ...dataToExport.map((item: any, index: number) => {
                const roles = item.roles?.map((r: any) => r.name).join(', ') || '---'
                const status = showDeleted ? 'Đã xóa' : (item.isActive ? 'Hoạt động' : 'Không hoạt động')
                
                return [
                    index + 1,
                    `"${(item.name || '').replace(/"/g, '""')}"`,
                    `"${(item.username || '').replace(/"/g, '""')}"`,
                    `"${(item.email || '').replace(/"/g, '""')}"`,
                    `"${roles.replace(/"/g, '""')}"`,
                    `"${status}"`,
                ].join(',')
            })
        ]

        const csvContent = csvRows.join('\n')

        // Tạo file và tải xuống
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        const dateStr = new Date().toISOString().split('T')[0]
        
        link.setAttribute('href', url)
        link.setAttribute('download', `Danh-sach-nguoi-dung-${dateStr}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        toast.success('Xuất file thành công', { id: toastId })
    } catch (err: any) {
        toast.error('Lỗi khi xuất file: ' + err.message, { id: toastId })
        console.error('Export error:', err)
    }
}
