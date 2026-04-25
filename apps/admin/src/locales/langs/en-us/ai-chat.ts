const chat: App.I18n.Schema['ai']['chat'] = {
  new_chat: 'New Chat',
  expand_sidebar: 'Expand Sidebar',
  load_app_info_fail: 'Failed to load app info',
  load_history_fail: 'Failed to load history messages',
  clear_history_success: 'All sessions cleared',
  delete_session_success: 'Session deleted',
  op_fail: 'Operation failed',
  chat_title: 'Chat',
  chat_failed: 'Chat failed',
  thinking_process: 'Thinking Process',
  time_cost: 'Time Cost',
  execution_details: 'Execution Details',
  node_count: 'Nodes',
  ai_thinking: 'AI thinking...',
  ai_responding: 'AI responding...',
  input_placeholder: "Type your question, or type {'@'} to call skills... (Enter to send)",
  close_execution_details: 'Close Execution Details',
  open_execution_details: 'View Execution Details',
  citation_details: 'Citation Details',
  similarity: 'Similarity',
  chunk_id: 'Chunk ID',
  unknown_document: 'Unknown Document',
  title_required: 'Title cannot be empty',
  title_update_success: 'Title updated successfully',
  title_update_fail: 'Failed to update title',
  history: 'History',
  clear_all: 'Clear All',
  no_sessions: 'No sessions',
  recent_sessions_tip: 'Recent Sessions',
  read_stream_error: 'Failed to read stream',
  debug: 'Debug',
  debug_tip1: 'In debug mode, you can see the workflow execution process and each node output in real-time.',
  debug_tip2: 'Chats in debug mode will not be saved to history.',
  like: 'Like',
  dislike: 'Dislike',
  cancel_like: 'Cancel Like',
  cancel_dislike: 'Cancel Dislike',
  upload_image: 'Upload Image',
  upload_audio: 'Upload Audio',
  upload_file: 'Upload File',
  upload_fail: 'Upload failed',
  upload_error: 'Upload error',
  abort: 'Abort',
  abort_success: 'Aborted',
  abort_failed: 'Abort failed',
  abortSuccess: 'Abort success',
  abortFailed: 'Abort failed',
  aborted: 'Aborted',
  resume_session: 'Resume Session',
  resumable_sessions: 'Resumable Sessions',
  no_resumable_sessions: 'No resumable sessions',
  load_resumable_failed: 'Failed to load resumable sessions',
  resume_success: 'Session resumed',
  resume_failed: 'Failed to resume',
  abort_time: 'Abort Time',
  abort_reason: 'Abort Reason',
  resume: 'Resume',
  resumeSession: 'Resume Session',
  resumeSessionTitle: 'Resume Session',
  skipResume: 'Skip Resume',
  abortReason: 'Abort Reason',
  systemException: 'System Exception',
  userAbort: 'User Abort',
  networkError: 'Network Error',
  exceptionType: 'Exception Type',
  exceptionMessage: 'Exception Message',
  abortTime: 'Abort Time',
  messageCount: 'Messages'
};

const msg: App.I18n.Schema['ai']['msg'] = {
  rate_limit: {
    request_exceeded: 'Request rate limit exceeded, please try again later',
    token_exceeded: 'Token consumption limit exceeded, please try again later'
  }
};

