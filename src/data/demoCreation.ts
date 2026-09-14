import type { RecognitionResultData } from './mockRecognition'

export type CreationStyle = '传统复原' | '元素重组' | '几何抽象' | '现代极简' | '国潮插画' | '连续纹样'
export type CompositionMode = '单独纹样' | '镜像' | '旋转' | '二方连续' | '四方连续' | '放射' | '散点'
export type ApplicationScene = '服装' | '包装' | '海报' | '文创' | '家居' | '数字媒体'
export type PaletteMode = '楚漆红金' | '墨黑朱砂' | '古金暖白' | '赭红米白' | '自定义配色'

export interface CreationParams {
  style: CreationStyle
  composition: CompositionMode
  application: ApplicationScene
  strength: number
  retention: number
  density: number
  size: number
  rotation: number
  spacing: number
  lineWeight: number
  complexity: number
  palette: PaletteMode
  primaryColor: string
  secondaryColor: string
  seed: number
  prompt: string
  negativePrompt: string
}

export interface CreationPlan {
  id: string
  title: string
  description: string
  style: CreationStyle
  composition: CompositionMode
  application: ApplicationScene
  palette: PaletteMode
  svg: string
  favorite: boolean
  createdAt: number
  sourceName: string
}

export const DEMO_MODE_NOTICE = '演示模式：当前由本地规则生成 SVG 方案，真实 AI 接口可替换 requestCreationPlans。'
export const styleOptions: CreationStyle[] = ['传统复原', '元素重组', '几何抽象', '现代极简', '国潮插画', '连续纹样']
export const compositionOptions: CompositionMode[] = ['单独纹样', '镜像', '旋转', '二方连续', '四方连续', '放射', '散点']
export const applicationOptions: ApplicationScene[] = ['服装', '包装', '海报', '文创', '家居', '数字媒体']
export const paletteOptions: PaletteMode[] = ['楚漆红金', '墨黑朱砂', '古金暖白', '赭红米白', '自定义配色']

export const defaultCreationParams: CreationParams = {
  style: '元素重组',
  composition: '二方连续',
  application: '包装',
  strength: 68,
  retention: 72,
  density: 52,
  size: 64,
  rotation: 18,
  spacing: 44,
  lineWeight: 46,
  complexity: 58,
  palette: '楚漆红金',
  primaryColor: '#b73b2e',
  secondaryColor: '#c69a4a',
  seed: 202609,
  prompt: '保留凤鸟尾羽的回旋动势，转译为现代品牌主视觉。',
  negativePrompt: '避免蓝紫霓虹、卡通化、低质贴纸感。'
}

