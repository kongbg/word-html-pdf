<template>
  <div id="app">
    <!-- 全局加载状态 -->
    <LoadingSpinner :loading="isLoading" :message="loadingMessage" :delay="200" />

    <!-- 路由视图 -->
    <Suspense>
      <router-view />
      <template #fallback>
        <div class="loading-fallback">
          <div class="loading-spinner"></div>
          <p>页面加载中...</p>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import { useRouter } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const router = useRouter()
const isLoading = ref(false)
const loadingMessage = ref('加载中...')

// 提供全局加载状态给子组件使用
provide('setLoading', (loading, message = '加载中...') => {
  isLoading.value = loading
  loadingMessage.value = message
})

// 路由切换时的加载状态
router.beforeEach((to, from, next) => {
  isLoading.value = true
  loadingMessage.value = `正在加载 ${to.meta.title || '页面'}...`
  next()
})

router.afterEach(() => {
  // 延迟关闭加载状态，确保页面渲染完成
  setTimeout(() => {
    isLoading.value = false
  }, 300)
})

router.onError(() => {
  isLoading.value = false
})
</script>

<style>
/* 引入打印样式优化 */
@import '@/styles/print.css';

html,
body,
div,
span,
h1,
h2,
h3,
h4,
h5,
h6,
p,
a,
img,
ul,
ol,
li,
form,
input,
textarea {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  min-height: 100vh;
}

/* 全局加载状态样式 */
.loading-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 路由切换动画 */
.router-view-enter-active,
.router-view-leave-active {
  transition: all 0.3s ease;
}

.router-view-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.router-view-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 全局按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-fallback {
    padding: 20px;
  }

  .loading-spinner {
    width: 30px;
    height: 30px;
  }
}
</style>
