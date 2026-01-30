import { defineConfig } from '@unocss/vite';
import transformerDirectives from '@unocss/transformer-directives';
import transformerVariantGroup from '@unocss/transformer-variant-group';
import presetWind3 from '@unocss/preset-wind3';
import type { Theme } from '@unocss/preset-uno';
import { presetSoybeanAdmin } from '@sa/uno-preset';
import { themeVars } from './apps/admin/src/theme/vars';

export default defineConfig<Theme>({
  content: {
    pipeline: {
      exclude: ['node_modules', 'dist']
    }
  },
  theme: {
    ...themeVars,
    fontSize: {
      'icon-xs': '0.875rem',
      'icon-small': '1rem',
      icon: '1.125rem',
      'icon-large': '1.5rem',
      'icon-xl': '2rem'
    }
  },
  shortcuts: {
    'card-wrapper': 'rd-8px shadow-sm',
    // 工作流节点样式
    'workflow-label': 'flex items-center justify-start text-12px c-gray-5 font-600',
    'workflow-label-required': 'ml-0.5 c-red-5',
    'workflow-input': 'text-11px',
    'workflow-textarea': 'text-11px',
    'workflow-btn-icon': 'text-4 c-gray-5',
    'workflow-collapse-icon': 'c-gray-5', // 折叠面板箭头图标
    'workflow-config-section': 'flex flex-col gap-1 mt-1',
    'workflow-config-item': 'flex flex-col gap-1.5',
    'workflow-config-item-section': 'flex flex-col gap-3 pb-2 bg-slate-50 p-2 rounded'
  },
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [presetWind3({ dark: 'class' }), presetSoybeanAdmin()]
});
