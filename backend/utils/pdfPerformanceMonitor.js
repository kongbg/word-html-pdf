import fs from 'fs';
import path from 'path';

class PDFPerformanceMonitor {
    constructor() {
        this.logs = [];
        this.startTime = null;
    }

    // 开始监控
    start() {
        this.startTime = Date.now();
        this.logs = [];
        console.log(`[Monitor] 开始PDF性能监控: ${new Date().toISOString()}`);
    }

    // 记录时间点
    mark(stage, description = '') {
        const timestamp = Date.now();
        const elapsed = this.startTime ? timestamp - this.startTime : 0;

        const log = {
            stage,
            description,
            timestamp,
            elapsed,
            time: new Date().toISOString()
        };

        this.logs.push(log);
        console.log(`[Monitor] ${stage}: ${description} (耗时: ${elapsed}ms)`);

        return log;
    }

    // 获取性能报告
    getReport() {
        if (this.logs.length === 0) {
            return { message: '没有性能数据' };
        }

        const totalTime = this.logs[this.logs.length - 1].elapsed;
        const stages = {};

        // 计算每个阶段的耗时
        for (let i = 0; i < this.logs.length; i++) {
            const current = this.logs[i];
            const previous = i > 0 ? this.logs[i - 1] : null;

            const stageTime = previous ? current.elapsed - previous.elapsed : current.elapsed;
            const percentage = ((stageTime / totalTime) * 100).toFixed(2);

            stages[current.stage] = {
                time: stageTime,
                percentage,
                description: current.description
            };
        }

        // 找出耗时最长的阶段
        const slowestStage = Object.entries(stages).reduce((max, [stage, data]) => {
            return data.time > max.time ? { stage, ...data } : max;
        }, { stage: '', time: 0, percentage: 0 });

        return {
            totalTime,
            stages,
            slowestStage,
            logCount: this.logs.length,
            startTime: this.logs[0]?.time,
            endTime: this.logs[this.logs.length - 1]?.time
        };
    }

    // 打印性能报告
    printReport() {
        const report = this.getReport();

        console.log('\n' + '='.repeat(60));
        console.log('📊 PDF生成性能报告');
        console.log('='.repeat(60));

        if (report.message) {
            console.log(report.message);
            return;
        }

        console.log(`总耗时: ${report.totalTime}ms`);
        console.log(`开始时间: ${report.startTime}`);
        console.log(`结束时间: ${report.endTime}`);
        console.log(`记录阶段数: ${report.logCount}`);

        console.log('\n各阶段耗时:');
        console.log('-'.repeat(40));

        Object.entries(report.stages).forEach(([stage, data]) => {
            console.log(`${stage.padEnd(20)}: ${data.time.toString().padStart(6)}ms (${data.percentage}%)`);
            if (data.description) {
                console.log(`  └─ ${data.description}`);
            }
        });

        console.log('\n性能瓶颈:');
        console.log('-'.repeat(40));
        console.log(`最慢阶段: ${report.slowestStage.stage} (${report.slowestStage.time}ms, ${report.slowestStage.percentage}%)`);

        // 性能建议
        console.log('\n性能建议:');
        console.log('-'.repeat(40));
        if (report.slowestStage.percentage > 50) {
            console.log(`⚠️  ${report.slowestStage.stage} 阶段占用了 ${report.slowestStage.percentage}% 的时间，建议优化`);
        }

        if (report.totalTime > 10000) {
            console.log('⚠️  PDF生成总耗时超过10秒，建议检查网络或页面复杂度');
        }

        if (report.totalTime < 3000) {
            console.log('✅ PDF生成性能良好');
        }

        console.log('='.repeat(60) + '\n');
    }

    // 保存性能日志到文件
    saveLogs(filename = null) {
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `pdf-performance-${timestamp}.json`;
        }

        const logPath = path.join(process.cwd(), 'logs', filename);

        // 确保logs目录存在
        const logsDir = path.dirname(logPath);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        const logData = {
            timestamp: new Date().toISOString(),
            report: this.getReport(),
            logs: this.logs
        };

        fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
        console.log(`[Monitor] 性能日志已保存到: ${logPath}`);

        return logPath;
    }

    // 重置监控器
    reset() {
        this.logs = [];
        this.startTime = null;
    }
}

// 创建单例实例
const pdfPerformanceMonitor = new PDFPerformanceMonitor();

export default pdfPerformanceMonitor; 