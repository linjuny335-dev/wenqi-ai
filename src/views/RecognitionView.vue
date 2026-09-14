<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Cpu, UploadFilled } from '@element-plus/icons-vue'
import { demoAnalysis, setCurrentPattern } from '../stores/pattern'

const imageUrl = ref('')
const analyzing = ref(false)
const analyzed = ref(false)

const analysis = computed(() => ({
  ...demoAnalysis,
  imageUrl: imageUrl.value
}))

function handleChange(file: UploadFile) {
  const raw = file.raw
  if (!raw) return

  imageUrl.value = URL.createObjectURL(raw)
  analyzing.value = true
  analyzed.value = false

  window.setTimeout(() => {
    analyzing.value = false
    analyzed.value = true
    setCurrentPattern(analysis.value)
    ElMessage.success('AI识别完成，已生成纹样档案')
  }, 1800)
}
</script>

<template>
  <section class="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <div class="rounded border border-gold/20 bg-white/50 p-6 shadow-glow">
      <h2 class="font-display text-3xl font-semibold">纹样识别</h2>
      <p class="mt-3 text-ink/65">上传一张传统纹样图片，系统会模拟分析纹样结构并输出文化信息。</p>

      <el-upload
        class="mt-6"
        drag
        accept="image/*"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleChange"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">拖拽图片到这里，或点击上传</div>
      </el-upload>

      <div v-if="imageUrl" class="relative mt-6 overflow-hidden rounded border border-gold/25 bg-ink/5">
        <img :src="imageUrl" alt="上传的纹样" class="h-80 w-full object-cover" />
        <div v-if="analyzing" class="absolute inset-0 overflow-hidden bg-ink/45">
          <div class="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-tech/55 to-transparent animate-scan" />
          <div class="absolute inset-0 grid place-items-center text-rice">
            <el-icon class="mb-3 text-4xl text-gold"><Cpu /></el-icon>
            <p>AI正在分析纹样特征...</p>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded border border-gold/20 bg-ink p-6 text-rice shadow-tech">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="font-display text-3xl font-semibold">AI纹样档案</h2>
        <span class="rounded-full border border-gold/35 px-3 py-1 text-sm text-gold">
          {{ analyzed ? '已识别' : '等待上传' }}
        </span>
      </div>

      <div class="relative mb-8 h-32 overflow-hidden rounded border border-gold/20 bg-rice/5">
        <div class="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/70" />
        <div class="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-tech/40 animate-pulseRing" />
        <div class="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(198,154,74,0.14),transparent)]" />
      </div>

      <div class="space-y-5">
        <div>
          <p class="text-sm text-rice/45">纹样名称</p>
          <p class="mt-1 font-display text-2xl text-gold">{{ analyzed ? analysis.name : '待识别' }}</p>
        </div>
        <div>
          <p class="text-sm text-rice/45">年代</p>
          <p class="mt-1">{{ analyzed ? analysis.dynasty : '上传后生成' }}</p>
        </div>
        <div>
          <p class="text-sm text-rice/45">元素</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span v-for="item in analysis.elements" :key="item" class="rounded-full bg-rice/10 px-3 py-1 text-sm">
              {{ analyzed ? item : '识别中' }}
            </span>
          </div>
        </div>
        <div>
          <p class="text-sm text-rice/45">文化寓意</p>
          <p class="mt-1 leading-7 text-rice/78">{{ analyzed ? analysis.meaning : '系统会在此展示纹样寓意与应用方向。' }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
