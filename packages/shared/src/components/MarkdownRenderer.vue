<script lang="ts" setup>
import { computed } from 'vue';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface Citation {
  index: number;
  chunkId?: number;
  documentId?: number;
  documentName?: string;
  content?: string;
  score?: number;
}

interface Props {
  content: string;
  streaming?: boolean;
  /** 引用元数据列表 */
  citations?: Citation[];
}

const props = defineProps<Props>();

// 配置 markdown-it
const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true, // 自动将换行转换为 <br>
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value;
        return `<pre class="hljs-code-block"><div class="code-block-header"><span class="language-label">${lang}</span><button class="copy-btn" data-code="${encodeURIComponent(str)}">复制</button></div><code class="hljs language-${lang}">${highlighted}</code></pre>`;
      } catch {
        // failed to highlight
      }
    }
    return `<pre class="hljs-code-block"><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

/**
 * 处理引用标记 [1], [2] 等，将其替换为可点击的引用标签
 */
function processCitationMarkers(html: string): string {
  if (!props.citations || props.citations.length === 0) {
    return html;
  }

  // 匹配 [数字] 模式
  const citationRegex = /\[(\d+)\]/g;

  return html.replace(citationRegex, (match, indexStr) => {
    const index = Number.parseInt(indexStr, 10);
    const citation = props.citations?.find(c => c.index === index);

    if (citation) {
      const docName = citation.documentName || '未知文档';
      const contentPreview = citation.content
        ? citation.content.substring(0, 100) + (citation.content.length > 100 ? '...' : '')
        : '';

      // 创建可点击的引用标签
      return `<span class="citation-badge" data-citation-index="${index}" title="${docName}&#10;${contentPreview.replace(/"/g, '&quot;')}">[${index}]</span>`;
    }

    return match; // 如果没有找到对应引用，保留原样
  });
}

// 渲染 Markdown
const renderedHtml = computed(() => {
  if (!props.content) return '';

  // 如果正在流式输出，返回纯文本（使用 white-space: pre-wrap 保留换行）
  if (props.streaming) {
    return props.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // 不需要转换 \n 为 <br>，因为 CSS white-space: pre-wrap 会自动处理
  }

  // 流式结束后，渲染完整的 Markdown
  try {
    let html = md.render(props.content);
    // 处理引用标记
    html = processCitationMarkers(html);
    return html;
  } catch {
    // 如果 Markdown 渲染失败，降级为纯文本
    return props.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
});

// 处理代码块复制
function handleCopyCode(event: Event) {
  const target = event.target as HTMLElement;
  if (target.classList.contains('copy-btn')) {
    const code = decodeURIComponent(target.getAttribute('data-code') || '');
    navigator.clipboard.writeText(code).then(() => {
      target.textContent = '已复制';
      setTimeout(() => {
        target.textContent = '复制';
      }, 2000);
    });
  }
}
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div :class="{ 'is-streaming': streaming }" class="markdown-renderer" @click="handleCopyCode" v-html="renderedHtml" />
  <span v-if="streaming" class="ml-1 inline-block h-4 w-2 animate-pulse bg-primary" />
</template>

<style scoped>
.markdown-renderer {
  word-break: break-word;
  line-height: 1.6;
}

/* 流式输出时保留换行符 */
.markdown-renderer.is-streaming {
  white-space: pre-wrap;
}

.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5),
.markdown-renderer :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-renderer :deep(h1) {
  font-size: 1.875em;
  border-bottom: 1px solid var(--n-border-color);
  padding-bottom: 0.3em;
}

.markdown-renderer :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--n-border-color);
  padding-bottom: 0.3em;
}

.markdown-renderer :deep(h3) {
  font-size: 1.25em;
}

.markdown-renderer :deep(p) {
  margin: 0.8em 0;
}

.markdown-renderer :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5em;
  margin: 0.8em 0;
}

.markdown-renderer :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
  margin: 0.8em 0;
}

.markdown-renderer :deep(li) {
  margin: 0.25em 0;
}

.markdown-renderer :deep(code) {
  background-color: rgba(150, 150, 150, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-renderer :deep(.hljs-code-block) {
  position: relative;
  margin: 1em 0;
  border-radius: 6px;
  overflow: hidden;
}

.markdown-renderer :deep(.code-block-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5em 1em;
  background-color: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.markdown-renderer :deep(.language-label) {
  font-size: 0.85em;
  color: #ccc;
  font-weight: 500;
}

.markdown-renderer :deep(.copy-btn) {
  padding: 0.25em 0.75em;
  font-size: 0.85em;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.markdown-renderer :deep(.copy-btn:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

.markdown-renderer :deep(.hljs-code-block code) {
  display: block;
  padding: 1em;
  background-color: transparent;
  overflow-x: auto;
  font-size: 0.9em;
  line-height: 1.5;
}

.markdown-renderer :deep(blockquote) {
  border-left: 4px solid var(--n-primary-color);
  padding-left: 1em;
  margin: 1em 0;
  color: var(--n-text-color-3);
}

.markdown-renderer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-renderer :deep(th),
.markdown-renderer :deep(td) {
  border: 1px solid var(--n-border-color);
  padding: 0.5em 1em;
}

.markdown-renderer :deep(th) {
  background-color: var(--n-table-header-color);
  font-weight: 600;
}

.markdown-renderer :deep(a) {
  color: var(--n-primary-color);
  text-decoration: none;
}

.markdown-renderer :deep(a:hover) {
  text-decoration: underline;
}

.markdown-renderer :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5em 0;
}

.markdown-renderer :deep(hr) {
  border: none;
  border-top: 1px solid var(--n-divider-color);
  margin: 1.5em 0;
}

/* 引用标签样式 */
.markdown-renderer :deep(.citation-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5em;
  height: 1.2em;
  padding: 0 0.3em;
  margin: 0 0.1em;
  font-size: 0.75em;
  font-weight: 600;
  color: var(--n-primary-color);
  background-color: var(--n-primary-color-suppl);
  border-radius: 0.25em;
  cursor: pointer;
  vertical-align: super;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.markdown-renderer :deep(.citation-badge:hover) {
  background-color: var(--n-primary-color-pressed);
  color: white;
  transform: scale(1.1);
}
</style>
