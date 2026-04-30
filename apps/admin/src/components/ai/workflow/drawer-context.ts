/** 抽屉渲染上下文注入 key，用于标识当前组件树是否处于 NodeDrawer 内 */
export const DRAWER_RENDER_KEY = Symbol('drawer-render');

/**
 * 抽屉展开上下文注入 key
 * 值为 true 时，节点内所有折叠面板应自动展开
 */
export const DRAWER_EXPANDED_KEY = Symbol('drawer-expanded');
