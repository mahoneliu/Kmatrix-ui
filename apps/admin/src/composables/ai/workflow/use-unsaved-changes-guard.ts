import { onMounted, onUnmounted } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';
import { useDialog } from 'naive-ui';
import { useWorkflowStore } from '@/store/modules/ai/workflow';

/**
 * 未保存更改守卫 composable
 * 处理路由离开和浏览器关闭/刷新时的未保存提示
 * @param handleAutoSave 自动保存回调函数
 */
export function useUnsavedChangesGuard(handleAutoSave: () => Promise<void>) {
  const workflowStore = useWorkflowStore();
  const dialog = useDialog();

  // 路由守卫
  onBeforeRouteLeave((_to, _from, next) => {
    if (!workflowStore.isDirty) {
      next();
      return;
    }
    dialog.warning({
      title: '未保存的更改',
      content: '您有未保存的更改，确定要离开吗？',
      positiveText: '保存并离开',
      negativeText: '放弃更改',
      onPositiveClick: async () => {
        await handleAutoSave();
        next();
      },
      onNegativeClick: () => {
        next();
      },
      onMaskClick: () => {
        next(false);
      }
    });
  });

  // 浏览器关闭/刷新守卫
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (workflowStore.isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });

  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });
}
