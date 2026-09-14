export interface PatternAnalysis {
  name: string
  dynasty: string
  elements: string[]
  meaning: string
  imageUrl: string
}

export const demoAnalysis: PatternAnalysis = {
  name: '缠枝莲纹',
  dynasty: '唐宋时期至明清广泛流行',
  elements: ['莲花', '卷草', '连绵枝蔓', '对称构图'],
  meaning: '象征清雅、延续、丰盛与生命循环，常用于织物、瓷器和建筑装饰。',
  imageUrl: ''
}

let currentPattern: PatternAnalysis = { ...demoAnalysis }

export function setCurrentPattern(pattern: PatternAnalysis) {
  currentPattern = pattern
}

export function getCurrentPattern() {
  return currentPattern
}
