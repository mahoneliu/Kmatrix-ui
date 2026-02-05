import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { useMessage } from 'naive-ui';
import {
  addQuestion,
  fetchQuestionsByChunkId,
  fetchQuestionsByDocumentId,
  generateQuestions,
  linkQuestion,
  unlinkQuestion
} from '@/service/api/ai/knowledge';

interface UseChunkQuestionsOptions {
  documentId: Ref<string | undefined>;
  selectedChunkId: Ref<string | null>;
}

export function useChunkQuestions(options: UseChunkQuestionsOptions) {
  const { documentId, selectedChunkId } = options;
  const message = useMessage();

  const questions = ref<Api.AI.KB.Question[]>([]);
  const loadingQuestions = ref(false);
  const generatingQuestions = ref(false);

  const documentQuestions = ref<Api.AI.KB.Question[]>([]);
  const documentQuestionOptions = computed(() => {
    return Array.from(documentQuestions.value.values()).map(q => ({
      label: q.content,
      value: q.id
    }));
  });

  const newQuestionContent = ref<string | number | null>(null);

  async function loadQuestions(chunkId: string) {
    loadingQuestions.value = true;
    try {
      const { data } = await fetchQuestionsByChunkId(chunkId);
      questions.value = data || [];
    } finally {
      loadingQuestions.value = false;
    }
  }

  async function loadDocumentQuestions() {
    if (!documentId.value) return;
    const { data } = await fetchQuestionsByDocumentId(documentId.value);
    documentQuestions.value = data || [];
  }

  async function handleSelectQuestion(val: string | number | null) {
    if (!selectedChunkId.value || !val) return;

    try {
      await linkQuestion(selectedChunkId.value, val as string);
      message.success('关联成功');
      newQuestionContent.value = null;
      await loadQuestions(selectedChunkId.value);
    } catch {
      message.error('操作失败');
    }
  }

  async function handleCreateQuestion(event: KeyboardEvent) {
    const inputElement = event.target as HTMLInputElement;
    const content = inputElement.value;

    if (!selectedChunkId.value || !content) return;

    const contentStr = String(content).trim();
    if (!contentStr) return;

    try {
      const existingQuestion = documentQuestions.value.find(q => q.content === contentStr);

      if (existingQuestion) {
        await linkQuestion(selectedChunkId.value, existingQuestion.id);
        message.success('关联成功');
      } else {
        await addQuestion(selectedChunkId.value, contentStr);
        message.success('添加成功');
        await loadDocumentQuestions();
      }

      newQuestionContent.value = null;
      await loadQuestions(selectedChunkId.value);
    } catch {
      message.error('操作失败');
    }
  }

  async function handleDeleteQuestion(questionId: string | number) {
    if (!selectedChunkId.value) return;
    try {
      await unlinkQuestion(selectedChunkId.value, questionId);
      message.success('已取消关联');
      await loadQuestions(selectedChunkId.value);
    } catch {
      message.error('操作失败');
    }
  }

  // 模型选择弹窗状态
  const showModelSelectModal = ref(false);

  // 打开模型选择弹窗
  function handleOpenModelSelect() {
    showModelSelectModal.value = true;
  }

  // 生成问题(带模型参数)
  async function handleGenerateQuestions(params: {
    modelId: CommonType.IdType;
    prompt: string;
    temperature: number;
    maxTokens: number;
  }) {
    if (!selectedChunkId.value) return;
    generatingQuestions.value = true;
    const msg = message.loading('AI 正在生成问题,请稍候...', { duration: 0 });
    try {
      await generateQuestions(selectedChunkId.value, {
        modelId: params.modelId,
        prompt: params.prompt,
        temperature: params.temperature,
        maxTokens: params.maxTokens
      });
      msg.destroy();
      message.success('生成成功');
      await loadQuestions(selectedChunkId.value);
    } catch {
      msg.destroy();
      message.error('生成失败');
    } finally {
      generatingQuestions.value = false;
    }
  }

  return {
    questions,
    loadingQuestions,
    generatingQuestions,
    documentQuestions,
    documentQuestionOptions,
    newQuestionContent,
    showModelSelectModal,
    loadQuestions,
    loadDocumentQuestions,
    handleSelectQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    handleOpenModelSelect,
    handleGenerateQuestions
  };
}
