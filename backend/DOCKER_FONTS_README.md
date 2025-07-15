# Docker 中文字体配置说明

## 问题描述
在Docker容器中生成包含中文内容的PDF时，经常出现中文显示为方块或乱码的问题。这是因为容器中缺少中文字体支持。

## 解决方案

### 1. 字体安装
在Dockerfile中安装了以下中文字体包：
- `fonts-noto-cjk` - Google Noto CJK字体（简体中文、繁体中文、日文、韩文）
- `fonts-noto-cjk-extra` - Noto CJK额外字体
- `fonts-wqy-microhei` - 文泉驿微米黑
- `fonts-wqy-zenhei` - 文泉驿正黑
- `fonts-arphic-ukai` - 文鼎PL中楷
- `fonts-arphic-uming` - 文鼎PL细上海宋
- `fonts-ipafont-gothic` - IPA字体
- `fonts-ipafont-mincho` - IPA明朝字体
- `fonts-unfonts-core` - Un字体核心
- `fonts-unfonts-extra` - Un字体额外

### 2. 字体配置
- 创建了自定义的 `fonts.conf` 配置文件
- 设置了字体优先级，优先使用中文字体
- 配置了字体抗锯齿和提示

### 3. 环境变量
设置了以下环境变量：
- `FONTCONFIG_PATH=/etc/fonts` - 字体配置路径
- `FONTCONFIG_FILE=/etc/fonts/fonts.conf` - 字体配置文件
- `LANG=zh_CN.UTF-8` - 语言环境
- `LC_ALL=zh_CN.UTF-8` - 本地化环境

## 构建和使用

### 构建镜像
```bash
# Linux/Mac
./build-docker.sh

# Windows PowerShell
.\build-docker.ps1

# 或者直接使用docker命令
docker build -t word-html-pdf-backend:latest .
```

### 测试字体安装
```bash
# 运行容器并测试字体
docker run --rm word-html-pdf-backend:latest node test-fonts.js
```

### 运行应用
```bash
# 运行容器
docker run -p 4320:4320 word-html-pdf-backend:latest
```

## 验证字体效果

### 1. 检查字体列表
```bash
docker run --rm word-html-pdf-backend:latest fc-list | grep -i chinese
```

### 2. 测试字体匹配
```bash
docker run --rm word-html-pdf-backend:latest fc-match "Noto Sans CJK SC"
```

### 3. 生成测试PDF
访问应用并生成包含中文内容的PDF，检查是否还有乱码问题。

## 故障排除

### 如果仍有乱码问题：

1. **检查字体是否正确安装**
   ```bash
   docker run --rm word-html-pdf-backend:latest node test-fonts.js
   ```

2. **检查Puppeteer配置**
   确保Puppeteer启动参数包含字体相关配置

3. **手动安装字体**
   如果自动安装失败，可以手动复制字体文件到容器中

4. **检查PDF生成时的字体设置**
   确保在生成PDF时指定了正确的中文字体

## 注意事项

- 字体安装会增加镜像大小（约200-300MB）
- 首次构建可能需要较长时间下载字体包
- 建议在生产环境中使用多阶段构建来减少最终镜像大小
- 定期更新字体包以获得更好的中文显示效果 