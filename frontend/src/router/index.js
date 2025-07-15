import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
            title: 'Word转PDF工具',
            preload: true // 标记为预加载
        }
    },
    {
        path: '/preview',
        name: 'Preview',
        component: () => import('@/views/preview/index.vue'),
        meta: {
            title: '文档预览',
            preload: true // 标记为预加载
        }
    },
    {
        path: '/print',
        name: 'Print',
        component: () => import('@/views/print/index.vue'),
        meta: {
            title: '打印视图'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/components/NotFound.vue'),
        meta: {
            title: '页面未找到'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫：设置页面标题、预加载和性能监控
router.beforeEach((to, from, next) => {

    // 设置页面标题
    if (to.meta.title) {
        document.title = to.meta.title
    }

    // 预加载下一个可能访问的页面
    if (to.meta.preload) {
        const nextRoute = routes.find(route =>
            route.path !== to.path && route.meta?.preload
        )
        if (nextRoute) {
            nextRoute.component()
        }
    }

    next()
})

// 路由完成后的处理
router.afterEach((to, from) => {

    // 预加载相关路由
    if (to.name === 'Home') {
        // 从首页预加载预览页面
        import('@/views/preview/index.vue')
    } else if (to.name === 'Preview') {
        // 从预览页面预加载打印页面
        import('@/views/print/index.vue')
    }
})

// 路由错误处理
router.onError((error) => {
    console.error('路由错误:', error)

    // 可以在这里添加错误上报逻辑
    // 例如：发送到错误监控服务
})

export default router 