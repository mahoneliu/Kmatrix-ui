const chat: App.I18n.Schema['ai']['chat'] = {
  new_chat: '新建对话',
  expand_sidebar: '展开侧边栏',
  load_app_info_fail: '加载应用信息失败',
  load_history_fail: '加载历史消息失败',
  clear_history_success: '已清空所有会话',
  delete_session_success: '已删除会话',
  op_fail: '操作失败',
  chat_title: '对话',
  chat_failed: '对话失败',
  thinking_process: '思考过程',
  time_cost: '耗时',
  execution_details: '执行详情',
  node_count: '节点数',
  ai_thinking: 'AI 思考中...',
  ai_responding: 'AI 回复中...',
  input_placeholder: "请输入问题，或输入 {'@'} 调用技能... (Enter发送)",
  close_execution_details: '收起执行详情',
  open_execution_details: '查看执行详情',
  citation_details: '引用详情',
  similarity: '相似度',
  chunk_id: '分段 ID',
  unknown_document: '未知文档',
  title_required: '标题不能为空',
  title_update_success: '更新标题成功',
  title_update_fail: '更新标题失败',
  history: '历史记录',
  clear_all: '清空所有',
  no_sessions: '暂无会话',
  recent_sessions_tip: '近期会话',
  read_stream_error: '读取流失败',
  debug: '调试',
  debug_tip1: '调试模式下，你可以实时看到工作流的执行过程和每个节点的输出。',
  debug_tip2: '调试模式下的对话不会被保存到历史记录中。',
  like: '点赞',
  dislike: '点踩',
  cancel_like: '取消点赞',
  cancel_dislike: '取消点踩',
  upload_image: '上传图片',
  upload_audio: '上传录音',
  upload_file: '上传文件',
  upload_fail: '上传失败',
  upload_error: '上传异常',
  abort: '中断',
  abort_success: '已中断',
  abort_failed: '中断失败',
  abortSuccess: '中断成功',
  abortFailed: '中断失败',
  aborted: '已中断',
  resume_session: '恢复会话',
  resumable_sessions: '可恢复的会话',
  no_resumable_sessions: '没有可恢复的会话',
  load_resumable_failed: '加载可恢复会话失败',
  resume_success: '会话已恢复',
  resume_failed: '恢复失败',
  abort_time: '中断时间',
  abort_reason: '中断原因',
  resume: '恢复',
  resumeSession: '恢复会话',
  resumeSessionTitle: '恢复会话',
  skipResume: '跳过恢复',
  abortReason: '中断原因',
  systemException: '系统异常',
  userAbort: '用户主动中断',
  networkError: '网络错误',
  exceptionType: '异常类型',
  exceptionMessage: '异常消息',
  abortTime: '中断时间',
  messageCount: '消息数'
};

const msg: App.I18n.Schema['ai']['msg'] = {
  rate_limit: {
    request_exceeded: '请求频率超限，请稍后再试',
    token_exceeded: 'Token 消耗超限，请稍后再试'
  }
};

const common: App.I18n.Schema['ai']['common'] = {
  provider_type: {
    public: '公有',
    local: '本地'
  },
  model_type: {
    multi_modal: '多模态',
    llm: '语言',
    vector: '向量',
    rerank: '多路召回',
    speech: '语音',
    image: '图像',
    video: '视频'
  },
  app_type: {
    fixed_template: '固定模板',
    custom_template: '自定义模板',
    agent: '智能体'
  },
  document_status: {
    parsing: '解析中',
    success: '完成',
    fail: '失败'
  }
};

const skill: App.I18n.Schema['ai']['skill'] = {
  label: '技能',
  info: '技能信息',
  add: '新增技能',
  edit: '编辑技能',
  listTitle: '技能列表',
  name: '技能名称',
  description: '技能描述',
  toolBindings: '工具绑定',
  inputSchema: '输入参数(Schema)',
  outputSchema: '输出参数(Schema)',
  providedBySkillConfig: '由技能配置提供',
  noAvailableToolsOrSkills: '暂无可用的工具或技能',
  confirmDelete: '确认删除该技能？',
  confirmBatchDelete: '确认删除选中的技能？',
  placeholder: {
    name: '请输入技能名称 (用作大模型 Function name, 建议英文)',
    nameSearch: '请输入技能名称',
    description: '请输入技能描述 (提供给大模型参考)',
    toolBindings: '请输入绑定的工具 JSON 配置',
    inputSchema: 'JSON Schema 格式',
    statusSearch: '请选择状态'
  },
  tip: {
    jsonBinding: '暂用 JSON 格式绑定工具：[{"type":"builtin","id":1}, {"type":"mcp","id":2}]'
  }
};

