import type { Node } from '@vue-flow/core';

/**
 * 生成新节点的名称 (自动编号)
 * 例如: "大模型对话" -> "大模型对话 1", "大模型对话 2"
 * @param defaultLabel 节点默认名称 (如 "大模型对话")
 * @param nodes 现有节点列表
 */
export function generateNodeLabel(defaultLabel: string, nodes: Node[]): string {
  // 1. 找到所有同类节点的名称
  // 我们只关心开头相同的
  const pattern = new RegExp(`^${defaultLabel}\\s*(\\d+)?$`);

  const indices: number[] = [];

  nodes.forEach(node => {
    const label = node.data?.nodeLabel || '';
    const match = label.match(pattern);
    if (match) {
      if (match[1]) {
        indices.push(Number.parseInt(match[1], 10));
      } else {
        // 只有前缀，没有数字，视为 1 (或者可以视为 0，看需求)
        // 用户例子：大模型对话1。说明 1 是明确显示的。
        // 如果有一个叫 "大模型对话"，下一个通常是 "大模型对话 1" 或者 "2"？
        // 遵循 Windows 风格：New Folder -> New Folder (2)。
        // 用户例子：大模型对话1，大模型对话2。
        // 假设初始名称就是 "大模型对话 1"。
        // 如果 defaultLabel 是 "大模型对话"，我们生成 "大模型对话 1"
        indices.push(0); // 占位
      }
    }
  });

  if (indices.length === 0) {
    return `${defaultLabel} 1`;
  }

  const maxIndex = Math.max(...indices, 0);
  return `${defaultLabel} ${maxIndex + 1}`;
}
