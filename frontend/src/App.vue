<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useBreadcrumb } from "@/composables/useBreadcrumb";
import { Toaster } from "@/components/ui/sonner";
import 'vue-sonner/style.css';

import { useRoute } from 'vue-router'
import { computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { items: breadcrumbItems } = useBreadcrumb();
const route = useRoute()
const { token, resetInactivityTimer, checkInactivity } = useAuth()

let interval: any = null

onMounted(() => {
  // Check inactivity every minute
  interval = setInterval(checkInactivity, 60 * 1000)

  // Listen for interaction
  window.addEventListener('mousemove', resetInactivityTimer)
  window.addEventListener('keydown', resetInactivityTimer)
  window.addEventListener('click', resetInactivityTimer)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
  window.removeEventListener('mousemove', resetInactivityTimer)
  window.removeEventListener('keydown', resetInactivityTimer)
  window.removeEventListener('click', resetInactivityTimer)
})

const isAuthPage = computed(() => {
  return !token.value || route.path === '/' || route.name === 'login'
})
</script>

<template>
  <Toaster />
  
  <template v-if="isAuthPage">
    <RouterView v-if="!route.meta.requiresAuth" :key="route.fullPath" />
    <div v-else class="flex h-screen w-screen items-center justify-center bg-background">
      <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  </template>

  <SidebarProvider v-else>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-12 shrink-0 items-center gap-2">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <template v-for="(item, index) in breadcrumbItems" :key="item.title">
                <BreadcrumbItem>
                  <BreadcrumbPage v-if="index === breadcrumbItems.length - 1">
                    {{ item.title }}
                  </BreadcrumbPage>
                  <BreadcrumbLink v-else :href="item.href ?? '#'">
                    {{ item.title }}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="index < breadcrumbItems.length - 1" />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <hr class="border-border" />
      <RouterView :key="route.fullPath" />
    </SidebarInset>
  </SidebarProvider>
</template>
