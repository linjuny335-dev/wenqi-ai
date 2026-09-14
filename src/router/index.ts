import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RecognitionView from '../views/RecognitionView.vue'
import CreationView from '../views/CreationView.vue'
import GalleryView from '../views/GalleryView.vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/recognition', name: 'recognition', component: RecognitionView },
    { path: '/creation', name: 'creation', component: CreationView },
    { path: '/gallery', name: 'gallery', component: GalleryView }
  ]
})

export default router
