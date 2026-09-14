<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { SCENE_TRANSITION_MS, type SceneId } from '../../data/sceneConfig'

const props = defineProps<{
  state: 'default' | 'uploaded' | 'recognizing' | 'done' | 'error'
  activeScene: SceneId
  direction: number
  transitioning: boolean
  dragProgress: number
}>()

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  tx: number
  ty: number
  tz: number
  radius: number
  alpha: number
  color: string
  depth: number
  life?: number
  maxLife?: number
  burst?: boolean
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

let context: CanvasRenderingContext2D | null = null
let animationId = 0
let width = 0
let height = 0
let dpr = 1
let isVisible = true
let isMobile = false
let reduceMotion = false
let particles: Particle[] = []
let burstParticles: Particle[] = []
let sceneValue = props.activeScene
let transitionStart = 0
let transitionDirection = props.direction
let pointer = { x: -9999, y: -9999, active: false }

const colorsByScene: Record<SceneId, string[]> = {
  home: ['185,54,43', '159,47,36', '198,154,74', '247,241,228'],
  recognition: ['198,154,74', '185,54,43', '176,166,148', '247,241,228'],
  culture: ['198,154,74', '176,166,148', '159,47,36', '247,241,228'],
  creation: ['199,67,50', '198,154,74', '159,47,36', '176,166,148'],
  gallery: ['198,154,74', '185,54,43', '247,241,228', '176,166,148']
}

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function getParticleCount() {
  if (reduceMotion) return isMobile ? 18 : 34
  return isMobile ? 30 : 68
}

function getSceneTarget(scene: SceneId, index: number, total: number) {
  const t = index / Math.max(1, total - 1)
  const angle = t * Math.PI * 2
  const centerX = width * 0.66
  const centerY = height * 0.5
  const quietLeft = index % 5 === 0 ? width * random(0.08, 0.36) : centerX

  if (scene === 'home') {
    const group = index % 4
    if (group === 0) {
      return {
        x: width * (0.62 + t * 0.28) + Math.sin(angle * 3) * width * 0.035,
        y: height * (0.18 + Math.sin(t * Math.PI) * 0.42) + Math.sin(angle * 2) * height * 0.05,
        z: random(-160, 160)
      }
    }
    if (group === 1) {
      return {
        x: width * (0.44 + t * 0.32),
        y: height * (0.44 + Math.sin(angle * 1.6) * 0.2),
        z: random(-90, 260)
      }
    }
    if (group === 2) {
      return {
        x: width * (0.58 + Math.cos(angle) * 0.22),
        y: height * (0.57 + Math.sin(angle) * 0.23),
        z: random(-140, 210)
      }
    }
    return {
      x: width * random(0.52, 0.92),
      y: height * random(0.08, 0.78),
      z: random(-220, 260)
    }
  }

  if (scene === 'recognition') {
    const ring = index % 2 === 0 ? 0.18 : 0.26
    return {
      x: width * 0.52 + Math.cos(angle) * width * ring,
      y: height * 0.54 + Math.sin(angle) * height * ring,
      z: random(-80, 140)
    }
  }

  if (scene === 'culture') {
    const orbit = index % 3
    const radiusX = width * (0.18 + orbit * 0.07)
    const radiusY = height * (0.14 + orbit * 0.05)
    return {
      x: width * 0.58 + Math.cos(angle) * radiusX,
      y: height * 0.48 + Math.sin(angle * 1.2) * radiusY,
      z: orbit * 80 - 80
    }
  }

  if (scene === 'creation') {
    const col = (index % 9) - 4
    const row = Math.floor(index / 9) % 7 - 3
    return {
      x: width * 0.6 + col * width * 0.045 + Math.sin(row + t * 8) * 18,
      y: height * 0.5 + row * height * 0.055 + Math.cos(col + t * 7) * 16,
      z: random(-100, 160)
    }
  }

  return {
    x: quietLeft + t * width * 0.72,
    y: height * (0.5 + Math.sin(angle * 3) * 0.22),
    z: (t - 0.5) * 420
  }
}

function assignTargets(scene: SceneId) {
  const palette = colorsByScene[scene]
  particles.forEach((particle, index) => {
    const target = getSceneTarget(scene, index, particles.length)
    particle.tx = target.x
    particle.ty = target.y
    particle.tz = target.z
    particle.color = palette[index % palette.length]
  })
}

