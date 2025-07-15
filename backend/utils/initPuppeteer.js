import puppeteerManager from './puppeteerManager.js';

// 初始化puppeteer管理器
export const initPuppeteer = async () => {
    try {
        console.log('Initializing Puppeteer manager...');

        // 预热浏览器
        await puppeteerManager.launchBrowser();

        console.log('Puppeteer manager initialized successfully');
        console.log('Status:', puppeteerManager.getStatus());

        // 设置进程退出时的清理
        process.on('SIGINT', async () => {
            console.log('Cleaning up Puppeteer resources...');
            await puppeteerManager.cleanup();
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('Cleaning up Puppeteer resources...');
            await puppeteerManager.cleanup();
            process.exit(0);
        });

    } catch (error) {
        console.error('Failed to initialize Puppeteer manager:', error);
        throw error;
    }
};

export default initPuppeteer; 