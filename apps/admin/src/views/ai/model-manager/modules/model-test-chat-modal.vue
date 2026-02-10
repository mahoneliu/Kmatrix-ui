<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { NButton, NInput, NModal, NScrollbar, useMessage } from 'naive-ui';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { TestModelChatUrl } from '@/service/api/ai/model';
import { useAuthStore } from '@/store/modules/auth'; // Adjust path if needed
import 'highlight.js/styles/github-dark.css';

const props = defineProps<{
  visible: boolean;
  model: Api.AI.Admin.Model | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
}>();

const message = useMessage();
const authStore = useAuthStore();

const inputMessage = ref('');
const loading = ref(false);
const chatHistory = ref<{ role: 'user' | 'assistant'; content: string }[]>([]);
const scrollbarRef = ref<InstanceType<typeof NScrollbar> | null>(null);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch {
        // ignore
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

const formattedHistory = computed(() => {
  return chatHistory.value.map(msg => ({
    ...msg,
    html: md.render(msg.content)
  }));
});

function handleClose() {
  emit('update:visible', false);
  chatHistory.value = [];
  inputMessage.value = '';
}

async function handleSend() {
  if (!inputMessage.value.trim() || !props.model) return;

  const userMsg = inputMessage.value;
  inputMessage.value = '';
  chatHistory.value.push({ role: 'user', content: userMsg });
  loading.value = true;

  // Add placeholder for assistant
  const assistantMsgIndex = chatHistory.value.push({ role: 'assistant', content: '' }) - 1;

  scrollToBottom();

  const ctrl = new AbortController();

  try {
    await fetchEventSource(import.meta.env.VITE_SERVICE_BASE_URL + TestModelChatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        modelId: props.model.modelId,
        message: userMsg,
        stream: true,
        temperature: 0.7, // Default
        maxTokens: 2000 // Default
      }),
      signal: ctrl.signal,
      async onopen(response: Response) {
        if (response.ok) {
          // everything's good
        } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new Error(`Client error: ${response.status}`);
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      },
      onmessage(msg: any) {
        if (msg.event === 'token') {
          chatHistory.value[assistantMsgIndex].content += msg.data;
          scrollToBottom();
        } else if (msg.event === 'error') {
          message.error(msg.data);
          loading.value = false;
          ctrl.abort();
        }
      },
      onclose() {
        loading.value = false;
      },
      onerror(err: any) {
        message.error(`Connection error: ${err.message}`);
        loading.value = false;
        throw err; // rethrow to stop retrying
      }
    });
  } catch {
    loading.value = false;
    // message.error('Failed to send message');
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollbarRef.value) {
      scrollbarRef.value.scrollTo({ top: 99999, behavior: 'smooth' });
    }
  });
}

// Watch visible to reset if needed
watch(
  () => props.visible,
  val => {
    if (val) {
      // maybe focus input
    }
  }
);
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    class="h-[600px] w-[800px]"
    title="模型测试 (Playground)"
    @update:show="handleClose"
  >
    <div class="h-full flex flex-col">
      <div class="mb-2 text-gray-500">
        当前测试模型:
        <span class="text-primary font-bold">{{ model?.modelName }}</span>
        ({{ model?.modelKey }})
      </div>

      <NScrollbar ref="scrollbarRef" class="custom-scrollbar flex-1 border rounded bg-gray-50 p-4">
        <div v-if="chatHistory.length === 0" class="mt-20 text-center text-gray-400">请输入消息开始测试...</div>
        <div
          v-for="(msg, index) in formattedHistory"
          :key="index"
          class="mb-4 flex"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] overflow-hidden rounded-lg p-3 text-sm"
            :class="msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border text-gray-800'"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-if="msg.role === 'assistant'" class="markdown-body" v-html="msg.html"></div>
            <div v-else>{{ msg.content }}</div>
          </div>
        </div>
      </NScrollbar>

      <div class="mt-4 flex gap-2">
        <NInput
          v-model:value="inputMessage"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          placeholder="Ctrl + Enter 发送..."
          :disabled="loading"
          @keydown.enter.ctrl.prevent="handleSend"
        />
        <NButton
          type="primary"
          class="h-auto px-6"
          :loading="loading"
          :disabled="!inputMessage.trim()"
          @click="handleSend"
        >
          发送
        </NButton>
      </div>
    </div>
  </NModal>
</template>

<style scoped>
.custom-scrollbar :deep(.n-scrollbar-rail) {
  right: 2px;
}

:deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.6;
}

:deep(.markdown-body pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
}

:deep(.markdown-body code) {
  font-family:
    ui-monospace,
    SFMono-Regular,
    SF Mono,
    Menlo,
    Consolas,
    Liberation Mono,
    monospace;
}
</style>
