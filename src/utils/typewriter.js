// 创建打字机效果类来管理timer和状态
class TypeWriter {
    constructor() {
        this.timers = [];
        this.isRunning = false;
    }

    // 清理所有timer
    clear() {
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
        this.isRunning = false;
    }

    // 添加timer到管理列表
    addTimer(timer) {
        this.timers.push(timer);
    }

    // 开始打字机效果
    start(text, text2, textContainer) {
        // 清理之前的效果
        this.clear();

        // 重置文本容器
        textContainer.value = "";
        this.isRunning = true;

        const typeText = (index) => {
            if (!this.isRunning) return;

            if (index < text.length) {
                textContainer.value += text.charAt(index);
                index++;
                const timer = setTimeout(() => {
                    typeText(index);
                }, 150); // 打字机速度,150ms打一个字
                this.addTimer(timer);
            } else {
                const timer = setTimeout(() => {
                    deleteText(text.length);
                }, 1000); // 打完字后删除字的停顿时间
                this.addTimer(timer);
            }
        };

        const deleteText = (index) => {
            if (!this.isRunning) return;

            if (index >= 0) {
                textContainer.value = text.substring(0, index);
                index--;
                const timer = setTimeout(() => {
                    deleteText(index);
                }, 100); // 删除速度，100ms删除一个字
                this.addTimer(timer);
            } else {
                const timer = setTimeout(() => {
                    typeText2(0);
                }, 1000); // 删除完字后打第二段字的停顿时间
                this.addTimer(timer);
            }
        };

        const typeText2 = (index) => {
            if (!this.isRunning) return;

            if (index < text2.length) {
                textContainer.value += text2.charAt(index);
                index++;
                const timer = setTimeout(() => {
                    typeText2(index);
                }, 150);
                this.addTimer(timer);
            }
        };

        typeText(0);
    }
}

// 创建全局实例
const typeWriterInstance = new TypeWriter();

// 导出启动函数和清理函数
export const startTypeWriter = (text, text2, textContainer) => {
    typeWriterInstance.start(text, text2, textContainer);
};

export const clearTypeWriter = () => {
    typeWriterInstance.clear();
};

// 保持向后兼容
export default startTypeWriter;