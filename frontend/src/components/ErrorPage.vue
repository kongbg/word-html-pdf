<template>
    <div class="error-page">
        <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h1>页面加载失败</h1>
            <p>抱歉，页面加载时出现了问题。请稍后重试。</p>
            <div class="error-actions">
                <button @click="retry" class="btn-primary">重新加载</button>
                <router-link to="/" class="btn-secondary">返回首页</router-link>
            </div>
            <div class="error-details" v-if="showDetails">
                <p><strong>错误信息：</strong>{{ errorMessage }}</p>
                <p><strong>时间：</strong>{{ errorTime }}</p>
            </div>
            <button @click="toggleDetails" class="btn-link">
                {{ showDetails ? '隐藏详情' : '显示详情' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showDetails = ref(false)
const errorMessage = ref('组件加载超时或网络错误')
const errorTime = ref(new Date().toLocaleString())

const retry = () => {
    window.location.reload()
}

const toggleDetails = () => {
    showDetails.value = !showDetails.value
}
</script>

<style scoped>
.error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.error-content {
    text-align: center;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    max-width: 500px;
    width: 100%;
}

.error-icon {
    font-size: 4rem;
    margin-bottom: 20px;
}

.error-content h1 {
    color: #333;
    margin-bottom: 15px;
    font-size: 1.8rem;
    font-weight: 600;
}

.error-content p {
    color: #666;
    margin-bottom: 30px;
    line-height: 1.6;
}

.error-actions {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    font-size: 14px;
}

.btn-primary {
    background: #007bff;
    color: white;
}

.btn-primary:hover {
    background: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.btn-link {
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    text-decoration: underline;
    font-size: 14px;
    padding: 5px 10px;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.btn-link:hover {
    background-color: rgba(0, 123, 255, 0.1);
}

.error-details {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 6px;
    margin: 20px 0;
    text-align: left;
    border-left: 4px solid #007bff;
}

.error-details p {
    margin: 5px 0;
    font-size: 14px;
    color: #555;
}

.error-details strong {
    color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .error-content {
        padding: 30px 20px;
        margin: 20px;
    }

    .error-content h1 {
        font-size: 1.5rem;
    }

    .error-actions {
        flex-direction: column;
        gap: 10px;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        text-align: center;
    }
}
</style>