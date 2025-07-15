class PDFOptimizer {
    constructor() {
        this.defaultTimeouts = {
            navigation: 15000,
            basicWait: 2000,
            renderWait: 3000,
            contentWait: 2000,
            loadingWait: 1500
        };
    }

    // 分析页面复杂度
    async analyzePageComplexity(page) {
        try {
            const complexity = await page.evaluate(() => {
                try {
                    const body = document.body;
                    if (!body) return { complexity: 'low', reason: 'no body' };

                    // 只用原生 DOM API
                    const imageCount = document.querySelectorAll('img').length;
                    const scriptCount = document.querySelectorAll('script').length;
                    const styleCount = document.querySelectorAll('style, link[rel="stylesheet"]').length;
                    const elementCount = document.querySelectorAll('*').length;
                    const textLength = body.textContent.length;
                    const hasComplexCSS = document.querySelectorAll('[style*="transform"], [style*="animation"], [style*="transition"]').length > 0;
                    const hasExternalResources = document.querySelectorAll('img[src^="http"], link[href^="http"], script[src^="http"]').length > 0;

                    let complexity = 'low';
                    let reason = '';

                    if (elementCount > 1000 || textLength > 10000) {
                        complexity = 'high';
                        reason = 'large content';
                    } else if (imageCount > 10 || hasExternalResources) {
                        complexity = 'medium';
                        reason = 'external resources';
                    } else if (hasComplexCSS || scriptCount > 5) {
                        complexity = 'medium';
                        reason = 'complex styling';
                    } else {
                        complexity = 'low';
                        reason = 'simple content';
                    }

                    return {
                        complexity,
                        reason,
                        metrics: {
                            imageCount,
                            scriptCount,
                            styleCount,
                            elementCount,
                            textLength,
                            hasComplexCSS,
                            hasExternalResources
                        }
                    };
                } catch (e) {
                    return { complexity: 'medium', reason: 'evaluate error: ' + (e && e.message) };
                }
            });

            return complexity;
        } catch (error) {
            console.log('[Optimizer] 页面复杂度分析失败:', error.message);
            return { complexity: 'medium', reason: 'analysis failed' };
        }
    }

    // 根据页面复杂度调整超时时间
    adjustTimeouts(complexity) {
        const timeouts = { ...this.defaultTimeouts };

        switch (complexity.complexity) {
            case 'high':
                timeouts.navigation = 20000;
                timeouts.basicWait = 3000;
                timeouts.renderWait = 5000;
                timeouts.contentWait = 3000;
                timeouts.loadingWait = 2500;
                break;
            case 'medium':
                timeouts.navigation = 15000;
                timeouts.basicWait = 2000;
                timeouts.renderWait = 3000;
                timeouts.contentWait = 2000;
                timeouts.loadingWait = 1500;
                break;
            case 'low':
                timeouts.navigation = 10000;
                timeouts.basicWait = 1000;
                timeouts.renderWait = 2000;
                timeouts.contentWait = 1000;
                timeouts.loadingWait = 1000;
                break;
        }

        console.log(`[Optimizer] 页面复杂度: ${complexity.complexity} (${complexity.reason}), 调整超时时间:`, timeouts);
        return timeouts;
    }

    // 智能等待策略
    async smartWait(page, timeouts) {
        console.log('[Optimizer] 开始智能等待...');

        try {
            // 1. 快速检查页面是否已经准备好
            const isReady = await page.evaluate(() => {
                const body = document.body;
                const loadingElements = document.querySelectorAll('.loading, [data-loading="true"], .spinner, .loader');

                return document.readyState === 'complete' &&
                    body &&
                    body.scrollHeight > 0 &&
                    loadingElements.length === 0;
            });

            if (isReady) {
                console.log('[Optimizer] 页面已准备就绪，跳过等待');
                return true;
            }

            // 2. 分步等待
            console.log('[Optimizer] 页面需要等待渲染...');

            // 等待页面基本加载完成
            await page.waitForFunction(() => {
                return document.readyState === 'complete';
            }, { timeout: timeouts.renderWait });

            // 等待页面内容渲染
            await page.waitForFunction(() => {
                const body = document.body;
                return body && body.scrollHeight > 0;
            }, { timeout: timeouts.contentWait });

            // 检查是否有loading状态
            await page.waitForFunction(() => {
                const loadingElements = document.querySelectorAll('.loading, [data-loading="true"], .spinner, .loader');
                return loadingElements.length === 0;
            }, { timeout: timeouts.loadingWait });

            console.log('[Optimizer] 智能等待完成');
            return true;

        } catch (error) {
            console.log('[Optimizer] 智能等待超时，继续生成PDF...', error.message);
            return false;
        }
    }

    // 优化PDF生成选项
    optimizePDFOptions(options, complexity) {
        const optimizedOptions = { ...options };

        // 根据页面复杂度调整PDF选项
        if (complexity.complexity === 'high') {
            // 高质量设置
            optimizedOptions.printBackground = true;
            optimizedOptions.preferCSSPageSize = true;
        } else if (complexity.complexity === 'low') {
            // 快速设置
            optimizedOptions.printBackground = false;
            optimizedOptions.preferCSSPageSize = false;
        }

        console.log('[Optimizer] PDF选项已优化:', optimizedOptions);
        return optimizedOptions;
    }
}

export default PDFOptimizer; 