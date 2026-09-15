<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { MagicStick, RefreshRight, UploadFilled, View } from '@element-plus/icons-vue'
import PhoenixVisual from './PhoenixVisual.vue'
import ParticleBackground from './ParticleBackground.vue'
import PatternUploader from './PatternUploader.vue'
import RecognitionProgress from './RecognitionProgress.vue'
import RecognitionResult from './RecognitionResult.vue'
import PatternDetailDrawer from './PatternDetailDrawer.vue'
import SceneNavigator from './SceneNavigator.vue'
import CultureScene from './CultureScene.vue'
import CreationWorkbench from './CreationWorkbench.vue'
import GalleryScene from './GalleryScene.vue'
import {
  demoRecognitionResult,
  patternDetails,
  recognitionSteps,
  simulateRecognition,
  type PatternDetail,
  type RecognitionResultData
} from '../../data/mockRecognition'
import type { CreationPlan } from '../../data/demoCreation'
import { homeScenes, SCENE_COOLDOWN_MS, SCENE_TRANSITION_MS, type SceneId } from '../../data/sceneConfig'

type HomeState = 'default' | 'uploaded' | 'recognizing' | 'done' | 'error'

interface UploadedPattern {
  file: File
  name: string
  size: number
  width: number
  height: number
  previewUrl: string
}

const MAX_FILE_SIZE = 8 * 1024 * 1024
const VALID_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const status = ref<HomeState>('default')
const uploadedFile = ref<UploadedPattern | null>(null)
const currentStep = ref(0)
const errorMessage = ref('')
const result = ref<RecognitionResultData | null>(null)
const selectedDetail = ref<PatternDetail | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const homeFileInput = ref<HTMLInputElement | null>(null)
const parallaxFrame = ref<number | null>(null)
const activeSceneIndex = ref(0)
const direction = ref(1)
const isSceneTransitioning = ref(false)
const dragProgress = ref(0)
const pointerStartX = ref(0)
const pointerStartY = ref(0)
const isDraggingScene = ref(false)
const savedWorks = ref<CreationPlan[]>([])
const SAVED_WORKS_KEY = 'wenqi-ai-saved-works'
let stepTimer: number | null = null
let sceneTimer: number | null = null
let dragResetFrame: number | null = null
let cooldownUntil = 0

const phoenixState = computed(() => status.value)
const activeScene = computed(() => homeScenes[activeSceneIndex.value])
const activeSceneId = computed<SceneId>(() => activeScene.value.id)
const sceneCounter = computed(() => `${String(activeSceneIndex.value + 1).padStart(2, '0')} / ${String(homeScenes.length).padStart(2, '0')}`)
const displayResult = computed(() => result.value ?? demoRecognitionResult)
const uploadedImage = computed(() => uploadedFile.value?.previewUrl ?? null)
const titleParts = computed(() => {
  const title = activeScene.value.title
  const accent = activeScene.value.accent
  const index = title.indexOf(accent)
  if (index === -1) return { before: title, accent: '', after: '' }
  return { before: title.slice(0, index), accent, after: title.slice(index + accent.length) }
})
const sceneDirectionClass = computed(() => `scene-enter-${activeScene.value.enterDirection}`)

function clearStepTimer() {
  if (stepTimer !== null) {
    window.clearInterval(stepTimer)
    stepTimer = null
  }
}

function clearSceneTimer() {
  if (sceneTimer !== null) {
    window.clearTimeout(sceneTimer)
    sceneTimer = null
  }
}

function normalizedIndex(index: number) {
  const total = homeScenes.length
  return ((index % total) + total) % total
}

function resolveDirection(targetIndex: number) {
  const total = homeScenes.length
  const current = activeSceneIndex.value
  const forward = (targetIndex - current + total) % total
  const backward = (current - targetIndex + total) % total
  if (forward === 0) return direction.value
  return forward <= backward ? 1 : -1
}

function setScene(targetIndex: number, forcedDirection?: number) {
  const nextIndex = normalizedIndex(targetIndex)
  const now = performance.now()
  if (nextIndex === activeSceneIndex.value || isSceneTransitioning.value || now < cooldownUntil) return

  direction.value = forcedDirection ?? resolveDirection(nextIndex)
  activeSceneIndex.value = nextIndex
  isSceneTransitioning.value = true
  dragProgress.value = 0
  cooldownUntil = now + SCENE_COOLDOWN_MS
  clearSceneTimer()
  sceneTimer = window.setTimeout(() => {
    isSceneTransitioning.value = false
  }, SCENE_TRANSITION_MS)
}

