<script setup lang="ts">
import { computed, ref } from 'vue'
import { Delete, Refresh, UploadFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  uploadedFile: {
    name: string
    size: number
    width: number
    height: number
    previewUrl: string
  } | null
  status: 'default' | 'uploaded' | 'recognizing' | 'done' | 'error'
  errorMessage: string
}>()

const emit = defineEmits<{
  upload: [file: File]
  start: []
  remove: []
  retry: []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const readableSize = computed(() => {
  if (!props.uploadedFile) return ''
  const kb = props.uploadedFile.size / 1024
  return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(0)} KB`
})

function openPicker() {
  if (props.status === 'recognizing') return
  fileInput.value?.click()
}

function onInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) emit('upload', file)
  input.value = ''
}

function onDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  if (props.status === 'recognizing') return
  const file = event.dataTransfer?.files?.[0]
  if (file) emit('upload', file)
}
</script>

<template>
  <section
    class="upload-panel glass-panel"
    :class="{ 'is-dragging': isDragging, 'has-error': status === 'error' }"
    @dragenter.prevent="isDragging = true"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop="onDrop"
  >
    <input ref="fileInput" class="sr-only" type="file" accept="image/png,image/jpeg,image/webp" @change="onInputChange" />

    <button v-if="!uploadedFile" class="upload-dropzone" type="button" @click="openPicker">
      <el-icon><UploadFilled /></el-icon>
      <span>{{ isDragging ? '松开以上传图片' : '上传纹样图片' }}</span>
      <small>支持 PNG、JPG、WEBP，单张图片不超过 8MB</small>
    </button>

    <div v-else class="uploaded-layout">
      <div class="preview-frame">
        <img :src="uploadedFile.previewUrl" alt="上传的纹样预览" />
        <div v-if="status === 'recognizing'" class="scan-line" />
      </div>
      <div class="upload-meta">
        <p class="eyebrow">已上传纹样</p>
        <h3>{{ uploadedFile.name }}</h3>
        <p>{{ uploadedFile.width }} × {{ uploadedFile.height }} px · {{ readableSize }}</p>
        <div class="upload-actions">
          <button class="mini-action" type="button" :disabled="status === 'recognizing'" @click="openPicker">
            <el-icon><Refresh /></el-icon>
            重新上传
          </button>
          <button class="mini-action danger" type="button" :disabled="status === 'recognizing'" @click="emit('remove')">
            <el-icon><Delete /></el-icon>
            删除图片
          </button>
        </div>
      </div>
    </div>

    <p v-if="status === 'default'" class="upload-hint">请先上传一张传统纹样图片，系统会演示识别流程。</p>
    <p v-if="status === 'error'" class="error-text">{{ errorMessage }}</p>

    <div class="primary-actions">
      <button class="hero-upload-btn shine-btn" type="button" :disabled="status === 'recognizing'" @click="uploadedFile ? emit('start') : openPicker()">
        <el-icon><UploadFilled /></el-icon>
        <span>{{ uploadedFile ? '开始识别' : '开始上传识别' }}</span>
      </button>
      <button v-if="status === 'error'" class="hero-outline-btn" type="button" @click="emit('retry')">再次尝试</button>
    </div>
  </section>
</template>
