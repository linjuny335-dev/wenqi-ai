<script setup lang="ts">
const works = [
  {
    title: '云肩外套纹样',
    type: '服饰',
    color: 'bg-cinnabar',
    desc: '将缠枝莲结构转译为肩部环绕图案，保留东方礼服的层次感。'
  },
  {
    title: '茶礼包装',
    type: '包装',
    color: 'bg-gold',
    desc: '以米白纸纹与金色线描组合，适合茶叶、香氛和节庆礼盒。'
  },
  {
    title: '博物馆文创杯',
    type: '文创',
    color: 'bg-jade',
    desc: '提取卷草曲线作为杯身连续纹带，适合日常文创商品。'
  },
  {
    title: '数码丝巾',
    type: '服饰',
    color: 'bg-tech',
    desc: '用未来科技光线重构团花纹中心结构，形成轻盈视觉焦点。'
  }
]
</script>

<template>
  <section>
    <div class="mb-8">
      <h2 class="font-display text-4xl font-semibold">作品展示</h2>
      <p class="mt-2 text-ink/65">把传统纹样应用到服饰、包装与文创场景中，形成可落地的视觉方案。</p>
    </div>

    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="work in works" :key="work.title" class="group overflow-hidden rounded border border-gold/20 bg-white/55 shadow-sm transition hover:-translate-y-1 hover:shadow-glow">
        <div class="relative h-56 overflow-hidden bg-ink">
          <div :class="['absolute inset-0 opacity-85', work.color]" />
          <div class="absolute inset-8 rounded-full border border-rice/75" />
          <div class="absolute inset-16 rounded-full border border-rice/45" />
          <div class="absolute bottom-5 left-5 rounded-full bg-rice/90 px-3 py-1 text-sm text-ink">
            {{ work.type }}
          </div>
          <div class="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#f7f1e4_2px,transparent_3px)] bg-[length:14px_14px] transition group-hover:scale-110" />
        </div>
        <div class="p-5">
          <h3 class="font-display text-xl font-semibold">{{ work.title }}</h3>
          <p class="mt-3 text-sm leading-6 text-ink/62">{{ work.desc }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