function goToScene(index: number) {
  setScene(index)
}

function goToSceneId(sceneId: SceneId) {
  const index = homeScenes.findIndex((scene) => scene.id === sceneId)
  if (index >= 0) setScene(index)
}

function nextScene() {
  setScene(activeSceneIndex.value + 1, 1)
}

function previousScene() {
  setScene(activeSceneIndex.value - 1, -1)
}

function setError(message: string) {
  status.value = 'error'
  errorMessage.value = message
  goToSceneId('recognition')
}

function readImageSize(file: File, previewUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => reject(new Error('图片读取失败，请重新上传。'))
    image.src = previewUrl
  })
}

async function handleUpload(file: File) {
  clearStepTimer()
  result.value = null
  errorMessage.value = ''

  if (!VALID_TYPES.includes(file.type)) {
    setError('文件格式不支持。请上传 PNG、JPG 或 WEBP 图片。')
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    setError('图片超过 8MB。请压缩后重新上传。')
    return
  }

  if (uploadedFile.value?.previewUrl) URL.revokeObjectURL(uploadedFile.value.previewUrl)
  const previewUrl = URL.createObjectURL(file)

  try {
    const size = await readImageSize(file, previewUrl)
    uploadedFile.value = { file, name: file.name, size: file.size, width: size.width, height: size.height, previewUrl }
    status.value = 'uploaded'
    goToSceneId('recognition')
  } catch (error) {
    URL.revokeObjectURL(previewUrl)
    setError(error instanceof Error ? error.message : '图片读取失败，请重新上传。')
  }
}

async function startRecognition() {
  if (status.value === 'recognizing') return
  if (!uploadedFile.value) {
    setError('请先上传纹样图片，再开始识别。')
    return
  }

  goToSceneId('recognition')
  status.value = 'recognizing'
  currentStep.value = 0
  result.value = null
  clearStepTimer()

  stepTimer = window.setInterval(() => {
    if (currentStep.value < recognitionSteps.length - 1) currentStep.value += 1
  }, 620)

  try {
    const data = await simulateRecognition()
    clearStepTimer()
    currentStep.value = recognitionSteps.length
    result.value = data
    status.value = 'done'
  } catch {
    clearStepTimer()
    setError('识别失败，请稍后再次尝试。')
  }
}

function resetUpload() {
  clearStepTimer()
  if (uploadedFile.value?.previewUrl) URL.revokeObjectURL(uploadedFile.value.previewUrl)
  uploadedFile.value = null
  result.value = null
  errorMessage.value = ''
  currentStep.value = 0
  status.value = 'default'
}

function retryRecognition() {
  if (uploadedFile.value) startRecognition()
  else {
    status.value = 'default'
    errorMessage.value = ''
  }
}

function openHomeUpload() {
  homeFileInput.value?.click()
}

function onHomeUploadChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleUpload(file)
  input.value = ''
}

function restartRecognition() {
  status.value = uploadedFile.value ? 'uploaded' : 'default'
  result.value = null
  currentStep.value = 0
  goToSceneId('recognition')
}

function openPatternDetail(name: string) {
  selectedDetail.value = patternDetails.find((item) => item.name === name) ?? null
}

function openResultDetail() {
  selectedDetail.value = {
    name: displayResult.value.name,
    title: displayResult.value.name,
    description: displayResult.value.meaning,
    usage: displayResult.value.directions.join('、')
  }
}

function saveCreations(plans: CreationPlan[]) {
  const existing = new Set(savedWorks.value.map((item) => item.id))
  savedWorks.value = [...plans.filter((item) => !existing.has(item.id)), ...savedWorks.value]
}

