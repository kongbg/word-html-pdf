import puppeteer from 'puppeteer-core';
import envConfig from '../configs/env.js'
import pdfPerformanceMonitor from './pdfPerformanceMonitor.js';
import PDFOptimizer from './pdfOptimizer.js';

class PuppeteerManager {
    constructor(options = {}) {
        this.maxConcurrency = options.maxConcurrency || 3; // 最大并发数
        this.browserPath = options.browserPath || "/usr/bin/google-chrome-stable";
        this.browser = null;
        this.activeTabs = 0;
        this.queue = [];
        this.isProcessing = false;
        this.maxIdleTime = options.maxIdleTime || 300000; // 5分钟空闲后关闭浏览器
        this.idleTimer = null;
        this.optimizer = new PDFOptimizer(); // 添加PDF优化器
    }

    // 启动浏览器
    async launchBrowser() {
        if (this.browser) {
            return this.browser;
        }

        const browserStartTime = Date.now();
        console.log(`[Browser] 开始启动浏览器: ${new Date().toISOString()}`);

        try {
            this.browser = await puppeteer.launch({
                executablePath: this.browserPath,
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });

            const browserEndTime = Date.now();
            console.log(`[Browser] 浏览器启动成功，耗时: ${browserEndTime - browserStartTime}ms`);

            // 监听浏览器断开连接
            this.browser.on('disconnected', () => {
                console.log('[Browser] 浏览器连接断开');
                this.browser = null;
                this.activeTabs = 0;
                this.clearIdleTimer();
            });

            return this.browser;
        } catch (error) {
            const errorTime = Date.now();
            console.error(`[Browser] 浏览器启动失败，耗时: ${errorTime - browserStartTime}ms`);
            console.error('[Browser] 错误详情:', error);
            throw error;
        }
    }

