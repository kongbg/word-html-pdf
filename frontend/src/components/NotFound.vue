<template>
    <div class="not-found">
        <div class="not-found-content">
            <h1>404</h1>
            <h2>页面未找到</h2>
            <p>抱歉，您访问的页面不存在。</p>
            <div class="actions">
                <router-link to="/" class="btn-primary">返回首页</router-link>
                <button @click="goBack" class="btn-secondary">返回上页</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
    if (window.history.length > 1) {
        router.go(-1)
    } else {
        router.push('/')
    }
}
</script>

<style scoped>
.not-found {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.not-found-content {
    text-align: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.not-found h1 {
    font-size: 120px;
    margin: 0;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.not-found h2 {
    font-size: 32px;
    margin: 20px 0;
    font-weight: 300;
}

.not-found p {
    font-size: 18px;
    margin: 20px 0 40px;
    opacity: 0.9;
}

.actions {
    display: flex;
    gap: 20px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
}

.btn-primary {
    background: #4CAF50;
    color: white;
}

.btn-primary:hover {
    background: #45a049;
    transform: translateY(-2px);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

@media (max-width: 768px) {
    .not-found h1 {
        font-size: 80px;
    }

    .not-found h2 {
        font-size: 24px;
    }

    .actions {
        flex-direction: column;
        align-items: center;
    }
}
</style>