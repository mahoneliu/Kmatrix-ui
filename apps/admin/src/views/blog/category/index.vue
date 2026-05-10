<script setup lang="ts">
import { computed, h, onMounted, ref, watch } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NDivider,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  NTag,
  NText,
  NTooltip,
  useDialog,
  useMessage
} from 'naive-ui';
import type { DataTableColumns, FormInst } from 'naive-ui';
import { SvgIcon } from '@sa/materials';
import { fetchAllKnowledgeBases, fetchDatasetsByKbId } from '@/service/api/ai/knowledge';
import {
  createBlogCategory,
  createGitCategory,
  deleteBlogCategory,
  fetchBlogCategoryTree,
  updateBlogCategory,
  updateGitCategory
} from '@/service/api/blog';

const message = useMessage();
const dialog = useDialog();

// ========== 分类树数据 ==========
const loading = ref(false);
const treeData = ref<Api.Blog.Category[]>([]);

async function loadData() {
  loading.value = true;
  try {
    const { data } = await fetchBlogCategoryTree();
    if (data) treeData.value = data;
  } finally {
    loading.value = false;
  }
}

// ========== 知识库 & 数据集联动 ==========
const kbList = ref<Api.AI.KB.KnowledgeBase[]>([]);
const kbLoading = ref(false);
const datasetList = ref<Api.AI.KB.Dataset[]>([]);
const datasetLoading = ref(false);

const selectedKbId = ref<CommonType.IdType | null>(null);
const selectedDatasetId = ref<CommonType.IdType | null>(null);

const kbOptions = computed(() => kbList.value.map(kb => ({ label: kb.name, value: kb.id as CommonType.IdType })));

const datasetOptions = computed(() =>
  datasetList.value.map(ds => ({
    label: ds.name,
    value: ds.id as CommonType.IdType,
    count: ds.documentCount ?? 0
  }))
);

async function loadKbList() {
  kbLoading.value = true;
  try {
    const { data } = await fetchAllKnowledgeBases();
    kbList.value = data || [];
  } finally {
    kbLoading.value = false;
  }
}

async function loadDatasets(kbId: CommonType.IdType, restoreId?: CommonType.IdType) {
  datasetLoading.value = true;
  datasetList.value = [];
  // 如果没有指定要恢复的 ID，则清空当前选中的数据集
  if (!restoreId) {
    selectedDatasetId.value = null;
  }
  try {
    const { data } = await fetchDatasetsByKbId(kbId);
    datasetList.value = data || [];
    // 如果有指定要恢复的 ID，确保它在列表中
    if (restoreId) {
      selectedDatasetId.value = restoreId;
    }
  } finally {
    datasetLoading.value = false;
  }
}

watch(selectedKbId, (val, oldVal) => {
  // 如果是从有值变更为另一个不同的值，或者是手动清空
  if (val && val !== oldVal) {
    // 如果已经在 loadDatasets 中处理了，这里可能不需要重复调用
    // 但为了保险，如果是手动切换（非 openEditModal 内部触发），我们需要清理
    if (datasetList.value.length === 0 || datasetList.value[0]?.kbId !== val) {
      loadDatasets(val);
    }
  } else if (!val) {
    datasetList.value = [];
    selectedDatasetId.value = null;
  }
});

// ========== 弹窗状态 ==========
type CategoryType = 'online' | 'git';

const modalVisible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInst | null>(null);

const editingId = ref<CommonType.IdType | null>(null);
const isEditing = computed(() => editingId.value !== null);
const categoryType = ref<CategoryType>('online');
const isTopicNode = ref(false);

// ========== 表单数据 ==========
const commonData = ref({
  name: '',
  path: '',
  orderNum: 0,
  topicSlug: ''
});

// 在线创建专属
const onlineExtra = ref({
  parentId: 0 as CommonType.IdType,
  customDomain: ''
});

// Git 专题专属
const gitExtra = ref({
  repoUrl: '',
  gitOwner: '',
  gitRepo: '',
  gitBranch: 'main',
  gitRootPath: '',
  gitToken: ''
});

const gitHasExistingToken = ref(false);
const gitTokenPlaceholder = computed(() =>
  isEditing.value && gitHasExistingToken.value
    ? '已配置（留空则不修改，填写则覆盖）'
    : '请输入 GitHub Personal Access Token'
);

