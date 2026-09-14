<script setup lang="ts">
import type { PatternDetail } from '../../data/mockRecognition'

defineProps<{
  detail: PatternDetail | null
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="detail" class="drawer-backdrop" @click.self="emit('close')">
        <aside class="pattern-drawer glass-panel" role="dialog" aria-modal="true" :aria-label="detail.title">
          <button class="drawer-close" type="button" aria-label="关闭纹样详情" @click="emit('close')">×</button>
          <p class="eyebrow">Pattern Archive</p>
          <h2>{{ detail.title }}</h2>
          <p>{{ detail.description }}</p>
          <div>
            <span>现代应用</span>
            <strong>{{ detail.usage }}</strong>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
