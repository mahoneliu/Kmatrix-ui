<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

const ParamSelector = defineAsyncComponent(() => import('@/components/Flow/ParamSelector.vue'));

interface Props {
  nodeId: string;
  inputParams: Workflow.ParamDefinition[];
  outputParams: Array<{ key: string; label: string; type: string }>;
  bindings: Workflow.ParamBinding[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:bindings': [bindings: Workflow.ParamBinding[]];
}>();

// 更新参数绑定
function updateBinding(paramKey: string, binding: Workflow.ParamBinding | undefined) {
  const newBindings = [...props.bindings];
  const index = newBindings.findIndex(b => b.paramKey === paramKey);

  if (binding) {
    if (index >= 0) {
      newBindings[index] = binding;
    } else {
      newBindings.push(binding);
    }
  } else if (index >= 0) {
    newBindings.splice(index, 1);
  }

  emit('update:bindings', newBindings);
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <!-- 输入参数 -->
    <div v-if="inputParams.length > 0" class="flex flex-col gap-3">
      <div class="border-b border-gray-200 pb-1 text-13px font-500 dark:border-gray-700">输入参数</div>
      <div class="mb-1 text-12px c-gray-5">配置节点输入参数的来源</div>

      <div v-for="param in inputParams" :key="param.key" class="flex flex-col gap-1.5">
        <label class="text-12px font-500">
          {{ param.label }}
          <span v-if="param.required" class="ml-0.5 c-red-5">*</span>
        </label>
        <ParamSelector
          :node-id="nodeId"
          :param-def="param"
          :binding="bindings.find(b => b.paramKey === param.key)"
          @update:binding="binding => updateBinding(param.key, binding)"
        />
        <div v-if="param.description" class="text-11px c-gray-5">{{ param.description }}</div>
      </div>
    </div>

    <!-- 输出参数 -->
    <div v-if="outputParams.length > 0" class="flex flex-col gap-3">
      <div class="border-b border-gray-200 pb-1 text-13px font-500 dark:border-gray-700">输出参数</div>
      <div class="flex flex-col gap-2">
        <div v-for="param in outputParams" :key="param.key" class="text-12px">
          <span class="font-500">{{ param.label }}</span>
          <span class="mx-1 c-gray-5">·</span>
          <code class="rounded bg-gray-100 px-1 py-0.5 text-11px font-mono dark:bg-gray-700">{{ param.key }}</code>
          <span class="mx-1 c-gray-5">·</span>
          <span class="text-11px c-gray-6">{{ param.type }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