// ========== 表单校验 ==========
const formRules = computed(() => {
  const base = {
    name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
    path: [{ required: true, message: '请输入分类路径', trigger: 'blur' }]
  };
  if (categoryType.value !== 'git') return base;
  return {
    ...base,
    gitOwner: [
      {
        required: true,
        validator: (_rule: unknown, value: string) => {
          if (gitExtra.value.repoUrl?.trim()) return true;
          if (!value?.trim()) return new Error('请输入仓库所有者（或填写仓库 URL 自动解析）');
          return true;
        },
        trigger: 'blur'
      }
    ],
    gitRepo: [
      {
        required: true,
        validator: (_rule: unknown, value: string) => {
          if (gitExtra.value.repoUrl?.trim()) return true;
          if (!value?.trim()) return new Error('请输入仓库名称（或填写仓库 URL 自动解析）');
          return true;
        },
        trigger: 'blur'
      }
    ]
  };
});

// NForm :model 需要一个平铺对象
const formModel = computed(() => ({
  ...commonData.value,
  ...onlineExtra.value,
  ...gitExtra.value,
  datasetId: selectedDatasetId.value
}));

// ========== 父节点选项 ==========
function buildParentOptions(list: Api.Blog.Category[], prefix = '') {
  const result: { label: string; value: CommonType.IdType }[] = [];
  for (const item of list) {
    const label = prefix ? `${prefix} / ${item.name}` : item.name;
    result.push({ label, value: item.id });
    if (item.children?.length) result.push(...buildParentOptions(item.children, label));
  }
  return result;
}

const parentOptions = computed(() => [
  { label: '根节点（专题）', value: 0 as CommonType.IdType },
  ...buildParentOptions(treeData.value)
]);

// ========== 打开弹窗 ==========
function resetForm() {
  commonData.value = { name: '', path: '', orderNum: 0, topicSlug: '' };
  onlineExtra.value = { parentId: 0 as CommonType.IdType, customDomain: '' };
  gitExtra.value = { repoUrl: '', gitOwner: '', gitRepo: '', gitBranch: 'main', gitRootPath: '', gitToken: '' };
  gitHasExistingToken.value = false;
  selectedKbId.value = null;
  selectedDatasetId.value = null;
  datasetList.value = [];
}

function openAddModal(parentId: CommonType.IdType = 0 as CommonType.IdType) {
  editingId.value = null;
  categoryType.value = 'online';
  isTopicNode.value = parentId === 0;
  resetForm();
  onlineExtra.value.parentId = parentId;
  modalVisible.value = true;
}

async function openEditModal(row: Api.Blog.Category) {
  editingId.value = row.id;
  isTopicNode.value = row.isTopic === '1';
  resetForm();

  commonData.value = {
    name: row.name,
    path: row.path,
    orderNum: row.orderNum ?? 0,
    topicSlug: row.topicSlug || ''
  };

  // 回填知识库/数据集
  if (row.kbId) {
    selectedKbId.value = row.kbId;
    loadDatasets(row.kbId, row.datasetId);
  } else if (row.datasetId) {
    // 兼容老数据：如果没有 kbId 但有 datasetId，遍历查找
    selectedDatasetId.value = row.datasetId;
    if (kbList.value.length === 0) await loadKbList();
    for (const kb of kbList.value) {
      // eslint-disable-next-line no-await-in-loop
      const { data } = await fetchDatasetsByKbId(kb.id!);
      const found = (data || []).find(ds => ds.id === row.datasetId);
      if (found) {
        selectedKbId.value = kb.id!;
        datasetList.value = data || [];
        break;
      }
    }
  }

  if (row.source === 'GIT') {
    categoryType.value = 'git';
    gitHasExistingToken.value = row.hasToken ?? false;
    gitExtra.value = {
      repoUrl: row.gitOwner && row.gitRepo ? `https://github.com/${row.gitOwner}/${row.gitRepo}` : '',
      gitOwner: row.gitOwner || '',
      gitRepo: row.gitRepo || '',
      gitBranch: row.gitBranch || 'main',
      gitRootPath: row.gitRootPath || '',
      gitToken: ''
    };
  } else {
    categoryType.value = 'online';
    onlineExtra.value = {
      parentId: row.parentId,
      customDomain: row.customDomain || ''
    };
  }
  modalVisible.value = true;
}

// 切换类型时重置专属字段（仅新增时可切换）
function onTypeChange(val: CategoryType) {
  if (isEditing.value) return;
  categoryType.value = val;
  if (val === 'git') {
    gitExtra.value = { repoUrl: '', gitOwner: '', gitRepo: '', gitBranch: 'main', gitRootPath: '', gitToken: '' };
    isTopicNode.value = true;
  } else {
    onlineExtra.value = { parentId: 0 as CommonType.IdType, customDomain: '' };
    isTopicNode.value = onlineExtra.value.parentId === 0;
  }
}

