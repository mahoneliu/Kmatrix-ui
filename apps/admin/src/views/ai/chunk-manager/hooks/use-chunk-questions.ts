import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { useMessage } from 'naive-ui';
import {
  addQuestion,
  fetchQuestionPage,
  fetchQuestionsByChunkId,
  generateQuestions,
  linkQuestion,
  unlinkQuestion
} from '@/service/api/ai/knowledge';

interface UseChunkQuestionsOptions {
  documentId: Ref<string | undefined>;
  selectedChunkId: Ref<string | null>;
  kbId: Ref<string | undefined>;
}

export function useChunkQuestions(options: UseChunkQuestionsOptions) {
  const { selectedChunkId, kbId } = options;
  const message = useMessage();

  const questions = ref<Api.AI.KB.Question[]>([]);
  const loadingQuestions = ref(false);
  const generatingQuestions = ref(false);

  // 知识库问题列表(用于下拉选择)
  const kbQuestions = ref<Api.AI.KB.Question[]>([]);
  const kbQuestionOptions = computed(() => {
    return kbQuestions.value.map(q => ({
      label: q.content,
      value: q.id
    }));
  });

  // 分页状态
  const questionPageNum = ref(1);
  const questionPageSize = ref(100);
  const questionTotal = ref(0);
  const questionHasMore = ref(true);
  const loadingMoreQuestions = ref(false);
  const questionSearchKeyword = ref('');

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

  // 加载知识库问题(支持分页和搜索)
  async function loadKbQuestions(reset = false) {
    if (reset) {
      questionPageNum.value = 1;
      kbQuestions.value = [];
      questionHasMore.value = true;
    }

    if (!kbId.value || loadingMoreQuestions.value || !questionHasMore.value) return;

    loadingMoreQuestions.value = true;
    try {
      const { data } = await fetchQuestionPage({
        kbId: kbId.value,
        content: questionSearchKeyword.value || undefined,
        pageNum: questionPageNum.value,
        pageSize: questionPageSize.value
      });

      if (reset) {
        kbQuestions.value = data?.rows || [];
      } else {
        kbQuestions.value.push(...(data?.rows || []));
      }

      questionTotal.value = data?.total || 0;
      questionHasMore.value = kbQuestions.value.length < questionTotal.value;
      questionPageNum.value += 1;
    } finally {
      loadingMoreQuestions.value = false;
    }
  }

  // 搜索问题
  function handleQuestionSearch(keyword: string) {
    questionSearchKeyword.value = keyword;
    loadKbQuestions(true);
  }

  // 滚动加载更多
  function handleQuestionScroll(e: Event) {
    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // 滚动到底部时加载更多
    if (scrollHeight - scrollTop - clientHeight < 50 && questionHasMore.value && !loadingMoreQuestions.value) {
      loadKbQuestions(false);
    }
  }

  async function handleSelectQuestion(val: string | number | null) {
    if (!selectedChunkId.value || !val) return;

    try {
      const { error } = await linkQuestion(selectedChunkId.value, val as string);
      if (error) return;
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
      const existingQuestion = kbQuestions.value.find((q: Api.AI.KB.Question) => q.content === contentStr);

      if (existingQuestion) {
        const { error } = await linkQuestion(selectedChunkId.value, existingQuestion.id);
        if (!error) message.success('关联成功');
      } else {
        const { error } = await addQuestion(selectedChunkId.value, contentStr);
        if (!error) {
          message.success('添加成功');
          await loadKbQuestions(true);
        }
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
      const { error } = await unlinkQuestion(selectedChunkId.value, questionId);
      if (error) return;
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
      const { error } = await generateQuestions(selectedChunkId.value, {
        modelId: params.modelId,
        prompt: params.prompt,
        temperature: params.temperature,
        maxTokens: params.maxTokens
      });
      msg.destroy();
      if (!error) message.success('生成成功');
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
    kbQuestions,
    kbQuestionOptions,
    loadingMoreQuestions,
    questionHasMore,
    newQuestionContent,
    showModelSelectModal,
    loadQuestions,
    loadKbQuestions,
    handleQuestionSearch,
    handleQuestionScroll,
    handleSelectQuestion,
    handleCreateQuestion,
    handleDeleteQuestion,
    handleOpenModelSelect,
    handleGenerateQuestions
  };
}
