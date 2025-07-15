/**
 * 修复HTML结构
 * @param {string} html - HTML字符串
 * @returns {string} 修复后的HTML字符串
 */
const fixHtmlStructure = (html) => {
    // 创建临时DOM元素来解析和修复HTML
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html

    // 修复表格结构
    const tables = tempDiv.querySelectorAll('table')
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
    const elements = tempDiv.querySelectorAll('*')
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

    return tempDiv.innerHTML
}

/**
 * 生成Vue3组件代码
 * @param {HTMLElement} docxWrapper - docx-wrapper元素
 * @returns {string} Vue3组件代码
 */
export const generateVueComponent = (docxWrapper) => {
    if (!docxWrapper) {
        throw new Error("未找到 .docx-wrapper 区域");
    }

    // 克隆一份 DOM，避免影响页面
    const wrapperClone = docxWrapper.cloneNode(true);
    // 移除所有 footer 元素
    wrapperClone.querySelectorAll("footer").forEach(footer => footer.remove());

    // 修复HTML结构
    const fixedHtml = fixHtmlStructure(wrapperClone.innerHTML);

    // 收集所有样式
    let styles = ``;
    // 收集 <style> 标签
    document.querySelectorAll("style").forEach(style => {
        let styleContent = style.textContent || style.innerHTML;

        // 删除 @charset "UTF-8";
        styleContent = styleContent.replace(/@charset\s+["']UTF-8["']\s*;?\s*/g, '');

        // 处理内联样式中的 &quot;
        styleContent = styleContent.replace(/&quot;/g, '"');

        // 去掉类名后面的属性选择器，例如：.main-container[data-v-a06db51c]
        styleContent = styleContent.replace(/\[[^\]]+\]/g, '');

        // 恢复被误删的通配符 *
        styleContent = styleContent.replace(/\s+\{\s*/g, ' {\n  ');
        styleContent = styleContent.replace(/\s*\*\s*\{/g, '* {');

        // 创建新的style标签，添加scoped属性，不包含type和data-vite-dev-id属性
        const cleanStyle = document.createElement('style');
        cleanStyle.setAttribute('scoped', '');
        cleanStyle.textContent = styleContent;

        styles += cleanStyle.outerHTML;
    });
    // 收集 <link rel="stylesheet"> 标签
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        styles += link.outerHTML;
    });

    // 清理样式，只保留必要的样式
    styles = cleanStyles(styles);

    // 生成Vue3组件代码
    const vueComponent = [
        '<template>',
        '  <div class="document-viewer">',
        '    <div class="docx-wrapper" ref="documentRef">',
        '      ' + fixedHtml,
        '    </div>',
        '  </div>',
        '</template>',
        '',
        '<script setup>',
        'import { ref, onMounted, nextTick } from \'vue\'',
        '',
        '// 组件逻辑',
        'const documentRef = ref(null)',
        '',
        '// 修复HTML结构',
        'const fixHtmlStructure = () => {',
        '  if (!documentRef.value) return',
        '  ',
        '  // 修复表格结构',
        '  const tables = documentRef.value.querySelectorAll(\'table\')',
        '  tables.forEach(table => {',
        '    // 确保表格有tbody',
        '    if (!table.querySelector(\'tbody\')) {',
        '      const tbody = document.createElement(\'tbody\')',
        '      const rows = Array.from(table.querySelectorAll(\'tr\'))',
        '      rows.forEach(row => tbody.appendChild(row))',
        '      table.appendChild(tbody)',
        '    }',
        '  })',
        '}',
        '',
        'onMounted(async () => {',
        '  console.log(\'文档组件已挂载\')',
        '  ',
        '  // 等待DOM更新后修复结构',
        '  await nextTick()',
        '  fixHtmlStructure()',
        '})',
        '',
        '// 导出组件',
        'defineExpose({',
        '  documentRef,',
        '  fixHtmlStructure',
        '})',
        '</script>',
        '',
        '<style scoped>',
        '/* 文档样式 */',
        '.document-viewer {',
        '  background: #fff;',
        '  padding: 20px;',
        '  border-radius: 8px;',
        '  box-shadow: 0 2px 10px rgba(0,0,0,0.1);',
        '  max-width: 800px;',
        '  margin: 0 auto;',
        '}',
        '',
        styles,
        '',
        '/* 组件特定样式 */',
        '* {',
        '  margin: 0;',
        '  padding: 0;',
        '}',
        '',
        '.docx-wrapper {',
        '  background: #fff;',
        '  padding: 0;',
        '  padding-bottom: 0px;',
        '  display: block;',
        '}',
        '',
        '.docx-wrapper > section.docx {',
        '  box-shadow: none;',
        '}',
        '',
        '.docx-wrapper table {',
        '  border-collapse: collapse;',
        '  width: 100%;',
        '  margin: 10px 0;',
        '}',
        '',
        '.docx-wrapper table td,',
        '.docx-wrapper table th {',
        '  border: 1px solid #ddd;',
        '  padding: 8px;',
        '  vertical-align: top;',
        '}',
        '',
        '.docx-wrapper table tr {',
        '  page-break-inside: avoid;',
        '}',
        '',
        '/* 修复表格结构警告 */',
        '.docx-wrapper table tbody {',
        '  display: table-row-group;',
        '}',
        '',
        '.docx-wrapper table tr {',
        '  display: table-row;',
        '}',
        '',
        '.docx-wrapper table td,',
        '.docx-wrapper table th {',
        '  display: table-cell;',
        '}',
        '',
        '/* 响应式设计 */',
        '@media (max-width: 768px) {',
        '  .document-viewer {',
        '    padding: 10px;',
        '    margin: 10px;',
        '  }',
        '  ',
        '  .docx-wrapper table {',
        '    font-size: 12px;',
        '  }',
        '  ',
        '  .docx-wrapper table td,',
        '  .docx-wrapper table th {',
        '    padding: 4px;',
        '  }',
        '}',
        '',
        '/* 打印样式 */',
        '@media print {',
        '  .document-viewer {',
        '    box-shadow: none;',
        '    padding: 0;',
        '  }',
        '  ',
        '  * {',
        '    margin: 0;',
        '    padding: 0;',
        '    box-shadow: none !important;',
        '  }',
        '',
        '  body {',
        '    line-height: 1.5;',
        '    font-family: "Times New Roman", serif;',
        '  }',
        '',
        '  .docx-wrapper table tr {',
        '    page-break-inside: avoid;',
        '  }',
        '',
        '  .docx-wrapper table {',
        '    border-collapse: collapse;',
        '  }',
        '',
        '  .docx-wrapper table td,',
        '  .docx-wrapper table th {',
        '    border: 1px solid black;',
        '  }',
        '',
        '  img {',
        '    max-width: 100%;',
        '    height: auto;',
        '  }',
        '}',
        '</style>'
    ].join('\n');

    return vueComponent;
};

/**
 * 收集并清理样式
 * @returns {string} 清理后的样式代码
 */
const collectAndCleanStyles = () => {
    let styles = '';

    // 收集 <style> 标签
    document.querySelectorAll("style").forEach(style => {
        const styleContent = style.textContent || style.innerHTML;
        if (styleContent) {
            styles += styleContent + '\n';
        }
    });

    // 收集 <link rel="stylesheet"> 标签
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        styles += `/* 外部样式表: ${link.href} */\n`;
    });

    // 清理样式代码
    return cleanStyles(styles);
};

