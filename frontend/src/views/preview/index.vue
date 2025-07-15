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
      <!-- 左侧：文件上传和预览 -->
      <div class="left-panel">
        <div class="action-buttons">
          <!-- <button @click="goPreview" class="btn-secondary">
          预览
        </button>
        <button @click="downLoad" class="btn-secondary">
          下载
        </button> -->
          <button @click="triggerFileUpload" class="btn-primary">
            上传文件
          </button>
          <button @click="generateHTML" class="btn-success" :disabled="isAnyLoading">
            {{ loading.html ? '生成中...' : '生成HTML' }}
          </button>
          <button @click="generateVue3" class="btn-info" :disabled="isAnyLoading">
            {{ loading.vue ? '生成中...' : '生成Vue3' }}
          </button>
          <!-- <button @click="goToPrint" class="btn-warning" :disabled="!uploadedFileName">
            前往打印页面
          </button> -->
        </div>
        <div class="upload-section">
          <input type="file" ref="fileInput" @change="handleFileUpload" accept=".docx,.doc" style="display: none;" />
          <span v-if="uploadedFileName" class="file-name">
            已上传: {{ uploadedFileName }}
          </span>
        </div>

        <!-- Loading提示 -->
        <div v-if="isAnyLoading" class="loading-tip">
          <div class="loading-spinner"></div>
          <span>正在生成文件，请稍候...</span>
        </div>

        <div class="doc-render-box">
          <div ref="refFile"></div>
        </div>
      </div>

      <!-- 右侧：CSS样式编辑 -->
      <div class="right-panel">
        <h3>CSS 样式编辑</h3>

        <div class="style-section">
          <h4>自定义样式</h4>
          <div class="css-editor">
            <textarea v-model="customCSS" placeholder="输入CSS代码，例如：
            .doc-render-box {
              background: #f5f5f5;
              border: 2px solid #007bff;
            }

            .docx-wrapper {
              font-family: 'Times New Roman', serif;
              line-height: 1.8;
            }

            .docx-wrapper p {
              margin-bottom: 15px;
              color: #333;
            }" @input="applyCustomCSS"></textarea>
          </div>
          <div class="button-group">
            <!-- <button @click="applyCustomCSS" class="btn-primary">应用样式</button> -->
            <button @click="clearCustomCSS" class="btn-danger">清除样式</button>
          </div>
        </div>


      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, watch, computed } from 'vue'

export default defineComponent({
  name: 'PreviewDemo'
})

</script>
<script setup>
// 引入axios用来发请求
import axios from 'axios'
import { generateAndDownloadVue } from '../../utils/index.js'
import { nextTick } from 'vue'
const docxPromise = () => import('docx-preview')
const docx = await docxPromise()

const service = axios.create({
  baseURL: '/api',
  timeout: 60000 * 5
})

const refFile = ref(null)
const fileInput = ref(null)
const uploadedFileName = ref('')
const uploadedFileBuffer = ref(null)

// const customCSS = ref(``)
const customCSS = ref(`
  .docx{
    padding: 72pt 0pt!important;
  }
  .docx_2 {
    padding: 0 70pt;
  }
  .docx_2+p{
    padding: 0 60pt 0 70pt;
  }`)

// loading状态
const loading = reactive({
  html: false,
  vue: false,
  pdf: false
})

// 全局loading状态
const isAnyLoading = computed(() => {
  return loading.html || loading.vue || loading.pdf;
})

// console.log('使用插件的 renderAsync 方法来渲染', docx)

/**
 * 解析 filename
 */