    // 创建新标签页
    async createPage() {
        const pageStartTime = Date.now();
        console.log(`[Page] 开始创建新页面: ${new Date().toISOString()}`);

        const browser = await this.launchBrowser();
        const page = await browser.newPage();

        // 设置页面配置
        console.log(`[Page] 设置页面配置...`);
        const configStartTime = Date.now();
        await page.setViewport({ width: 1200, height: 800 });
        await page.setDefaultNavigationTimeout(30000);
        await page.setDefaultTimeout(30000);
        const configEndTime = Date.now();
        console.log(`[Page] 页面配置完成，耗时: ${configEndTime - configStartTime}ms`);

        const pageEndTime = Date.now();
        console.log(`[Page] 页面创建完成，总耗时: ${pageEndTime - pageStartTime}ms`);

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
            this.processQueue();
        }
    }

    // 设置空闲定时器
    setIdleTimer() {
        this.clearIdleTimer();
        this.idleTimer = setTimeout(() => {
            this.closeBrowser();
        }, this.maxIdleTime);
    }

    // 清除空闲定时器
    clearIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }
    }

    // 关闭浏览器
    async closeBrowser() {
        this.clearIdleTimer();
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (error) {
                console.error('Error closing browser:', error);
            } finally {
                this.browser = null;
                this.activeTabs = 0;
            }
        }
    }

    // 处理队列
    async processQueue() {
        if (this.isProcessing || this.queue.length === 0 || this.activeTabs >= this.maxConcurrency) {
            return;
        }

        this.isProcessing = true;
        console.log(`[Queue] 开始处理队列，当前队列长度: ${this.queue.length}, 活跃标签页: ${this.activeTabs}`);

        while (this.queue.length > 0 && this.activeTabs < this.maxConcurrency) {
            const task = this.queue.shift();
            this.activeTabs++;
            console.log(`[Queue] 开始处理任务，当前活跃标签页: ${this.activeTabs}`);

            // 异步执行任务，不等待完成
            this.executeTask(task).catch(error => {
                console.error('[Queue] 任务执行错误:', error);
                if (task.reject) {
                    task.reject(error);
                }
            });
        }

        this.isProcessing = false;
        console.log(`[Queue] 队列处理完成，剩余队列长度: ${this.queue.length}`);
    }

    // 执行任务
    async executeTask(task) {
        const taskStartTime = Date.now();
        console.log(`[Task] 开始执行任务: ${new Date().toISOString()}`);

        let page = null;
        try {
            page = await this.createPage();
            const executeStartTime = Date.now();
            const result = await task.execute(page);
            const executeEndTime = Date.now();
            console.log(`[Task] 任务执行完成，耗时: ${executeEndTime - executeStartTime}ms`);

            if (task.resolve) {
                task.resolve(result);
            }
        } catch (error) {
            const errorTime = Date.now();
            console.error(`[Task] 任务执行失败，耗时: ${errorTime - taskStartTime}ms`);
            if (task.reject) {
                task.reject(error);
            }
            throw error;
        } finally {
            const closeStartTime = Date.now();
            await this.closePage(page);
            const closeEndTime = Date.now();
            console.log(`[Task] 页面关闭完成，耗时: ${closeEndTime - closeStartTime}ms`);

            const totalTaskTime = Date.now() - taskStartTime;
            console.log(`[Task] 任务总耗时: ${totalTaskTime}ms`);
        }
    }

    // 添加任务到队列
    async addTask(taskExecutor) {
        return new Promise((resolve, reject) => {
            const task = {
                execute: taskExecutor,
                resolve,
                reject
            };

            console.log(`[Queue] 添加新任务到队列，当前队列长度: ${this.queue.length}`);
            this.queue.push(task);
            this.processQueue();
        });
    }

    // 生成PDF
    async generatePdf(url, options = {}) {
        // 启动性能监控
        pdfPerformanceMonitor.start();
        pdfPerformanceMonitor.mark('PDF_Start', `开始生成PDF: ${url}`);

        const defaultOptions = {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '20mm',
                bottom: '20mm',
                left: '20mm'
            }
        };

        const pdfOptions = { ...defaultOptions, ...options };

        return this.addTask(async (page) => {
            pdfPerformanceMonitor.mark('Task_Start', '任务开始执行');

            try {
                pdfPerformanceMonitor.mark('Navigation_Start', `导航到URL: ${url}`);

                // 导航到页面
                await page.goto(url, {
                    waitUntil: 'domcontentloaded',
                    timeout: 15000
                });

                pdfPerformanceMonitor.mark('Navigation_Complete', '页面导航完成');

                // 分析页面复杂度并调整策略
                pdfPerformanceMonitor.mark('Complexity_Analysis', '分析页面复杂度');
                const complexity = await this.optimizer.analyzePageComplexity(page);
                const timeouts = this.optimizer.adjustTimeouts(complexity);
                pdfPerformanceMonitor.mark('Complexity_Analysis_Complete', `页面复杂度: ${complexity.complexity}`);

                // 智能等待
                pdfPerformanceMonitor.mark('Smart_Wait_Start', '开始智能等待');
                await this.optimizer.smartWait(page, timeouts);
                pdfPerformanceMonitor.mark('Smart_Wait_Complete', '智能等待完成');

                pdfPerformanceMonitor.mark('PDF_Generation_Start', '开始生成PDF');

                // 优化PDF选项
                const optimizedOptions = this.optimizer.optimizePDFOptions(pdfOptions, complexity);

                // 生成PDF
                const pdfData = await page.pdf(optimizedOptions);

                pdfPerformanceMonitor.mark('PDF_Generation_Complete', 'PDF生成完成');

                // 转换为Buffer
                pdfPerformanceMonitor.mark('Buffer_Conversion_Start', '开始转换为Buffer');
                const pdf = Buffer.from(pdfData);
                pdfPerformanceMonitor.mark('Buffer_Conversion_Complete', `Buffer转换完成，大小: ${pdf.length} bytes`);

                // 确保返回的是Buffer
                if (!Buffer.isBuffer(pdf)) {
                    throw new Error('PDF generation did not return a valid buffer');
                }

                pdfPerformanceMonitor.mark('Task_Complete', '任务执行完成');

                // 打印性能报告
                pdfPerformanceMonitor.printReport();

                // 保存性能日志
                pdfPerformanceMonitor.saveLogs();

                return pdf;
            } catch (error) {
                pdfPerformanceMonitor.mark('Error', `PDF生成错误: ${error.message}`);
                pdfPerformanceMonitor.printReport();
                throw error;
            }
        });
    }

    // 获取状态信息
    getStatus() {
        return {
            browserActive: !!this.browser,
            activeTabs: this.activeTabs,
            queueLength: this.queue.length,
            maxConcurrency: this.maxConcurrency
        };
    }

    // 清理资源
    async cleanup() {
        this.clearIdleTimer();
        await this.closeBrowser();
        this.queue = [];
        this.activeTabs = 0;
        this.isProcessing = false;
    }
}

// 创建单例实例
console.log('envConfig.local:', envConfig.local)
const browserPath = envConfig.local == 'local' ? "C:/Program Files/Google/Chrome/Application/chrome.exe" : "/usr/bin/google-chrome-stable"
const puppeteerManager = new PuppeteerManager({ browserPath });

export default puppeteerManager; 