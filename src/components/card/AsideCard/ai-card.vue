<!--<template>-->
<!--  <Card class="aiCard">-->
<!--    <h2 style="color: var(&#45;&#45;title-color);">-->
<!--      <font-awesome-icon :icon="['fas', 'robot']" style="color: #409eff" />-->
<!--      AI小助手-->
<!--    </h2>-->
<!--    <div class="text">-->
<!--      &lt;!&ndash; 这里添加AI助手的内容 &ndash;&gt;-->
<!--      欢迎使用AI小助手，有什么可以帮助你的吗？-->
<!--    </div>-->
<!--  </Card>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import Card from "@/components/card/BaseCard/card.vue";-->
<!--// 确保导入了font-awesome-icon组件-->
<!--import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';-->
<!--</script>-->

<!--<style scoped>-->
<!--.aiCard {  /* 这里修改为与class一致的样式名 */-->
<!--  height: 115px;-->
<!--}-->
<!--.text {-->
<!--  height: calc(100% - 1.5em - 28px);-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  color: var(&#45;&#45;font-color);-->
<!--  margin-top: 10px;-->
<!--}-->
<!--</style>-->
<template>
  <Card class="aiCard">
    <h2 style="color: var(--title-color);">
      <font-awesome-icon :icon="['fas', 'robot']" style="color: #409eff" />
      AI小助手
    </h2>
    <div class="ai-content">
      <div class="message bot-message">
        你好！有什么可以帮助你的吗？
      </div>

      <div class="input-area">
        <input
            type="text"
            v-model="userInput"
            @keyup.enter="sendMessage"
            placeholder="输入你的问题..."
        >
        <button @click="sendMessage">
          <font-awesome-icon :icon="['fas', 'paper-plane']" />
        </button>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from "@/components/card/BaseCard/card.vue";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// 存储用户输入
const userInput = ref('');
// 存储对话消息
const messages = ref([
  { text: "你好！有什么可以帮助你的吗？", isBot: true }
]);

// 发送消息
const sendMessage = () => {
  if (!userInput.value.trim()) return;

  // 添加用户消息
  messages.value.push({
    text: userInput.value,
    isBot: false
  });

  // 清空输入框
  const userMessage = userInput.value;
  userInput.value = '';

  // 模拟AI回复
  setTimeout(() => {
    messages.value.push({
      text: `我收到了你的消息："${userMessage}"。这是一个模拟回复。`,
      isBot: true
    });

    // 滚动到底部
    scrollToBottom();
  }, 800);

  // 滚动到底部
  scrollToBottom();
};

// 滚动到最新消息
const scrollToBottom = () => {
  const container = document.querySelector('.ai-content .messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
};
</script>

<style scoped>
.aiCard {
  height: 400px;
  display: flex;
  flex-direction: column;
}

.ai-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 2em);
  margin-top: 10px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 10px;
  padding-right: 5px;
}

.message {
  max-width: 85%;
  padding: 8px 12px;
  margin-bottom: 10px;
  border-radius: 8px;
  word-wrap: break-word;
}

.bot-message {
  background-color: #f0f2f5;
  align-self: flex-start;
}

.user-message {
  background-color: #409eff;
  color: white;
  margin-left: auto;
}

.input-area {
  display: flex;
  gap: 8px;
}

.input-area input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.input-area button {
  padding: 8px 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.input-area button:hover {
  background-color: #3688e6;
}
</style>
