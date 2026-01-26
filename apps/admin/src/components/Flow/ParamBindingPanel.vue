<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { NButton, NInput, NPopover, useMessage } from 'naive-ui';
import { getTagBackground } from '@/utils/color';
import SvgIcon from '@/components/custom/svg-icon.vue';

const ParamSelector = defineAsyncComponent(() => import('@/components/Flow/ParamSelector.vue'));

interface Props {
  nodeId: string;
  nodeData: Workflow.NodeData;
  inputParams: Workflow.ParamDefinition[];
  outputParams: Workflow.ParamDefinition[];
  bindings: Workflow.ParamBinding[];

  // Custom parameter configuration
  allowCustomInput?: boolean;
  allowCustomOutput?: boolean;
  customInputParams?: Workflow.ParamDefinition[];
  customOutputParams?: Workflow.ParamDefinition[];
}

const props = withDefaults(defineProps<Props>(), {
  allowCustomInput: false,
  allowCustomOutput: false,
  customInputParams: () => [],
  customOutputParams: () => []
});

const emit = defineEmits<{
  'update:bindings': [bindings: Workflow.ParamBinding[]];
  'update:customInputParams': [params: Workflow.ParamDefinition[]];
  'update:customOutputParams': [params: Workflow.ParamDefinition[]];
}>();

const message = useMessage();

// 更新参数绑定
function updateBinding(paramKey: string, binding: Workflow.ParamBinding | undefined) {
  let newBindings: Workflow.ParamBinding[];
  const index = props.bindings.findIndex(b => b.paramKey === paramKey);

  if (binding) {
    // 添加或更新绑定
    if (index >= 0) {
      newBindings = props.bindings.map((b, i) => (i === index ? binding : b));
    } else {
      newBindings = [...props.bindings, binding];
    }
  } else if (index >= 0) {
    // 使用 filter 而不是 splice,确保创建新数组
    newBindings = props.bindings.filter((_, i) => i !== index);
  } else {
    // 没有找到要删除的绑定,保持原样
    newBindings = props.bindings;
  }

  emit('update:bindings', newBindings);
}

// 添加自定义参数(创建空槽位)
function handleAddParam(type: 'input' | 'output') {
  // 问题3修复: 检查是否已存在空键名的参数,如果存在则不允许添加
  const existingParams = type === 'input' ? props.customInputParams : props.customOutputParams;
  const hasEmptyKey = existingParams.some(p => !p.key || p.key.trim() === '');

  if (hasEmptyKey) {
    message.warning('请先完成现有参数的配置');
    return;
  }

  const newParam: Workflow.ParamDefinition = {
    key: '', // 初始键名为空,等待用户输入或自动填充
    label: '未命名参数',
    type: 'string',
    required: false
  };

  if (type === 'input') {
    const newParams = [...props.customInputParams, newParam];
    emit('update:customInputParams', newParams);
  } else {
    const newParams = [...props.customOutputParams, newParam];
    emit('update:customOutputParams', newParams);
  }
}

// 更新自定义参数的键名
function updateCustomParamKey(oldKey: string, newKey: string, type: 'input' | 'output') {
  if (type === 'input') {
    const newParams = props.customInputParams.map(p => (p.key === oldKey ? { ...p, key: newKey } : p));
    emit('update:customInputParams', newParams);

    // 同时更新绑定中的 paramKey - 一次性完成删除和添加
    const binding = props.bindings.find(b => b.paramKey === oldKey);
    if (binding) {
      // 手动构建新的 bindings 数组:删除旧键名的绑定,添加新键名的绑定
      const newBindings = props.bindings
        .filter(b => b.paramKey !== oldKey) // 删除旧绑定
        .concat({ ...binding, paramKey: newKey }); // 添加新绑定
      emit('update:bindings', newBindings);
    }
  } else {
    const newParams = props.customOutputParams.map(p => (p.key === oldKey ? { ...p, key: newKey } : p));
    emit('update:customOutputParams', newParams);

    // 同时更新绑定中的 paramKey - 一次性完成删除和添加
    const binding = props.bindings.find(b => b.paramKey === oldKey);
    if (binding) {
      // 手动构建新的 bindings 数组:删除旧键名的绑定,添加新键名的绑定
      const newBindings = props.bindings
        .filter(b => b.paramKey !== oldKey) // 删除旧绑定
        .concat({ ...binding, paramKey: newKey }); // 添加新绑定
      emit('update:bindings', newBindings);
    }
  }
}

