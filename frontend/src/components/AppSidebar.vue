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

const { user: authUser } = useAuth()

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: "icon",
})

const data = {
  navMain: [
    {
      title: "Administrator",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Users",
          url: "/users",
        },
        {
          title: "Roles",
          url: "/roles",
        },
        {
          title: "Permissions",
          url: "/permissions",
        },
      ],
    },
  ],
}
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
