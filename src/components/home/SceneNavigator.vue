<script setup lang="ts">
import type { HomeScene } from '../../data/sceneConfig'

defineProps<{
  scenes: HomeScene[]
  activeIndex: number
  disabled: boolean
  counter: string
}>()

const emit = defineEmits<{
  change: [index: number]
  previous: []
  next: []
}>()
</script>

<template>
  <nav class="scene-dock immersive-dock" aria-label="全屏场景切换">
    <div class="scene-track">
      <button
        v-for="(scene, index) in scenes"
        :key="scene.id"
        class="scene-dock-item"
        :class="{ active: index === activeIndex }"
        type="button"
        :aria-current="index === activeIndex ? 'page' : undefined"
        :disabled="disabled"
        @click="emit('change', index)"
      >
        <span class="scene-icon-ring"><el-icon><component :is="scene.icon" /></el-icon></span>
        <span class="scene-label">{{ scene.label }}</span>
      </button>
    </div>
    <div class="scene-side-control">
      <div class="scene-counter" aria-live="polite">{{ counter }}</div>
      <div class="scene-drag-hint">
        <button class="scene-arrow" type="button" :disabled="disabled" aria-label="上一个场景" @click="emit('previous')">←</button>
        <em>拖动探索</em>
        <button class="scene-arrow" type="button" :disabled="disabled" aria-label="下一个场景" @click="emit('next')">→</button>
      </div>
    </div>
  </nav>
</template>
