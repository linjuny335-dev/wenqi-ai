<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'
import type { RecognitionStep } from '../../data/mockRecognition'

defineProps<{
  steps: RecognitionStep[]
  currentStep: number
  visible: boolean
}>()
</script>

<template>
  <section v-if="visible" class="progress-panel glass-panel">
    <div class="panel-heading">
      <p class="eyebrow">AI Recognition</p>
      <h3>识别流程</h3>
    </div>
    <ol class="recognition-steps">
      <li
        v-for="(step, index) in steps"
        :key="step.key"
        :class="{ active: index === currentStep, done: index < currentStep }"
      >
        <span class="step-mark">
          <el-icon v-if="index < currentStep"><Check /></el-icon>
          <span v-else>{{ index + 1 }}</span>
        </span>
        <span>
          <strong>{{ step.label }}</strong>
          <small>{{ step.description }}</small>
        </span>
      </li>
    </ol>
  </section>
</template>
