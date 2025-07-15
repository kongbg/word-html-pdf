# PDF生成功能说明

## 功能概述

本系统使用puppeteer-core来生成PDF，支持并发处理、队列管理和浏览器缓存。

## 主要特性

1. **并发控制**: 支持设置最大并发数（默认3个）
2. **队列管理**: 超出的请求自动进入队列等待
3. **浏览器缓存**: 避免频繁创建销毁浏览器实例
4. **自动清理**: 空闲5分钟后自动关闭浏览器
5. **错误处理**: 完善的错误处理和资源清理
6. **智能等待**: 使用Promise实现的延时函数，支持页面加载完成检测

## 🔄 并发生成PDF的队列控制机制

### 1. 核心架构设计

系统采用 `PuppeteerManager` 类来管理PDF生成的并发和队列：

```javascript
class PuppeteerManager {
    constructor(options = {}) {
        this.maxConcurrency = options.maxConcurrency || 3; // 最大并发数
        this.browser = null;                              // 浏览器实例
        this.activeTabs = 0;                              // 当前活跃标签页数
        this.queue = [];                                  // 任务队列
        this.isProcessing = false;                        // 队列处理状态
        this.maxIdleTime = options.maxIdleTime || 300000; // 5分钟空闲超时
    }
}
```

### 2. 并发控制机制

#### 并发限制
- **默认最大并发数**: 3个标签页同时处理PDF生成
- **队列管理**: 超出并发限制的请求自动进入队列等待
- **资源复用**: 浏览器实例复用，避免频繁创建销毁

#### 队列处理流程
```javascript
// 添加任务到队列
async addTask(taskExecutor) {
    return new Promise((resolve, reject) => {
        const task = {
            execute: taskExecutor,
            resolve,
            reject
        };
        
        this.queue.push(task);
        this.processQueue(); // 立即尝试处理队列
    });
}

// 处理队列
async processQueue() {
    if (this.isProcessing || this.queue.length === 0 || this.activeTabs >= this.maxConcurrency) {
        return;
    }

    this.isProcessing = true;
    
    while (this.queue.length > 0 && this.activeTabs < this.maxConcurrency) {
        const task = this.queue.shift();
        this.activeTabs++;
        
        // 异步执行任务，不阻塞队列处理
        this.executeTask(task).catch(error => {
            console.error('Task execution error:', error);
            if (task.reject) {
                task.reject(error);
            }
        });
    }
    
    this.isProcessing = false;
}
```

### 3. 资源管理

#### 浏览器生命周期管理
- **延迟启动**: 首次需要时才启动浏览器
- **空闲清理**: 5分钟无活动后自动关闭浏览器
- **异常恢复**: 浏览器断开连接时自动重置状态

#### 标签页管理
```javascript
// 创建新标签页
async createPage() {
    const browser = await this.launchBrowser();
    const page = await browser.newPage();
    
    // 设置页面配置
    await page.setViewport({ width: 1200, height: 800 });
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);
    
    return page;
}

// 关闭标签页
async closePage(page) {
    try {
        if (page && !page.isClosed()) {
            await page.close();
        }
    } catch (error) {
        console.error('Error closing page:', error);
    } finally {
        this.activeTabs = Math.max(0, this.activeTabs - 1);
        this.processQueue(); // 释放资源后继续处理队列
    }
}
```

### 4. 状态监控

系统提供状态查询接口：
```javascript
getStatus() {
    return {
        browserActive: !!this.browser,    // 浏览器是否活跃
        activeTabs: this.activeTabs,      // 当前活跃标签页数
        queueLength: this.queue.length,   // 队列长度
        maxConcurrency: this.maxConcurrency // 最大并发数
    };
}
```

### 5. 性能优化建议

#### 并发数调整
根据服务器性能调整最大并发数：
```javascript
// 高性能服务器
const puppeteerManager = new PuppeteerManager({
    maxConcurrency: 5,  // 增加到5个并发
    maxIdleTime: 600000 // 10分钟空闲超时
});

// 低配置服务器
const puppeteerManager = new PuppeteerManager({
    maxConcurrency: 1,  // 减少到1个并发
    maxIdleTime: 180000 // 3分钟空闲超时
});
```

#### 内存管理
- 每个标签页约占用50-100MB内存
- 建议根据服务器内存调整并发数
- 定期调用清理接口释放资源

## ⚠️ 前端接口超时时间设置

### 当前超时配置

前端已配置10分钟超时时间：
```javascript
const service = axios.create({
  baseURL: '/api',
  timeout: 60000 * 10  // 10分钟超时，适应复杂文档的PDF生成
})
```

### 超时时间建议

| 文档复杂度 | 建议超时时间 | 说明 |
|-----------|-------------|------|
| 简单文档（<10页） | 5分钟 | 基础文档，加载快速 |
| 中等文档（10-50页） | 10分钟 | 包含图片和表格 |
| 复杂文档（>50页） | 15-20分钟 | 大量图片、复杂布局 |
| 超大文档（>100页） | 30分钟 | 需要分段处理 |

### 超时处理策略