// 仓库 URL 失焦自动解析
function onRepoUrlBlur() {
  const url = gitExtra.value.repoUrl?.trim();
  if (!url) return;
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    gitExtra.value.gitOwner = match[1];
    gitExtra.value.gitRepo = match[2].replace(/\.git$/, '');
  }
}

// ========== 提交 ==========
async function handleSubmit() {
  try {
    await formRef.value?.validate();
  } catch {
    return;
  }
  submitting.value = true;
  try {
    const datasetId = selectedDatasetId.value ?? undefined;

    if (categoryType.value === 'git') {
      const payload: Api.Blog.GitCategorySaveBo = {
        name: commonData.value.name,
        path: commonData.value.path,
        orderNum: commonData.value.orderNum,
        topicSlug: commonData.value.topicSlug,
        datasetId,
        ...gitExtra.value
      };
      if (isEditing.value && !payload.gitToken?.trim()) delete payload.gitToken;

      const { error } = isEditing.value
        ? await updateGitCategory(editingId.value!, payload)
        : await createGitCategory(payload);
      if (!error) {
        message.success(isEditing.value ? '保存成功' : 'Git 专题创建成功');
        modalVisible.value = false;
        loadData();
      }
    } else {
      const payload: Api.Blog.CategorySaveBo = {
        parentId: onlineExtra.value.parentId,
        name: commonData.value.name,
        path: commonData.value.path,
        orderNum: commonData.value.orderNum,
        topicSlug: commonData.value.topicSlug,
        datasetId,
        customDomain: onlineExtra.value.customDomain
      };
      const { error } = isEditing.value
        ? await updateBlogCategory(editingId.value!, payload)
        : await createBlogCategory(payload);
      if (!error) {
        message.success('保存成功');
        modalVisible.value = false;
        loadData();
      }
    }
  } finally {
    submitting.value = false;
  }
}

// ========== 删除 ==========
function handleDelete(row: Api.Blog.Category) {
  dialog.warning({
    title: '确认删除',
    content: `确定要删除分类「${row.name}」吗？删除前请确保该分类下无子分类且无关联文章。`,
    positiveText: '确认',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deleteBlogCategory(row.id);
      if (!error) {
        message.success('删除成功');
        loadData();
      }
    }
  });
}

// ========== 来源标签 ==========
function renderSourceTag(source: string) {
  if (source === 'FILE') {
    return h(NTag, { size: 'small', type: 'info', bordered: false }, { default: () => '文件扫描' });
  }
  if (source === 'GIT') {
    return h(
      NTag,
      { size: 'small', type: 'warning', bordered: false },
      {
        default: () =>
          h('div', { class: 'flex items-center gap-1' }, [h(SvgIcon, { icon: 'mdi:git', class: 'text-12px' }), 'Git'])
      }
    );
  }
  return h(NTag, { size: 'small', type: 'success', bordered: false }, { default: () => '在线创建' });
}

