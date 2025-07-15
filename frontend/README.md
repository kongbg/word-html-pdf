# Word转PDF工具 - 前端项目

## 项目简介

这是一个基于Vue3 + Vite的前端项目，提供Word文档预览、转换和PDF生成功能。

## 技术栈

- Vue 3 (Composition API)
- Vue Router 4
- Vite
- docx-preview (Word文档预览)
- 原生CSS

## 路由配置

项目使用Vue Router进行路由管理，包含以下路由：

### 路由列表

| 路径 | 名称 | 组件 | 描述 |
|------|------|------|------|
| `/` | Home | Home.vue | 首页，欢迎页面 |
| `/preview` | Preview | PreviewDemo.vue | 文档预览和转换页面 |
| `/print` | Print | DocumentViewer.vue | 打印视图页面 |
| `/view/:id?` | View | DocumentViewer.vue | 文档查看页面（支持参数） |
| `/*` | NotFound | NotFound.vue | 404页面 |

### 路由特性

- **页面标题自动设置**: 每个路由都配置了meta.title，会自动设置浏览器标题
- **响应式导航**: 导航栏支持移动端适配
- **路由守卫**: 自动设置页面标题
- **懒加载**: 404页面使用懒加载优化性能

## 组件结构

### 主要组件

1. **App.vue** - 根组件，包含路由视图和全局样式
2. **Home.vue** - 首页组件，欢迎页面
3. **PreviewDemo.vue** - 文档预览和转换组件
4. **DocumentViewer.vue** - 文档查看组件
5. **NotFound.vue** - 404页面组件

### 导航栏

所有页面都包含统一的导航栏，提供：
- 品牌标识（可点击返回首页）
- 导航菜单（首页、预览、打印）
- 响应式设计
- 当前页面高亮显示

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
frontend/
├── src/
│   ├── components/          # 组件目录
│   │   ├── Home.vue        # 首页组件
│   │   ├── PreviewDemo.vue # 预览组件
│   │   ├── DocumentViewer.vue # 文档查看组件
│   │   └── NotFound.vue    # 404页面
│   ├── router/             # 路由配置
│   │   └── index.js        # 路由主文件
│   ├── utils/              # 工具函数
│   │   └── index.js        # 通用工具函数
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── public/                 # 静态资源
├── index.html              # HTML模板
├── package.json            # 项目配置
└── vite.config.js          # Vite配置
```

## 样式指南

### 导航栏样式

- 使用渐变背景色
- 固定定位，支持滚动
- 响应式设计
- 悬停效果和当前页面高亮

### 按钮样式

- 统一的按钮样式系统
- 支持多种颜色主题
- 悬停和点击效果
- 加载状态支持

### 响应式设计

- 移动端优先设计
- 断点：768px
- 弹性布局
- 自适应内容

## 功能特性

### 文档预览
- 支持.docx文件上传
- 实时预览
- 样式编辑
- 多种导出格式

### 文件转换
- HTML导出
- Vue3组件生成
- PDF生成
- 样式保持

### 用户体验
- 加载状态提示
- 错误处理
- 响应式设计
- 直观的界面

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 注意事项

1. 确保后端服务正常运行
2. 文件上传大小限制
3. 浏览器兼容性考虑
4. 网络连接要求

## 更新日志

### v1.0.0
- 初始版本发布
- 基础路由配置
- 文档预览功能
- 文件转换功能
