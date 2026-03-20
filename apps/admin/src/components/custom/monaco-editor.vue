<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as monaco from 'monaco-editor';

/**
 * Monaco Editor Wrapper Component
 */
defineOptions({ name: 'MonacoEditor' });

interface Props {
  value: string;
  language?: string;
  theme?: string;
  height?: number | string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'python',
  theme: 'vs-dark',
  height: '400px',
  readonly: false
});

const emit = defineEmits<{
  (e: 'update:value', val: string): void;
  (e: 'change', val: string): void;
}>();

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

const containerStyle = ref({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  width: '100%',
  border: '1px solid #d9d9d9',
  borderRadius: '4px',
  overflow: 'hidden'
});

onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: props.value,
      language: props.language,
      theme: props.theme,
      readOnly: props.readonly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 4
    });

    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || '';
      emit('update:value', value);
      emit('change', value);
    });
  }
});

onUnmounted(() => {
  if (editor) {
    editor.dispose();
  }
});

watch(
  () => props.value,
  val => {
    if (editor && val !== editor.getValue()) {
      editor.setValue(val);
    }
  }
);

watch(
  () => props.language,
  val => {
    if (editor && val) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, val);
      }
    }
  }
);

watch(
  () => props.theme,
  val => {
    if (val) {
      monaco.editor.setTheme(val);
    }
  }
);
</script>

<template>
  <div ref="editorContainer" :style="containerStyle"></div>
</template>

<style scoped></style>
