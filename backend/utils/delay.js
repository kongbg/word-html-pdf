/**
 * 通用延时函数
 * @param {number} ms - 延时毫秒数
 * @returns {Promise} 延时Promise
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 带条件的延时函数
 * @param {number} ms - 延时毫秒数
 * @param {Function} condition - 条件函数，返回true时提前结束延时
 * @param {number} checkInterval - 检查间隔，默认100ms
 * @returns {Promise} 延时Promise
 */
export const delayUntil = (ms, condition, checkInterval = 100) => {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const check = () => {
            if (condition()) {
                resolve();
                return;
            }

            if (Date.now() - startTime >= ms) {
                resolve();
                return;
            }

            setTimeout(check, checkInterval);
        };

        check();
    });
};

/**
 * 指数退避延时函数
 * @param {number} baseDelay - 基础延时毫秒数
 * @param {number} maxDelay - 最大延时毫秒数
 * @param {number} factor - 退避因子，默认2
 * @returns {Function} 返回一个函数，每次调用返回递增的延时时间
 */
export const createExponentialBackoff = (baseDelay = 1000, maxDelay = 30000, factor = 2) => {
    let currentDelay = baseDelay;
    let attempt = 0;

    return () => {
        const delay = Math.min(currentDelay, maxDelay);
        currentDelay *= factor;
        attempt++;
        return { delay, attempt };
    };
};

export default delay; 