function loadSavedWorks() {
  try {
    const raw = window.localStorage.getItem(SAVED_WORKS_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as CreationPlan[]
    if (Array.isArray(parsed)) savedWorks.value = parsed
  } catch {
    savedWorks.value = []
  }
}

function toggleWorkFavorite(id: string) {
  savedWorks.value = savedWorks.value.map((item) => item.id === id ? { ...item, favorite: !item.favorite } : item)
}

function deleteWork(id: string) {
  savedWorks.value = savedWorks.value.filter((item) => item.id !== id)
}

function handlePointerMove(event: PointerEvent) {
  if (!heroRef.value || window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches) return
  const rect = heroRef.value.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5

  if (isDraggingScene.value) {
    const dx = event.clientX - pointerStartX.value
    dragProgress.value = Math.max(-1, Math.min(1, dx / 180))
  }

  if (parallaxFrame.value !== null) window.cancelAnimationFrame(parallaxFrame.value)
  parallaxFrame.value = window.requestAnimationFrame(() => {
    heroRef.value?.style.setProperty('--px', x.toFixed(3))
    heroRef.value?.style.setProperty('--py', y.toFixed(3))
  })
}

function resetPointer() {
  heroRef.value?.style.setProperty('--px', '0')
  heroRef.value?.style.setProperty('--py', '0')
}

function handleScenePointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (target.closest('button, a, input, textarea, select, label')) return
  pointerStartX.value = event.clientX
  pointerStartY.value = event.clientY
  isDraggingScene.value = true
  dragProgress.value = 0
  heroRef.value?.setPointerCapture?.(event.pointerId)
}

function animateDragBack() {
  if (dragResetFrame !== null) window.cancelAnimationFrame(dragResetFrame)
  const start = dragProgress.value
  const startTime = performance.now()
  const duration = 260
  const tick = (time: number) => {
    const progress = Math.min(1, (time - startTime) / duration)
    const eased = 1 - Math.pow(1 - progress, 3)
    dragProgress.value = start * (1 - eased)
    if (progress < 1) dragResetFrame = window.requestAnimationFrame(tick)
  }
  dragResetFrame = window.requestAnimationFrame(tick)
}

function handleScenePointerUp(event: PointerEvent) {
  if (!isDraggingScene.value) return
  isDraggingScene.value = false
  const dx = event.clientX - pointerStartX.value
  const dy = event.clientY - pointerStartY.value
  heroRef.value?.releasePointerCapture?.(event.pointerId)
  if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy)) dx < 0 ? nextScene() : previousScene()
  else animateDragBack()
}

function handleWheel(event: WheelEvent) {
  if (Math.abs(event.deltaY) < 18 || isSceneTransitioning.value || performance.now() < cooldownUntil) return
  event.preventDefault()
  event.deltaY > 0 ? nextScene() : previousScene()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') nextScene()
  if (event.key === 'ArrowLeft') previousScene()
}

function tiltCard(event: MouseEvent) {
  if (window.matchMedia('(max-width: 768px), (prefers-reduced-motion: reduce)').matches) return
  const card = event.currentTarget as HTMLElement
  const rect = card.getBoundingClientRect()
  const x = (event.clientX - rect.left) / rect.width - 0.5
  const y = (event.clientY - rect.top) / rect.height - 0.5
  card.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`)
  card.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`)
}

function resetTilt(event: MouseEvent) {
  const card = event.currentTarget as HTMLElement
  card.style.setProperty('--rx', '0deg')
  card.style.setProperty('--ry', '0deg')
}

onMounted(() => {
  loadSavedWorks()
  window.addEventListener('keydown', handleKeydown)
})

watch(savedWorks, (works) => {
  try {
    window.localStorage.setItem(SAVED_WORKS_KEY, JSON.stringify(works.slice(0, 24)))
  } catch {
    // 本地存储不可用时不影响核心交互。
  }
}, { deep: true })

onBeforeUnmount(() => {
  clearStepTimer()
  clearSceneTimer()
  window.removeEventListener('keydown', handleKeydown)
  if (uploadedFile.value?.previewUrl) URL.revokeObjectURL(uploadedFile.value.previewUrl)
  if (parallaxFrame.value !== null) window.cancelAnimationFrame(parallaxFrame.value)
  if (dragResetFrame !== null) window.cancelAnimationFrame(dragResetFrame)
})
</script>

