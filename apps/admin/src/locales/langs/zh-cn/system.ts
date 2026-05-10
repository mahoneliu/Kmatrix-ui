const system: App.I18n.Schema['system'] = {
  title: 'KMATRIX',
  updateTitle: '系统版本更新通知',
  updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
  updateConfirm: '立即刷新',
  updateCancel: '稍后再说'
};

const route: App.I18n.Schema['route'] = {
  '403': '无权限',
  '404': '页面不存在',
  '500': '服务器错误',
  login: '登录',
  'iframe-page': '外链页面',
  home: '首页',
  system: '系统管理',
  system_user: '用户管理',
  system_role: '角色管理',
  system_menu: '菜单管理',
  system_dept: '部门管理',
  system_post: '岗位管理',
  system_dict: '字典管理',
  system_config: '参数设置',
  system_notice: '通知公告',
  system_oss: '文件管理',
  'system_oss-config': 'OSS 配置',
  system_client: '客户端管理',
  system_tenant: '租户管理',
  'system_tenant-package': '租户套餐',
  log: '日志管理',
  system_system_log: '日志管理',
  monitor: '系统监控',
  monitor_cache: '缓存监控',
  monitor_logininfor: '登录日志',
  monitor_operlog: '操作日志',
  monitor_online: '在线用户',
  'social-callback': '单点登录回调',
  'user-center': '个人中心',
  demo: '测试',
  demo_demo: '测试单表',
  demo_tree: '测试树表',
  exception: '异常页',
  exception_403: '403',
  exception_404: '404',
  exception_500: '500',
  tool: '系统工具',
  tool_gen: '代码生成',
  about: '关于',
  app: '应用管理',
  'app_app-manager': '应用管理',
  'app_app-detail': '应用详情',
  app_chat: 'AI对话',
  'app_rate-limit': '限流配置',
  knowledge: '知识库',
  'knowledge_knowledge-manager': '知识库管理',
  'knowledge_knowledge-detail': '知识库详情',
  'knowledge_chunk-manager': '分块管理',
  'knowledge_document-upload': '文档上传',
  'knowledge_document-upload_step1': '文档上传-第一步',
  'knowledge_document-upload_step2': '文档上传-第二步',
  blog: '博客管理',
  blog_article: '文章管理',
  blog_category: '分类管理',
  model: '大模型',
  'model_model-manager': '模型管理',
  execution: '工具',
  'execution_mcp-manager': 'MCP服务',
  'execution_mcp-market': 'MCP市场',
  'execution_tool-manager': '工具管理',
  'execution_skill-manager': '技能管理',
  'execution_mcp-manager_registry': 'MCP注册表',
  workflow: '工作流',
  'workflow_workflow-template': '工作流模板',
  'workflow_node-definition': '节点定义',
  'workflow_template-editor': '模板编排',
  'workflow_datasource-manager': '数据源管理',
  workflow_editor: '工作流编排',
  'workflow_connection-rule-manager': '连接规则管理'
};

const menu: App.I18n.Schema['menu'] = {
  system_tenant: '租户管理',
  system_log: '日志管理',
  'monitor_snail-job': '任务调度中心',
  monitor_admin: 'Admin 监控'
};

const dict: App.I18n.Schema['dict'] = {
  sys_user_sex: {
    male: '男',
    female: '女',
    unknown: '未知'
  },
  sys_show_hide: {
    show: '显示',
    hide: '隐藏'
  },
  sys_normal_disable: {
    name: '状态',
    normal: '正常',
    disable: '停用'
  },
  sys_yes_no: {
    yes: '是',
    no: '否'
  },
  sys_notice_type: {
    notice: '通知',
    announcement: '公告'
  },
  sys_notice_status: {
    normal: '正常',
    close: '关闭'
  },
  sys_oper_type: {
    insert: '新增',
    update: '修改',
    delete: '删除',
    grant: '授权',
    export: '导出',
    import: '导入',
    force: '强退',
    gencode: '生成代码',
    clean: '清空数据',
    other: '其他'
  },
  sys_common_status: {
    success: '成功',
    fail: '失败'
  },
  sys_grant_type: {
    password: '密码认证',
    sms: '短信认证',
    email: '邮件认证',
    miniapp: '小程序认证',
    social: '三方登录认证'
  },
  sys_device_type: {
    pc: 'PC',
    android: '安卓',
    ios: 'iOS',
    miniapp: '小程序'
  },
  wf_business_status: {
    revoked: '已撤销',
    draft: '草稿',
    pending: '待审核',
    completed: '已完成',
    cancelled: '已作废',
    returned: '已退回',
    terminated: '已终止'
  },
  wf_form_type: {
    custom_form: '自定义表单',
    dynamic_form: '动态表单'
  },
  wf_task_status: {
    revoke: '撤销',
    pass: '通过',
    pending_review: '待审核',
    cancel: '作废',
    return: '退回',
    terminate: '终止',
    transfer: '转办',
    delegate: '委托',
    copy: '抄送',
    add_sign: '加签',
    minus_sign: '减签',
    timeout: '超时'
  }
};

export default {
  system,
  route,
  menu,
  dict
};
