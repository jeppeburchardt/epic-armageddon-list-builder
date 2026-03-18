import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import EditorView from '@/views/EditorView.vue'
import PrintView from '@/views/PrintView.vue'
import ArmyView from '@/views/ArmyView.vue'
import ListLayout from '@/views/ListLayout.vue'
import ListReferenceView from '@/views/ListReferenceView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: HomeView },
        { path: '/army/:slug', name: 'army', component: ArmyView, props: true },
        {
            path: '/:id',
            component: ListLayout,
            props: true,
            children: [
                { path: '', redirect: 'view' },
                { path: 'view', name: 'list-view', component: PrintView, props: true },
                { path: 'edit', name: 'list-edit', component: EditorView, props: true },
                { path: 'reference', name: 'list-reference', component: ListReferenceView, props: true },
            ],
        },
    ],
})

export default router
