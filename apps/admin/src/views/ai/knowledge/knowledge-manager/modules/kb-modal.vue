<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { NButton, NForm, NFormItem, NInput, NModal, NSelect, NSpace, useMessage } from 'naive-ui';
import type { FormInst, FormRules } from 'naive-ui';
import { addKnowledgeBase, fetchKnowledgeBaseConfig, updateKnowledgeBase } from '@/service/api/ai/knowledge';
import { fetchModelList } from '@/service/api/ai/model';
import { $t } from '@/locales';

interface Props {
  visible?: boolean;
  data?: Api.AI.KB.KnowledgeBase | null;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  data: null
});

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const message = useMessage();
const formRef = ref<FormInst | null>(null);
const submitting = ref(false);

const isEdit = computed(() => Boolean(props.data?.id));

const formData = ref<Partial<Api.AI.KB.KnowledgeBase>>({
  name: '',
  description: '',
  permissionLevel: 'PRIVATE',
  embeddingModelId: null
});

const unifiedEmbeddingModel = ref(true);
const modelOptions = ref<Array<{ label: string; value: number }>>([]);

async function loadConfigAndModels() {
  try {
    const [configRes, modelRes] = await Promise.all([fetchKnowledgeBaseConfig(), fetchModelList({ modelType: '2' })]);
    if (!configRes.error && configRes.data) {
      unifiedEmbeddingModel.value = configRes.data.unifiedEmbeddingModel;
    }
    if (!modelRes.error && modelRes.data) {
      modelOptions.value = modelRes.data.map(m => ({ label: m.modelName, value: m.modelId as number }));
    }
  } catch {
    // Failed to load KB config or models
  }
}

const rules: FormRules = {
  name: [
    { required: true, message: $t('ai.knowledge_manager.modal.nameRequired'), trigger: 'blur' },
    { max: 50, message: $t('ai.knowledge_manager.modal.nameMaxLength'), trigger: 'blur' }
  ],
  embeddingModelId: [
    {
      required: true,
      validator: (_rule, value) => {
        if (!unifiedEmbeddingModel.value && !value) {
          return new Error($t('ai.knowledge_manager.modal.embeddingModelRequired'));
        }
        return true;
      },
      trigger: ['blur', 'change'],
      message: $t('ai.knowledge_manager.modal.embeddingModelRequired')
    }
  ]
};

watch(
  () => props.visible,
  val => {
    if (val) {
      loadConfigAndModels();
      if (props.data) {
        formData.value = {
          id: props.data.id,
          name: props.data.name,
          description: props.data.description,
          permissionLevel: props.data.permissionLevel || 'PRIVATE',
          embeddingModelId: (props.data as any).embeddingModelId || null
        };
      } else {
        formData.value = {
          name: '',
          description: '',
          permissionLevel: 'PRIVATE',
          embeddingModelId: null
        };
      }
    }
  }
);

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }

  submitting.value = true;
  try {
    if (isEdit.value) {
      await updateKnowledgeBase(formData.value);
      message.success($t('ai.knowledge_manager.modal.updateSuccess'));
    } else {
      await addKnowledgeBase(formData.value);
      message.success($t('ai.knowledge_manager.modal.addSuccess'));
    }
    emit('success');
    emit('update:visible', false);
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  emit('cancel');
  emit('update:visible', false);
}
</script>

<template>
  <NModal
    :show="visible"
    preset="card"
    :title="isEdit ? $t('ai.knowledge_manager.modal.edit') : $t('ai.knowledge_manager.createKnowledgeBase')"
    class="w-500px"
    :mask-closable="false"
    @update:show="val => emit('update:visible', val)"
  >
    <NForm ref="formRef" :model="formData" :rules="rules" label-placement="left" label-width="80">
      <NFormItem :label="$t('ai.knowledge_manager.modal.name')" path="name">
        <NInput
          v-model:value="formData.name"
          :placeholder="$t('ai.knowledge_manager.modal.namePlaceholder')"
          maxlength="50"
        />
      </NFormItem>
      <NFormItem :label="$t('ai.knowledge_manager.modal.description')" path="description">
        <NInput
          v-model:value="formData.description"
          type="textarea"
          :placeholder="$t('ai.knowledge_manager.modal.descPlaceholder')"
          :rows="3"
          maxlength="200"
        />
      </NFormItem>
      <NFormItem
        v-if="!unifiedEmbeddingModel"
        :label="$t('ai.knowledge_manager.modal.embeddingModel')"
        path="embeddingModelId"
      >
        <div class="w-full flex flex-col gap-2">
          <NSelect
            v-model:value="formData.embeddingModelId"
            :options="modelOptions"
            :placeholder="$t('ai.knowledge_manager.modal.embeddingModelPlaceholder')"
            :disabled="isEdit"
          />
          <div
            v-if="isEdit"
            class="group select-none border-l-3 border-primary/40 rounded-r-lg bg-primary/4 px-3 py-2 transition-all duration-300 dark:bg-primary/10 hover:bg-primary/8"
          >
            <div class="flex items-start gap-2.5">
              <icon-mdi-information-outline
                class="mt-0.5 shrink-0 text-16px text-primary opacity-80 transition-transform duration-300 group-hover:scale-110"
              />
              <span class="text-12px text-primary/70 font-medium leading-relaxed italic dark:text-primary/90">
                {{ $t('ai.knowledge_manager.modal.embeddingModelEditTip') }}
              </span>
            </div>
          </div>
        </div>
      </NFormItem>
      <!--
 <NFormItem label="权限" path="permissionLevel">
        <NSelect v-model:value="formData.permissionLevel" :options="permissionOptions" placeholder="选择权限级别" />
      </NFormItem> 
-->
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleCancel">{{ $t('ai.knowledge_manager.modal.cancel') }}</NButton>
        <NButton type="primary" :loading="submitting" @click="handleSubmit">
          {{ isEdit ? $t('ai.knowledge_manager.modal.save') : $t('ai.knowledge_manager.modal.create') }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>
