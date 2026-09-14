<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RecognitionResultData } from '../../data/mockRecognition'

const props = defineProps<{
  result: RecognitionResultData
  imageUrl: string | null
}>()

interface CultureNode {
  key: string
  label: string
  value: string
  detail: string
  x: number
  y: number
}

const activeNode = ref<CultureNode | null>(null)

const nodes = computed<CultureNode[]>(() => [
  { key: 'dynasty', label: '年代', value: props.result.dynasty, detail: '该时间段的楚文化纹样常见于漆器、帛画和礼器装饰，重视曲线动势与神性象征。', x: 14, y: 18 },
  { key: 'source', label: '来源', value: props.result.source, detail: '纹样来源可用于后续确定材质质感、边框语汇和展陈叙事方式。', x: 73, y: 16 },
  { key: 'colors', label: '色彩', value: props.result.colors.join(' / '), detail: '墨黑、朱红和古金形成楚漆器的核心配色，适合现代高端视觉系统。', x: 8, y: 64 },
  { key: 'composition', label: '构图', value: props.result.composition, detail: '回旋曲线、尾羽伸展和云气缠绕构成主要识别线索，可转译为连续纹样。', x: 75, y: 62 },
  { key: 'meaning', label: '寓意', value: props.result.meaning, detail: '凤鸟象征生命升腾、精神自由和祝颂护佑，可作为品牌精神和文创叙事核心。', x: 42, y: 82 }
])

const relics = [
  { name: '楚漆凤鸟纹盘', desc: '黑漆底、朱红线描，适合提取尾羽结构。' },
  { name: '战国帛画纹样', desc: '云气与神鸟并置，适合数字展陈动效。' },
  { name: '云雷连续边饰', desc: '可作为包装腰封和界面分隔纹。' }
]
</script>

<template>
  <section class="culture-scene glass-panel">
    <div class="culture-orbit">
      <div class="culture-core">
        <img v-if="imageUrl" :src="imageUrl" alt="识别出的纹样" />
        <div v-else class="culture-core-placeholder">纹</div>
      </div>
      <button
        v-for="node in nodes"
        :key="node.key"
        class="culture-node"
        type="button"
        :style="{ left: `${node.x}%`, top: `${node.y}%` }"
        @click="activeNode = node"
      >
        <span>{{ node.label }}</span>
        <strong>{{ node.value }}</strong>
      </button>
    </div>

    <div class="culture-side">
      <p class="eyebrow">CULTURE MAP</p>
      <h3>{{ result.name }}</h3>
      <p>{{ result.meaning }}</p>
      <div class="culture-info-grid">
        <article>
          <span>结构拆解</span>
          <strong>{{ result.structure.join(' / ') }}</strong>
        </article>
        <article>
          <span>可提取元素</span>
          <strong>{{ result.designElements.join(' / ') }}</strong>
        </article>
        <article>
          <span>现代设计方向</span>
          <strong>{{ result.directions.join(' / ') }}</strong>
        </article>
      </div>
      <div class="color-chip-row" aria-label="色彩提取">
        <span v-for="color in result.colors" :key="color">{{ color }}</span>
      </div>
      <div class="relic-list">
        <article v-for="item in relics" :key="item.name">
          <strong>{{ item.name }}</strong>
          <span>{{ item.desc }}</span>
        </article>
      </div>
    </div>

    <Transition name="drawer-fade">
      <div v-if="activeNode" class="culture-popover glass-panel">
        <button class="drawer-close" type="button" @click="activeNode = null">×</button>
        <p class="eyebrow">{{ activeNode.label }}</p>
        <h3>{{ activeNode.value }}</h3>
        <p>{{ activeNode.detail }}</p>
      </div>
    </Transition>
  </section>
</template>
