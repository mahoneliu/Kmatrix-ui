const system: App.I18n.Schema['system'] = {
  title: 'KMATRIX',
  updateTitle: 'System Version Update Notification',
  updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
  updateConfirm: 'Refresh immediately',
  updateCancel: 'Later'
};

const route: App.I18n.Schema['route'] = {
  '403': 'No Permission',
  '404': 'Page Not Found',
  '500': 'Server Error',
  login: 'Login',
  'iframe-page': 'Iframe',
  home: 'Home',
  system: 'System Management',
  system_user: 'User Management',
  system_role: 'Role Management',
  system_menu: 'Menu Management',
  system_dept: 'Dept Management',
  system_post: 'Post Management',
  system_dict: 'Dict Management',
  system_config: 'Config Management',
  system_notice: 'Notice Management',
  system_oss: 'File Management',
  'system_oss-config': 'OSS Config',
  system_client: 'Client Management',
  system_tenant: 'Tenant Management',
  'system_tenant-package': 'Tenant Package Management',
  log: 'Log Management',
  system_system_log: 'Log Management',
  monitor: 'Monitor',
  monitor_logininfor: 'Login Log',
  monitor_operlog: 'Operate Log',
  monitor_cache: 'Cache Monitor',
  monitor_online: 'Online User',
  'user-center': 'User Center',
  'social-callback': 'Social Callback',
  demo: 'Demo',
  demo_demo: 'Demo Table',
  demo_tree: 'Demo Tree',
  exception: 'Exception',
  exception_403: '403',
  exception_404: '404',
  exception_500: '500',
  tool: 'System Tools',
  tool_gen: 'Code Generation',
  about: 'About',
  ai: 'AI Management',
  'ai_model_model-manager': 'Model Manager',
  'ai_model_mcp-manager': 'MCP Service',
  'ai_model_tool-manager': 'Tool Manager',
  'ai_model_skill-manager': 'Skill Manager',
  'ai_knowledge_knowledge-manager': 'Knowledge Manager',
  'ai_knowledge_knowledge-detail': 'Knowledge Detail',
  'ai_knowledge_chunk-manager': 'Chunk Manager',
  'ai_knowledge_document-upload': 'Document Upload',
  'ai_knowledge_document-upload_step1': 'Document Upload Step 1',
  'ai_knowledge_document-upload_step2': 'Document Upload Step 2',
  'ai_workflow_workflow-template': 'Workflow Template',
  'ai_workflow_node-definition': 'Node Definition',
  'ai_workflow_template-editor': 'Template Editor',
  'ai_workflow_datasource-manager': 'Datasource Manager',
  'ai_app_app-manager': 'App Manager',
  'ai_app_app-detail': 'App Detail',
  ai_app_chat: 'AI Chat',
  'ai_app_rate-limit': 'Rate Limit',
  ai_model: 'Model',
  ai_knowledge: 'Knowledge',
  ai_app: 'App Management',
  ai_workflow: 'Workflow',
  ai_workflow_editor: 'Workflow Editor',
  ai_ai_model: 'Model',
  ai_ai_knowledge: 'Knowledge',
  ai_ai_workflow: 'Workflow',
  ai_ai_app: 'App Management',
  'ai_workflow_connection-rule-manager': 'Connection Rule Management'
};

const menu: App.I18n.Schema['menu'] = {
  system_tenant: 'Tenant Management',
  system_log: 'Log Management',
  'monitor_snail-job': 'Job Management',
  monitor_admin: 'Admin Monitor'
};

const dict: App.I18n.Schema['dict'] = {
  sys_user_sex: {
    male: 'Male',
    female: 'Female',
    unknown: 'Unknown'
  },
  sys_show_hide: {
    show: 'Show',
    hide: 'Hide'
  },
  sys_normal_disable: {
    name: 'Status',
    normal: 'Normal',
    disable: 'Disable'
  },
  sys_yes_no: {
    yes: 'Yes',
    no: 'No'
  },
  sys_notice_type: {
    notice: 'Notice',
    announcement: 'Announcement'
  },
  sys_notice_status: {
    normal: 'Normal',
    close: 'Close'
  },
  sys_oper_type: {
    insert: 'Insert',
    update: 'Update',
    delete: 'Delete',
    grant: 'Grant',
    export: 'Export',
    import: 'Import',
    force: 'Force',
    gencode: 'Generate Code',
    clean: 'Clean Data',
    other: 'Other'
  },
  sys_common_status: {
    success: 'Success',
    fail: 'Fail'
  },
  sys_grant_type: {
    password: 'Password Auth',
    sms: 'SMS Auth',
    email: 'Email Auth',
    miniapp: 'Mini App Auth',
    social: 'Social Auth'
  },
  sys_device_type: {
    pc: 'PC',
    android: 'Android',
    ios: 'iOS',
    miniapp: 'Mini App'
  },
  wf_business_status: {
    revoked: 'Revoked',
    draft: 'Draft',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
    returned: 'Returned',
    terminated: 'Terminated'
  },
  wf_form_type: {
    custom_form: 'Custom Form',
    dynamic_form: 'Dynamic Form'
  },
  wf_task_status: {
    revoke: 'Revoke',
    pass: 'Pass',
    pending_review: 'Pending Review',
    cancel: 'Cancel',
    return: 'Return',
    terminate: 'Terminate',
    transfer: 'Transfer',
    delegate: 'Delegate',
    copy: 'Copy',
    add_sign: 'Add Sign',
    minus_sign: 'Minus Sign',
    timeout: 'Timeout'
  }
};

export default {
  system,
  route,
  menu,
  dict
};