// ========== 表格列 ==========
const columns: DataTableColumns<Api.Blog.Category> = [
  {
    title: '分类名称',
    key: 'name',
    minWidth: 200,
    render(row) {
      const isTopic = row.isTopic === '1';
      const isGit = row.source === 'GIT';
      // eslint-disable-next-line no-nested-ternary
      const iconName = isGit ? 'mdi:git' : isTopic ? 'mdi:folder-star' : 'mdi:folder-outline';
      // eslint-disable-next-line no-nested-ternary
      const iconClass = isGit
        ? 'text-warning text-18px'
        : isTopic
          ? 'text-primary text-18px'
          : 'text-gray-400 text-16px';
      return h('div', { class: 'inline-flex items-center gap-2 py-1 align-middle' }, [
        h(SvgIcon, { icon: iconName, class: iconClass }),
        h('span', { class: isTopic ? 'font-bold text-gray-700' : 'text-gray-600' }, row.name)
      ]);
    }
  },
  {
    title: '路径',
    key: 'path',
    width: 180,
    ellipsis: { tooltip: true }
  },
  {
    title: '来源',
    key: 'source',
    width: 100,
    render: row => renderSourceTag(row.source)
  },
  {
    title: 'Git 仓库',
    key: 'gitRepo',
    width: 200,
    render(row) {
      if (row.source !== 'GIT') return h('span', { class: 'text-gray-300' }, '—');
      const repoText = row.gitOwner && row.gitRepo ? `${row.gitOwner}/${row.gitRepo}` : '-';
      const sub = [row.gitBranch ? `@${row.gitBranch}` : '', row.gitRootPath ? `\u00B7 ${row.gitRootPath}` : '']
        .filter(Boolean)
        .join(' ');
      return h('div', { class: 'flex-col text-xs leading-5' }, [
        h('div', { class: 'font-medium text-gray-700' }, repoText),
        sub ? h('div', { class: 'text-gray-400' }, sub) : null
      ]);
    }
  },
  {
    title: 'Topic Slug',
    key: 'topicSlug',
    width: 140,
    render: row => row.topicSlug || '—'
  },
  {
    title: '知识库/数据集',
    key: 'kbInfo',
    width: 180,
    render(row) {
      if (!row.datasetId) return h('span', { class: 'text-gray-300' }, '—');
      return h('div', { class: 'flex-col text-xs leading-5' }, [
        h('div', { class: 'text-gray-400' }, (row as any).kbName || '-'),
        h('div', { class: 'truncate max-w-140px' }, (row as any).datasetName || `DS: ${row.datasetId}`)
      ]);
    }
  },
  {
    title: '文章数',
    key: 'articleCount',
    width: 70,
    render: row => (row.source === 'GIT' ? h('span', { class: 'text-gray-300' }, '—') : (row.articleCount ?? 0))
  },
  {
    title: '排序',
    key: 'orderNum',
    width: 60
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right',
    render(row) {
      return h(
        NSpace,
        { size: 'small' },
        {
          default: () =>
            [
              row.source !== 'GIT' &&
                h(
                  NButton,
                  { size: 'small', ghost: true, onClick: () => openAddModal(row.id) },
                  { default: () => '添加子分类' }
                ),
              h(
                NButton,
                { size: 'small', ghost: true, onClick: () => openEditModal(row) },
                { default: () => h(SvgIcon, { localIcon: 'mdi-pencil' }) }
              ),
              h(
                NButton,
                { size: 'small', ghost: true, type: 'error', onClick: () => handleDelete(row) },
                { default: () => h(SvgIcon, { localIcon: 'mdi-delete' }) }
              )
            ].filter(Boolean)
        }
      );
    }
  }
];

const renderExpandIcon = ({ expanded }: { expanded: boolean }) =>
  h(SvgIcon, {
    icon: 'mdi:chevron-right',
    class: `text-gray-400 text-16px transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`
  });

// ========== 弹窗标题 ==========
const modalTitle = computed(() => {
  if (isEditing.value) return categoryType.value === 'git' ? '编辑 Git 专题' : '编辑分类';
  return isTopicNode.value ? '新增专题' : '新增子分类';
});

