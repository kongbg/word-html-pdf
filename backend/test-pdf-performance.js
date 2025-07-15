import pdfPerformanceMonitor from './utils/pdfPerformanceMonitor.js';

// 测试性能监控功能
console.log('🧪 测试PDF性能监控功能...\n');

// 模拟PDF生成过程
pdfPerformanceMonitor.start();

// 模拟各个阶段
setTimeout(() => {
    pdfPerformanceMonitor.mark('Navigation_Start', '导航到页面');
}, 100);

setTimeout(() => {
    pdfPerformanceMonitor.mark('Navigation_Complete', '页面导航完成');
}, 800);

setTimeout(() => {
    pdfPerformanceMonitor.mark('Wait_Start', '等待页面加载');
}, 1000);

setTimeout(() => {
    pdfPerformanceMonitor.mark('Wait_Complete', '页面加载完成');
}, 1500);

setTimeout(() => {
    pdfPerformanceMonitor.mark('Render_Start', '等待页面渲染');
}, 1600);

setTimeout(() => {
    pdfPerformanceMonitor.mark('Render_Complete', '页面渲染完成');
}, 2500);

setTimeout(() => {
    pdfPerformanceMonitor.mark('PDF_Generation_Start', '开始生成PDF');
}, 2600);

setTimeout(() => {
    pdfPerformanceMonitor.mark('PDF_Generation_Complete', 'PDF生成完成');
}, 4000);

setTimeout(() => {
    pdfPerformanceMonitor.mark('Buffer_Conversion_Start', '转换为Buffer');
}, 4100);

setTimeout(() => {
    pdfPerformanceMonitor.mark('Buffer_Conversion_Complete', 'Buffer转换完成');
}, 4200);

setTimeout(() => {
    pdfPerformanceMonitor.mark('Task_Complete', '任务完成');

    // 打印性能报告
    pdfPerformanceMonitor.printReport();

    // 保存日志
    const logPath = pdfPerformanceMonitor.saveLogs();
    console.log(`\n✅ 测试完成，日志已保存到: ${logPath}`);
}, 4300); 