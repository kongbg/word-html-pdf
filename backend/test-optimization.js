import puppeteerManager from './utils/puppeteerManager.js';

// 测试PDF优化功能
console.log('🧪 测试PDF优化功能...\n');

async function testPDFGeneration() {
    try {
        console.log('开始测试PDF生成...');

        // 测试URL
        const testUrl = 'http://localhost:4320/print?id=test';

        // 生成PDF
        const pdfBuffer = await puppeteerManager.generatePdf(testUrl);

        console.log(`✅ PDF生成成功，大小: ${pdfBuffer.length} bytes`);

        // 显示性能统计
        console.log('\n📊 性能统计:');
        console.log('浏览器状态:', puppeteerManager.getStatus());

    } catch (error) {
        console.error('❌ PDF生成失败:', error.message);
    } finally {
        // 清理资源
        await puppeteerManager.cleanup();
    }
}

// 运行测试
testPDFGeneration().then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
}).catch((error) => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
}); 