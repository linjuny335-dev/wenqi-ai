<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download, EditPen, Star, View } from '@element-plus/icons-vue'
import type { RecognitionResultData } from '../../data/mockRecognition'
import {
  DEMO_MODE_NOTICE,
  applicationOptions,
  compositionOptions,
  defaultCreationParams,
  paletteOptions,
  requestCreationPlans,
  styleOptions,
  type ApplicationScene,
  type CreationParams,
  type CreationPlan
} from '../../data/demoCreation'

const props = defineProps<{
  result: RecognitionResultData
  imageUrl: string | null
}>()

const emit = defineEmits<{
  save: [plans: CreationPlan[]]
  gallery: []
}>()

type RangeKey = 'strength' | 'retention' | 'density' | 'size' | 'rotation' | 'spacing' | 'lineWeight' | 'complexity'

const params = ref<CreationParams>({ ...defaultCreationParams })
const plans = ref<CreationPlan[]>([])
const selectedPlanId = ref<string | null>(null)
const compareIds = ref<string[]>([])
const isGenerating = ref(false)
const notice = ref(DEMO_MODE_NOTICE)
const previewPlan = ref<CreationPlan | null>(null)
const selectedProductScene = ref<ApplicationScene>('包装')

const rangeControls: Array<{ key: RangeKey; label: string; min: number; max: number; unit?: string }> = [
  { key: 'strength', label: '二创强度', min: 0, max: 100 },
  { key: 'retention', label: '传统元素保留度', min: 0, max: 100 },
  { key: 'density', label: '图案密度', min: 0, max: 100 },
  { key: 'size', label: '图案大小', min: 20, max: 120 },
  { key: 'rotation', label: '旋转角度', min: -90, max: 90, unit: '°' },
  { key: 'spacing', label: '间距', min: 10, max: 90 },
  { key: 'lineWeight', label: '线条粗细', min: 8, max: 100 },
  { key: 'complexity', label: '复杂度', min: 10, max: 100 }
]

const extractedElements = computed(() => props.result.designElements.map((item, index) => ({
  name: item,
  value: `${[params.value.retention, params.value.complexity, params.value.density, params.value.lineWeight, params.value.strength][index % 5]}%`
})))

const selectedPlan = computed(() => plans.value.find((item) => item.id === selectedPlanId.value) ?? plans.value[0] ?? null)
const comparePlans = computed(() => plans.value.filter((item) => compareIds.value.includes(item.id)).slice(0, 2))

async function generate() {
  if (isGenerating.value) return
  isGenerating.value = true
  notice.value = '演示模式正在生成：参数会参与 SVG 纹样重构，但尚未调用真实云端 AI。'
  try {
    plans.value = await requestCreationPlans(params.value, props.result, props.result.name)
    selectedPlanId.value = plans.value[0]?.id ?? null
    compareIds.value = []
    notice.value = `已生成 ${plans.value.length} 个演示方案，可收藏、对比、下载或保存到作品展示。`
  } catch {
    notice.value = '生成失败，请稍后重试。'
  } finally {
    isGenerating.value = false
  }
}

function toggleFavorite(plan: CreationPlan) {
  plan.favorite = !plan.favorite
}

function toggleCompare(plan: CreationPlan) {
  if (compareIds.value.includes(plan.id)) {
    compareIds.value = compareIds.value.filter((id) => id !== plan.id)
    return
  }
  compareIds.value = [...compareIds.value.slice(-1), plan.id]
}

function editFromPlan(plan: CreationPlan) {
  params.value.style = plan.style
  params.value.composition = plan.composition
  params.value.application = plan.application
  params.value.palette = plan.palette
  selectedPlanId.value = plan.id
  notice.value = `已载入「${plan.title}」参数，可继续微调后重新生成。`
}

function downloadPlan(plan: CreationPlan) {
  const link = document.createElement('a')
  link.href = plan.svg
  link.download = `${plan.title}.svg`
  link.click()
}

function saveToGallery() {
  if (!plans.value.length) return
  emit('save', plans.value)
  notice.value = `已保存 ${plans.value.length} 个方案到作品展示场景。`
}

function applyProduct(scene: ApplicationScene) {
  selectedProductScene.value = scene
  params.value.application = scene
}

generate()
</script>

