# 构建阶段
FROM kongbg/node16-chrome:latest AS builder

# 设置工作目录
WORKDIR /app

# 复制源代码
COPY . .

# 安装 pnpm
RUN npm install -g pnpm@7

# 安装依赖
RUN pnpm install

# 构建项目
RUN npm run build

# 运行阶段
FROM kongbg/node16-chrome:latest

# 设置工作目录
WORKDIR /app

# 修正 Debian buster 过期源为 archive 源
RUN sed -i 's/deb.debian.org\/debian/archive.debian.org\/debian/g' /etc/apt/sources.list && \
    sed -i 's/security.debian.org\/debian-security/archive.debian.org\/debian-security/g' /etc/apt/sources.list

# 字体包及字体渲染依赖安装
RUN apt-get update && apt-get install -y \
    fontconfig \
    fonts-liberation \
    fonts-wqy-zenhei \
    libfreetype6 \
    libfreetype6-dev \
    libharfbuzz0b && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 字体缓存更新
RUN fc-cache -fv && \
    fc-list | grep -i "wqy\|noto"

# 安装符号和 Emoji 字体，增强对 ☐ 等符号的支持
RUN apt-get update && apt-get install -y \
    fonts-noto-color-emoji \
    fonts-noto \
    fonts-symbola || true
RUN fc-cache -fv

# 安装常用免费中英文和符号字体包
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    fonts-noto \
    fonts-noto-color-emoji \
    fonts-liberation \
    fonts-dejavu \
    fonts-wqy-zenhei \
    fonts-wqy-microhei \
    fonts-arphic-ukai \
    fonts-arphic-uming \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# RUN fc-cache -fv

# 拷贝宋体 simsun.ttc 到系统字体目录
COPY fonts/simsun.ttc /usr/share/fonts/truetype/simsun.ttc
RUN fc-cache -fv


# 从构建阶段复制 dist 目录和 node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# 创建 PM2 配置文件
COPY ecosystem.config.js ./

# 暴露配置目录
VOLUME ["/app/dist/config"]

# 暴露端口
EXPOSE 4320

# 设置默认环境变量
ENV NODE_ENV=production

# 使用 PM2 启动应用
CMD ["pm2-runtime", "start", "ecosystem.config.js"]