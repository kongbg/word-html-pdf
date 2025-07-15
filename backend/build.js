import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import JavaScriptObfuscator from 'javascript-obfuscator';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 缓存已混淆的代码
const obfuscationCache = new Map();

// 混淆配置
const obfuscationConfig = {
    reservedNames: [
        'evalfrom',
        'document',   // 保留 document
        'window',     // 建议也保留 window
        'navigator',  // 建议也保留 navigator
        'location',   // 建议也保留 location
        'setTimeout', // 建议也保留常用全局
        'setInterval'
    ],
    compact: true,                  // 代码压缩
    controlFlowFlattening: false,   // 关闭控制流扁平化（大幅提升速度）
    deadCodeInjection: false,       // 关闭死代码注入（提升速度）
    identifierNamesGenerator: 'hexadecimal', // 变量名混淆
    stringArray: true,              // 字符串数组编码
    splitStrings: false,            // 关闭字符串分割（提升速度）
    transformObjectKeys: false,     // 关闭对象键名转换（提升速度）
    unicodeEscapeSequence: false,   // 关闭Unicode转义（提升速度）
    disableConsoleOutput: false,    // 保持控制台输出
    selfDefending: false,           // 关闭自我防御（提升速度）
    debugProtection: false,         // 关闭调试保护
    log: false                      // 关闭日志（提升速度）
};


// 混淆单个文件
const obfuscateFile = (filePath, outPath) => {
    try {
        // 检查缓存
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const fileHash = crypto.createHash('md5').update(fileContent).digest('hex');
        const cacheKey = `${filePath}:${fileHash}`;

        if (obfuscationCache.has(cacheKey)) {
            fs.writeFileSync(outPath, obfuscationCache.get(cacheKey));
            return true;
        }

        // 混淆代码
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(fileContent, obfuscationConfig).getObfuscatedCode();

        // 缓存结果
        obfuscationCache.set(cacheKey, obfuscatedCode);

        fs.writeFileSync(outPath, obfuscatedCode);
        return true;
    } catch (error) {
        console.error(`Error obfuscating ${filePath}:`, error.message);
        // 如果混淆失败，直接复制原文件
        fs.copyFileSync(filePath, outPath);
        return false;
    }
};

// 读取配置文件获取端口号
const configPath = path.join(__dirname, './configs/index.js');

// 混淆后端代码
console.log('混淆后端代码...');
const serverDir = path.join(__dirname, './'); // 源码目录
const distDir = path.join(__dirname, './dist'); // 输出目录

// 确保dist目录存在
if (fs.existsSync(distDir)) {
    // 清空dist目录
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });// 不存在就创建

// 收集所有需要处理的文件
const collectFiles = (dir, outDir, files = []) => {
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const items = fs.readdirSync(dir);

    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const outPath = path.join(outDir, item);
        const stat = fs.statSync(itemPath);

        if (stat.isDirectory()) {
            if (item === 'node_modules' || item === 'dist' || item === 'frontend' || item === 'fonts') {
                // 跳过 node_modules， dist 目录
                return;
            } else {
                collectFiles(itemPath, outPath, files);
            }
        } else if (item.endsWith('.js')) {
            // 跳过不需要混淆的文件
            if ((item === 'index.js') && dir.includes('config')) {
                files.push({ type: 'copy', src: itemPath, dest: outPath });
                return;
            }
            // 跳过 plugins/Scrape.js 的混淆，直接复制
            if ((item === 'Scrape.js') && dir.includes('plugins')) {
                files.push({ type: 'copy', src: itemPath, dest: outPath });
                return;
            }
            // public目录下的所有文件都直接复制（包括前端构建产物）
            if (dir.includes('public')) {
                files.push({ type: 'copy', src: itemPath, dest: outPath });
                return;
            }
            files.push({ type: 'obfuscate', src: itemPath, dest: outPath });
        } else {
            files.push({ type: 'copy', src: itemPath, dest: outPath });
        }
    });

    return files;
};

// 处理文件列表
const processFiles = async (files) => {
    let processed = 0;
    const total = files.length;

    console.log(`开始处理 ${total} 个文件...`);

    for (const file of files) {
        if (file.type === 'obfuscate') {
            obfuscateFile(file.src, file.dest);
        } else {
            fs.copyFileSync(file.src, file.dest);
        }

        processed++;
        if (processed % 10 === 0 || processed === total) {
            console.log(`进度: ${processed}/${total} (${Math.round(processed / total * 100)}%)`);
        }
    }
};

try {
    const startTime = Date.now();

    // 第二步：混淆服务器代码
    console.log('🔧 开始混淆后端代码...');
    const files = collectFiles(serverDir, distDir);
    await processFiles(files);

    // 复制package.json和配置文件
    fs.copyFileSync(
        path.join(serverDir, 'package.json'),
        path.join(distDir, 'package.json')
    );

    // 确保配置目录存在
    const distConfigDir = path.join(distDir, 'config');
    if (!fs.existsSync(distConfigDir)) {
        fs.mkdirSync(distConfigDir, { recursive: true });
    }

    // 复制配置文件
    fs.copyFileSync(
        path.join(serverDir, 'config/index.js'),
        path.join(distConfigDir, 'index.js')
    );

    const endTime = Date.now();
    const buildTime = (endTime - startTime) / 1000;

    console.log(`🎉 完整打包成功! 耗时: ${buildTime.toFixed(2)}秒`);
    console.log(`📊 缓存命中: ${obfuscationCache.size} 个文件`);
    console.log(`📁 输出目录: ${distDir}`);
    console.log(`🌐 前端文件已构建到: ${path.join(__dirname, 'public')}`);
} catch (error) {
    console.error('❌ 打包失败:', error.message);
    process.exit(1);
}