function extractFileNameFromContentDispositionHeader(value) {
  const patterns = [
    /filename\*=[^']+'\w*'"([^"]+)";?/i,
    /filename\*=[^']+'\w*'([^;]+);?/i,
    /filename="([^;]*);?"/i,
    /filename=([^;]*);?/i
  ]

  let responseFilename
  patterns.some(regex => {
    responseFilename = regex.exec(value)
    return responseFilename !== null
  })
  if (responseFilename !== null && responseFilename.length > 1) {
    try {
      return decodeURIComponent(responseFilename[1])
    } catch (e) {
      console.error(e)
    }
  }

  return null
}

// 应用自定义CSS
const applyCustomCSS = () => {
  // 移除之前的自定义样式
  const existingStyle = document.getElementById('custom-docx-styles')
  if (existingStyle) {
    existingStyle.remove()
  }

  // 创建新的样式元素
  const styleElement = document.createElement('style')
  styleElement.id = 'custom-docx-styles'
  styleElement.textContent = customCSS.value

  // 添加到页面头部
  document.head.appendChild(styleElement)

  console.log('自定义CSS已应用')
}

// 清除自定义CSS
const clearCustomCSS = () => {
  const existingStyle = document.getElementById('custom-docx-styles')
  if (existingStyle) {
    existingStyle.remove()
  }
  customCSS.value = ''
  console.log('自定义CSS已清除')
}

// 清理样式标签，删除不需要的属性和@charset声明
const cleanStyleTags = () => {
  let styles = ``;

  // 收集 <style> 标签
  document.querySelectorAll("style").forEach(style => {
    let styleContent = style.textContent || style.innerHTML;

    // 删除 @charset "UTF-8";
    styleContent = styleContent.replace(/@charset\s+["']UTF-8["']\s*;?\s*/g, '');

    // 去掉类名后面的属性选择器，例如：.main-container[data-v-a06db51c]
    styleContent = styleContent.replace(/\[[^\]]+\]/g, '');

    // 创建新的style标签，添加scoped属性，不包含type和data-vite-dev-id属性
    const cleanStyle = `<style scoped>${styleContent}</style>`

    styles += cleanStyle;
  });

  // 收集 <link rel="stylesheet"> 标签
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    styles += link.outerHTML;
  });

  return styles;
};

// 清理HTML元素中的内联样式，处理&quot;并将双引号改为单引号
const cleanInlineStyles = (htmlString) => {
  // 使用正则表达式替换内联样式中的&quot;并改为单引号
  return htmlString.replace(/style="([^"]*&quot;[^"]*)"/g, (match, styleContent) => {
    const cleanedStyle = styleContent.replace(/&quot;/g, '"');
    return `style='${cleanedStyle}'`;
  }).replace(/style="([^"]*)"/g, (match, styleContent) => {
    // 处理没有&quot;的普通内联样式，也改为单引号
    return `style='${styleContent}'`;
  });
};

