const mcp: App.I18n.Schema['ai']['mcp'] = {
  listTitle: 'MCP Server 列表',
  addTitle: '新增 MCP Server',
  editTitle: '编辑 MCP Server',
  serverName: 'Server 名称',
  description: '描述',
  transportType: '传输协议',
  serverConfig: 'Server 配置（JSON）',
  status: '状态',
  searchPlaceholder: '请输入 Server 名称搜索',
  formMode: '表单模式',
  jsonMode: 'JSON 模式',
  form: {
    serverNameRequired: '请输入 Server 名称',
    transportTypeRequired: '请选择传输协议',
    serverNamePlaceholder: '请输入 MCP Server 名称',
    descriptionPlaceholder: '请输入描述信息',
    serverConfigPlaceholder: '请输入 JSON 格式的 Server 配置，如：{"url": "http://...","headers": {}}',
    jsonFormatError: 'JSON 格式错误',
    formatJson: '格式化 JSON',
    parseAndFill: '解析并填充表单',
    jsonParseSuccess: 'JSON 解析成功',
    jsonParseError: 'JSON 解析失败',
    jsonRequired: '请输入 JSON 配置',
    noServerConfig: '请填写 Server 配置'
  },
  mcp_server: 'MCP Server',
  mcp_server_placeholder: '请选择 MCP Server',
  resource_uri: '资源 URI',
  resource_uri_placeholder: '请选择资源或手动输入'
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

const builtinTool: App.I18n.Schema['ai']['builtinTool'] = {
  listTitle: '内置工具列表',
  addTitle: '新增内置工具',
  editTitle: '编辑内置工具',
  toolName: '工具名称（英文标识）',
  description: '功能描述',
  pythonCode: 'Python 脚本',
  inputSchema: '输入参数 Schema',
  initParamsTab: '启动参数',
  inputSchemaTab: '输入参数',
  outputSchemaTab: '输出参数 JSON Schema',
  status: '状态',
  searchPlaceholder: '请输入工具名称搜索',
  securityWarningTitle: '安全警告',
  securityWarning:
    'Python 脚本将以服务器进程权限执行，请确保代码来源可信。请勿编写删除文件、访问网络等高危操作，或交由管理员审核后发布。',
  paramEditor: {
    defaultTitle: '参数',
    addParam: '添加{title}',
    editParam: '编辑{title}',
    name: '参数名',
    namePlaceholder: '请输入参数的英文标识，如 query',
    displayName: '显示名称',
    displayNamePlaceholder: '请输入显示名称（可选）',
    type: '数据类型',
    required: '是否必填',
    description: '提示说明',
    descriptionPlaceholder: '请输入详细的参数说明以便 LLM 理解',
    defaultValue: '默认值',
    defaultValuePlaceholder: '请输入默认值（可选）',
    nameRequired: '请输入参数名称',
    namePattern: '参数名只能包含字母、数字下划线，且以字母或下划线开头',
    deleteConfirm: '确定删除该参数吗？',
    typeString: 'String (字符串)',
    typeNumber: 'Number (数字)',
    typeBoolean: 'Boolean (布尔)',
    typeObject: 'Object (对象)',
    typeArray: 'Array (数组)'
  },
  form: {
    toolNameRequired: '请输入工具名称',
    toolNamePattern: '工具名称只能使用小写字母、数字和下划线，且必须以字母开头',
    toolNamePlaceholder: '英文小写，如：search_tool（将作为 LLM 工具函数名）',
    descriptionPlaceholder: '描述该工具的功能，LLM 将根据此描述判断何时调用',
    codePlaceholder: '在此编写 Python 代码...',
    schemaPlaceholder: '请输入 JSON Schema 格式的输入参数 definition'
  }
};

export default {
  mcp,
  skill,
  builtinTool
};
