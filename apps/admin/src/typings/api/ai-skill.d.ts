/**
 * 技能管理 (Skill Management) 相关 API 类型定义
 */
declare namespace Api {
  namespace Ai {
    namespace Skill {
      /**
       * 技能配置信息
       */
      interface Info {
        /** 技能ID */
        skillId: string;
        /** 技能名称（英文标识，用作 LLM 函数名） */
        skillName: string;
        /** 技能说明（提供给大模型参考） */
        spec: string;
        /** 绑定的工具配置集合 JSON 字符串 */
        toolBindings: string;
        /** 输入参数 JSON Schema */
        inputSchema: string;
        /** 输出参数 JSON Schema */
        outputSchema: string;
        /** 状态（0正常 1停用） */
        status: string;
        /** 备注 */
        remark: string;
        /** 创建时间 */
        createTime: string;
      }

      /**
       * 查询相关参数
       */
      type QueryParams = Common.CommonSearchParams & Pick<Info, 'skillName' | 'status'>;
    }
  }
}