#### 1. 前端超时处理
```javascript
try {
  const response = await service.post('/generate/pdf', data, {
    responseType: 'blob',
    timeout: 60000 * 10  // 10分钟
  });
} catch (error) {
  if (error.code === 'ECONNABORTED') {
    alert('PDF生成超时，请尝试生成较小的文档或联系管理员');
  } else {
    alert('PDF生成失败: ' + error.message);
  }
}
```

#### 2. 后端超时配置
```javascript
// puppeteer页面超时设置
await page.setDefaultNavigationTimeout(30000);  // 导航超时30秒
await page.setDefaultTimeout(30000);            // 操作超时30秒

// 页面加载等待
await page.waitForFunction(() => {
    return document.readyState === 'complete' &&
        !document.querySelector('.loading') &&
        document.body.scrollHeight > 0;
}, { timeout: 10000 });  // 页面渲染超时10秒
```

### 监控和调试

#### 1. 状态监控接口
```bash
# 查看当前状态
curl http://localhost:4320/api/generate/status

# 返回示例
{
  "browserActive": true,
  "activeTabs": 2,
  "queueLength": 1,
  "maxConcurrency": 3
}
```

#### 2. 调试接口
```bash
# 获取详细状态
curl http://localhost:4320/api/generate/debug

# 清理资源
curl -X POST http://localhost:4320/api/generate/cleanup
```

## 配置说明

### 浏览器路径
默认使用Chrome浏览器：`C:/Program Files/Google/Chrome/Application/chrome.exe`

### 并发设置
- 最大并发数：3个标签页
- 队列管理：自动排队等待
- 空闲超时：5分钟

### 页面加载设置
- 导航超时：30秒
- 页面等待：2秒基础等待 + 智能检测
- 内容渲染检测：等待页面完全加载和内容渲染

## API接口

### 1. 生成PDF
```http
POST /api/generate/pdf
Content-Type: application/json

{
  "url": "http://localhost:4501/?print=true",
  "options": {
    "format": "A4",
    "printBackground": true,
    "margin": {
      "top": "20mm",
      "right": "20mm", 
      "bottom": "20mm",
      "left": "20mm"
    }
  }
}
```

### 2. 获取状态
```http
GET /api/generate/status
```

返回：
```json
{
  "browserActive": true,
  "activeTabs": 1,
  "queueLength": 0,
  "maxConcurrency": 3
}
```

### 3. 清理资源
```http
POST /api/generate/cleanup
```

## 使用示例

### 前端调用
```javascript
// 生成PDF
const generatePdf = async () => {
  try {
    const response = await axios.post('/api/generate/pdf', {
      url: 'http://localhost:4501/?print=true',
      options: {
        format: 'A4',
        printBackground: true
      }
    }, {
      responseType: 'blob',
      timeout: 60000 * 10  // 10分钟超时
    });

    // 下载PDF
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-document.pdf';
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('PDF生成超时');
    } else {
      console.error('PDF生成失败:', error);
    }
  }
};
```

### 测试脚本
```bash
# 运行测试脚本
node test-pdf.js
```

## 延时工具函数

系统提供了多种延时工具函数：

### 基础延时
```javascript
import { delay } from './utils/delay.js';

// 延时2秒
await delay(2000);
```

### 条件延时
```javascript
import { delayUntil } from './utils/delay.js';

// 等待条件满足或超时
await delayUntil(5000, () => document.readyState === 'complete');
```

### 指数退避
```javascript
import { createExponentialBackoff } from './utils/delay.js';

const backoff = createExponentialBackoff(1000, 30000);
const { delay, attempt } = backoff();
await delay(delay);
```

## 注意事项

1. **浏览器路径**: 确保Chrome浏览器安装在指定路径
2. **内存使用**: 每个标签页会占用一定内存，建议根据服务器配置调整并发数
3. **超时设置**: 页面加载超时30秒，可根据需要调整
4. **错误处理**: 系统会自动重试和清理资源
5. **页面等待**: 系统会智能等待页面完全加载，确保PDF质量
6. **队列管理**: 超出并发限制的请求会自动排队，无需手动处理
7. **资源清理**: 建议定期调用清理接口释放内存资源

## 故障排除

### 1. 浏览器启动失败
- 检查Chrome浏览器路径是否正确
- 确保有足够的系统权限
- 检查防火墙设置

### 2. PDF生成失败
- 检查目标URL是否可访问
- 确认页面完全加载
- 查看服务器日志获取详细错误信息

### 3. 内存占用过高
- 减少最大并发数
- 缩短空闲超时时间
- 定期调用清理接口

### 4. 页面加载超时
- 检查网络连接
- 增加超时时间设置
- 优化目标页面加载速度

### 5. 队列积压
- 检查服务器性能
- 调整并发数设置
- 监控队列长度状态

## 性能优化

1. **增加等待时间**: 如果页面加载较慢，可以增加delay时间
2. **调整并发数**: 根据服务器性能调整maxConcurrency
3. **优化页面**: 减少页面资源，提高加载速度
4. **缓存浏览器**: 避免频繁创建销毁浏览器实例
5. **监控资源**: 定期检查内存使用和队列状态
6. **超时优化**: 根据文档复杂度调整超时时间 