// 复制参数键名
async function copyParamKey(e: Event, key: string) {
  e.stopPropagation();
  const ref = `{${key}}`;

  try {
    await navigator.clipboard.writeText(ref);
    message.success(`已复制: ${ref}`);
  } catch {
    message.error('复制失败,请手动复制');
  }
}

// 处理自定义参数的绑定更新(带自动更新键名)
function handleCustomBindingUpdate(
  paramIndex: number,
  type: 'input' | 'output',
  binding: Workflow.ParamBinding | undefined
) {
  const params = type === 'input' ? props.customInputParams : props.customOutputParams;
  const param = params[paramIndex];

  if (!param) return;

  // 如果选择了参数
  if (binding) {
    const sourceParam = binding.sourceParam;
    // const paramKey = binding.paramKey;
    if (sourceParam) {
      const oldKey = param.key;

      // 问题5修复: 只有在首次选择时(键名为空)才自动更新键名
      if (!oldKey || oldKey.trim() === '') {
        // 首次选择,自动填充键名
        const newParams = params.map((p, i) => (i === paramIndex ? { ...p, key: sourceParam } : p));

        if (type === 'input') {
          emit('update:customInputParams', newParams);
        } else {
          emit('update:customOutputParams', newParams);
        }

        // 使用新键名创建绑定
        const paramKey = sourceParam;
        binding.paramKey = paramKey;
        updateBinding(paramKey, { ...binding, paramKey });
      } else {
        // 非首次选择,键名已存在,直接使用现有键名创建绑定
        updateBinding(oldKey, { ...binding, paramKey: oldKey });
      }
      return;
    }
  }

  // 如果清空选择,移除绑定
  if (param.key) {
    updateBinding(param.key, undefined);
  }
}