<template>
  <section class="creation-workbench glass-panel">
    <header class="workbench-header">
      <div>
        <p class="eyebrow">DEMO AI WORKBENCH</p>
        <h3>AI二创工作台</h3>
      </div>
      <span>{{ notice }}</span>
    </header>

    <div class="workbench-grid enhanced-workbench-grid">
      <aside class="workbench-source">
        <p class="eyebrow">原始纹样</p>
        <div class="source-preview">
          <img v-if="imageUrl" :src="imageUrl" alt="原始纹样预览" />
          <div v-else class="source-placeholder">{{ result.name.slice(0, 1) }}</div>
        </div>
        <div class="extract-list">
          <article v-for="item in extractedElements" :key="item.name">
            <span>{{ item.name }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </aside>

      <div class="workbench-controls">
        <label>
          <span>设计风格</span>
          <select v-model="params.style">
            <option v-for="item in styleOptions" :key="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span>构图形式</span>
          <select v-model="params.composition">
            <option v-for="item in compositionOptions" :key="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span>应用场景</span>
          <select v-model="params.application">
            <option v-for="item in applicationOptions" :key="item">{{ item }}</option>
          </select>
        </label>
        <label>
          <span>配色方案</span>
          <select v-model="params.palette">
            <option v-for="item in paletteOptions" :key="item">{{ item }}</option>
          </select>
        </label>

        <label class="color-row">
          <span>主色</span>
          <input v-model="params.primaryColor" type="color" />
          <em>{{ params.primaryColor }}</em>
        </label>
        <label class="color-row">
          <span>辅助色</span>
          <input v-model="params.secondaryColor" type="color" />
          <em>{{ params.secondaryColor }}</em>
        </label>

        <label v-for="control in rangeControls" :key="control.key" class="range-row">
          <span>{{ control.label }}</span>
          <input v-model.number="params[control.key]" type="range" :min="control.min" :max="control.max" />
          <em>{{ params[control.key] }}{{ control.unit ?? '' }}</em>
        </label>

        <label>
          <span>随机种子</span>
          <input v-model.number="params.seed" type="number" min="1" step="1" />
        </label>

        <label class="prompt-row">
          <span>正向提示词</span>
          <textarea v-model="params.prompt" rows="3" placeholder="描述希望生成的用途、情绪、材质或品牌语气" />
        </label>
        <label class="prompt-row">
          <span>排除提示词</span>
          <textarea v-model="params.negativePrompt" rows="2" placeholder="例如：不要蓝紫霓虹、不要卡通、不要低质贴纸感" />
        </label>

        <div class="workbench-actions">
          <button class="hero-upload-btn shine-btn" type="button" :disabled="isGenerating" @click="generate">
            {{ isGenerating ? '生成中...' : '生成4个方案' }}
          </button>
          <button class="hero-outline-btn" type="button" :disabled="!plans.length" @click="saveToGallery">保存到作品展示</button>
          <button class="hero-outline-btn" type="button" @click="emit('gallery')">进入作品展示</button>
        </div>
      </div>

      <div class="workbench-results">
        <div class="product-preview glass-panel" :class="`mockup-${selectedProductScene}`">
          <div class="mockup-canvas">
            <img v-if="selectedPlan" :src="selectedPlan.svg" alt="当前生成方案应用预览" />
            <span v-else>等待生成</span>
          </div>
          <div class="product-tabs">
            <button v-for="scene in applicationOptions" :key="scene" type="button" :class="{ active: scene === selectedProductScene }" @click="applyProduct(scene)">
              {{ scene }}
            </button>
          </div>
        </div>

        <div v-if="comparePlans.length" class="compare-strip">
          <article v-for="plan in comparePlans" :key="plan.id">
            <strong>{{ plan.title }}</strong>
            <img :src="plan.svg" :alt="`${plan.title} 对比图`" />
          </article>
        </div>

        <div class="plan-grid">
          <article
            v-for="plan in plans"
            :key="plan.id"
            class="plan-card"
            :class="{ active: plan.id === selectedPlanId, comparing: compareIds.includes(plan.id) }"
            @click="selectedPlanId = plan.id"
          >
            <img :src="plan.svg" :alt="plan.title" />
            <div>
              <strong>{{ plan.title }}</strong>
              <span>{{ plan.style }} / {{ plan.composition }}</span>
            </div>
            <div class="plan-actions">
              <button type="button" title="放大查看" @click.stop="previewPlan = plan"><el-icon><View /></el-icon></button>
              <button type="button" title="收藏" :class="{ active: plan.favorite }" @click.stop="toggleFavorite(plan)"><el-icon><Star /></el-icon></button>
              <button type="button" title="前后对比" @click.stop="toggleCompare(plan)"><span>比</span></button>
              <button type="button" title="再次编辑" @click.stop="editFromPlan(plan)"><el-icon><EditPen /></el-icon></button>
              <button type="button" title="下载" @click.stop="downloadPlan(plan)"><el-icon><Download /></el-icon></button>
            </div>
          </article>
        </div>
      </div>
    </div>

    <Transition name="drawer-fade">
      <div v-if="previewPlan" class="plan-lightbox" @click.self="previewPlan = null">
        <article class="glass-panel">
          <button class="drawer-close" type="button" @click="previewPlan = null">×</button>
          <img :src="previewPlan.svg" :alt="previewPlan.title" />
          <h3>{{ previewPlan.title }}</h3>
          <p>{{ previewPlan.description }}</p>
          <div class="workbench-actions">
            <button class="hero-outline-btn" type="button" @click="editFromPlan(previewPlan); previewPlan = null">再次编辑</button>
            <button class="hero-upload-btn shine-btn" type="button" @click="downloadPlan(previewPlan)">下载方案</button>
          </div>
        </article>
      </div>
    </Transition>
  </section>
</template>
