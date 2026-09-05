import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/pista/:trackId',
      name: 'track',
      component: () => import('@/views/TrackView.vue'),
      props: true,
    },
    {
      path: '/pista/:trackId/:exerciseId/teoria',
      name: 'lesson',
      component: () => import('@/views/LessonView.vue'),
      props: true,
    },
    {
      path: '/pista/:trackId/:exerciseId',
      name: 'exercise',
      component: () => import('@/views/ExerciseView.vue'),
      props: true,
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})
