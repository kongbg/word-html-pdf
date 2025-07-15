<template>
    <div class="app-container">
        <!-- 导航栏 -->
        <nav class="navbar">
            <div class="nav-brand">
                <router-link to="/" class="nav-link">Word转PDF工具</router-link>
            </div>
            <div class="nav-menu">
                <router-link to="/" class="nav-link" active-class="active">首页</router-link>
                <router-link to="/preview" class="nav-link" active-class="active">预览</router-link>
                <router-link to="/print" class="nav-link" active-class="active">打印</router-link>
                <a href="https://github.com/kongbg/word-html-pdf" target="_blank" class="nav-link github-link">
                    <span class="github-icon">🐙</span>
                    GitHub
                </a>
                <a href="https://hub.docker.com/repository/docker/kongbg/word-html-pdf/general" target="_blank"
                    class="nav-link github-link">
                    <span class="github-icon">🐙</span>
                    docker
                </a>
            </div>
        </nav>

        <div class="main-container">
            <div class="welcome-content">
                <h1>欢迎使用Word转PDF工具</h1>
                <p>这是一个功能强大的文档转换工具，支持以下功能：</p>
                <ul>
                    <li>Word文档预览</li>
                    <li>Word转HTML文件</li>
                    <li>Word转Vue3组件</li>
                    <li>填充数据后页面生成PDF文件</li>
                </ul>
                <p>为什么要先转成代码再转成pdf呢？当然是方便动态填入数据了</p>
                <div class="action-buttons">
                    <router-link to="/preview" class="btn-primary">开始使用</router-link>
                    <router-link to="/print" class="btn-secondary">查看示例</router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// 首页组件逻辑
</script>

<style scoped>
/* 导航栏样式 */
.app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.navbar {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
}

.nav-brand .nav-link {
    color: white;
    text-decoration: none;
    transition: opacity 0.3s ease;
}

.nav-brand .nav-link:hover {
    opacity: 0.8;
}

.nav-menu {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.nav-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    transition: all 0.3s ease;
    font-weight: 500;
}

.nav-link:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
    color: white;
    background: rgba(255, 255, 255, 0.2);
}

.github-link {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0.5rem 1rem;
    transition: all 0.3s ease;
}

.github-link:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.github-icon {
    font-size: 1.1rem;
}

/* 响应式导航 */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
    }

    .nav-menu {
        gap: 1rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .nav-link {
        padding: 0.4rem 0.8rem;
        font-size: 0.9rem;
    }
}

/* 主容器样式 */
.main-container {
    flex: 1;
    padding: 40px 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
}

.welcome-content {
    text-align: center;
    max-width: 600px;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.welcome-content h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2.5rem;
    font-weight: 700;
}

.welcome-content p {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 30px;
    line-height: 1.6;
}

.welcome-content ul {
    text-align: left;
    margin: 30px 0;
    padding-left: 20px;
}

.welcome-content li {
    color: #555;
    font-size: 1rem;
    margin-bottom: 10px;
    line-height: 1.5;
}

.action-buttons {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin-top: 40px;
}

.btn-primary,
.btn-secondary {
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    display: inline-block;
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

/* 响应式设计 */
@media (max-width: 768px) {
    .welcome-content {
        padding: 30px 20px;
        margin: 20px;
    }

    .welcome-content h1 {
        font-size: 2rem;
    }

    .action-buttons {
        flex-direction: column;
        gap: 15px;
    }

    .btn-primary,
    .btn-secondary {
        width: 100%;
        text-align: center;
    }
}
</style>