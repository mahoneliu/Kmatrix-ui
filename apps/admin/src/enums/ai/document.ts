/**
 * 文档状态枚举
 * @author Mahone
 * @date 2026-02-03
 */

/** 文档启用状态 */
export enum DocumentStatus {
  DISABLED = 0,
  ENABLED = 1
}

/** 任务状态 */
export enum TaskState {
  PENDING = 0,
  STARTED = 1,
  SUCCESS = 2,
  FAILED = 3,
  CANCELLING = 4,
  CANCELLED = 5
}

/** 任务类型 */
export enum TaskType {
  EMBEDDING = 1,
  GENERATE_PROBLEM = 2
}

/** 任务状态标签映射 */
export const TASK_STATE_LABELS: Record<TaskState, string> = {
  [TaskState.PENDING]: '等待中',
  [TaskState.STARTED]: '执行中',
  [TaskState.SUCCESS]: '成功',
  [TaskState.FAILED]: '失败',
  [TaskState.CANCELLING]: '取消中',
  [TaskState.CANCELLED]: '已取消'
};

/** 任务状态标签类型映射 (for Naive UI Tag type) */
export const TASK_STATE_TAG_TYPES: Record<TaskState, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  [TaskState.PENDING]: 'default',
  [TaskState.STARTED]: 'info',
  [TaskState.SUCCESS]: 'success',
  [TaskState.FAILED]: 'error',
  [TaskState.CANCELLING]: 'warning',
  [TaskState.CANCELLED]: 'default'
};
