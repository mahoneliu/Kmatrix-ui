<script setup lang="ts">
/**
 * MCP Server 连接测试弹窗
 * 打开时自动发起连接测试，展示工具列表或错误信息
 * @author Mahone
 * @date 2026-03-15
 */
import { onBeforeUnmount, ref, watch } from 'vue';
import { NAlert, NEmpty, NList, NListItem, NModal, NSpin, NText, NThing } from 'naive-ui';
import { testMcpConnection } from '@/service/api/ai/mcp-server';

interface Props {
  show: boolean;
  server: Api.Ai.McpServerVo;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:show', val: boolean): void;
}>();

const loading = ref(false);
const tools = ref<Api.Ai.McpToolVo[]>([]);
const errorMessage = ref<string | null>(null);
const elapsedMs = ref<number>(0);

let abortController: AbortController | null = null;

/**
 * 发起连接测试请求
 * 使用 AbortController 支持取消
 */
async function runTest() {
  // 取消上一次未完成的请求
  abortController?.abort();
  abortController = new AbortController();

  loading.value = true;
  tools.value = [];
  errorMessage.value = null;
  elapsedMs.value = 0;

  try {
    const res = await testMcpConnection({ serverId: props.server.serverId });
    // 检查是否已被取消
    if (abortController.signal.aborted) return;

    const data: Api.Ai.McpConnectionTestResultVo = (res as any)?.data ?? res;
    if (data.success) {
      tools.value = data.tools ?? [];
      elapsedMs.value = data.elapsedMs ?? 0;
    } else {
      errorMessage.value = data.errorMessage ?? '连接失败';
    }
  } catch (err: any) {
    if (abortController?.signal.aborted) return;
    errorMessage.value = err?.message ?? '请求异常，请稍后重试';
  } finally {
    if (!abortController?.signal.aborted) {
      loading.value = false;
    }
  }
}

/** 关闭弹窗 */
function handleClose() {
  abortController?.abort();
  abortController = null;
  emit('update:show', false);
}

/** 监听 show 变化，打开时自动发起测试 */
watch(
  () => props.show,
  val => {
    if (val) {
      runTest();
    } else {
      abortController?.abort();
      abortController = null;
    }
  }
);

/** 组件卸载前取消请求 */
onBeforeUnmount(() => {
  abortController?.abort();
  abortController = null;
});
</script>

<template>
  <NModal
    :show="show"
    :title="`测试连接 - ${server.serverName}`"
    preset="card"
    :style="{ width: '560px' }"
    :mask-closable="true"
    @update:show="handleClose"
  >
    <!-- 加载中 -->
    <div v-if="loading" class="flex flex-col items-center justify-center gap-4 py-10">
      <NSpin size="large" />
      <NText depth="3" class="text-14px">正在测试连接，请稍候...</NText>
    </div>

    <!-- 失败提示 -->
    <NAlert v-else-if="errorMessage" type="error" title="连接失败" class="mb-2">
      {{ errorMessage }}
    </NAlert>

    <!-- 成功：工具列表 -->
    <template v-else>
      <!-- 耗时提示 -->
      <div class="mb-3 flex items-center gap-1.5">
        <NText type="success" class="text-14px font-medium">连接成功</NText>
        <NText depth="3" class="text-13px">（耗时 {{ elapsedMs }} ms）</NText>
      </div>

      <!-- 工具数量为 0 时显示空状态 -->
      <NEmpty v-if="tools.length === 0" description="该 MCP Server 暂无可用工具" class="py-6" />

      <!-- 工具列表 -->
      <NList v-else bordered>
        <NListItem v-for="tool in tools" :key="tool.name">
          <NThing>
            <template #header>
              <span class="text-14px font-semibold">{{ tool.name }}</span>
            </template>
            <template v-if="tool.description" #description>
              <NText depth="3" class="text-12px">{{ tool.description }}</NText>
            </template>
          </NThing>
        </NListItem>
      </NList>
    </template>
  </NModal>
</template>

<style scoped></style>