const datasource: App.I18n.Schema['ai']['datasource'] = {
  name: '名称',
  type: '类型',
  metadata_manage: '元数据管理',
  add: '新建数据源',
  search_placeholder: '输入名称进行搜索...',
  ddl_import: 'DDL 导入',
  sync_metadata: '同步元数据',
  table_name: '表名',
  table_comment: '注释',
  search: '搜索',
  list_title: '数据源列表',
  connection_info: '连接信息',
  status: '状态',
  operation: '操作',
  type_dynamic: '动态 (Dynamic)',
  type_manual: '手动 (Manual)',
  status_enabled: '已启用',
  status_disabled: '已禁用',
  edit: '编辑',
  delete: '删除',
  delete_confirm: '确定要删除该数据源吗？',
  delete_success: '删除数据源成功',
  delete_fail: '删除数据源失败: {error}',
  load_fail: '加载数据源列表失败: {error}',
  unknown_error: '未知错误',
  form: {
    add_title: '新增数据源',
    edit_title: '编辑数据源',
    name_label: '数据源名称',
    name_placeholder: '请输入数据源名称',
    name_required: '请输入数据源名称',
    source_type_label: '数据源类型',
    source_type_required: '请选择数据源类型',
    type_manual_label: '手动输入',
    type_dynamic_label: '动态选择',
    dynamic_select: '选择数据源',
    ds_key_label: '数据源标识',
    driver_label: '驱动类',
    jdbc_url_label: 'JDBC URL',
    jdbc_url_required: '请输入 JDBC URL',
    username_label: '用户名',
    username_required: '请输入用户名',
    password_label: '密码',
    password_placeholder: '请输入密码 (仅在修改时留空则不更改)',
    db_type_label: '数据库类型',
    is_enabled_label: '是否启用',
    cancel: '取消',
    confirm: '确定',
    add_success: '新增成功',
    edit_success: '修改成功',
    submit_fail: '提交失败 {msg}',
    driver_required: '请选择驱动',
    dynamic_ds_required: '请选择动态数据源'
  },
  metadata: {
    title: '元数据管理',
    ddl_import_title: 'DDL 语句导入',
    sync_metadata_title: '同步元数据',
    ddl_placeholder: '请输入建表 DDL 语句...',
    import_success: '解析并导入成功',
    import_fail: '操作失败: {error}',
    sync_success: '同步成功',
    sync_fail: '同步失败: {error}',
    load_fail: '加载表信息失败: {error}',
    ddl_required: 'DDL 不能为空',
    confirm_sync: '正在同步元数据...',
    source_label: '源方式:',
    source_ddl: 'DDL',
    source_jdbc: 'JDBC',
    list_tab: '表列表',
    jdbc_tab: 'JDBC 获取',
    close: '关闭',
    delete_success: '删除表成功',
    delete_fail: '删除表失败: {error}',
    unknown_error: '未知错误',
    ddl_tip: '注意: DDL 解析为本地分析推断结果,在字段类型推断上可能会与实际表结构有差异。',
    parse_and_import: '解析并导入',
    jdbc_sync_tip: '将从数据库即时读取表结构并作为元数据进行覆盖同步。'
  }
};

const ai_rateLimit: App.I18n.Schema['page']['ai_rateLimit'] = {
  title: '频率限制配置',
  systemDefault: '系统默认配置',
  userCustom: '用户个别配置',
  quota: {
    minute: '按分钟',
    hour: '按小时',
    day: '按天',
    requests: '次数限制',
    tokens: 'Token 限制'
  },
  table: {
    userId: '用户ID',
    userName: '用户名',
    nickName: '昵称',
    minuteLimit: '分阈值',
    hourLimit: '小时阈值',
    dayLimit: '日阈值',
    action: '操作',
    hasCustom: '已定义',
    useDefault: '系统默认'
  },
  form: {
    addUserConfig: '新增用户限流配置',
    editUserConfig: '编辑用户【{userName}】限流配置',
    reqPlaceholder: '请求次数 (为空不限)',
    tokenPlaceholder: 'Tokens数量 (为空不限)',
    clearCustom: '恢复默认(清空)'
  },
  msg: {
    updateSuccess: '系统默认限流更新成功',
    userAddSuccess: '用户限流配置已保存',
    userUpdateSuccess: '用户限流配置更新成功',
    clearSuccess: '用户限流配置已成功恢复系统默认',
    clearConfirm: '确定要清除该用户的个别配置，使其恢复为系统默认吗？',
    exceeded: '您已达到当前对话频率与 Token 限制，请稍后再试。'
  }
};

export default {
  chat,
  msg,
  common,
  skill,
  datasource,
  ai_rateLimit
};
