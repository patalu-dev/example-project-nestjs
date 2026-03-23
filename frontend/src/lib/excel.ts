import { toast } from 'vue-sonner'

/**
 * Xuất dữ liệu ra file Excel
 * @param data Mảng dữ liệu cần xuất
 * @param filename Tên file (không bao gồm đuôi .xlsx)
 * @param sheetName Tên sheet
 * @param columnWidths Độ rộng các cột (NCH)
 */
export async function exportToExcel(
    data: any[],
    filename: string = 'export',
    sheetName: string = 'Sheet1',
    columnWidths?: { wch: number }[]
) {
    if (!data || data.length === 0) {
        toast.error('Không có dữ liệu để xuất')
        return
    }

    const toastId = toast.loading('Đang chuẩn bị dữ liệu xuất Excel...')

    try {
        const XLSX = await import('xlsx')
        
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

        if (columnWidths) {
            worksheet['!cols'] = columnWidths
        }

        XLSX.writeFile(workbook, `${filename}_${new Date().getTime()}.xlsx`)
        
        toast.dismiss(toastId)
        toast.success('Xuất file thành công')
    } catch (err: any) {
        toast.dismiss(toastId)
        toast.error('Lỗi khi xuất file: ' + err.message)
        console.error(err)
    }
}
