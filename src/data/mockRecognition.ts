export type RecognitionStepKey = 'scan' | 'extract' | 'match' | 'result'

export interface RecognitionStep {
  key: RecognitionStepKey
  label: string
  description: string
}

export interface RecognitionResultData {
  name: string
  dynasty: string
  source: string
  region: string
  elements: string[]
  colors: string[]
  colorFeature: string
  composition: string
  meaning: string
  similarity: number
  structure: string[]
  designElements: string[]
  directions: string[]
}

export interface PatternDetail {
  name: string
  title: string
  description: string
  usage: string
}

export const recognitionSteps: RecognitionStep[] = [
  { key: 'scan', label: '图像扫描', description: '读取图像轮廓、色块与纹理密度' },
  { key: 'extract', label: '纹样提取', description: '提取连续线条、对称轴与主体元素' },
  { key: 'match', label: '文化匹配', description: '匹配传统纹样语义与时代特征' },
  { key: 'result', label: '结果生成', description: '生成识别档案与二创建议' }
]

export const demoRecognitionResult: RecognitionResultData = {
  name: '楚式凤鸟纹',
  dynasty: '战国至汉代楚文化体系',
  source: '漆器、帛画与礼器装饰纹样',
  region: '荆楚地区 / 长江中游文化圈',
  elements: ['凤鸟', '卷云', '尾羽', '云雷回旋', '漆器边饰'],
  colors: ['墨黑', '楚漆红', '朱红', '古金'],
  colorFeature: '黑漆底压低整体明度，朱红组织主体动势，古金用于羽脉与高光，形成庄重而有生命力的红金层次。',
  composition: '以回旋曲线组织凤鸟身形，尾羽与云气纹交织，形成向外舒展的动势。',
  meaning: '凤鸟在楚文化中象征通神、生命升腾与精神自由，也常被用于表达礼制、祝颂与护佑。',
  similarity: 92,
  structure: ['S形主轴', '放射羽翼', '卷曲尾羽', '环形云气', '边饰连续单元'],
  designElements: ['凤首轮廓', '尾羽曲线', '云气负形', '红金描线', '漆器暗纹肌理'],
  directions: ['新中式服饰纹带', '文创礼盒主视觉', '数字展陈动态纹样', '器物表面连续图案']
}

export const patternDetails: PatternDetail[] = [
  {
    name: '云雷纹',
    title: '云雷纹',
    description: '以连续回旋线构成的传统几何纹样，常见于青铜器与建筑装饰。',
    usage: '适合用于边框、底纹、包装防伪暗纹与数字界面分割线。'
  },
  {
    name: '缠枝莲纹',
    title: '缠枝莲纹',
    description: '以莲花和枝蔓连续展开，强调生生不息的节奏与柔性秩序。',
    usage: '适合用于服饰面料、丝巾、礼盒腰封与文创图案延展。'
  },
  {
    name: '海水江崖纹',
    title: '海水江崖纹',
    description: '由浪涛、山石与云气组成，寓意江山永固、气象开阔。',
    usage: '适合用于大面积背景、展陈主视觉、包装端景与品牌纹样系统。'
  },
  {
    name: '团花纹',
    title: '团花纹',
    description: '以中心向四周扩展的圆形构图组织花叶、瑞兽或几何元素。',
    usage: '适合用于徽章、杯盘中心纹、首饰包装与图标化视觉符号。'
  }
]

export function simulateRecognition(): Promise<RecognitionResultData> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(demoRecognitionResult), 2600)
  })
}
