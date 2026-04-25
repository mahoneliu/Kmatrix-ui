const mcp: App.I18n.Schema['ai']['mcp'] = {
  listTitle: 'MCP Server List',
  addTitle: 'Add MCP Server',
  editTitle: 'Edit MCP Server',
  serverName: 'Server Name',
  description: 'Description',
  transportType: 'Transport Protocol',
  serverConfig: 'Server Config (JSON)',
  status: 'Status',
  searchPlaceholder: 'Search by Server Name',
  formMode: 'Form Mode',
  jsonMode: 'JSON Mode',
  form: {
    serverNameRequired: 'Please enter Server Name',
    transportTypeRequired: 'Please select Transport Protocol',
    serverNamePlaceholder: 'Enter MCP Server name',
    descriptionPlaceholder: 'Enter description',
    serverConfigPlaceholder: 'Enter Server configuration in JSON format, e.g. {"url": "http://...","headers": {}}',
    jsonFormatError: 'JSON Format Error',
    formatJson: 'Format JSON',
    parseAndFill: 'Parse and Fill Form',
    jsonParseSuccess: 'JSON Parse Success',
    jsonParseError: 'JSON Parse Error',
    jsonRequired: 'Please enter JSON config',
    noServerConfig: 'Please fill in Server configuration'
  },
  mcp_server: 'MCP Server',
  mcp_server_placeholder: 'Please select MCP Server',
  resource_uri: 'Resource URI',
  resource_uri_placeholder: 'Select resource or enter manually'
};

const skill: App.I18n.Schema['ai']['skill'] = {
  label: 'Skill',
  info: 'Skill Info',
  add: 'Add Skill',
  edit: 'Edit Skill',
  listTitle: 'Skill List',
  name: 'Skill Name',
  description: 'Description',
  toolBindings: 'Tool Bindings',
  inputSchema: 'Input Schema',
  outputSchema: 'Output Schema',
  providedBySkillConfig: 'Provided by Skill Config',
  noAvailableToolsOrSkills: 'No available tools or skills',
  confirmDelete: 'Are you sure to delete this skill?',
  confirmBatchDelete: 'Are you sure to delete selected skills?',
  placeholder: {
    name: 'Skill name (Used as LLM Function name, English recommended)',
    nameSearch: 'Enter skill name',
    description: 'Skill description (for LLM reference)',
    toolBindings: 'Enter tool JSON config',
    inputSchema: 'JSON Schema format',
    statusSearch: 'Select status'
  },
  tip: {
    jsonBinding: 'Temporary JSON format: [{"type":"builtin","id":1}, {"type":"mcp","id":2}]'
  }
};

const builtinTool: App.I18n.Schema['ai']['builtinTool'] = {
  listTitle: 'Built-in Tool List',
  addTitle: 'Add Built-in Tool',
  editTitle: 'Edit Built-in Tool',
  toolName: 'Tool Name (English ID)',
  description: 'Description',
  pythonCode: 'Python Script',
  inputSchema: 'Input Schema',
  initParamsTab: 'Init Params',
  inputSchemaTab: 'Input Schema',
  outputSchemaTab: 'Output Schema',
  status: 'Status',
  searchPlaceholder: 'Search by tool name',
  securityWarningTitle: 'Security Warning',
  securityWarning:
    'Python scripts execute with server permissions. Ensure code source is trusted. Avoid high-risk operations (file deletion, network access) or have admins review before publishing.',
  paramEditor: {
    defaultTitle: 'Parameter',
    addParam: 'Add {title}',
    editParam: 'Edit {title}',
    name: 'Parameter Name',
    namePlaceholder: 'English ID, e.g. query',
    displayName: 'Display Name',
    displayNamePlaceholder: 'Enter display name (optional)',
    type: 'Data Type',
    required: 'Required',
    description: 'Description',
    descriptionPlaceholder: 'Detailed explanation for LLM understanding',
    defaultValue: 'Default Value',
    defaultValuePlaceholder: 'Enter default value (optional)',
    nameRequired: 'Please enter parameter name',
    namePattern: 'Letters, numbers, underscores only, starting with letter/underscore',
    deleteConfirm: 'Are you sure you want to delete this parameter?',
    typeString: 'String',
    typeNumber: 'Number',
    typeBoolean: 'Boolean',
    typeObject: 'Object',
    typeArray: 'Array'
  },
  form: {
    toolNameRequired: 'Please enter tool name',
    toolNamePattern: 'Lowercase letters, numbers, underscores only, starting with letter',
    toolNamePlaceholder: 'lowercase, e.g. search_tool (LLM function name)',
    descriptionPlaceholder: 'Describe tool function for LLM to decide when to call',
    codePlaceholder: 'Write Python code here...',
    schemaPlaceholder: 'Enter input parameter definition in JSON Schema format'
  }
};

export default {
  mcp,
  skill,
  builtinTool
};