// 生成HTML
const generateHTML = async () => {
  try {
    loading.html = true;

    // 1. 获取 docx-wrapper 区域
    const docxWrapper = document.querySelector(".docx-wrapper");
    if (!docxWrapper) {
      alert("未找到 .docx-wrapper 区域");
      return;
    }
    // 克隆一份 DOM，避免影响页面
    const wrapperClone = docxWrapper.cloneNode(true);
    // 移除所有 footer 元素
    wrapperClone.querySelectorAll("footer").forEach(footer => footer.remove());

    // 使用innerHTML来保留占位符，然后用div包装
    let wrapperHtml = `<div class="docx-wrapper">${wrapperClone.innerHTML}</div>`;
    // 清理内联样式中的&quot;
    wrapperHtml = cleanInlineStyles(wrapperHtml);

    // 2. 收集所有样式
    let styles = cleanStyleTags();

    // 3. 拼接完整 HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
        <style type="text/css">
          .docx-wrapper {
            background: #fff;
            padding: 0;
            padding-bottom: 0px;
            display: block;
          }

          .docx-wrapper>section.docx {
            box-shadow: none;
          }
          .docx-wrapper table tr {
            page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        ${wrapperHtml}
      </body>
      </html>
        `;

    // 4. 生成并下载
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "index.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('HTML生成成功');
  } catch (error) {
    console.error('HTML生成失败:', error);
    alert('HTML生成失败: ' + error.message);
  } finally {
    loading.html = false;
  }
};
// 生成HTML
const generateVue3 = async () => {
  try {
    loading.html = true;

    // 1. 获取 docx-wrapper 区域
    const docxWrapper = document.querySelector(".docx-wrapper");
    if (!docxWrapper) {
      alert("未找到 .docx-wrapper 区域");
      return;
    }
    // 克隆一份 DOM，避免影响页面
    const wrapperClone = docxWrapper.cloneNode(true);
    // 移除所有 footer 元素
    wrapperClone.querySelectorAll("footer").forEach(footer => footer.remove());

    // 使用innerHTML来保留占位符，然后用div包装
    let wrapperHtml = `<div class="docx-wrapper">${wrapperClone.innerHTML}</div>`;


    // 清理内联样式中的&quot;
    wrapperHtml = cleanInlineStyles(wrapperHtml);

    console.log('wrapperHtml:', wrapperHtml);

    // 2. 收集所有样式
    let styles = cleanStyleTags();

    // 3. 拼接完整 HTML
    const htmlContent = `
      <template>
      ${wrapperHtml}
      </template>
      ${styles}
      <style scoped>
          .docx-wrapper {
            background: #fff;
            padding: 0;
            padding-bottom: 0px;
            display: block;
          }
          .docx-wrapper>section.docx {
            box-shadow: none;
          }
          .docx-wrapper table tr {
            page-break-inside: avoid;
          }
        </style>
     `;

    console.log('htmlContent:', htmlContent)

    // 4. 生成并下载
    const blob = new Blob([htmlContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DocumentViewer.vue";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('HTML生成成功');
  } catch (error) {
    console.error('HTML生成失败:', error);
    alert('HTML生成失败: ' + error.message);
  } finally {
    loading.html = false;
  }
};

// 生成Vue3代码
const generateVue = async () => {
  try {
    loading.vue = true;

    const docxWrapper = document.querySelector(".docx-wrapper");
    await generateAndDownloadVue(docxWrapper);

    console.log('Vue3组件生成成功');
  } catch (error) {
    console.error('Vue3组件生成失败:', error);
    alert('Vue3组件生成失败: ' + error.message);
  } finally {
    loading.vue = false;
  }
};

// 清理CSS样式，只保留必要的样式
const cleanCSSForExport = (cssText) => {
  if (!cssText) return ''

  // 移除不需要的选择器
  const lines = cssText.split('\n')
  const cleanedLines = lines.filter(line => {
    const trimmedLine = line.trim()
    // 保留 .docx-wrapper 相关的样式
    if (trimmedLine.includes('.docx-wrapper') ||
      trimmedLine.includes('{') ||
      trimmedLine.includes('}') ||
      trimmedLine.startsWith('/*') ||
      trimmedLine.endsWith('*/')) {
      return true
    }
    // 移除 .doc-render-box 相关样式，因为我们会用新的容器
    if (trimmedLine.includes('.doc-render-box')) {
      return false
    }
    return true
  })

  return cleanedLines.join('\n')
}

// 触发文件选择
const triggerFileUpload = () => {
  fileInput.value.click()
}

// 处理文件上传
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件类型
  if (!file.name.match(/\.(docx|doc)$/i)) {
    alert('请选择 Word 文件 (.docx 或 .doc)')
    return
  }

  uploadedFileName.value = file.name

  try {
    // 将文件转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    uploadedFileBuffer.value = arrayBuffer

    // 使用 docx.renderAsync 渲染预览
    await docx.renderAsync(arrayBuffer, refFile.value)

    // 等待DOM更新后修复HTML结构
    await nextTick()
    // fixHtmlStructure()

    // 应用当前的自定义CSS
    applyCustomCSS()

    console.log('文件上传成功，已渲染预览')
  } catch (error) {
    console.error('文件处理失败:', error)
    alert('文件处理失败，请重试')
  }
}

// 修复HTML结构
const fixHtmlStructure = () => {
  if (!refFile.value) return

  // 修复表格结构
  const tables = refFile.value.querySelectorAll('table')
  tables.forEach(table => {
    // 确保表格有tbody
    if (!table.querySelector('tbody')) {
      const tbody = document.createElement('tbody')
      const rows = Array.from(table.querySelectorAll('tr'))
      rows.forEach(row => tbody.appendChild(row))
      table.appendChild(tbody)
    }

    // 确保tr在tbody内
    const trs = table.querySelectorAll('tr')
    trs.forEach(tr => {
      if (tr.parentElement === table) {
        const tbody = table.querySelector('tbody') || document.createElement('tbody')
        if (!table.querySelector('tbody')) {
          table.appendChild(tbody)
        }
        tbody.appendChild(tr)
      }
    })
  })

  // 修复其他HTML结构问题
  const elements = refFile.value.querySelectorAll('*')
  elements.forEach(element => {
    // 移除空的span标签
    if (element.tagName === 'SPAN' && (!element.textContent || element.textContent.trim() === '')) {
      element.remove()
    }

    // 修复过长的text-indent
    if (element.style.textIndent) {
      const indent = element.style.textIndent
      if (indent.includes('pt') && parseInt(indent) > 200) {
        element.style.textIndent = '24pt'
      }
    }
  })
}

// 预览
const goPreview = async () => {
  const { data } = await service({
    method: 'get',
    responseType: 'blob'
  })
  await docx.renderAsync(data, refFile.value)

  // 等待DOM更新后修复HTML结构
  await nextTick()
  fixHtmlStructure()

  applyCustomCSS()
}

// 下载
const downLoad = async () => {
  const res = await service({
    method: 'get',
    responseType: 'blob'
  })
  const fileName = extractFileNameFromContentDispositionHeader(
    res.headers?.['content-disposition']
  )

  const blob = new Blob([res.data])
  const link = document.createElement('a')

  link.href = URL.createObjectURL(blob)
  link.download = fileName || 'word文件.docx'
  link.style.display = 'none'

  document.body.appendChild(link)

  link.click()
  link.remove()
}

// 前往打印页面
const goToPrint = () => {
  // 获取文件名（去掉扩展名）
  const fileName = uploadedFileName.value ? uploadedFileName.value.replace(/\.(docx|doc)$/i, '') : 'test';

  // 跳转到打印页面，传递文件名
  window.location.href = `/print?id=test&fileName=${encodeURIComponent(fileName)}`;
}
</script>

<style lang="scss" scoped>
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
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 80px);
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.right-panel {
  width: 400px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  overflow-y: auto;
  height: fit-content;
  max-height: 100vh;

  h3 {
    margin: 0 0 20px 0;
    color: #333;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
  }
}

.style-section {
  margin-bottom: 25px;

  h4 {
    margin: 0 0 15px 0;
    color: #555;
    font-size: 16px;
  }
}

.css-editor {
  margin-bottom: 15px;

  textarea {
    width: 100%;
    height: 300px;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    line-height: 1.4;
    resize: vertical;
    background: #fafafa;

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      background: white;
    }
  }
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}



.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      margin: -8px 0 0 -8px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.btn-primary {
  background: #007bff;
  color: white;

  &:hover {
    background: #0056b3;
  }
}

.btn-secondary {
  background: #6c757d;
  color: white;

  &:hover {
    background: #545b62;
  }
}

.btn-success {
  background: #28a745;
  color: white;

  &:hover {
    background: #1e7e34;
  }
}

.btn-danger {
  background: #dc3545;
  color: white;

  &:hover {
    background: #c82333;
  }
}

.btn-info {
  background: #17a2b8;
  color: white;

  &:hover {
    background: #138496;
  }
}

.btn-warning {
  background: #ffc107;
  color: white;

  &:hover {
    background: #e0a800;
  }
}

.upload-section {
  .file-name {
    margin-left: 10px;
    color: #666;
    font-size: 14px;
  }
}

.doc-render-box {
  flex: 1;
  overflow-x: auto;
  min-height: 400px;
  width: 900px;
  padding: 10px;
  margin: 0 auto;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px
}


/* 基础打印重置 */
@media print {

  body {
    line-height: 1.5;
    font-family: "Times New Roman", serif;
  }

  /* 隐藏导航和按钮 */
  .no-print,
  button,
  .share-buttons {
    display: none;
  }

  /* 链接显示URL */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 80%;
  }

  /* 分页控制 */
  .chapter {
    page-break-before: always;
  }

  img {
    max-width: 100%;
    height: auto;
  }
}

.loading-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 10px 0;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-top-color: #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
  }

  span {
    font-size: 14px;
    color: #333;
  }
}
</style>