onMounted(() => {
  loadData();
  loadKbList();
});
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- 列表区 -->
    <NCard :bordered="false" size="small" class="flex-1-hidden card-wrapper">
      <template #header>
        <span class="font-medium">博客分类管理</span>
      </template>
      <template #header-extra>
        <NButton type="primary" ghost size="small" @click="openAddModal(0 as CommonType.IdType)">
          <template #icon>
            <SvgIcon local-icon="mdi-plus" />
          </template>
          新增专题
        </NButton>
      </template>

      <NDataTable
        :columns="columns"
        :data="treeData"
        :loading="loading"
        :row-key="(row: Api.Blog.Category) => row.id"
        children-key="children"
        :render-expand-icon="renderExpandIcon"
        flex-height
        class="h-full"
        size="small"
        scroll-x="1000"
      />
    </NCard>

    <!-- 统一新增/编辑弹窗 -->
    <NModal v-model:show="modalVisible" preset="card" :title="modalTitle" class="w-580px" :mask-closable="false">
      <!-- 类型切换（仅新增时可操作） -->
      <div class="mb-4">
        <NRadioGroup :value="categoryType" :disabled="isEditing" size="medium" @update:value="onTypeChange">
          <NSpace>
            <NRadio value="online">
              <div class="flex items-center gap-1">
                <SvgIcon icon="mdi:pencil-outline" class="text-16px" />
                在线创建
              </div>
            </NRadio>
            <NTooltip :disabled="!isEditing">
              <template #trigger>
                <NRadio value="git">
                  <div class="flex items-center gap-1">
                    <SvgIcon icon="mdi:git" class="text-16px text-warning" />
                    Git 仓库
                  </div>
                </NRadio>
              </template>
              分类类型创建后不可修改
            </NTooltip>
          </NSpace>
        </NRadioGroup>
        <NText v-if="categoryType === 'git'" depth="3" class="mt-1 block text-xs">
          将 GitHub 仓库作为内容来源，博客前端直接读取仓库中的 Markdown 文件展示
        </NText>
      </div>

      <NDivider class="my-0" />

      <NForm ref="formRef" :model="formModel" :rules="formRules" label-placement="left" label-width="90" class="mt-4">
        <!-- ===== 公共基础字段 ===== -->
        <NFormItem label="分类名称" path="name">
          <NInput v-model:value="commonData.name" placeholder="请输入分类名称" maxlength="100" />
        </NFormItem>
        <NFormItem label="路径" path="path">
          <NInput
            v-model:value="commonData.path"
            :placeholder="categoryType === 'git' ? '如 /ai-notes（URL 路径）' : '如 /ai 或 /ai/workflow'"
            maxlength="500"
          />
        </NFormItem>
        <NFormItem label="Topic Slug">
          <NInput
            v-model:value="commonData.topicSlug"
            placeholder="URL 标识，如 ai-notes（全局唯一，留空自动生成）"
            maxlength="200"
          />
        </NFormItem>
        <NFormItem label="排序">
          <NInputNumber v-model:value="commonData.orderNum" :min="0" class="w-full" />
        </NFormItem>

        <!-- ===== 知识库/数据集（所有类型共用） ===== -->
        <NDivider class="my-2">
          <NText depth="3" class="text-xs">知识库收录</NText>
        </NDivider>

        <NFormItem label="知识库">
          <NSelect
            v-model:value="selectedKbId"
            :options="kbOptions"
            :loading="kbLoading"
            placeholder="选择知识库（可选）"
            clearable
            filterable
          />
        </NFormItem>
        <NFormItem label="数据集">
          <NSelect
            v-model:value="selectedDatasetId"
            :options="datasetOptions"
            :loading="datasetLoading"
            :disabled="!selectedKbId"
            :placeholder="selectedKbId ? '选择数据集（可选）' : '请先选择知识库'"
            clearable
          >
            <template #render-option="{ option }">
              <div class="w-full flex items-center justify-between">
                <span>{{ option.label }}</span>
                <NTag v-if="(option as any).count > 0" size="small" type="info" :bordered="false">
                  {{ (option as any).count }} 篇
                </NTag>
              </div>
            </template>
          </NSelect>
        </NFormItem>

        <!-- ===== 在线创建专属字段 ===== -->
        <template v-if="categoryType === 'online'">
          <NDivider class="my-2">
            <NText depth="3" class="text-xs">分类配置</NText>
          </NDivider>

          <NFormItem label="父节点">
            <NSelect
              v-model:value="onlineExtra.parentId"
              :options="parentOptions"
              :disabled="isEditing"
              placeholder="选择父节点"
              @update:value="
                (v: CommonType.IdType) => {
                  isTopicNode = v === 0;
                }
              "
            />
          </NFormItem>

          <template v-if="isTopicNode">
            <NFormItem label="独立域名">
              <NInput
                v-model:value="onlineExtra.customDomain"
                placeholder="绑定的独立域名，如 ai.kmatrix.io（可选）"
                maxlength="500"
              />
            </NFormItem>
          </template>
        </template>

        <!-- ===== Git 专题专属字段 ===== -->
        <template v-if="categoryType === 'git'">
          <NDivider class="my-2">
            <NText depth="3" class="text-xs">Git 仓库配置</NText>
          </NDivider>

          <NFormItem label="仓库 URL">
            <NInput
              v-model:value="gitExtra.repoUrl"
              placeholder="https://github.com/owner/repo（填写后自动解析）"
              maxlength="500"
              @blur="onRepoUrlBlur"
            />
          </NFormItem>
          <NFormItem label="Owner" path="gitOwner">
            <NInput v-model:value="gitExtra.gitOwner" placeholder="仓库所有者（用户名或组织名）" maxlength="200" />
          </NFormItem>
          <NFormItem label="Repo" path="gitRepo">
            <NInput v-model:value="gitExtra.gitRepo" placeholder="仓库名称" maxlength="200" />
          </NFormItem>
          <NFormItem label="分支">
            <NInput v-model:value="gitExtra.gitBranch" placeholder="默认 main" maxlength="100" />
          </NFormItem>
          <NFormItem label="根路径">
            <NInput
              v-model:value="gitExtra.gitRootPath"
              placeholder="仓库内子目录，如 docs（留空则读取整个仓库）"
              maxlength="500"
            />
          </NFormItem>
          <NFormItem label="Access Token">
            <NInput
              v-model:value="gitExtra.gitToken"
              type="password"
              show-password-on="click"
              :placeholder="gitTokenPlaceholder"
              maxlength="500"
            />
          </NFormItem>
        </template>
      </NForm>

      <template #footer>
        <NSpace justify="end">
          <NButton @click="modalVisible = false">取消</NButton>
          <NButton type="primary" :loading="submitting" @click="handleSubmit">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>
