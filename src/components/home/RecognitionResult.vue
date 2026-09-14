<script setup lang="ts">
import { Refresh, Reading } from '@element-plus/icons-vue'
import type { RecognitionResultData } from '../../data/mockRecognition'

defineProps<{
  result: RecognitionResultData | null
}>()

const emit = defineEmits<{
  restart: []
  detail: []
  culture: []
  creation: []
}>()
</script>

<template>
  <section v-if="result" class="result-panel glass-panel">
    <div class="panel-heading result-item">
      <p class="eyebrow">Recognition Result</p>
      <h3>{{ result.name }}</h3>
    </div>

    <div class="result-grid">
      <div class="result-item">
        <span>年代</span>
        <strong>{{ result.dynasty }}</strong>
      </div>
      <div class="result-item">
        <span>来源</span>
        <strong>{{ result.source }}</strong>
      </div>
      <div class="result-item">
        <span>地域</span>
        <strong>{{ result.region }}</strong>
      </div>
      <div class="result-item">
        <span>相似度</span>
        <strong>{{ result.similarity }}%</strong>
      </div>
      <div class="result-item result-wide">
        <span>主要元素</span>
        <div class="direction-tags">
          <em v-for="item in result.elements" :key="item">{{ item }}</em>
        </div>
      </div>
      <div class="result-item result-wide">
        <span>色彩特征</span>
        <p>{{ result.colorFeature }}</p>
      </div>
      <div class="result-item result-wide">
        <span>构图</span>
        <p>{{ result.composition }}</p>
      </div>
      <div class="result-item result-wide">
        <span>文化寓意</span>
        <p>{{ result.meaning }}</p>
      </div>
      <div class="result-item result-wide">
        <span>推荐二创方向</span>
        <div class="direction-tags">
          <em v-for="item in result.directions" :key="item">{{ item }}</em>
        </div>
      </div>
    </div>

    <div class="result-actions result-item">
      <button class="hero-upload-btn shine-btn" type="button" @click="emit('creation')">进入AI二创</button>
      <button class="hero-outline-btn" type="button" @click="emit('culture')">
        <el-icon><Reading /></el-icon>
        进入文化解析
      </button>
      <button class="hero-outline-btn" type="button" @click="emit('restart')">
        <el-icon><Refresh /></el-icon>
        重新识别
      </button>
      <button class="hero-outline-btn" type="button" @click="emit('detail')">
        <el-icon><Reading /></el-icon>
        查看文化详情
      </button>
    </div>
  </section>
</template>
