/**
 * 节点参数注册表
 * 定义每个节点类型的输入输出参数
 * @author Mahone
 * @date 2026-01-07
 */

/**
 * 节点类型参数定义注册表
 */
export const NODE_PARAMS_REGISTRY: Record<Workflow.NodeType, Workflow.NodeTypeParams> = {
  APP_INFO: {
    type: 'APP_INFO',
    inputParams: [],
    outputParams: []
  },

  START: {
    type: 'START',
    inputParams: [],
    outputParams: [
      {
        key: 'userInput',
        label: '用户输入',
        type: 'string',
        required: true,
        description: '用户发送的消息内容'
      },
      {
        key: 'sessionId',
        label: '会话ID',
        type: 'string',
        required: true,
        description: '当前会话的唯一标识'
      },
      {
        key: 'userId',
        label: '用户ID',
        type: 'string',
        required: true,
        description: '当前用户的唯一标识'
      }
    ]
  },

  LLM_CHAT: {
    type: 'LLM_CHAT',
    inputParams: [
      {
        key: 'prompt',
        label: '提示词',
        type: 'string',
        required: true,
        description: '发送给 LLM 的提示词内容'
      },
      {
        key: 'context',
        label: '上下文',
        type: 'string',
        required: false,
        description: '额外的上下文信息'
      },
      {
        key: 'systemPrompt',
        label: '系统提示词',
        type: 'string',
        required: false,
        description: '系统级提示词（优先级高于节点配置）'
      }
    ],
    outputParams: [
      {
        key: 'response',
        label: 'AI回复',
        type: 'string',
        required: true,
        description: 'LLM 生成的回复内容'
      },
      {
        key: 'tokens',
        label: 'Token消耗',
        type: 'number',
        required: true,
        description: '本次调用消耗的 Token 数量'
      }
    ]
  },

  INTENT_CLASSIFIER: {
    type: 'INTENT_CLASSIFIER',
    inputParams: [
      {
        key: 'text',
        label: '待分类文本',
        type: 'string',
        required: true,
        description: '需要进行意图分类的文本内容'
      }
    ],
    outputParams: [
      {
        key: 'intent',
        label: '识别意图',
        type: 'string',
        required: true,
        description: '识别出的意图名称'
      },
      {
        key: 'confidence',
        label: '置信度',
        type: 'number',
        required: true,
        description: '意图识别的置信度 (0-1)'
      }
    ]
  },

  CONDITION: {
    type: 'CONDITION',
    inputParams: [
      {
        key: 'value',
        label: '判断值',
        type: 'string',
        required: true,
        description: '用于条件判断的值'
      }
    ],
    outputParams: [
      {
        key: 'result',
        label: '判断结果',
        type: 'boolean',
        required: true,
        description: '条件判断的结果'
      },
      {
        key: 'matchedBranch',
        label: '匹配分支',
        type: 'string',
        required: false,
        description: '匹配的条件分支名称'
      }
    ]
  },

  FIXED_RESPONSE: {
    type: 'FIXED_RESPONSE',
    inputParams: [
      {
        key: 'template',
        label: '回复模板',
        type: 'string',
        required: false,
        description: '回复内容模板，支持变量替换'
      }
    ],
    outputParams: [
      {
        key: 'response',
        label: '回复内容',
        type: 'string',
        required: true,
        description: '最终生成的回复内容'
      }
    ]
  },

  END: {
    type: 'END',
    inputParams: [
      {
        key: 'finalOutput',
        label: '最终输出',
        type: 'string',
        required: true,
        description: '工作流的最终输出内容'
      }
    ],
    outputParams: []
  }
};

/**
 * 获取节点类型的参数定义
 * @param nodeType 节点类型
 * @returns 节点参数定义
 */
export function getNodeTypeParams(nodeType: Workflow.NodeType): Workflow.NodeTypeParams {
  return NODE_PARAMS_REGISTRY[nodeType];
}

/**
 * 获取节点类型的输入参数定义
 * @param nodeType 节点类型
 * @returns 输入参数定义列表
 */
export function getNodeInputParams(nodeType: Workflow.NodeType): Workflow.ParamDefinition[] {
  return NODE_PARAMS_REGISTRY[nodeType]?.inputParams || [];
}

/**
 * 获取节点类型的输出参数定义
 * @param nodeType 节点类型
 * @returns 输出参数定义列表
 */
export function getNodeOutputParams(nodeType: Workflow.NodeType): Workflow.ParamDefinition[] {
  return NODE_PARAMS_REGISTRY[nodeType]?.outputParams || [];
}
