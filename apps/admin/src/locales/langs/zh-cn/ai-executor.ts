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

export default {
  mcp,
  skill
};