function createParticle(index: number, total: number): Particle {
  const target = getSceneTarget(sceneValue, index, total)
  return {
    x: random(0, width),
    y: random(0, height),
    z: random(-160, 180),
    vx: random(-0.2, 0.2),
    vy: random(-0.2, 0.2),
    tx: target.x,
    ty: target.y,
    tz: target.z,
    radius: random(1.1, 2.8),
    alpha: random(0.18, 0.52),
    color: colorsByScene[sceneValue][index % colorsByScene[sceneValue].length],
    depth: random(0.45, 1.2)
  }
}

function seedParticles() {
  const total = getParticleCount()
  particles = Array.from({ length: total }, (_, index) => createParticle(index, total))
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  width = Math.max(1, rect.width)
  height = Math.max(1, rect.height)
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context = canvas.getContext('2d')
  context?.setTransform(dpr, 0, 0, dpr, 0, 0)
  isMobile = window.matchMedia('(max-width: 768px)').matches
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  seedParticles()
}

function updatePointer(event: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  pointer = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    active: event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom
  }
}

function createBurst(event: PointerEvent) {
  if (isMobile || reduceMotion) return
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  if (x < 0 || x > width || y < 0 || y > height) return
  const palette = colorsByScene[sceneValue]
  for (let i = 0; i < 18; i += 1) {
    const angle = (Math.PI * 2 * i) / 18 + random(-0.14, 0.14)
    const speed = random(1.2, 2.6)
    burstParticles.push({
      x,
      y,
      z: random(-60, 80),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      tx: x,
      ty: y,
      tz: 0,
      radius: random(1.1, 2.3),
      alpha: random(0.34, 0.72),
      color: palette[i % palette.length],
      depth: random(0.8, 1.5),
      life: 42,
      maxLife: 42,
      burst: true
    })
  }
}

function project(particle: Particle, cameraShift: number, cameraTurn: number) {
  const px = particle.x - width * 0.5
  const py = particle.y - height * 0.5
  const cos = Math.cos(cameraTurn)
  const sin = Math.sin(cameraTurn)
  const rx = px * cos - particle.z * sin
  const rz = px * sin + particle.z * cos
  const perspective = 720 / (720 + rz)
  return {
    x: width * 0.5 + (rx + cameraShift * particle.depth) * perspective,
    y: height * 0.5 + py * perspective,
    size: Math.max(0.35, particle.radius * perspective),
    alpha: particle.alpha * Math.min(1.1, perspective + 0.18)
  }
}

function updateParticle(particle: Particle, transitionProgress: number) {
  const loosen = props.transitioning ? Math.sin(Math.min(1, transitionProgress / 0.35) * Math.PI) : 0
  const targetPull = particle.burst ? 0 : (reduceMotion ? 0.035 : 0.055)

  particle.vx += (particle.tx - particle.x) * targetPull * (1 - loosen * 0.45)
  particle.vy += (particle.ty - particle.y) * targetPull * (1 - loosen * 0.45)
  particle.z += (particle.tz - particle.z) * targetPull

  if (props.transitioning) {
    const swirl = (1 - Math.abs(transitionProgress - 0.5) * 2) * 0.52 * transitionDirection
    const dx = particle.x - width * 0.56
    const dy = particle.y - height * 0.5
    particle.vx += -dy * 0.0009 * swirl
    particle.vy += dx * 0.00055 * swirl
  }

  if (Math.abs(props.dragProgress) > 0.03) {
    particle.vx += props.dragProgress * 0.06 * particle.depth
  }

  if (pointer.active && !isMobile) {
    const dx = particle.x - pointer.x
    const dy = particle.y - pointer.y
    const distance = Math.hypot(dx, dy)
    if (distance > 0 && distance < 120) {
      const force = (1 - distance / 120) * 0.036
      particle.vx += (dx / distance) * force
      particle.vy += (dy / distance) * force
    }
  }

  particle.x += particle.vx
  particle.y += particle.vy
  particle.vx *= particle.burst ? 0.94 : 0.86
  particle.vy *= particle.burst ? 0.94 : 0.86

  if (particle.x < 0 || particle.x > width) {
    particle.x = Math.max(0, Math.min(width, particle.x))
    particle.vx *= -0.72
  }
  if (particle.y < 0 || particle.y > height) {
    particle.y = Math.max(0, Math.min(height, particle.y))
    particle.vy *= -0.72
  }

  if (particle.burst && particle.life !== undefined) particle.life -= 1
}