const common: App.I18n.Schema['ai']['common'] = {
  provider_type: {
    public: 'Public',
    local: 'Local'
  },
  model_type: {
    multi_modal: 'Multi-modal',
    llm: 'LLM',
    vector: 'Vector',
    rerank: 'Rerank',
    speech: 'Speech',
    image: 'Image',
    video: 'Video'
  },
  app_type: {
    fixed_template: 'Fixed Template',
    custom_template: 'Custom Template',
    agent: 'Agent'
  },
  document_status: {
    parsing: 'Parsing',
    success: 'Success',
    fail: 'Fail'
  }
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

const datasource: App.I18n.Schema['ai']['datasource'] = {
  name: 'Name',
  type: 'Type',
  metadata_manage: 'Metadata Manage',
  add: 'Add Datasource',
  search_placeholder: 'Search by name...',
  ddl_import: 'DDL Import',
  sync_metadata: 'Sync Metadata',
  table_name: 'Table Name',
  table_comment: 'Comment',
  search: 'Search',
  list_title: 'Datasource List',
  connection_info: 'Connection Info',
  status: 'Status',
  operation: 'Operation',
  type_dynamic: 'Dynamic',
  type_manual: 'Manual',
  status_enabled: 'Enabled',
  status_disabled: 'Disabled',
  edit: 'Edit',
  delete: 'Delete',
  delete_confirm: 'Are you sure to delete this datasource?',
  delete_success: 'Deleted successfully',
  delete_fail: 'Failed to delete: {error}',
  load_fail: 'Failed to load list: {error}',
  unknown_error: 'Unknown error',
  form: {
    add_title: 'Add Datasource',
    edit_title: 'Edit Datasource',
    name_label: 'Name',
    name_placeholder: 'Enter datasource name',
    name_required: 'Please enter name',
    source_type_label: 'Source Type',
    source_type_required: 'Please select source type',
    type_manual_label: 'Manual',
    type_dynamic_label: 'Dynamic',
    dynamic_select: 'Select Datasource',
    ds_key_label: 'Datasource Key',
    driver_label: 'Driver Class',
    jdbc_url_label: 'JDBC URL',
    jdbc_url_required: 'Please enter JDBC URL',
    username_label: 'Username',
    username_required: 'Please enter username',
    password_label: 'Password',
    password_placeholder: 'Enter password (leave blank to keep unchanged)',
    db_type_label: 'DB Type',
    is_enabled_label: 'Enabled',
    cancel: 'Cancel',
    confirm: 'Confirm',
    add_success: 'Added successfully',
    edit_success: 'Updated successfully',
    submit_fail: 'Submit failed: {msg}',
    driver_required: 'Please select driver',
    dynamic_ds_required: 'Please select dynamic datasource'
  },
  metadata: {
    title: 'Metadata Manage',
    ddl_import_title: 'DDL Statement Import',
    sync_metadata_title: 'Sync Metadata',
    ddl_placeholder: 'Enter DDL statement...',
    import_success: 'Imported successfully',
    import_fail: 'Operation failed: {error}',
    sync_success: 'Synced successfully',
    sync_fail: 'Sync failed: {error}',
    load_fail: 'Failed to load table info: {error}',
    ddl_required: 'DDL cannot be empty',
    confirm_sync: 'Syncing metadata...',
    source_label: 'Source:',
    source_ddl: 'DDL',
    source_jdbc: 'JDBC',
    list_tab: 'Table List',
    jdbc_tab: 'JDBC Fetch',
    close: 'Close',
    delete_success: 'Table deleted',
    delete_fail: 'Delete failed: {error}',
    unknown_error: 'Unknown error',
    ddl_tip: 'Note: DDL analysis results may differ from actual DB structure.',
    parse_and_import: 'Parse and Import',
    jdbc_sync_tip: 'Will read DB structure and overwrite metadata.'
  }
};

const ai_rateLimit: App.I18n.Schema['page']['ai_rateLimit'] = {
  title: 'Rate Limit Configuration',
  systemDefault: 'System Default Config',
  userCustom: 'User Custom Config',
  quota: {
    minute: 'Per Minute',
    hour: 'Per Hour',
    day: 'Per Day',
    requests: 'Requests Limit',
    tokens: 'Tokens Limit'
  },
  table: {
    userId: 'User ID',
    userName: 'User Name',
    nickName: 'Nick Name',
    minuteLimit: 'Min Limit',
    hourLimit: 'Hour Limit',
    dayLimit: 'Day Limit',
    action: 'Action',
    hasCustom: 'Customized',
    useDefault: 'System Default'
  },
  form: {
    addUserConfig: 'Add User Rate Limit Configuration',
    editUserConfig: 'Edit Rate Limit for User "{userName}"',
    reqPlaceholder: 'Req Count (Empty for No Limit)',
    tokenPlaceholder: 'Tokens Count (Empty for No Limit)',
    clearCustom: 'Restore Default (Clear)'
  },
  msg: {
    updateSuccess: 'System Default Rate Limit Updated Successfully',
    userAddSuccess: 'User rate limit configuration saved',
    userUpdateSuccess: 'User Rate Limit Updated Successfully',
    clearSuccess: 'User Rate Limit Restored to System Default',
    clearConfirm: "Are you sure you want to clear this user's custom config and restore system default?",
    exceeded: 'You have reached the current chat frequency or Token limit, please try again later.'
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
