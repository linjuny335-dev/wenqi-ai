<script setup lang="ts">
import { computed, ref } from 'vue'
import { Delete, Download, Star, View } from '@element-plus/icons-vue'
import type { CreationPlan } from '../../data/demoCreation'

const props = defineProps<{
  works: CreationPlan[]
  sourceImage: string | null
}>()

const emit = defineEmits<{
  startCreate: []
  delete: [id: string]
  favorite: [id: string]
}>()

const activeIndex = ref(0)
const category = ref('全部')
const detail = ref<CreationPlan | null>(null)
const dragStart = ref<number | null>(null)

const categories = computed(() => ['全部', ...Array.from(new Set(props.works.map((item) => item.application)))])
const filteredWorks = computed(() => category.value === '全部' ? props.works : props.works.filter((item) => item.application === category.value))
const activeWork = computed(() => filteredWorks.value[activeIndex.value] ?? null)

function normalizeIndex() {
  if (activeIndex.value >= filteredWorks.value.length) activeIndex.value = Math.max(0, filteredWorks.value.length - 1)
}

function move(delta: number) {
  if (!filteredWorks.value.length) return
  activeIndex.value = (activeIndex.value + delta + filteredWorks.value.length) % filteredWorks.value.length
}

function pointerDown(event: PointerEvent) {
  dragStart.value = event.clientX
}

function pointerUp(event: PointerEvent) {
  if (dragStart.value === null) return
  const dx = event.clientX - dragStart.value
  dragStart.value = null
  if (Math.abs(dx) > 50) move(dx < 0 ? 1 : -1)
}

function selectCategory(item: string) {
  category.value = item
  activeIndex.value = 0
  normalizeIndex()
}

function downloadWork(work: CreationPlan) {
  const link = document.createElement('a')
  link.href = work.svg
  link.download = `${work.title}.svg`
  link.click()
}

function cardStyle(index: number) {
  const offset = index - activeIndex.value
  const clamped = Math.max(-2, Math.min(2, offset))
  const scale = Math.max(0.68, 1 - Math.abs(clamped) * 0.16)
  const opacity = Math.max(0.28, 1 - Math.abs(clamped) * 0.24)
  return {
    transform: `translate(calc(-50% + ${clamped * 17}rem), -50%) scale(${scale})`,
    opacity: `${opacity}`,
    zIndex: `${10 - Math.abs(clamped)}`
  }
}
</script>

<template>
  <section class="gallery-scene-full glass-panel">
    <header class="gallery-header">
      <div>
        <p class="eyebrow">SPATIAL GALLERY</p>
        <h3>作品展示</h3>
      </div>
      <div class="gallery-filters">
        <button v-for="item in categories" :key="item" type="button" :class="{ active: item === category }" @click="selectCategory(item)">{{ item }}</button>
      </div>
    </header>

    <div v-if="!filteredWorks.length" class="gallery-empty">
      <strong>还没有二创作品</strong>
      <p>进入 AI 二创生成方案后，可以保存到这里形成横向空间画廊。</p>
      <button class="hero-upload-btn shine-btn" type="button" @click="emit('startCreate')">开始创作</button>
    </div>

    <div v-else class="spatial-gallery" @pointerdown="pointerDown" @pointerup="pointerUp" @pointercancel="dragStart = null">
      <button class="gallery-arrow left" type="button" @click="move(-1)">‹</button>
      <article
        v-for="(work, index) in filteredWorks"
        :key="work.id"
        class="gallery-work-card"
        :class="{ active: index === activeIndex, side: index !== activeIndex }"
        :style="cardStyle(index)"
        @click="activeIndex = index"
      >
        <img :src="work.svg" :alt="work.title" />
        <div>
          <strong>{{ work.title }}</strong>
          <span>{{ work.application }} · {{ work.style }}</span>
        </div>
      </article>
      <button class="gallery-arrow right" type="button" @click="move(1)">›</button>
    </div>

    <div v-if="activeWork" class="gallery-detail-strip">
      <div class="before-after">
        <div>
          <span>原纹样</span>
          <img v-if="sourceImage" :src="sourceImage" alt="原纹样" />
          <em v-else>纹</em>
        </div>
        <div>
          <span>二创结果</span>
          <img :src="activeWork.svg" alt="二创结果" />
        </div>
      </div>
      <div class="gallery-actions">
        <button class="mini-action" type="button" @click="detail = activeWork"><el-icon><View /></el-icon>详情</button>
        <button class="mini-action" type="button" @click="emit('favorite', activeWork.id)"><el-icon><Star /></el-icon>{{ activeWork.favorite ? '取消收藏' : '收藏' }}</button>
        <button class="mini-action" type="button" @click="downloadWork(activeWork)"><el-icon><Download /></el-icon>下载</button>
        <button class="mini-action danger" type="button" @click="emit('delete', activeWork.id)"><el-icon><Delete /></el-icon>删除</button>
      </div>
    </div>

    <Transition name="drawer-fade">
      <div v-if="detail" class="gallery-modal glass-panel">
        <button class="drawer-close" type="button" @click="detail = null">×</button>
        <img :src="detail.svg" :alt="detail.title" />
        <p class="eyebrow">{{ detail.application }} / {{ detail.palette }}</p>
        <h3>{{ detail.title }}</h3>
        <p>{{ detail.description }}</p>
      </div>
    </Transition>
  </section>
</template>