/**
 * 清理样式代码
 * @param {string} styles - 原始样式代码
 * @returns {string} 清理后的样式代码
 */
const cleanStyles = (styles) => {
    if (!styles) return '';

    // 移除不需要的选择器
    const lines = styles.split('\n');
    const cleanedLines = lines.filter(line => {
        const trimmedLine = line.trim();

        // 保留空行和注释
        if (!trimmedLine || trimmedLine.startsWith('/*') || trimmedLine.endsWith('*/')) {
            return true;
        }

        // 保留 .docx-wrapper 相关的样式
        if (trimmedLine.includes('.docx-wrapper') ||
            trimmedLine.includes('.docx') ||
            trimmedLine.includes('{') ||
            trimmedLine.includes('}')) {
            return true;
        }

        // 移除 .doc-render-box 相关样式，因为我们会用新的容器
        if (trimmedLine.includes('.doc-render-box')) {
            return false;
        }

        // 移除其他不需要的样式
        if (trimmedLine.includes('.main-container') ||
            trimmedLine.includes('.left-panel') ||
            trimmedLine.includes('.right-panel') ||
            trimmedLine.includes('.upload-section') ||
            trimmedLine.includes('.action-buttons') ||
            trimmedLine.includes('.css-editor') ||
            trimmedLine.includes('.button-group')) {
            return false;
        }

        return true;
    });

    return cleanedLines.join('\n');
};

/**
 * 下载文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} type - 文件类型
 */
export const downloadFile = (content, filename, type = "text/plain") => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * 生成并下载Vue3组件
 * @param {HTMLElement} docxWrapper - docx-wrapper元素
 * @returns {Promise} 返回Promise
 */
export const generateAndDownloadVue = (docxWrapper) => {
    return new Promise((resolve, reject) => {
        try {
            const vueComponent = generateVueComponent(docxWrapper);
            downloadFile(vueComponent, "DocumentViewer.vue");
            console.log('Vue3组件已生成并下载');
            resolve();
        } catch (error) {
            console.error('生成Vue3组件失败:', error);
            reject(error);
        }
    });
}; 