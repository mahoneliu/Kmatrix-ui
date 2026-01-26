<!-- <script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import type { NodeProps } from '@vue-flow/core';
import { useNodeDefinitionStore } from '@/store/modules/node-definition';
import { useWorkflowStore } from '@/store/modules/workflow';
import BaseNode from './BaseNode.vue';

const ParamSelector = defineAsyncComponent(() => import('@/components/Flow/ParamSelector.vue'));

const props = defineProps<NodeProps>();
const workflowStore = useWorkflowStore();
const nodeDefinitionStore = useNodeDefinitionStore();

// Get definition for this node type
const nodeDef = computed(() => nodeDefinitionStore.getNodeDefinition(props.data.nodeType));

// Input params from definition
const inputParams = computed(() => {
  if (!nodeDef.value?.inputParams) return [];
  return nodeDef.value.inputParams.map(param => ({
    key: param.key,
    label: param.label,
    type: param.type as Workflow.ParamDataType,
    required: param.required,
    defaultValue: param.defaultValue,
    description: param.description
  }));
});

// Bindings stored in node data
const paramBindings = computed({
  get: () => (props.data.paramBindings as Workflow.ParamBinding[]) || [],
  set: newBindings => {
    workflowStore.updateNode(props.id, {
      ...workflowStore.nodes.find(n => n.id === props.id),
      data: {
        ...props.data,
        paramBindings: newBindings
      }
    });
  }
});

function updateBinding(paramKey: string, binding: Workflow.ParamBinding | null) {
  const bindings = [...paramBindings.value];
  const index = bindings.findIndex(b => b.paramKey === paramKey);

  if (binding) {
    if (index >= 0) {
      bindings[index] = binding;
    } else {
      bindings.push(binding);
    }
  } else if (index >= 0) {
    bindings.splice(index, 1);
  }

  paramBindings.value = bindings;
}
</script>

<template>
  <BaseNode v-bind="props" :data="{ ...data, icon: nodeDef?.nodeIcon || data.icon }">
    <div class="max-w-300px min-w-200px flex flex-col gap-2">
      <div v-if="nodeDef?.description" class="mb-2 text-xs text-gray-500">
        {{ nodeDef.description }}
      </div>

      <div v-if="inputParams.length > 0" class="flex flex-col gap-2 b-t b-gray-1 pt-2 dark:b-gray-7">
        <div class="text-xs text-gray-600 font-bold dark:text-gray-400">INPUTS</div>

        <div v-for="param in inputParams" :key="param.key" class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <label class="text-xs text-gray-700 font-medium dark:text-gray-300">
              {{ param.label }}
              <span v-if="param.required" class="text-red-500">*</span>
            </label>
            <span class="rounded bg-gray-100 px-1 text-[10px] text-gray-400 dark:bg-gray-800">
              {{ param.type }}
            </span>
          </div>

          <ParamSelector
            :node-id="props.id"
            :param-def="param"
            :binding="paramBindings.find(b => b.paramKey === param.key) || undefined"
            @update:binding="(b: Workflow.ParamBinding | null | undefined) => updateBinding(param.key, b || null)"
          />
        </div>
      </div>

      <div v-if="nodeDef?.outputParams?.length" class="mt-1 flex flex-col gap-1 b-t b-gray-1 pt-2 dark:b-gray-7">
        <div class="text-xs text-gray-600 font-bold dark:text-gray-400">OUTPUTS</div>
        <div
          v-for="out in nodeDef.outputParams"
          :key="out.key"
          class="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300"
        >
          <span>{{ out.label }}</span>
          <span class="rounded bg-gray-100 px-1 text-[10px] text-gray-400 dark:bg-gray-800">{{ out.type }}</span>
        </div>
      </div>
    </div>
  </BaseNode>
</template>

<style scoped></style> -->