const palettes: Record<Exclude<PaletteMode, '自定义配色'>, { bg: string; primary: string; secondary: string; gold: string; line: string }> = {
  楚漆红金: { bg: '#120b09', primary: '#b73b2e', secondary: '#6f221c', gold: '#c69a4a', line: '#f3d89a' },
  墨黑朱砂: { bg: '#070707', primary: '#c74332', secondary: '#2a1210', gold: '#8a6540', line: '#f7f1e4' },
  古金暖白: { bg: '#18130d', primary: '#d2a24b', secondary: '#805d2c', gold: '#f1d28c', line: '#f7f1e4' },
  赭红米白: { bg: '#160d0a', primary: '#9f2f24', secondary: '#d7b889', gold: '#c69a4a', line: '#f4ead6' }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function seeded(seed: number, index: number) {
  const x = Math.sin(seed * 0.013 + index * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function getPalette(params: CreationParams) {
  if (params.palette === '自定义配色') {
    return { bg: '#100907', primary: params.primaryColor, secondary: '#6f221c', gold: params.secondaryColor, line: '#f4ead6' }
  }
  return palettes[params.palette]
}

function buildPath(params: CreationParams, variant: number) {
  const waves = Math.round(clamp(params.complexity / 10, 3, 10))
  const amp = 14 + params.strength * 0.32 + variant * 2 + seeded(params.seed, variant) * 10
  const baseY = 140 + variant * 7 + (params.composition === '放射' ? -18 : 0)
  const points: string[] = []
  for (let i = 0; i <= waves; i += 1) {
    const x = 36 + (328 / waves) * i
    const jitter = (seeded(params.seed, i + variant * 9) - 0.5) * (params.style === '现代极简' ? 3 : 16)
    const y = baseY + Math.sin(i * 1.22 + variant + params.seed * 0.001) * amp + jitter
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M ${points.join(' L ')}`
}

function motifCopies(params: CreationParams) {
  const density = Math.round(clamp(params.density / 14, 2, 8))
  const copies: Array<{ x: number; y: number; scale: number; rotate: number; mirror: number; opacity: number }> = []
  for (let i = 0; i < density; i += 1) {
    const row = i % 2
    const scatter = params.composition === '散点'
    const radial = params.composition === '放射'
    const angle = radial ? (360 / density) * i : params.rotation * (i % 2 ? -1 : 1)
    const radius = 58 + params.spacing * 1.4
    const x = radial ? 320 + Math.cos((angle * Math.PI) / 180) * radius : 68 + i * (params.spacing * 0.92 + 12) + (scatter ? (seeded(params.seed, i) - 0.5) * 92 : 0)
    const y = radial ? 210 + Math.sin((angle * Math.PI) / 180) * radius : row ? 214 : 96 + (scatter ? (seeded(params.seed, i + 20) - 0.5) * 112 : 0)
    copies.push({
      x,
      y,
      scale: clamp(params.size / 64, 0.55, 1.65),
      rotate: angle,
      mirror: params.composition === '镜像' && i % 2 ? -1 : 1,
      opacity: 0.54 + params.retention / 250
    })
  }
  return copies
}

export function buildCreationSvg(params: CreationParams, result: RecognitionResultData, variant: number) {
  const palette = getPalette(params)
  const path = buildPath(params, variant)
  const copies = motifCopies(params)
  const lineWidth = 0.8 + params.lineWeight / 24
  const patternOpacity = clamp(params.retention / 100, 0.28, 0.92)
  const geometric = params.style === '几何抽象' || params.style === '现代极简'
  const repeat = params.composition.includes('连续')
  const bolder = params.style === '国潮插画' ? 1.45 : 1

  const motifs = copies.map((copy, index) => `
    <g transform="translate(${copy.x.toFixed(1)} ${copy.y.toFixed(1)}) rotate(${copy.rotate.toFixed(1)}) scale(${(copy.scale * copy.mirror).toFixed(2)} ${copy.scale.toFixed(2)})" opacity="${copy.opacity.toFixed(2)}">
      <path d="M -38 4 C -12 -46 34 -42 48 -8 C 24 -14 8 -6 -2 16 C -12 38 -36 32 -52 16" fill="none" stroke="${index % 2 ? palette.gold : palette.primary}" stroke-width="${(lineWidth * bolder).toFixed(2)}" stroke-linecap="round" />
      <path d="M -48 18 C -18 8 6 22 28 46" fill="none" stroke="${palette.line}" stroke-opacity="0.36" stroke-width="${Math.max(1, lineWidth * 0.38).toFixed(2)}" />
      <circle cx="-8" cy="4" r="${geometric ? 5 : 3}" fill="${palette.gold}" opacity="0.78" />
      ${geometric ? `<polygon points="16,-18 42,-4 28,18 4,12" fill="${palette.primary}" opacity="0.22" />` : ''}
    </g>`).join('')

  return `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
  <defs>
    <radialGradient id="glow" cx="70%" cy="35%" r="65%">
      <stop offset="0" stop-color="${palette.primary}" stop-opacity="0.34"/>
      <stop offset="0.42" stop-color="${palette.gold}" stop-opacity="0.12"/>
      <stop offset="1" stop-color="${palette.bg}" stop-opacity="1"/>
    </radialGradient>
    <pattern id="dots" width="${repeat ? 28 : 42}" height="${repeat ? 28 : 42}" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="1.5" fill="${palette.gold}" opacity="0.2"/>
    </pattern>
  </defs>
  <rect width="640" height="420" rx="28" fill="${palette.bg}"/>
  <rect width="640" height="420" rx="28" fill="url(#glow)"/>
  <rect width="640" height="420" rx="28" fill="url(#dots)" opacity="${patternOpacity}"/>
  <path d="${path}" fill="none" stroke="${palette.primary}" stroke-width="${(2 + params.strength / 24).toFixed(2)}" stroke-linecap="round" stroke-opacity="0.55"/>
  <path d="${path}" fill="none" stroke="${palette.gold}" stroke-width="1.1" stroke-dasharray="${geometric ? '18 12' : '5 10'}" stroke-opacity="0.72"/>
  ${params.composition === '旋转' ? `<g transform="translate(320 210)">${[0, 90, 180, 270].map((deg) => `<path d="M 0 -74 C 42 -38 62 8 18 72" fill="none" stroke="${palette.primary}" stroke-width="${lineWidth.toFixed(2)}" opacity="0.42" transform="rotate(${deg + params.rotation})"/>`).join('')}</g>` : ''}
  ${params.composition === '四方连续' ? `<g opacity="0.32">${[120, 240, 360, 480].map((x) => `<line x1="${x}" y1="30" x2="${x - 80}" y2="390" stroke="${palette.gold}"/>`).join('')}</g>` : ''}
  ${motifs}
  <text x="34" y="370" fill="${palette.line}" opacity="0.78" font-size="20" font-family="Microsoft YaHei, sans-serif">${result.name} · ${params.style}</text>
  <text x="34" y="397" fill="${palette.gold}" opacity="0.68" font-size="14" font-family="Microsoft YaHei, sans-serif">${params.application} / ${params.composition} / 演示模式方案 ${variant + 1}</text>
</svg>`)} `
}

export async function requestCreationPlans(params: CreationParams, result: RecognitionResultData, sourceName = '楚式凤鸟纹'): Promise<CreationPlan[]> {
  // 真实 AI 接口接入点：以后可在这里替换为 fetch('/api/create-pattern', { body: ... })。
  return generateDemoCreations(params, result, sourceName)
}

export function generateDemoCreations(params: CreationParams, result: RecognitionResultData, sourceName = '楚式凤鸟纹'): Promise<CreationPlan[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(Array.from({ length: 4 }, (_, index) => ({
        id: `${Date.now()}-${index}`,
        title: `${params.application}方案 ${index + 1}`,
        description: `${params.style} × ${params.composition}。${params.prompt || '基于识别纹样生成现代二创方向。'}`,
        style: params.style,
        composition: params.composition,
        application: params.application,
        palette: params.palette,
        svg: buildCreationSvg({ ...params, rotation: params.rotation + index * 10, density: params.density + index * 5, seed: params.seed + index * 97 }, result, index),
        favorite: false,
        createdAt: Date.now(),
        sourceName
      })))
    }, 920)
  })
}
