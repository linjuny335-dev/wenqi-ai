<script setup lang="ts">
import phoenixImage from '../../assets/chu-phoenix-cinematic.png'

defineProps<{
  state: 'default' | 'uploaded' | 'recognizing' | 'done' | 'error'
}>()
</script>

<template>
  <div class="phoenix-visual" :class="`phoenix-visual-${state}`" aria-hidden="true">
    <div class="phoenix-outline" :style="{ backgroundImage: `url(${phoenixImage})` }" />
    <div class="phoenix-image" :style="{ backgroundImage: `url(${phoenixImage})` }" />
    <div class="phoenix-shine" />
    <div class="phoenix-red-core" />
    <div class="phoenix-vignette" />
  </div>
</template>
