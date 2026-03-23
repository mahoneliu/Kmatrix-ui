/**
 * 聊天频率限流管理 (Chat Rate Limit) 相关 API 类型定义
 */
declare namespace Api {
  namespace Ai {
    namespace RateLimit {
      /**
       * 单个维度的限流配额
       */
      interface Quota {
        /** 请求次数上限，null 表示不限制 */
        requests?: number | null;
        /** Token 消耗上限，null 表示不限制 */
        tokens?: number | null;
      }

      /**
       * 限流配置总接口
       * 对应后端的 ChatRateLimitConfigVo
       */
      interface Config {
        minute?: Quota | null;
        hour?: Quota | null;
        day?: Quota | null;
      }

      /**
       * 附带限流信息的用户实体 (映射 SysUserVo)
       */
      interface UserInfo {
        userId: number;
        userName: string;
        nickName: string;
        phonenumber: string;
        email: string;
        status: string;
        createTime: string;
        /** 特殊限流配置 JSON 字符串 */
        rateLimitConfig?: string | null;
        [key: string]: any;
      }

      /**
       * 用户查询参数
       */
      type UserQueryParams = Common.CommonSearchParams & {
        userName?: string;
        phonenumber?: string;
        status?: string;
      };
    }
  }
}
