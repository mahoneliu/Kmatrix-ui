<script setup lang="ts">
/**
 * MCP 工具预览面板
 * 展示已选 MCP Server 提供的工具列表，支持独立加载/错误状态
 *
 * @author Mahone
 * @date 2026-05-01
 */
import { reactive, watch } from 'vue';
import { NEmpty, NSpin, NTag, NText, NTooltip } from 'naive-ui';
import { fetchMcpServerTools } from '@/service/api/ai/mcp-server';

interface Props {
  /** 已选 MCP Server ID 列表 */
  serverIds: string[];
}

const props = defineProps<Props>();

/** 每个 Server 的工具加载状态 */
interface ServerToolState {
  serverId: string;
  loading: boolean;
  error: string | null;
  tools: Api.Ai.McpToolVo[];
}

// 使用 reactive Map 管理各 Server 的状态
const serverStateMap = reactive<Map<string, ServerToolState>>(new Map());

/** 加载指定 Server 的工具列表 */
async function loadServerTools(serverId: string) {
  // 初始化或重置状态
  serverStateMap.set(serverId, {
    serverId,
    loading: true,
    error: null,
    tools: []
  });

  try {
    const res = await fetchMcpServerTools(serverId);
    const state = serverStateMap.get(serverId);
    if (state) {
      state.loading = false;
      state.tools = res.data ?? [];
    }
  } catch (err: any) {
    const state = serverStateMap.get(serverId);
    if (state) {
      state.loading = false;
      state.error = err?.message ?? '加载失败';
    }
  }
}

/** 监听 serverIds 变化，增量加载/移除 */
watch(
  () => props.serverIds,
  (newIds, oldIds) => {
    const newSet = new Set(newIds);
    const oldSet = new Set(oldIds ?? []);

    // 移除已取消选择的 Server
    for (const id of oldSet) {
      if (!newSet.has(id)) {
        serverStateMap.delete(id);
      }
    }

    // 加载新增的 Server
    for (const id of newSet) {
      if (!oldSet.has(id)) {
        loadServerTools(id);
      }
    }
  },
  { immediate: true, deep: true }
);
</script>

<template>
  <div class="mcp-tool-preview-panel">
    <!-- 无已选 Server 时不显示任何内容 -->
    <template v-if="serverIds.length > 0">
      <div v-for="serverId in serverIds" :key="serverId" class="server-tool-group">
        <template v-if="serverStateMap.has(serverId)">
          <!-- 加载中 -->
          <div v-if="serverStateMap.get(serverId)!.loading" class="flex items-center gap-1 py-1">
            <NSpin :size="12" />
            <NText depth="3" class="text-11px">加载工具中…</NText>
          </div>

          <!-- 加载失败 -->
          <div v-else-if="serverStateMap.get(serverId)!.error" class="py-1">
            <NText type="error" class="text-11px">
              {{ serverStateMap.get(serverId)!.error }}
            </NText>
          </div>

          <!-- 工具列表 -->
          <template v-else-if="serverStateMap.get(serverId)!.tools.length > 0">
            <div class="flex flex-wrap gap-1 py-1">
              <NTooltip
                v-for="tool in serverStateMap.get(serverId)!.tools"
                :key="tool.name"
                placement="top"
                :delay="300"
              >
                <template #trigger>
                  <NTag size="small" :bordered="false" class="tool-tag cursor-default">
                    {{ tool.name }}
                  </NTag>
                </template>
                <span class="text-12px">{{ tool.description || tool.name }}</span>
              </NTooltip>
            </div>
          </template>

          <!-- 工具列表为空 -->
          <div v-else class="py-1">
            <NEmpty description="暂无工具" size="small" />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.mcp-tool-preview-panel {
  width: 100%;
}

.server-tool-group {
  min-height: 24px;
}

.tool-tag {
  font-size: 11px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
