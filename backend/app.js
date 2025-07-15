import Koa from 'koa';
import fs from 'fs';
import bodyParser from 'koa-bodyparser';
import serve from 'koa-static';
import cors from '@koa/cors';
import Router from 'koa-router';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import initPuppeteer from './utils/initPuppeteer.js';  // 引入puppeteer初始化
import { Blob } from 'buffer'; // fix: node16 ReferenceError: Blob is not defined。
import { prefix } from './config/index.js'
import puppeteerManager from './utils/puppeteerManager.js';
import envConfig from './configs/env.js'

// 为 Node.js 16 添加 polyfills
globalThis.Blob = Blob;

// 为 Node.js 16 添加 ReadableStream polyfill
if (typeof globalThis.ReadableStream === 'undefined') {
    try {
        const { ReadableStream } = await import('stream/web');
        globalThis.ReadableStream = ReadableStream;
    } catch (error) {
        console.warn('ReadableStream polyfill not available, using fallback');
        // 如果 stream/web 不可用，使用简单的 polyfill
        globalThis.ReadableStream = class ReadableStream {
            constructor() {
                throw new Error('ReadableStream not supported in this environment');
            }
        };
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Koa();
const PORT = process.env.NODE_PORT || envConfig.port;
let server = null;
const router = new Router({ prefix });

// CORS 配置
app.use(cors({
    origin: '*',
    credentials: true, // 关键：允许携带凭证
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Machineid'],
    maxAge: 86400, // 预检请求的有效期，单位为秒
}));

// 静态资源服务 - 前端构建后的文件会输出到这里
app.use(serve(path.join(__dirname, 'public')));

// 历史模式 Fallback：所有路由返回 index.html
app.use(async (ctx, next) => {
    if (ctx.path.startsWith('/') && ctx.path.indexOf('.') < 0 && !ctx.path.startsWith('/api')) {
        ctx.set('Content-Type', 'text/html');
        ctx.body = fs.createReadStream(
            path.resolve(__dirname, 'public/index.html')
        );
    } else {
        await next();
    }
});

// 中间件
app.use(bodyParser({
    enableTypes: ['json', 'form'],
    jsonLimit: '10mb',
    formLimit: '10mb',
    textLimit: '10mb'
}));

router.post(`/generate/pdf`, async (ctx) => {
    try {
        const { url, options = {} } = ctx.request.body;

        if (!url) {
            return this.error(ctx, 'URL is required');
        }
        console.log('Service: Starting PDF generation for URL:', url);

        // 使用puppeteer管理器生成PDF
        const pdfBuffer = await puppeteerManager.generatePdf(url, options);

        // 验证PDF数据
        if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
            console.error('Service: Invalid PDF buffer received, type:', typeof pdfBuffer, 'constructor:', pdfBuffer?.constructor?.name);
            throw new Error('Invalid PDF buffer received');
        }

        // 验证PDF头部标识
        const pdfHeader = pdfBuffer.slice(0, 4).toString();
        // console.log('Service: PDF header:', pdfHeader);

        if (!pdfHeader.startsWith('%PDF')) {
            throw new Error('Generated data is not a valid PDF');
        }

        // 设置响应头
        ctx.set('Content-Type', 'application/pdf');
        ctx.set('Content-Disposition', 'attachment; filename="generated.pdf"');
        ctx.set('Content-Length', pdfBuffer.length);

        // 直接返回Buffer，绕过响应处理中间件
        ctx.body = pdfBuffer;

    } catch (error) {
        console.error('Service: PDF generation failed:', error);
        ctx.body = {
            success: false,
            error: error.message,
            message: 'PDF generation failed'
        };
    }

});
app.use(router.routes());

// 获取本机IP地址
const getLocalIPs = () => {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (const info of interfaceInfo) {
            // 只获取IPv4地址，排除内部地址127.0.0.1
            if (info.family === 'IPv4' && !info.internal) {
                addresses.push(info.address);
            }
        }
    }

    return addresses;
};

async function startKoa() {
    try {
        // 初始化puppeteer管理器
        await initPuppeteer();

        // 启动服务器
        server = app.listen(PORT, () => {
            const localIPs = getLocalIPs();

            console.log('\n=== pdf服务 应用服务已启动 ===\n');
            console.log(`docker环境如映射了端口，请自行修改端口号访问\n`)
            console.log(`🚀 本地访问: http://localhost:${PORT}`);

            if (localIPs.length > 0) {
                console.log('\n📡 网络访问:');
                localIPs.forEach(ip => {
                    console.log(`   http://${ip}:${PORT}`);
                });
            }

            console.log(`\ndocker环境如映射了端口，请自行修改端口号访问\n`)

            console.log('\n=== 按 Ctrl+C 停止服务 ===\n');
        });
    } catch (error) {
        console.error('服务器启动失败:', error);
        process.exit(1);
    }
}

export const closeKoa = () => {
    if (server) {
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    }
}

// 开启koa
startKoa();

export default app;
