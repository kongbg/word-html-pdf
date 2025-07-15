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
      <!-- 左侧：文档内容 -->
      <div class="left-panel">
        <!-- 导出PDF按钮 -->
        <div class="export-actions">
          <button @click="exportToPDF" class="btn-export">
            <span class="btn-icon">📄</span>
            浏览器导出PDF
          </button>
          <button @click="exportToPDFForBackEnd" class="btn-export" :disabled="isAnyLoading">
            <span class="btn-icon" v-if="!loading.pdf">📄</span>
            <span class="loading-spinner" v-else></span>
            {{ loading.pdf ? '导出中...' : '后端导出PDF' }}
          </button>
          <div class="export-tip">
            💡 该页面展示的就是预览页面生成的vue3的组件
          </div>
          <div class="export-tip">
            💡 该页面展示的尽可能跟word样式保持一致。如过生成pdf需要调整边距，请自行调整.docx 元素的padding
          </div>
          <div class="export-tip">
            💡 点击按钮将调用浏览器打印功能，选择"另存为PDF"即可导出
          </div>
        </div>

        <div class="document-container">
          <component :is="comps.get(id)"></component>
        </div>
      </div>

      <!-- 右侧：特别提醒 -->
      <div class="right-panel">
        <div class="reminder-section">
          <h3>导出PDF说明</h3>

          <div class="reminder-item">
            <h4>🖨️ 浏览器导出PDF</h4>
            <p>使用浏览器自带打印功能导出PDF时，如果预览页面显示正常，但导出发生偏移，请：</p>
            <ol>
              <li>点击打印弹窗中的"更多设置"</li>
              <li>找到"边距"选项</li>
              <li>选择"无"或"最小"</li>
              <li>关闭默认边距设置</li>
            </ol>
          </div>

          <div class="reminder-item">
            <h4>🤖 Puppeteer导出PDF</h4>
            <p>如果预览页面显示正常，但Puppeteer导出PDF发生偏移，请自行调整options.margin：</p>
            <div class="code-example">
              <pre><code>const options = {
                format: 'A4',
                margin: {
                  top: '0',
                  right: '0', 
                  bottom: '0',
                  left: '0'
                }
              }</code></pre>
            </div>
            <p class="tip">💡 提示：可以根据需要调整margin值，单位为mm、cm或in</p>
          </div>

          <div class="reminder-item">
            <h4>📋 导出建议</h4>
            <ul>
              <li>建议使用Chrome或Edge浏览器进行导出</li>
              <li>导出前请先预览确认内容完整</li>
              <li>如遇格式问题，可尝试调整缩放比例</li>
              <li>选择"另存为PDF"而不是"打印到PDF"</li>
              <li>确保选择正确的纸张大小（A4）</li>
            </ul>
          </div>

          <div class="reminder-item">
            <h4>⚡ 快速导出步骤</h4>
            <ol>
              <li>点击上方的"导出PDF"按钮</li>
              <li>在弹出的打印对话框中，选择"目标"为"另存为PDF"</li>
              <li>调整页面设置（如需要）</li>
              <li>点击"保存"完成导出</li>
            </ol>
          </div>

          <div class="reminder-item">
            <h4>🎨 表格样式优化</h4>
            <p>已针对PDF导出优化表格样式：</p>
            <ul>
              <li>表格边框统一为1px细线</li>
              <li>移除阴影和加粗效果</li>
              <li>确保表格不会分页断开</li>
              <li>统一字体大小和行高</li>
            </ul>
            <p class="tip">💡 如果表格边框仍然显示异常，请检查浏览器的"背景图形"选项是否开启</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios'
import Test from '@/components/docx2vue/test.vue';

const setLoading = inject('setLoading');
setLoading && setLoading(false);
const service = axios.create({
  baseURL: '/api',
  timeout: 60000 * 10  // 10分钟超时，适应复杂文档的PDF生成
})

const route = useRoute()
const comps = new Map([
  ['test', Test]
])

// loading状态
const loading = reactive({
  pdf: false
})

