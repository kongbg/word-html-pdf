<template>
    <div class="loading-overlay" v-if="loading">
        <div class="loading-content">
            <div class="spinner">
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
                <div class="spinner-ring"></div>
            </div>
            <p class="loading-text">{{ message }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        default: '加载中...'
    },
    delay: {
        type: Number,
        default: 200
    }
})

const showLoading = ref(false)

onMounted(() => {
    if (props.loading) {
        const timer = setTimeout(() => {
            showLoading.value = true
        }, props.delay)

        return () => clearTimeout(timer)
    }
})
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
}

.loading-content {
    text-align: center;
    background: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
}

.spinner {
    position: relative;
    width: 60px;
    height: 60px;
    margin: 0 auto 20px;
}

.spinner-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid transparent;
    border-top: 3px solid #007bff;
    border-radius: 50%;
    animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(2) {
    width: 80%;
    height: 80%;
    top: 10%;
    left: 10%;
    border-top-color: #28a745;
    animation-delay: -0.4s;
}

.spinner-ring:nth-child(3) {
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
    border-top-color: #ffc107;
    animation-delay: -0.8s;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.loading-text {
    color: #666;
    font-size: 16px;
    margin: 0;
    font-weight: 500;
}

/* 淡入淡出动画 */
.loading-overlay {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* 响应式设计 */
@media (max-width: 768px) {
    .loading-content {
        padding: 20px;
        margin: 20px;
    }

    .spinner {
        width: 50px;
        height: 50px;
    }

    .loading-text {
        font-size: 14px;
    }
}
</style>