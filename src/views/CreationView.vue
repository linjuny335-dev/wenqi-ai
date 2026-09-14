<script setup lang="ts">
import { computed, ref } from 'vue'
import { Refresh, MagicStick } from '@element-plus/icons-vue'
import { getCurrentPattern } from '../stores/pattern'

const style = ref('新中式')
const scene = ref('服饰')
const strength = ref(68)
const color = ref('#c69a4a')
const generating = ref(false)
const generated = ref(false)
const pattern = computed(() => getCurrentPattern())

function generateDesign() {
  generating.value = true
  generated.value = false
  window.setTimeout(() => {
    generating.value = false
    generated.value = true
  }, 1200)
}
</script>

<template>
  <section>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 class="font-display text-4xl font-semibold">AI二创工作台</h2>
        <p class="mt-2 text-ink/65">调整风格、应用场景与创作强度，生成现代化纹样设计。</p>
      </div>
      <el-button type="primary" color="#9f2f24" :icon="MagicStick" @click="generateDesign">
        生成设计
      </el-button>
    </div>

    <div class="grid gap-5 lg:grid-cols-[1fr_320px_1fr]">
      <div class="rounded border border-gold/20 bg-white/50 p-5">
        <p class="mb-4 font-display text-xl font-semibold">原始纹样</p>
        <div class="grid h-[430px] place-items-center overflow-hidden rounded border border-gold/20 bg-rice">
          <img v-if="pattern.imageUrl" :src="pattern.imageUrl" alt="原始纹样" class="h-full w-full object-cover" />
          <div v-else class="h-56 w-56 rounded-full border border-cinnabar/30 bg-[radial-gradient(circle,#9f2f24_2px,transparent_3px)] bg-[length:16px_16px] animate-floatPattern" />
        </div>
      </div>

      <div class="rounded border border-gold/20 bg-ink p-5 text-rice">
        <p class="mb-5 font-display text-xl font-semibold text-gold">创作参数</p>

        <div class="space-y-6">
          <label class="block">
            <span class="mb-2 block text-sm text-rice/60">设计风格</span>
            <el-select v-model="style" class="w-full">
              <el-option label="新中式" value="新中式" />
              <el-option label="赛博东方" value="赛博东方" />
              <el-option label="极简国潮" value="极简国潮" />
            </el-select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-rice/60">应用场景</span>
            <el-segmented v-model="scene" :options="['服饰', '包装', '文创']" />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-rice/60">二创强度 {{ strength }}%</span>
            <el-slider v-model="strength" :min="20" :max="100" />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm text-rice/60">点缀色</span>
            <el-color-picker v-model="color" />
          </label>
        </div>

        <el-button class="mt-8 w-full" color="#c69a4a" :icon="Refresh" @click="generateDesign">
          重新生成
        </el-button>
      </div>

      <div class="rounded border border-gold/20 bg-white/50 p-5">
        <p class="mb-4 font-display text-xl font-semibold">生成结果</p>
        <div class="relative h-[430px] overflow-hidden rounded border border-gold/20 bg-ink">
          <div v-if="generating" class="absolute inset-0 grid place-items-center text-rice">
            <div class="h-24 w-24 rounded-full border border-gold/80 animate-pulseRing" />
            <p class="absolute">正在生成...</p>
          </div>
          <div v-else class="absolute inset-0 p-8" :style="{ '--accent': color }">
            <div class="h-full rounded border border-[var(--accent)]/40 bg-rice/95 p-8">
              <div class="mx-auto h-48 w-48 rounded-full border-2 border-[var(--accent)] bg-[radial-gradient(circle,var(--accent)_2px,transparent_3px)] bg-[length:18px_18px]" />
              <div class="mt-8 text-center">
                <p class="font-display text-3xl font-semibold text-cinnabar">{{ pattern.name }}</p>
                <p class="mt-3 text-ink/65">{{ style }} · {{ scene }} · 强度 {{ strength }}%</p>
                <p class="mt-5 text-sm leading-6 text-ink/55">
                  {{ generated ? '已生成可用于现代产品视觉的纹样方案。' : '点击生成设计查看结果。' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