// 全局loading状态
const isAnyLoading = computed(() => {
  return loading.html || loading.vue || loading.pdf;
})

let id = ref('');
id.value = route.query.id || 'test';

// 导出PDF功能
const exportToPDF = () => {
  try {
    // 调用浏览器打印功能
    window.print();
  } catch (error) {
    console.error('导出PDF失败:', error);
    alert('导出PDF失败，请检查浏览器设置或手动使用Ctrl+P');
  }
};
// 生成pdf
const exportToPDFForBackEnd = async () => {
  try {
    loading.pdf = true;
    console.log('开始生成PDF...');

    const response = await service.post('/generate/pdf', {
      url: 'http://localhost:4320/print?id=test',
      options: {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '0mm',
          bottom: '10mm',
          left: '0mm'
        }
      }
    }, {
      responseType: 'blob'
    });

    console.log('PDF响应接收成功，大小:', response.data.size);

    // 验证响应数据
    if (!response.data || response.data.size === 0) {
      throw new Error('PDF数据为空');
    }

    // 验证Content-Type
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/pdf')) {
      console.warn('警告: 响应Content-Type不是PDF格式:', contentType);
    }

    // 创建下载链接
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('PDF生成成功并已下载');
  } catch (error) {
    console.error('PDF生成失败:', error);
    alert('PDF生成失败: ' + error.message);
  } finally {
    loading.pdf = false;
  }
}
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
  display: flex;
  background: #f5f5f5;
  min-height: calc(100vh - 80px);
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-y: auto;
}

/* 导出操作区域 */
.export-actions {
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
  text-align: center;
}

.export-actions button {
  margin-right: 20px;
}

.btn-export {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-export:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.2rem;
}

/* Loading spinner styles */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.export-tip {
  margin-top: 10px;
  color: #666;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

/* 文档容器 */
.document-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 缩小“☐”符号字号，适用于所有文档内容 */
.document-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* 针对“☐”符号缩小字号 */
.symbol-checkbox,
.document-container .checkbox-symbol {
  font-size: 0.9em !important;
  vertical-align: middle;
}

/* 右侧面板 */
.right-panel {
  width: 350px;
  background: white;
  border-left: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.reminder-section {
  position: sticky;
  top: 20px;
}

.reminder-section h3 {
  color: #333;
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
}

.reminder-item {
  margin-bottom: 25px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.reminder-item h4 {
  color: #007bff;
  margin-bottom: 10px;
  font-size: 1.1rem;
  font-weight: 600;
}

.reminder-item p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 10px;
}

.reminder-item ol,
.reminder-item ul {
  color: #555;
  line-height: 1.6;
  padding-left: 20px;
}

.reminder-item li {
  margin-bottom: 5px;
}

.code-example {
  background: #2d3748;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  overflow-x: auto;
}

.code-example pre {
  margin: 0;
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.code-example code {
  color: #e2e8f0;
}

.tip {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 10px;
  margin-top: 10px;
  color: #856404;
  font-size: 0.9rem;
}

.doc-link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.doc-link:hover {
  color: #0056b3;
  text-decoration: underline;
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

.docx-wrapper {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
}

.docx {
  background: white;
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-container {
    flex-direction: column;
  }

  .right-panel {
    width: 100%;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }

  .reminder-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .left-panel {
    padding: 15px;
  }

  .right-panel {
    padding: 15px;
  }

  .reminder-item {
    padding: 12px;
  }

  .code-example {
    padding: 12px;
    font-size: 0.8rem;
  }

  .btn-export {
    padding: 10px 20px;
    font-size: 1rem;
  }

  .export-tip {
    font-size: 0.8rem;
  }
}

/* 打印样式 */
@media print {
  .navbar {
    display: none;
  }

  .right-panel {
    display: none;
  }

  .export-actions {
    display: none;
  }

  .main-container {
    padding: 0;
    background: white;
  }

  .left-panel {
    padding: 0;
  }

  .document-container {
    max-width: none;
  }

  .docx-wrapper {
    box-shadow: none;
    border-radius: 0;
  }
}
</style>