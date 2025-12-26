declare namespace Api {
    namespace AI {
        /** 模型供应商 */
        interface ModelProvider {
            providerId: number;
            providerName: string;
            providerKey: string;
            providerType?: '1' | '2'; // 1: 公用模型, 2: 本地模型
            default_endpoint: string;
            siteUrl: string;
            iconUrl: string;
            configSchema: string;
            models: string; // 支持的模型标识 (JSON 字符串)
            status: '0' | '1';
            sort: number;
            remark: string;
        }

        /** AI 模型配置 */
        interface Model {
            modelId: number;
            providerId: number;
            modelName: string;
            modelType: '1' | '2'; // 1: 语言模型, 2: 向量模型
            modelKey: string;
            apiKey: string;
            apiBase: string;
            config: string;
            status: '0' | '1';
            isBuiltin: 'Y' | 'N';
            modelSource: '1' | '2'; // 1: 公有模型, 2: 本地模型
            providerIcon?: string;
            remark: string;
        }
    }
}
