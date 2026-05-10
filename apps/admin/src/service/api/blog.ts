/**
 * 博客管理端 API 封装
 * 对应后端 /blog/** 接口
 */

import { request } from '@/service/request';

// ========== 文章管理 API ==========

/**
 * 分页查询文章列表
 */
export function fetchBlogArticlePage(params?: Api.Blog.ArticleQuery) {
  return request<Api.Common.PaginatingQueryRecord<Api.Blog.Article>>({
    url: '/blog/article/list',
    method: 'get',
    params
  });
}

/**
 * 查询文章详情（含 Markdown 内容）
 */
export function fetchBlogArticleById(id: CommonType.IdType) {
  return request<Api.Blog.Article>({
    url: `/blog/article/${id}`,
    method: 'get'
  });
}

/**
 * 新增文章（管理端在线创建）
 */
export function createBlogArticle(data: Api.Blog.ArticleSaveBo) {
  return request<CommonType.IdType>({
    url: '/blog/article',
    method: 'post',
    data
  });
}

/**
 * 修改文章
 * source=FILE 的文章：仅允许修改 status/datasetId/description/coverImage/tags
 * source=ONLINE 的文章：所有字段均可修改
 */
export function updateBlogArticle(id: CommonType.IdType, data: Api.Blog.ArticleSaveBo) {
  return request<boolean>({
    url: `/blog/article/${id}`,
    method: 'put',
    data
  });
}

/**
 * 切换文章发布状态
 */
export function toggleBlogArticleStatus(id: CommonType.IdType, status: 'DRAFT' | 'PUBLISHED') {
  return request<boolean>({
    url: `/blog/article/${id}/status`,
    method: 'put',
    params: { status }
  });
}

/**
 * 批量切换文章发布状态
 */
export function updateBlogArticleBatchStatus(ids: CommonType.IdType[], status: 'DRAFT' | 'PUBLISHED') {
  return request<boolean>({
    url: '/blog/article/batch/status',
    method: 'put',
    data: ids,
    params: { status }
  });
}

/**
 * 批量删除文章（逻辑删除）
 */
export function deleteBlogArticles(ids: CommonType.IdType[]) {
  return request<boolean>({
    url: `/blog/article/${ids.join(',')}`,
    method: 'delete'
  });
}

/**
 * 手动触发文章同步到知识库
 */
export function syncBlogArticleToKb(id: CommonType.IdType) {
  return request<boolean>({
    url: `/blog/article/${id}/sync-kb`,
    method: 'post'
  });
}

/**
 * 批量触发文章同步到知识库
 */
export function syncBlogArticleToKbBatch(ids: CommonType.IdType[]) {
  return request<boolean>({
    url: '/blog/article/batch/sync-kb',
    method: 'post',
    data: ids
  });
}

// ========== 分类管理 API ==========

/**
 * 获取分类树（含专题节点）
 */
export function fetchBlogCategoryTree() {
  return request<Api.Blog.Category[]>({
    url: '/blog/category/tree',
    method: 'get'
  });
}

/**
 * 新增分类（parentId=0 时自动标记为专题节点）
 */
export function createBlogCategory(data: Api.Blog.CategorySaveBo) {
  return request<CommonType.IdType>({
    url: '/blog/category',
    method: 'post',
    data
  });
}

/**
 * 修改分类
 */
export function updateBlogCategory(id: CommonType.IdType, data: Api.Blog.CategorySaveBo) {
  return request<boolean>({
    url: `/blog/category/${id}`,
    method: 'put',
    data
  });
}

/**
 * 新增 Git 专题分类
 */
export function createGitCategory(data: Api.Blog.GitCategorySaveBo) {
  return request<CommonType.IdType>({
    url: '/blog/category/git',
    method: 'post',
    data
  });
}

/**
 * 更新 Git 专题分类配置
 */
export function updateGitCategory(id: CommonType.IdType, data: Api.Blog.GitCategorySaveBo) {
  return request<boolean>({
    url: `/blog/category/git/${id}`,
    method: 'put',
    data
  });
}

/**
 * 获取 Git 分类配置（不含 token 明文）
 */
export function fetchGitCategoryConfig(id: CommonType.IdType) {
  return request<Api.Blog.GitCategoryConfigVo>({
    url: `/blog/category/git/${id}/config`,
    method: 'get'
  });
}

/**
 * 删除分类（需无子分类且无关联文章）
 */
export function deleteBlogCategory(id: CommonType.IdType) {
  return request<boolean>({
    url: `/blog/category/${id}`,
    method: 'delete'
  });
}