function resolveCollisions() {
  if (reduceMotion) return
  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i]
      const b = particles[j]
      const dx = b.x - a.x
      const dy = b.y - a.y
      const minDistance = (a.radius + b.radius) * 3.8
      const distance = Math.hypot(dx, dy)
      if (distance > 0 && distance < minDistance) {
        const nx = dx / distance
        const ny = dy / distance
        const impulse = (minDistance - distance) * 0.0025
        a.vx -= nx * impulse
        a.vy -= ny * impulse
        b.vx += nx * impulse
        b.vy += ny * impulse
      }
    }
  }
}

function draw() {
  if (!context || !isVisible) {
    animationId = window.requestAnimationFrame(draw)
    return
  }

  const elapsed = transitionStart ? performance.now() - transitionStart : SCENE_TRANSITION_MS
  const rawProgress = Math.min(1, elapsed / SCENE_TRANSITION_MS)
  const progress = props.transitioning ? easeInOut(rawProgress) : 1
  const dragShift = props.dragProgress * width * 0.12
  const cameraShift = props.transitioning ? transitionDirection * width * Math.sin(progress * Math.PI) * 0.14 : dragShift
  const cameraTurn = props.transitioning ? transitionDirection * Math.sin(progress * Math.PI) * 0.18 : props.dragProgress * 0.08

  context.fillStyle = 'rgba(8,7,6,0.22)'
  context.fillRect(0, 0, width, height)

  particles.forEach((particle) => updateParticle(particle, rawProgress))
  burstParticles.forEach((particle) => updateParticle(particle, rawProgress))
  burstParticles = burstParticles.filter((particle) => (particle.life ?? 0) > 0)
  resolveCollisions()

  if (!isMobile) {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = project(particles[i], cameraShift, cameraTurn)
        const b = project(particles[j], cameraShift, cameraTurn)
        const distance = Math.hypot(a.x - b.x, a.y - b.y)
        if (distance < 86) {
          context.beginPath()
          context.strokeStyle = `rgba(198,154,74,${(1 - distance / 86) * 0.07})`
          context.lineWidth = 0.7
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }
      }
    }
  }

  [...particles, ...burstParticles]
    .map((particle) => ({ particle, view: project(particle, cameraShift, cameraTurn) }))
    .sort((a, b) => a.particle.z - b.particle.z)
    .forEach(({ particle, view }) => {
      const lifeAlpha = particle.burst && particle.life !== undefined && particle.maxLife ? particle.life / particle.maxLife : 1
      const alpha = view.alpha * lifeAlpha * (props.transitioning ? 0.78 + Math.sin(progress * Math.PI) * 0.22 : 1)
      context!.beginPath()
      const glow = context!.createRadialGradient(view.x, view.y, 0, view.x, view.y, view.size * 5)
      glow.addColorStop(0, `rgba(${particle.color},${alpha})`)
      glow.addColorStop(1, `rgba(${particle.color},0)`)
      context!.fillStyle = glow
      context!.arc(view.x, view.y, view.size * 5, 0, Math.PI * 2)
      context!.fill()

      context!.beginPath()
      context!.fillStyle = `rgba(${particle.color},${Math.min(alpha + 0.12, 0.72)})`
      context!.arc(view.x, view.y, view.size, 0, Math.PI * 2)
      context!.fill()
    })

  animationId = window.requestAnimationFrame(draw)
}

function handleVisibilityChange() {
  isVisible = document.visibilityState === 'visible'
}

watch(
  () => props.activeScene,
  (value) => {
    sceneValue = value
    transitionDirection = props.direction || 1
    transitionStart = performance.now()
    assignTargets(value)
  }
)

watch(
  () => props.direction,
  (value) => {
    transitionDirection = value || 1
  }
)

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', updatePointer, { passive: true })
  window.addEventListener('pointerdown', createBurst, { passive: true })
  document.addEventListener('visibilitychange', handleVisibilityChange)
  animationId = window.requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  window.removeEventListener('pointermove', updatePointer)
  window.removeEventListener('pointerdown', createBurst)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <canvas ref="canvasRef" class="particle-canvas scene-particle-canvas" aria-hidden="true" />
</template>