// 移除自定义参数
function handleRemoveParam(key: string, type: 'input' | 'output') {
  if (type === 'input') {
    const newParams = props.customInputParams.filter(p => p.key !== key);
    // 问题4修复: 移除绑定关系
    if (props.bindings.some(b => b.paramKey === key)) {
      updateBinding(key, undefined);
    }
    emit('update:customInputParams', newParams);
  } else {
    const newParams = props.customOutputParams.filter(p => p.key !== key);
    // 问题2和4修复: 移除输出参数时也要删除相应的绑定关系
    if (props.bindings.some(b => b.paramKey === key)) {
      updateBinding(key, undefined);
    }
    emit('update:customOutputParams', newParams);
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- 输入参数 -->
    <div
      v-if="inputParams.length > 0 || customInputParams.length > 0 || allowCustomInput"
      class="workflow-config-item-section"
    >
      <div class="flex items-center justify-between">
        <span class="text-12px">输入参数</span>
        <NButton v-if="allowCustomInput" size="tiny" secondary @click="handleAddParam('input')">
          <template #icon>
            <SvgIcon icon="mdi:plus" />
          </template>
        </NButton>
      </div>

      <!-- 固定输入参数 -->
      <div class="flex flex-col gap-1 font-500">
        <div class="flex items-center gap-4">
          <!-- 左侧: 变量名 -->
          <div class="w-100px flex flex-shrink-0 items-center justify-center gap-1 c-gray-5">
            <span class="text-12px font-500">参数名</span>
          </div>

          <!-- 右侧: 参数选择器 -->
          <div class="w-240px flex flex-shrink-0 items-center justify-center gap-1 c-gray-5">
            <span class="text-12px font-500">变量选择</span>
          </div>
        </div>
      </div>

      <div v-for="param in inputParams" :key="param.key" class="flex flex-col gap-1 font-500">
        <!-- 参数行 -->
        <div class="flex items-center gap-4">
          <!-- 左侧: 变量名 (带描述提示) -->
          <div class="clickToCopy w-100px flex flex-shrink-0 items-center justify-start gap-1">
            <NPopover trigger="hover" placement="top">
              <template #trigger>
                <div
                  class="group inline-flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-11px transition-all hover:shadow-sm"
                  :style="{
                    backgroundColor: getTagBackground(nodeData.nodeColor),
                    borderLeft: `1px solid ${nodeData.nodeColor}`
                  }"
                  @click="copyParamKey($event, param.key)"
                >
                  <span class="font-600 font-mono" :style="{ color: nodeData.nodeColor }">{{ param.key }}</span>
                </div>
              </template>
              <div class="max-w-200px text-12px">
                {{ param.description ? param.description : '' }}
                <br />
                点击复制参数 {{ param.key }}
              </div>
            </NPopover>
            <span v-if="param.required" class="c-red-5">*</span>
          </div>

          <!-- 右侧: 参数选择器 -->
          <div class="max-w-240px min-w-0 flex-1 flex-shrink-1">
            <ParamSelector
              :node-id="nodeId"
              :param-def="param"
              :binding="bindings.find(b => b.paramKey === param.key)"
              @update:binding="binding => updateBinding(param.key, binding)"
            />
          </div>
        </div>
      </div>

      <!-- 自定义输入参数 -->
      <div v-for="(param, index) in customInputParams" :key="index" class="flex flex-col gap-1">
        <!-- 参数行 -->
        <div class="flex items-center gap-4">
          <!-- 左侧: 可编辑的变量名 -->
          <div class="w-100px flex-shrink-0">
            <NInput
              class="text-12px"
              :value="param.key"
              size="small"
              placeholder="键名"
              @update:value="val => updateCustomParamKey(param.key, val, 'input')"
            />
          </div>

          <!-- 中间: 参数选择器 -->
          <div class="min-w-0 flex-1">
            <ParamSelector
              :node-id="nodeId"
              :param-def="param"
              :binding="bindings.find(b => b.paramKey === param.key)"
              @update:binding="binding => handleCustomBindingUpdate(index, 'input', binding)"
            />
          </div>

          <!-- 右侧: 删除按钮 -->
          <NButton secondary size="tiny" @click="handleRemoveParam(param.key, 'input')">
            <template #icon>
              <SvgIcon icon="mdi:minus" />
            </template>
          </NButton>
        </div>
      </div>
    </div>

    <!-- 输出参数 -->
    <div
      v-if="outputParams.length > 0 || customOutputParams.length > 0 || allowCustomOutput"
      class="workflow-config-item-section"
    >
      <div class="flex items-center justify-between">
        <span class="text-12px">输出参数</span>
        <NButton v-if="allowCustomOutput" size="tiny" secondary @click="handleAddParam('output')">
          <template #icon>
            <SvgIcon icon="mdi:plus" />
          </template>
        </NButton>
      </div>

      <div class="flex flex-col gap-2">
        <!-- 固定输出参数 - 使用 ParamTag 展示 -->
        <div v-if="outputParams.length > 0" class="flex flex-col gap-1.5">
          <!-- <div class="text-11px c-gray-5 font-600">系统输出</div> -->
          <div class="min-w-full w-0 flex flex-wrap gap-1.5">
            <ParamTag
              v-for="param in outputParams"
              :key="param.key"
              :param="param"
              source-type="node"
              :node-data="nodeData"
            />
          </div>
        </div>

        <!-- 自定义输出参数 -->
        <div v-for="(param, index) in customOutputParams" :key="index" class="flex flex-col gap-1">
          <!--
 <div class="flex items-center justify-between text-11px c-gray-5 font-600">
            <span>自定义输出</span>
            <NButton v-if="allowCustomOutput" size="tiny" secondary @click="handleAddParam('output')">
              <template #icon>
                <SvgIcon icon="mdi:plus" />
              </template>
            </NButton>
          </div> 
-->

          <!-- 参数行 -->
          <div class="flex items-center gap-3">
            <!-- 左侧: 可编辑的变量名 -->
            <div class="w-80px flex-shrink-0">
              <NInput
                class="text-12px"
                :value="param.key"
                size="small"
                placeholder="键名"
                @update:value="val => updateCustomParamKey(param.key, val, 'output')"
              />
            </div>

            <!-- 中间: 参数选择器 -->
            <div class="min-w-0 flex-1">
              <ParamSelector
                :node-id="nodeId"
                :param-def="param"
                :binding="bindings.find(b => b.paramKey === param.key)"
                @update:binding="binding => handleCustomBindingUpdate(index, 'output', binding)"
              />
            </div>

            <!-- 右侧: 删除按钮 -->
            <NButton secondary size="tiny" @click="handleRemoveParam(param.key, 'output')">
              <SvgIcon icon="mdi:minus" />
            </NButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 添加点击反馈 */
.clickToCopy:active {
  transform: scale(0.9);
}
</style>
