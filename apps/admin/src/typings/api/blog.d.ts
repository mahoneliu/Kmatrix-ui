/**
 * 博客管理 API 类型定义
 */
declare namespace Api {
  namespace Blog {
    /** 博客文章 VO（管理端） */
    interface Article {
      id: CommonType.IdType;
      categoryId: CommonType.IdType;
      categoryName?: string;
      categoryPath?: string;
      categorySource?: 'FILE' | 'ONLINE';
      title: string;
      slug: string;
      content?: string;
      description?: string;
      coverImage?: string;
      tags?: string; // JSON 数组字符串
      status: 'DRAFT' | 'PUBLISHED';
      /** FILE=文件扫描入库, ONLINE=管理端在线创建 */
      source: 'FILE' | 'ONLINE';
      datasetId?: CommonType.IdType;
      kmDocumentId?: CommonType.IdType;
      sourcePath?: string;
      contentHash?: string;
      publishedAt?: string;
      viewCount?: number;
      createTime?: string;
      updateTime?: string;
    }

    /** 文章查询参数 */
    interface ArticleQuery {
      title?: string;
      categoryId?: CommonType.IdType;
      status?: 'DRAFT' | 'PUBLISHED';
      source?: 'FILE' | 'ONLINE';
      tags?: string;
      pageNum?: number;
      pageSize?: number;
    }

    /** 文章新增/修改 BO */
    interface ArticleSaveBo {
      title: string;
      categoryId: CommonType.IdType;
      content?: string;
      description?: string;
      coverImage?: string;
      tags?: string; // JSON 数组字符串
      status: 'DRAFT' | 'PUBLISHED';
      datasetId?: CommonType.IdType;
      slug?: string;
    }

    /** 博客分类 VO */
    interface Category {
      id: CommonType.IdType;
      parentId: CommonType.IdType;
      name: string;
      path: string;
      orderNum?: number;
      /** FILE=Scanner 创建, ONLINE=管理端创建, GIT=Git仓库 */
      source: 'FILE' | 'ONLINE' | 'GIT';
      /** '1'=专题节点, '0'=普通分类节点 */
      isTopic: '0' | '1';
      datasetId?: CommonType.IdType;
      kbId?: CommonType.IdType;
      topicSlug?: string;
      customDomain?: string;
      articleCount?: number;
      children?: Category[];
      createTime?: string;
      updateTime?: string;
      /** GIT 类型专属：仓库所有者 */
      gitOwner?: string;
      /** GIT 类型专属：仓库名称 */
      gitRepo?: string;
      /** GIT 类型专属：分支名称 */
      gitBranch?: string;
      /** GIT 类型专属：仓库根路径 */
      gitRootPath?: string;
      /** GIT 类型专属：是否已配置 Token */
      hasToken?: boolean;
    }

    /** 分类新增/修改 BO */
    interface CategorySaveBo {
      parentId: CommonType.IdType;
      name: string;
      path: string;
      orderNum?: number;
      datasetId?: CommonType.IdType;
      topicSlug?: string;
      customDomain?: string;
    }

    /** Git 专题新增 BO */
    interface GitCategorySaveBo {
      name: string;
      path: string;
      orderNum?: number;
      topicSlug?: string;
      datasetId?: CommonType.IdType;
      /** GitHub 仓库 URL，如 https://github.com/owner/repo */
      repoUrl?: string;
      gitOwner?: string;
      gitRepo?: string;
      gitBranch?: string;
      gitRootPath?: string;
      /** Git Token（明文，保存时加密） */
      gitToken?: string;
    }

    /** Git 分类配置 VO（不含 token 明文） */
    interface GitCategoryConfigVo {
      categoryId: CommonType.IdType;
      owner: string;
      repo: string;
      branch: string;
      rootPath?: string;
      repoUrl?: string;
      hasToken: boolean;
    }
  }
}
