import { Collection, Cpu, DataAnalysis, MagicStick, Picture } from '@element-plus/icons-vue'

export type SceneId = 'home' | 'recognition' | 'culture' | 'creation' | 'gallery'

export interface HomeScene {
  id: SceneId
  label: string
  title: string
  accent: string
  description: string
  enterDirection: 'left' | 'right' | 'up'
  icon: typeof Cpu
}

export const SCENE_TRANSITION_MS = 1180
export const SCENE_COOLDOWN_MS = 900

export const homeScenes: HomeScene[] = [
  {
    id: 'home',
    label: '首页',
    title: '让传统纹样在现代设计中重新生长',
    accent: '现代设计',
    description: '上传纹样图片，识别纹样名称、年代、元素与文化寓意，并将其转化为服饰、包装、文创等现代化视觉方案。',
    enterDirection: 'left',
    icon: Cpu
  },
  {
    id: 'recognition',
    label: '纹样识别',
    title: '上传纹样并启动AI识别',
    accent: 'AI识别',
    description: '凤鸟粒子向中央扫描区聚合，围绕上传图像形成识别光环，逐步完成图像扫描、纹样提取与文化匹配。',
    enterDirection: 'right',
    icon: DataAnalysis
  },
  {
    id: 'culture',
    label: '文化解析',
    title: '解析纹样背后的文化语义',
    accent: '文化语义',
    description: '粒子展开为纹样结构线、文化节点与环形轨道，让识别结果以分层卡片呈现。',
    enterDirection: 'right',
    icon: Collection
  },
  {
    id: 'creation',
    label: 'AI二创',
    title: '生成现代化纹样设计方向',
    accent: '现代化',
    description: '结构线转化为流动粒子，重组为现代几何纹样，为服饰、包装和文创设计提供参数化入口。',
    enterDirection: 'up',
    icon: MagicStick
  },
  {
    id: 'gallery',
    label: '作品展示',
    title: '查看纹样应用到真实场景',
    accent: '真实场景',
    description: '粒子形成具有纵深感的空间通道，作品卡片从远处靠近，呈现服饰、包装与文创应用。',
    enterDirection: 'right',
    icon: Picture
  }
]
