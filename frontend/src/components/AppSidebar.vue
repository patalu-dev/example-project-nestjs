<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'
import { SquareTerminal } from "lucide-vue-next"
import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuth } from '@/composables/useAuth'
import { computed } from 'vue'

const { user: authUser, can } = useAuth()

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

const data = computed(() => {
  const adminItems = [
    {
      title: "Users",
      url: "/users",
      action: "read",
      subject: "User"
    },
    {
      title: "Roles",
      url: "/roles",
      action: "read",
      subject: "Role"
    },
    {
      title: "Permissions",
      url: "/permissions",
      action: "read",
      subject: "Permission"
    },
  ].filter(item => can(item.action, item.subject))

  return {
    navMain: adminItems.length > 0 ? [
      {
        title: "Administrator",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: adminItems,
      },
    ] : [],
  }
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter v-if="authUser">
      <NavUser :user="{
        name: authUser.name,
        email: authUser.username,
        avatar: ''
      }" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
