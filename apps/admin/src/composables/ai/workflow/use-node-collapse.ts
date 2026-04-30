import { computed, inject } from 'vue';
import { DRAWER_EXPANDED_KEY } from '@/components/ai/workflow/drawer-context';

/**
 * 节点折叠面板 composable
 *
 * 在抽屉模式下，自动展开所有折叠面板；在画布模式下，使用默认展开状态。
 *
 * 用法：
 * ```ts
 * const { collapseProps } = useNodeCollapse();
 * // 模板中：<NCollapse v-bind="collapseProps(['config', 'advanced'])">
 * ```
 */
export function useNodeCollapse() {
  const isDrawerExpanded = inject(DRAWER_EXPANDED_KEY, false);

  /**
   * 返回传给 NCollapse 的 props。
   * - 抽屉模式：使用受控的 expanded-names，强制展开所有 item
   * - 画布模式：使用 default-expanded-names，保持原有默认行为
   *
   * @param defaultNames 画布模式下默认展开的 item name 列表
   * @param allNames 所有 item 的 name 列表（抽屉模式下全部展开）；
   *                 若省略，则与 defaultNames 相同
   */
  function collapseProps(defaultNames: string[], allNames?: string[]): Record<string, unknown> {
    if (isDrawerExpanded) {
      return { expandedNames: allNames ?? defaultNames };
    }
    return { defaultExpandedNames: defaultNames };
  }

  /** 是否处于抽屉展开模式 */
  const inDrawerExpanded = computed(() => isDrawerExpanded);

  return { collapseProps, inDrawerExpanded };
}
