# Word转PDF工具

一个基于 Vue3 + Koa + Puppeteer 的 Word 文档转 PDF 工具，支持将 Word 文档转换为 HTML、Vue3 组件(动态填入数据)，并生成高质量 PDF。

## 🚀 项目特性

- **Word文档解析**：使用 `docx-preview` 解析 Word 文档
- **Vue3组件生成**：自动生成 Vue3 单文件组件
- **PDF生成**：基于 Puppeteer 生成高质量 PDF
- **表格优化**：针对 PDF 导出优化表格边框和样式
- **响应式设计**：支持移动端和桌面端
- **Docker部署**：支持容器化部署
- **适用范围**：一些简单，纯文字，表格的docx文件， 暂不支持图片

## 在线体验

- https://word.660665.xyz

## 📁 项目结构

```
word-pdf/
├── frontend/                 # 前端项目 (Vue3 + Vite)
│   ├── src/
│   │   ├── components/      # Vue组件
│   │   ├── views/          # 页面视图
│   │   ├── router/         # 路由配置
│   │   └── utils/          # 工具函数
│   ├── vite.config.js      # Vite配置
│   └── package.json
├── backend/                 # 后端项目 (Koa + Puppeteer)
│   ├── controllers/        # 控制器
│   ├── routes/            # 路由
│   ├── service/           # 服务层
│   ├── utils/             # 工具函数
│   ├── public/            # 静态文件目录
│   ├── build.js           # 构建脚本
│   ├── Dockerfile         # Docker配置
│   └── package.json
├── package.json           # 根目录脚本
└── README.md
```

## 🛠️ 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vue Router** - 官方路由管理器
- **Vite** - 下一代前端构建工具
- **docx-preview** - Word 文档预览库
- **Axios** - HTTP 客户端

### 后端
- **Koa** - Node.js Web 框架
- **Puppeteer** - 无头浏览器控制
- **javascript-obfuscator** - 代码混淆
- **PM2** - 进程管理器

## 🚀 快速开始

### 环境要求
- Node.js 16+
- pnpm 7+
- Docker (可选)

### 安装依赖
```bash
# 安装根目录依赖
pnpm install

# 安装前端依赖
pnpm run -C frontend install

# 安装后端依赖
pnpm run -C backend install
```

## 🔧 开发模式

### 启动开发服务器
```bash
# 启动前端开发服务器 (端口 4321)
pnpm run dev

# 启动后端服务 (端口 4320)
pnpm run start
```

### 访问地址
- 前端：http://localhost:4321
- 后端API：http://localhost:4320

## 📦 构建部署

### 方式一：本地部署
```bash
# 完整打包（推荐）
pnpm run build:dist

# 启动打包后的服务
cd backend/dist
pnpm install
pnpm start
```

### 方式二：Docker部署
```bash
# 构建前端并创建Docker镜像
// 需要修改版本号 word-html-pdf:1.0.0 -> word-html-pdf:1.0.1
pnpm run build:docker

# 运行Docker容器
docker run -p 4320:4320 word-html-pdf:1.0.0
```

### 方式三：快速构建启动
```bash
# 构建前端并启动后端服务
pnpm run build:start
```

## 🐳 Docker 部署详解

### 构建镜像
```bash
# 方法1：使用项目脚本
pnpm run build:docker

# 方法2：手动构建
cd backend
docker build -t word-html-pdf:1.0.0 .
```

### 运行容器
```bash
# 基础运行
docker run -p 4320:4320 word-html-pdf:1.0.0

# 后台运行
docker run -d -p 4320:4320 --name word-html-pdf word-html-pdf:1.0.0

# 自定义端口映射
docker run -d -p 8080:4320 --name word-html-pdf word-html-pdf:1.0.0

# 挂载配置文件
docker run -d -p 4320:4320 -v /host/config:/app/dist/config word-html-pdf:1.0.0

# 挂载目录下新建文件
// index.js
export const prefix = '/api'
```

### 端口映射说明
- **4320**: 容器内部端口（应用端口）
- **8080**: 主机端口（可自定义）
- 访问地址：http://localhost:8080

### 容器管理
```bash
# 查看运行中的容器
docker ps

# 停止容器
docker stop word-html-pdf

# 重启容器
docker restart word-html-pdf

# 查看容器日志
docker logs word-html-pdf

# 进入容器
docker exec -it word-html-pdf bash
```

