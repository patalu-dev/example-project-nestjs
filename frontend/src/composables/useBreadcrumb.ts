import { ref } from 'vue'

export interface BreadcrumbItem {
  title: string
  href?: string
}

const items = ref<BreadcrumbItem[]>([])

export function useBreadcrumb() {
  function setBreadcrumbs(newItems: BreadcrumbItem[]) {
    items.value = newItems
  }

  return {
    items,
    setBreadcrumbs,
  }
}
