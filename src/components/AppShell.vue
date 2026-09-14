<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Brush, Cpu, Picture, UploadFilled } from '@element-plus/icons-vue'

const navItems = [
  { path: '/', label: '首页', icon: Cpu },
  { path: '/recognition', label: '纹样识别', icon: UploadFilled },
  { path: '/creation', label: 'AI二创', icon: Brush },
  { path: '/gallery', label: '作品展示', icon: Picture }
]

const route = useRoute()
const isScrolled = ref(false)

function updateScrollState() {
  isScrolled.value = window.scrollY > 12
}

onMounted(() => {
  updateScrollState()
  window.addEventListener('scroll', updateScrollState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScrollState)
})
</script>

<template>
  <div class="min-h-screen overflow-hidden bg-[#0d0d0c] text-rice" :class="{ 'home-shell': route.path === '/' }">
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(159,47,36,0.34),transparent_28%),radial-gradient(circle_at_20%_20%,rgba(198,154,74,0.12),transparent_25%),linear-gradient(105deg,#0d0d0c_0%,#151311_52%,#0a0a09_100%)]" />
      <div class="phoenix-field absolute inset-y-0 right-0 w-[62vw]" />
      <div class="pattern-watermark absolute inset-x-0 bottom-0 h-72 opacity-35" />
    </div>

    <header class="app-header sticky top-0 z-20 border-b border-white/10 bg-[#0d0d0c]/72 backdrop-blur-xl" :class="{ 'app-header-scrolled': isScrolled }">
      <nav class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <RouterLink to="/" class="flex items-center gap-3">
          <span class="grid h-11 w-11 place-items-center rounded-full border border-gold/50 bg-rice/10 shadow-glow">
            <span class="text-lg font-bold text-rice">纹</span>
          </span>
          <span>
            <span class="block font-display text-xl font-semibold tracking-wide text-rice">纹启AI</span>
            <span class="block text-xs text-rice/52">传统纹样识别与二次创作平台</span>
          </span>
        </RouterLink>

        <div class="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <RouterLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            active-class="nav-link-active"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.label }}</span>
          </RouterLink>
        </div>
      </nav>
    </header>

    <main class="relative z-10 mx-auto w-full px-0 py-0">
      <RouterView />
    </main>
  </div>
</template>

