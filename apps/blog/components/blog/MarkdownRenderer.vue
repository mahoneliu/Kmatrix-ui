<script setup lang="ts">
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface Props {
  content: string;
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
});

const emit = defineEmits<{
  tocUpdate: [headings: TocHeading[]];
}>();

// 配置 markdown-it + anchor 插件
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: false
}).use(markdownItAnchor, {
  slugify: (s: string) =>
    s
      .toLowerCase()
      .trim()
      .replace(/[\s]+/g, '-')
      .replace(/[^\w\u4E00-\u9FA5-]/g, '')
});

/** 从 Markdown 内容中提取标题列表（用于 TOC） */
function extractHeadings(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const tokens = md.parse(content, {});

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === 'heading_open') {
      const level = Number.parseInt(token.tag.slice(1), 10);
      const inlineToken = tokens[i + 1];
      if (inlineToken && inlineToken.type === 'inline') {
        const text =
          inlineToken.children
            ?.filter(t => t.type === 'text' || t.type === 'code_inline')
            .map(t => t.content)
            .join('') ?? '';
        const id = text
          .toLowerCase()
          .trim()
          .replace(/[\s]+/g, '-')
          .replace(/[^\w\u4E00-\u9FA5-]/g, '');
        if (text) {
          headings.push({ id, text, level });
        }
      }
    }
  }
  return headings;
}

const renderedHtml = computed(() => {
  if (!props.content) return '';
  try {
    return md.render(props.content);
  } catch {
    return `<p>${props.content}</p>`;
  }
});

const headings = computed(() => extractHeadings(props.content ?? ''));

function notifyToc() {
  emit('tocUpdate', headings.value);
}

onMounted(() => nextTick(notifyToc));
onUpdated(() => nextTick(notifyToc));
</script>

<template>
  <div class="markdown-renderer-container">
    <div v-if="loading" class="markdown-loading">
      <div class="skeleton-title" />
      <div class="skeleton-meta" />
      <div v-for="i in 6" :key="i" class="skeleton-line" />
    </div>

    <div v-else-if="error" class="markdown-error">
      <p class="error-message">{{ error }}</p>
      <slot name="error-action" />
    </div>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else class="blog-markdown" v-html="renderedHtml" />
  </div>
</template>

<style scoped>
.markdown-loading {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-title {
  height: 2rem;
  width: 60%;
  background: linear-gradient(90deg, var(--muted) 25%, var(--border) 50%, var(--muted) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-meta {
  height: 1rem;
  width: 35%;
  background: linear-gradient(90deg, var(--muted) 25%, var(--border) 50%, var(--muted) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line {
  height: 0.875rem;
  background: linear-gradient(90deg, var(--muted) 25%, var(--border) 50%, var(--muted) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.markdown-error {
  text-align: center;
  padding: 2rem 0;
  color: var(--muted-foreground);
}

.error-message {
  margin-bottom: 1rem;
  color: #ef4444;
}

.blog-markdown {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  word-break: break-word;
  line-height: 1.8;
  color: var(--foreground);
  font-size: 0.9375rem;
}
</style>

<style>
/* 非 scoped 样式，确保能够作用于 v-html 注入的内容 */
.blog-markdown h1,
.blog-markdown h2,
.blog-markdown h3,
.blog-markdown h4,
.blog-markdown h5,
.blog-markdown h6 {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  margin-top: 1.75em;
  margin-bottom: 0.6em;
  font-weight: 700;
  line-height: 1.3;
  color: var(--foreground);
  scroll-margin-top: 80px;
}

.blog-markdown .header-anchor {
  color: inherit !important;
  text-decoration: none;
  border-bottom: none !important;
  opacity: 0;
  margin-left: 0.4em;
  transition: opacity 0.15s;
}
.blog-markdown h1:hover .header-anchor,
.blog-markdown h2:hover .header-anchor,
.blog-markdown h3:hover .header-anchor,
.blog-markdown h4:hover .header-anchor {
  opacity: 0.5;
}

.blog-markdown h1 {
  font-size: 1.75rem;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.4em;
}
.blog-markdown h2 {
  font-size: 1.375rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.3em;
}
.blog-markdown h3 {
  font-size: 1.125rem;
}
.blog-markdown h4 {
  font-size: 1rem;
}
.blog-markdown h5 {
  font-size: 0.9375rem;
}
.blog-markdown h6 {
  font-size: 0.875rem;
  color: var(--muted-foreground);
}

.blog-markdown p {
  margin: 0.9em 0;
  color: var(--foreground);
}

.blog-markdown a {
  color: var(--primary);
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.15s;
}
.blog-markdown a:hover {
  border-bottom-color: var(--primary);
}

.blog-markdown ul {
  list-style-type: disc;
  padding-left: 1.75em;
  margin: 0.75em 0;
}
.blog-markdown ol {
  list-style-type: decimal;
  padding-left: 1.75em;
  margin: 0.75em 0;
}
.blog-markdown li {
  margin: 0.3em 0;
  color: var(--foreground);
}

.blog-markdown code {
  background: var(--muted);
  color: var(--primary);
  padding: 0.15em 0.45em;
  border-radius: 4px;
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', 'Monaco', monospace;
  font-size: 0.85em;
  border: 1px solid var(--border);
}

.blog-markdown pre {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1.25em 1.5em;
  border-radius: 10px;
  overflow-x: auto;
  margin: 1.25em 0;
  font-size: 0.85em;
  line-height: 1.65;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.blog-markdown pre code {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  border: none;
  font-size: inherit;
}

.blog-markdown blockquote {
  border-left: 3px solid var(--primary);
  background: color-mix(in srgb, var(--primary) 6%, var(--background));
  padding: 0.75em 1.25em;
  margin: 1.25em 0;
  border-radius: 0 8px 8px 0;
  color: var(--muted-foreground);
}
.blog-markdown blockquote p {
  margin: 0;
  color: inherit;
}

.blog-markdown table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.25em 0;
  font-size: 0.9em;
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}
.blog-markdown th,
.blog-markdown td {
  border: 1px solid var(--border);
  padding: 0.6em 1em;
  text-align: left;
  color: var(--foreground);
}
.blog-markdown th {
  background: var(--muted);
  font-weight: 600;
}
.blog-markdown tr:nth-child(even) td {
  background: color-mix(in srgb, var(--muted) 50%, var(--background));
}

.blog-markdown img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 0.75em 0;
  display: block;
  box-shadow: var(--shadow);
}

.blog-markdown hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2em 0;
}
</style>
