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

export default {
  mcp,
  skill
};