<template>
  <section
    ref="heroRef"
    class="hero-stage advanced-hero scene-stage immersive-stage phoenix-world-stage"
    :class="[`hero-state-${status}`, `scene-${activeSceneId}`, { 'is-scene-transitioning': isSceneTransitioning, 'is-dragging-scene': isDraggingScene }]"
    @pointerdown="handleScenePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handleScenePointerUp"
    @pointercancel="handleScenePointerUp"
    @pointerleave="resetPointer"
    @wheel="handleWheel"
  >
    <div class="hero-depth hero-depth-back" />
    <div class="hero-depth hero-depth-pattern" />
    <ParticleBackground
      :state="status"
      :active-scene="activeSceneId"
      :direction="direction"
      :transitioning="isSceneTransitioning"
      :drag-progress="dragProgress"
    />
    <PhoenixVisual :state="phoenixState" />

    <Transition name="scene-copy" mode="out-in">
      <div :key="activeSceneId" class="immersive-scene-content" :class="[sceneDirectionClass, `content-${activeSceneId}`]">
        <template v-if="activeSceneId === 'home'">
          <input ref="homeFileInput" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" @change="onHomeUploadChange" />
          <div class="home-cinematic-motto">
            <span>纹以载道</span>
            <span>启于未来</span>
            <i />
          </div>
          <div class="home-landing-copy cinematic-copy">
            <h1 class="font-display">纹启AI</h1>
            <h2>传统纹样识别与二次创作平台</h2>
            <i class="title-rule" />
            <p>让沉睡的传统纹样，在数字世界中重新生长</p>
            <div class="cinematic-actions">
              <button class="hero-upload-btn shine-btn cinematic-primary" type="button" @click="goToSceneId('recognition')">
                <span>开始探索</span>
                <b>›</b>
              </button>
              <button class="hero-outline-btn cinematic-secondary" type="button" @click="openHomeUpload">
                <el-icon><UploadFilled /></el-icon>
                <span>上传纹样</span>
              </button>
            </div>
          </div>
          <div class="home-footer-whisper">寻纹见古 · 以 AI 焕新</div>
        </template>

        <template v-else-if="activeSceneId === 'recognition'">
          <div class="scene-two-column recognition-layout">
            <div class="scene-copy-block">
              <div class="hero-eyebrow"><span />纹样识别 · Demo AI</div>
              <h1 class="font-display">
                {{ titleParts.before }}<span>{{ titleParts.accent }}</span>{{ titleParts.after }}
              </h1>
              <p>{{ activeScene.description }}</p>
              <PatternUploader
                :uploaded-file="uploadedFile"
                :status="status"
                :error-message="errorMessage"
                @upload="handleUpload"
                @start="startRecognition"
                @remove="resetUpload"
                @retry="retryRecognition"
              />
            </div>
            <div class="scene-panel-stack">
              <Transition name="panel-slide" mode="out-in">
                <RecognitionProgress
                  v-if="status === 'recognizing'"
                  :steps="recognitionSteps"
                  :current-step="currentStep"
                  :visible="status === 'recognizing'"
                />
                <RecognitionResult
                  v-else-if="status === 'done'"
                  :result="displayResult"
                  @restart="restartRecognition"
                  @detail="openResultDetail"
                  @culture="goToSceneId('culture')"
                  @creation="goToSceneId('creation')"
                />
                <section v-else class="ai-progress-panel glass-panel recognition-hint-panel">
                  <p class="eyebrow">UPLOAD STATUS</p>
                  <h3>{{ status === 'uploaded' ? '图片已载入，等待识别' : '等待上传传统纹样' }}</h3>
                  <p>{{ status === 'uploaded' ? '点击开始识别后，粒子将围绕图片形成扫描光环。' : '支持 PNG、JPG、WEBP，本地演示不会上传到外部服务。' }}</p>
                </section>
              </Transition>
              <button v-if="status === 'done'" class="hero-upload-btn shine-btn" type="button" @click="goToSceneId('creation')">
                <span>进入AI二创</span>
                <el-icon><MagicStick /></el-icon>
              </button>
            </div>
          </div>
        </template>

        <template v-else-if="activeSceneId === 'culture'">
          <CultureScene :result="displayResult" :image-url="uploadedImage" />
        </template>

        <template v-else-if="activeSceneId === 'creation'">
          <CreationWorkbench
            :result="displayResult"
            :image-url="uploadedImage"
            @save="saveCreations"
            @gallery="goToSceneId('gallery')"
          />
        </template>

        <template v-else>
          <GalleryScene
            :works="savedWorks"
            :source-image="uploadedImage"
            @start-create="goToSceneId('creation')"
            @favorite="toggleWorkFavorite"
            @delete="deleteWork"
          />
        </template>
      </div>
    </Transition>

    <SceneNavigator
      :scenes="homeScenes"
      :active-index="activeSceneIndex"
      :disabled="isSceneTransitioning"
      :counter="sceneCounter"
      @change="goToScene"
      @previous="previousScene"
      @next="nextScene"
    />

    <PatternDetailDrawer :detail="selectedDetail" @close="selectedDetail = null" />
  </section>
</template>