## 📄 API 接口
    后端做了简单的并发控制，默认最大处理3个请求，其余的进入队列等待，前端注意设置超时时间

### 生成 PDF
```http
POST /api/generate/pdf
Content-Type: application/json

{
  "url": "http://localhost:4321/print?id=test", // 需要生成pdf的页面地址，任何能访问的地址都可以
  "options": {
    "format": "A4",
    "printBackground": true,
    "margin": {
      "top": "20mm",
      "right": "10mm",
      "bottom": "20mm",
      "left": "10mm"
    }
  }
}
```

### 响应格式
```json
{
  "code": 200,
  "data": "PDF文件二进制数据",
  "message": "success"
}
```

## 🔄 Word转HTML流程

### 1. 文档解析
- 使用 `docx-preview` 解析 Word 文档
- 提取文档结构、样式、图片等

### 2. HTML生成
- 将 Word 内容转换为 HTML
- 保留原始样式和格式
- 优化表格边框和布局

### 3. Vue3组件生成
- 生成 Vue3 单文件组件
- 包含模板、样式
- 支持动态数据绑定

### 4. PDF生成
- 使用 Puppeteer 渲染页面
- 应用打印样式优化
- 生成高质量 PDF


## 🎨 样式优化

### 表格边框优化
- 统一边框宽度为 1px
- 使用 `border-collapse: collapse` 避免边框重叠
- 移除阴影和特效
- 确保表格不分页断开

### 打印样式
```css
@media print {
  table {
    border-collapse: collapse !important;
    border: 1px solid #000 !important;
  }
  
  th, td {
    border: 1px solid #000 !important;
    padding: 4px 8px !important;
  }
}
```

## 📋 使用示例

### 1. 上传 Word 文档
1. 访问 http://localhost:4321
2. 点击"选择文件"上传 .docx 文件
3. 预览文档内容

### 2. 生成 Vue3 组件
1. 在预览页面点击"生成 Vue3"
2. 下载生成的 .vue 文件
3. 在项目中使用组件

### 3. 生成 PDF
1. 在打印页面点击"导出PDF"
2. 选择浏览器导出或后端生成
3. 下载生成的 PDF 文件

### 4. 调用 API 生成 PDF
```javascript
const response = await fetch('/api/generate/pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'http://localhost:4321/print?id=test',
    options: {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '10mm',
        bottom: '20mm',
        left: '10mm'
      }
    }
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'document.pdf';
a.click();
```

## 🔧 配置说明

### 环境变量
```bash
# 后端端口
NODE_PORT=4320

# 环境模式
NODE_ENV=production
```

### 前端配置
```javascript
// vite.config.js
export default defineConfig({
  build: {
    outDir: '../backend/public',  // 构建输出目录
    assetsDir: 'static',          // 静态资源目录
  }
})
```

### 后端配置
```javascript
// configs/index.js
export const port = process.env.NODE_PORT || 4320;
```

## 🐛 故障排除

### 常见问题

#### 1. 前端构建失败
```bash
# 检查依赖
cd frontend && pnpm install

# 清理缓存
rm -rf node_modules package-lock.json
pnpm install
```

#### 2. 后端启动失败
```bash
# 检查端口占用
netstat -ano | findstr :4320

# 检查依赖
cd backend && pnpm install
```

#### 3. Docker构建失败
```bash
# 清理Docker缓存
docker system prune -a

# 重新构建
docker build --no-cache -t word-html-pdf:1.0.0 .
```

#### 4. PDF生成失败
- 检查 Puppeteer 是否正确安装
- 确认目标URL可访问
- 检查内存使用情况

### 日志查看
```bash
# 后端日志
cd backend && pnpm start

# Docker日志
docker logs word-html-pdf

# PM2日志
pm2 logs
```

## 📝 更新日志

### v1.0.1
- 添加 Docker 支持
- 优化表格样式
- 修复路径解析问题
- 完善构建脚本

### v1.0.0
- 初始版本发布
- 支持 Word 转 HTML/Vue3/PDF
- 基础功能实现

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 ISC 许可证。

## 📞 联系方式

如有问题或建议，请提交 Issue 或联系开发者。 