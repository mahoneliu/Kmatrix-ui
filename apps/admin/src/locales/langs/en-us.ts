const local: App.I18n.Schema = {
  system: {
    title: 'KMATRIX',
    updateTitle: 'System Version Update Notification',
    updateContent: 'A new version of the system has been detected. Do you want to refresh the page immediately?',
    updateConfirm: 'Refresh immediately',
    updateCancel: 'Later'
  },
  common: {
    basicInfo: 'Basic Info',
    action: 'Action',
    add: 'Add',
    addSuccess: 'Add Success',
    backToHome: 'Back to home',
    back: 'Back',
    batchDelete: 'Batch Delete',
    import: 'Import',
    export: 'Export',
    importSuccess: 'Import Success',
    importFail: 'Import Fail',
    importTemplate: 'Import Template',
    importResult: 'Import Result',
    downloadTemplate: 'Download Template',
    importEnd: '',
    importFormat: 'and the format is',
    importTip: 'Please upload a file no larger than',
    importSize: 'Please upload a file no larger than',
    exportSuccess: 'Export Success',
    exportFail: 'Export Fail',
    updateExisting: 'Whether to update the existing user data',
    cancel: 'Cancel',
    close: 'Close',
    check: 'Check',
    expandColumn: 'Expand Column',
    columnSetting: 'Column Setting',
    config: 'Config',
    login: 'Login',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    deleteSuccess: 'Delete Success',
    deleteFail: 'Delete failed',
    confirmDelete: 'Are you sure you want to delete?',
    edit: 'Edit',
    download: 'Download',
    warning: 'Warning',
    error: 'Error',
    index: 'Index',
    keywordSearch: 'Please enter keyword',
    logout: 'Logout',
    logoutConfirm: 'Are you sure you want to log out?',
    lookForward: 'Coming soon',
    modify: 'Modify',
    modifySuccess: 'Modify Success',
    noData: 'No Data',
    operate: 'Operate',
    pleaseCheckValue: 'Please check whether the value is valid',
    refresh: 'Refresh',
    reset: 'Reset',
    search: 'Search',
    permission: 'Permission',
    select_permission_level: 'Please select permission level',
    download_failed: 'Download Failed',
    switch: 'Switch',
    tip: 'Tip',
    trigger: 'Trigger',
    update: 'Update',
    saveSuccess: 'Save Success',
    updateSuccess: 'Update Success',
    noChange: 'No actions were taken',
    userCenter: 'User Center',
    yesOrNo: {
      yes: 'Yes',
      no: 'No'
    },
    second: 'Second',
    selected: 'selected',
    anyRecords: 'records',
    clear: 'Clear',
    noSelectRecord: 'No Records Selected',
    copy: 'Copy',
    name: 'Name',
    type: 'Type',
    description: 'Description',
    status: 'Status',
    enable: 'Enable',
    disable: 'Disable',
    remark: 'Remark',
    createTime: 'Creation Time',
    expandOrCollapse: 'Expand/Collapse',
    checkAllOrNot: 'Check/Uncheck All',
    cascade: 'Cascade',
    uploadTip: 'Click or drag files to this area to upload',
    fetchListFail: 'Failed to fetch list',
    confirmAction: 'Are you sure you want to {action} {info}?',
    deleteConfirmMsg: 'Deleted files cannot be recovered. Are you sure you want to delete?',
    fileNameError: 'Invalid file name. Commas are not allowed!',
    confirmDeleteFile: 'Are you sure you want to delete the file?',
    errorDetail: {
      unknown: 'Unknown system error, please report to the administrator',
      auth_fail: 'Authentication failed, unable to access system resources',
      no_permission: 'No permission for the current operation',
      not_found: 'The access resource does not exist'
    },
    copy_empty: 'Copy content is empty',
    copied: 'Copied',
    copy_fail: 'Copy failed',
    input: 'Input',
    output: 'Output',
    publishSuccess: 'Publish Success',
    publishFailed: 'Publish Failed',
    generateSuccess: 'Generate Success',
    generateFail: 'Generate Fail',
    all: 'All',
    none: 'None',
    createSuccess: 'Create Success',
    createFailed: 'Create Failed'
  },
  request: {
    logout: 'Logout user after request failed',
    logoutMsg: 'User status is invalid, please log in again',
    logoutWithModal: 'Pop up modal after request failed and then log out user',
    logoutWithModalMsg: 'User status is invalid, please log in again',
    refreshToken: 'The requested token has expired, refresh the token',
    tokenExpired: 'The requested token has expired'
  },
  theme: {
    themeDrawerTitle: 'Theme Configuration',
    tabs: {
      appearance: 'Appearance',
      layout: 'Layout',
      general: 'General',
      preset: 'Preset'
    },
    appearance: {
      themeSchema: {
        title: 'Theme Schema',
        light: 'Light',
        dark: 'Dark',
        auto: 'Follow System'
      },
      grayscale: 'Grayscale',
      colourWeakness: 'Colour Weakness',
      themeColor: {
        title: 'Theme Color',
        primary: 'Primary',
        info: 'Info',
        success: 'Success',
        warning: 'Warning',
        error: 'Error',
        followPrimary: 'Follow Primary'
      },
      themeRadius: {
        title: 'Theme Radius'
      },
      recommendColor: 'Apply Recommended Color Algorithm',
      recommendColorDesc: 'The recommended color algorithm refers to',
      preset: {
        title: 'Theme Presets',
        apply: 'Apply',
        applySuccess: 'Preset applied successfully',
        default: {
          name: 'Default Preset',
          desc: 'Default theme preset with balanced settings'
        },
        soybean: {
          name: 'Soybean',
          desc: 'Default theme preset of SoybeanAdmin'
        },
        dark: {
          name: 'Dark Preset',
          desc: 'Dark theme preset for night time usage'
        },
        compact: {
          name: 'Compact Preset',
          desc: 'Compact layout preset for small screens'
        },
        azir: {
          name: "Azir's Preset",
          desc: 'It is a cold and elegant preset that Azir likes'
        }
      }
    },
    layout: {
      layoutMode: {
        title: 'Layout Mode',
        vertical: 'Vertical Mode',
        horizontal: 'Horizontal Mode',
        'vertical-mix': 'Vertical Mix Mode',
        'vertical-hybrid-header-first': 'Left Hybrid Header-First',
        'top-hybrid-sidebar-first': 'Top-Hybrid Sidebar-First',
        'top-hybrid-header-first': 'Top-Hybrid Header-First',
        vertical_detail: 'Vertical menu layout, with the menu on the left and content on the right.',
        'vertical-mix_detail':
          'Vertical mix-menu layout, with the primary menu on the dark left side and the secondary menu on the lighter left side.',
        'vertical-hybrid-header-first_detail':
          'Left hybrid layout, with the primary menu at the top, the secondary menu on the dark left side, and the tertiary menu on the lighter left side.',
        horizontal_detail: 'Horizontal menu layout, with the menu at the top and content below.',
        'top-hybrid-sidebar-first_detail':
          'Top hybrid layout, with the primary menu on the left and the secondary menu at the top.',
        'top-hybrid-header-first_detail':
          'Top hybrid layout, with the primary menu at the top and the secondary menu on the left.'
      },
      tab: {
        title: 'Tab Settings',
        visible: 'Tab Visible',
        cache: 'Tag Bar Info Cache',
        cacheTip: 'One-click to open/close global keepalive',
        height: 'Tab Height',
        mode: {
          title: 'Tab Mode',
          slider: 'Slider',
          chrome: 'Chrome',
          button: 'Button'
        },
        closeByMiddleClick: 'Close Tab by Middle Click',
        closeByMiddleClickTip: 'Enable closing tabs by clicking with the middle mouse button'
      },
      header: {
        title: 'Header Settings',
        height: 'Header Height',
        breadcrumb: {
          visible: 'Breadcrumb Visible',
          showIcon: 'Breadcrumb Icon Visible'
        }
      },
      sider: {
        title: 'Sider Settings',
        inverted: 'Dark Sider',
        width: 'Sider Width',
        collapsedWidth: 'Sider Collapsed Width',
        mixWidth: 'Mix Sider Width',
        mixCollapsedWidth: 'Mix Sider Collapse Width',
        mixChildMenuWidth: 'Mix Child Menu Width',
        autoSelectFirstMenu: 'Auto Select First Submenu',
        autoSelectFirstMenuTip:
          'When a first-level menu is clicked, the first submenu is automatically selected and navigated to the deepest level'
      },
      footer: {
        title: 'Footer Settings',
        visible: 'Footer Visible',
        fixed: 'Fixed Footer',
        height: 'Footer Height',
        right: 'Right Footer'
      },
      content: {
        title: 'Content Area Settings',
        scrollMode: {
          title: 'Scroll Mode',
          tip: 'The theme scroll only scrolls the main part, the outer scroll can carry the header and footer together',
          wrapper: 'Wrapper',
          content: 'Content'
        },
        page: {
          animate: 'Page Animate',
          mode: {
            title: 'Page Animate Mode',
            fade: 'Fade',
            'fade-slide': 'Slide',
            'fade-bottom': 'Fade Zoom',
            'fade-scale': 'Fade Scale',
            'zoom-fade': 'Zoom Fade',
            'zoom-out': 'Zoom Out',
            none: 'None'
          }
        },
        fixedHeaderAndTab: 'Fixed Header And Tab'
      }
    },
    general: {
      title: 'General Settings',
      watermark: {
        title: 'Watermark Settings',
        visible: 'Watermark Full Screen Visible',
        text: 'Custom Watermark Text',
        enableUserName: 'Enable User Name Watermark',
        enableTime: 'Show Current Time',
        timeFormat: 'Time Format'
      },
      multilingual: {
        title: 'Multilingual Settings',
        visible: 'Display multilingual button'
      },
      globalSearch: {
        title: 'Global Search Settings',
        visible: 'Display GlobalSearch button'
      }
    },
    configOperation: {
      copyConfig: 'Copy Config',
      copySuccessMsg: 'Copy Success, Please replace the variable "themeSettings" in "src/theme/settings.ts"',
      resetConfig: 'Reset Config',
      resetSuccessMsg: 'Reset Success'
    },
    tablePropsTitle: 'Table Props',
    table: {
      size: {
        title: 'Table Size',
        small: 'Small',
        medium: 'Medium',
        large: 'Large'
      },
      bordered: 'Bordered',
      bottomBordered: 'Bottom Bordered',
      singleColumn: 'Single Column',
      singleLine: 'Single Line',
      striped: 'Striped'
    }
  },
  route: {
    login: 'Login',
    403: 'No Permission',
    404: 'Page Not Found',
    500: 'Server Error',
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
    'ai_model-manager': 'Model Manager',
    'ai_app-manager': 'App Manager',
    ai_workflow: 'Workflow',
    'ai_workflow-template': 'Workflow Template',
    'ai_node-definition': 'Node Definition',
    'ai_datasource-manager': 'Data Source',
    'ai_app-detail': 'App Detail',
    'ai_knowledge-manager': 'Knowledge Base Manager',
    'ai_knowledge-detail': 'Knowledge Base Detail',
    ai_chat: 'AI Chat',
    'ai_template-editor': 'Template Editor',
    'ai_chunk-manager': 'Chunk Management',
    'ai_mcp-manager': 'MCP Management',
    'ai_tool-manager': 'Tool Management',
    'ai_document-upload': 'Document Upload',
    'ai_document-upload_step1': 'Document Upload Step 1',
    'ai_document-upload_step2': 'Document Upload - Step 2',
    'ai_skill-manager': 'Skill Management',
    'ai_rate-limit': 'Rate Limit',
    ai_ai_model: 'Model',
    ai_ai_knowledge: 'Knowledge',
    ai_ai_workflow: 'Workflow',
    ai_ai_app: 'App Management'
  },
  menu: {
    system_tenant: 'Tenant Management',
    system_log: 'Log Management',
    'monitor_snail-job': 'Job Management',
    monitor_admin: 'Admin Monitor'
  },
  dict: {
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
  },

  page: {
    login: {
      common: {
        title: 'Modern enterprise-level multi-tenant management system',
        subTitle: 'Provides developers with a complete enterprise management solution',
        loginOrRegister: 'Login / Register',
        register: 'Register',
        userNamePlaceholder: 'Please enter user name',
        phonePlaceholder: 'Please enter phone number',
        codePlaceholder: 'Please enter verification code',
        passwordPlaceholder: 'Please enter password',
        confirmPasswordPlaceholder: 'Please enter password again',
        codeLogin: 'Verification code login',
        confirm: 'Confirm',
        back: 'Back',
        validateSuccess: 'Verification passed',
        loginSuccess: 'Login successfully',
        welcomeBack: 'Welcome back, {userName} !'
      },
      pwdLogin: {
        title: 'Password Login',
        rememberMe: 'Remember password',
        forgetPassword: 'Forget password?',
        register: 'Register',
        otherAccountLogin: 'Other Account Login',
        otherLoginMode: 'Other Login Mode',
        superAdmin: 'Super Admin',
        admin: 'Admin',
        user: 'User'
      },
      codeLogin: {
        title: 'Verification Code Login',
        getCode: 'Get verification code',
        reGetCode: 'Reacquire after {time}s',
        sendCodeSuccess: 'Verification code sent successfully',
        imageCodePlaceholder: 'Please enter image verification code'
      },
      register: {
        title: 'Register',
        agreement: 'I have read and agree to',
        protocol: '"User Agreement"',
        policy: '"Privacy Policy"'
      },
      resetPwd: {
        title: 'Reset Password'
      },
      bindWeChat: {
        title: 'Bind WeChat'
      }
    },
    home: {
      branchDesc:
        'For the convenience of everyone in developing and updating the merge, we have streamlined the code of the main branch, only retaining the homepage menu, and the rest of the content has been moved to the example branch for maintenance. The preview address displays the content of the example branch.',
      greeting: 'Good morning, {userName}, today is another day full of vitality!',
      weatherDesc: 'Today is cloudy to clear, 20℃ - 25℃',
      projectCount: 'Project Count',
      todo: 'Todo',
      message: 'Message',
      downloadCount: 'Download Count',
      registerCount: 'Register Count',
      schedule: 'Work and rest Schedule',
      study: 'Study',
      work: 'Work',
      rest: 'Rest',
      entertainment: 'Entertainment',
      visitCount: 'Visit Count',
      turnover: 'Turnover',
      dealCount: 'Deal Count',
      projectNews: {
        title: 'Project News',
        moreNews: 'More News',
        desc1: 'Created the open source project kmatrix on January 3, 2026!',
        desc2: 'Submitted a bug to kmatrix, the multi-tab bar will not adapt.',
        desc3: 'Is ready to do sufficient preparation for the release of kmatrix!',
        desc4: 'Is busy writing project documentation for kmatrix!',
        desc5: 'Just wrote some of the workbench pages casually, and it was enough to see!'
      },
      creativity: 'Creativity',
      total_docs: 'Total Documents',
      ai_token_cost: 'AI Token Cost',
      active_knowledge_base: 'Active Knowledge Base',
      yesterday_new_notes: 'Yesterday New Notes',
      recent_docs: 'Recent Edited Documents',
      view_all: 'View All',
      minutes_ago: '{count} minutes ago',
      hours_ago: '{count} hours ago',
      yesterday: 'Yesterday',
      ai_resource_usage: 'AI Resource Usage',
      token_consumption: 'Token Consumption',
      last_7_days: 'Last 7 Days',
      this_month: 'This Month',
      new_kb: 'New Knowledge Base',
      week: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      }
    },
    common: {
      id: 'ID',
      createBy: 'Creator',
      createTime: 'Create Time',
      updateBy: 'Updater',
      updateTime: 'Update Time',
      remark: 'Remark',
      form: {
        remark: {
          required: 'Please enter remark',
          invalid: 'Remark cannot be empty'
        }
      }
    },
    userCenter: {
      personalInfo: 'Personal Information',
      basicInfo: 'Basic Info',
      changePassword: 'Change Password',
      thirdPartyApp: 'Third-party App',
      onlineDevice: 'Online Devices',
      nickname: 'Nickname',
      email: 'Email',
      phoneNumber: 'Phone Number',
      gender: 'Gender',
      department: 'Department',
      role: 'Roles',
      createTime: 'Creation Date',
      save: 'Save',
      nicknamePlaceholder: 'Please enter nickname',
      emailPlaceholder: 'Please enter email',
      phonePlaceholder: 'Please enter phone number',
      genderMale: 'Male',
      genderFemale: 'Female',
      oldPassword: 'Old Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      oldPasswordPlaceholder: 'Please enter old password',
      newPasswordPlaceholder: 'Please enter new password',
      confirmPasswordPlaceholder: 'Please enter new password again',
      updateSuccess: 'Update Success',
      passwordSuccess: 'Password modified successfully',
      passwordDiff: 'Passwords do not match',
      rules: {
        nickname: 'Nickname is required',
        gender: 'Gender is required',
        oldPassword: 'Old password is required',
        newPassword: 'New password is required',
        confirmPassword: 'Confirm password is required'
      },
      onlineDeviceColumns: {
        deviceType: 'Device Type',
        ipaddr: 'IP Address',
        loginLocation: 'Login Location',
        browser: 'Browser',
        os: 'OS',
        loginTime: 'Login Time'
      },
      forceLogout: 'Force Logout',
      confirmForceLogout: 'Are you sure you want to force logout?',
      forceLogoutSuccess: 'Force logout successfully',
      social: {
        wechat: 'WeChat',
        bindTime: 'Bind Time',
        unbind: 'Unbind',
        bind: 'Bind',
        unbindSuccess: 'Account unbind successfully'
      },
      avatar: {
        changeTitle: 'Change Avatar',
        uploadTip: 'Please upload image type files (JPG, PNG, etc.)',
        updateSuccess: 'Avatar updated successfully!',
        selectImage: 'Select Image',
        confirmCrop: 'Confirm Crop'
      }
    },
    system: {
      client: {
        title: 'Client List',
        clientId: 'Client ID',
        clientKey: 'Client Key',
        clientSecret: 'Client Secret',
        grantTypeList: 'Grant Type',
        deviceType: 'Device Type',
        activeTimeout: 'Token Active Timeout',
        timeout: 'Token Timeout',
        status: 'Status',
        form: {
          clientId: {
            required: 'Please enter Client ID',
            invalid: 'Client ID cannot be empty'
          },
          clientKey: {
            required: 'Please enter Client Key',
            invalid: 'Client Key cannot be empty'
          },
          clientSecret: {
            required: 'Please enter Client Secret',
            invalid: 'Client Secret cannot be empty'
          },
          grantTypeList: {
            required: 'Please select Grant Type',
            invalid: 'Grant Type cannot be empty'
          },
          deviceType: {
            required: 'Please select Device Type',
            invalid: 'Device Type cannot be empty'
          },
          activeTimeout: {
            required: 'Please enter Active Timeout',
            invalid: 'Active Timeout cannot be empty',
            tooltip: 'Specify time without operation will expire (unit: second), default 30 minutes (1800 seconds)'
          },
          timeout: {
            required: 'Please enter Timeout',
            invalid: 'Timeout cannot be empty',
            tooltip: 'Specify time will expire (unit: second), default 7 days (604800 seconds)'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          }
        },
        addClient: 'Add Client',
        editClient: 'Edit Client'
      },
      config: {
        title: 'Config List',
        configName: 'Config Name',
        configKey: 'Config Key',
        configValue: 'Config Value',
        configType: 'Built-in',
        remark: 'Remark',
        createTime: 'Create Time',
        refreshCache: 'Refresh Cache',
        refreshCacheSuccess: 'Refresh cache successfully',
        form: {
          configId: {
            required: 'Please enter Config ID',
            invalid: 'Config ID cannot be empty'
          },
          configName: {
            required: 'Please enter Config Name',
            invalid: 'Config Name cannot be empty'
          },
          configKey: {
            required: 'Please enter Config Key',
            invalid: 'Config Key cannot be empty'
          },
          configValue: {
            required: 'Please enter Config Value',
            invalid: 'Config Value cannot be empty'
          },
          configType: {
            required: 'Please select Built-in status',
            invalid: 'Built-in status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addConfig: 'Add Config',
        editConfig: 'Edit Config'
      },
      dept: {
        empty: 'No department information',
        title: 'Department List',
        parentId: 'Parent Department',
        deptName: 'Department Name',
        orderNum: 'Order Num',
        deptCategory: 'Department Category',
        leader: 'Leader',
        phone: 'Phone',
        email: 'Email',
        status: 'Status',
        sort: 'Sort',
        createTime: 'Create Time',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All',
        form: {
          parentId: {
            required: 'Please select Parent Department',
            invalid: 'Parent Department cannot be empty'
          },
          deptName: {
            required: 'Please enter Department Name',
            invalid: 'Department Name cannot be empty'
          },
          orderNum: {
            required: 'Please enter Order Num',
            invalid: 'Order num cannot be empty'
          },
          deptCategory: {
            required: 'Please enter Department Category',
            invalid: 'Department category cannot be empty'
          },
          leader: {
            required: 'Please enter Leader',
            invalid: 'Leader cannot be empty'
          },
          phone: {
            required: 'Please enter Phone',
            invalid: 'Phone cannot be empty'
          },
          email: {
            required: 'Please enter Email',
            invalid: 'Email cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          sort: {
            required: 'Please enter Sort',
            invalid: 'Sort cannot be empty'
          },
          deptId: {
            required: 'Please enter deptId',
            invalid: 'Dept Id cannot be empty'
          }
        },
        error: {
          getDeptDataFail: 'Get dept data fail',
          getDeptUserDataFail: 'Get dept user data fail'
        },
        placeholder: {
          defaultLeaderPlaceHolder: 'Please select leader',
          addDataLeaderPlaceHolder: 'Department leader can be selected only when updating',
          deptUserIsEmptyLeaderPlaceHolder: 'Current dept has no leader'
        },
        addDept: 'Add Department',
        editDept: 'Edit Department'
      },
      dict: {
        title: 'Dictionary List',
        dictTypeTitle: 'Dictionary Type List',
        dictName: 'Dictionary Name',
        dictType: 'Dictionary Type',
        status: 'Status',
        remark: 'Remark',
        createTime: 'Create Time',
        refreshCacheSuccess: 'Refresh cache successfully',
        refreshCache: 'Refresh Cache',
        confirmDeleteDictType: 'Are you sure you want to delete dic type',
        data: {
          title: 'Dictionary Data List',
          label: 'Dictionary Label',
          value: 'Dictionary Value',
          dictSort: 'Sort',
          isDefault: 'Default',
          listClass: 'Display Style',
          cssClass: 'CSS Class',
          status: 'Status',
          remark: 'Remark',
          createTime: 'Create Time'
        },
        form: {
          dictId: {
            required: 'Please enter Dictionary Id',
            invalid: 'Dictionary Id cannot be empty'
          },
          dictCode: {
            required: 'Please enter Dictionary Code',
            invalid: 'Dictionary Code cannot be empty'
          },
          dictName: {
            required: 'Please enter Dictionary Name',
            invalid: 'Dictionary Name cannot be empty'
          },
          dictType: {
            required: 'Please enter Dictionary Type',
            invalid: 'Dictionary Type cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          },
          dictLabel: {
            required: 'Please enter Dictionary Label',
            invalid: 'Dictionary Label cannot be empty'
          },
          dictValue: {
            required: 'Please enter Dictionary Value',
            invalid: 'Dictionary Value cannot be empty'
          },
          dictSort: {
            required: 'Please enter Sort',
            invalid: 'Sort cannot be empty'
          },
          isDefault: {
            required: 'Please select Default',
            invalid: 'Default cannot be empty'
          },
          listClass: {
            required: 'Please select Display Style',
            invalid: 'Display Style cannot be empty'
          },
          cssClass: {
            required: 'Please enter CSS Class',
            invalid: 'CSS Class cannot be empty'
          }
        },
        addDict: 'Add Dictionary',
        editDict: 'Edit Dictionary',
        addDictData: 'Add Dictionary Data',
        editDictData: 'Edit Dictionary Data',
        addDictType: 'Add Dictionary Type',
        editDictType: 'Edit Dictionary Type',
        exportDictType: 'Export Dictionary Type',
        refreshDictType: 'Refresh Dictionary Type',
        dictTypeIsEmpty: 'Dictionary type is empty'
      },
      menu: {
        title: 'Menu List',
        parentId: 'Parent Menu',
        iconType: 'Icon Type',
        menuName: 'Menu Name',
        icon: 'Menu Icon',
        orderNum: 'Sort',
        perms: 'Permission Code',
        component: 'Component Path',
        path: 'Route Path',
        layout: 'Layout',
        externalPath: 'External Path',
        query: 'Route Parameters',
        iframeQuery: 'Iframe Address',
        isFrame: 'External Link',
        isCache: 'Cache',
        menuType: 'Menu Type',
        visible: 'Visible',
        status: 'Status',
        createTime: 'Create Time',
        cache: 'cache',
        noCache: 'No Cache',
        rootName: 'Root',
        buttonPermissionList: 'Button Permission List',
        emptyMenu: 'Empty Menu',
        menuDetail: 'Menu Detail',
        cascadeDeleteContent: 'Cascade delete menu will delete the selected menu and all its sub-menus, are you sure?',
        iconifyTip: 'iconify address: https://icones.js.org`',
        isFrameTip: 'If you choose External Link, the routing address needs to start with `http(s)://`',
        isCacheTip:
          'If you select yes, it will be cached by `keep-alive`, and the `name` and address of the matching component must be consistent',
        visibleTip: 'If you choose Hide, the route will not appear in the sidebar, but it can still be accessed.',
        statusTip: 'If you choose to disable, the route will not appear in the sidebar and cannot be accessed.',
        permsTip: "Permission string defined in the controller, such as: {'@'}SaCheckPermission('system:user:list')",
        componentTip:
          'The component path to access, such as: `system/user/index`, which is in the `views` directory by default',
        pathTip:
          'Router path: Example: `user`. If the external network address needs to be accessed in the internal link, then `http(s)://` beginning',
        layoutTip:
          'Default Layout: A layout that includes common sections such as the global header, sidebar, footer, etc;\nBlank Layout: A layout without any common sections, typically used for pages like the login page',
        form: {
          parentId: {
            required: 'Please select Parent Menu',
            invalid: 'Parent Menu cannot be empty'
          },
          menuType: {
            required: 'Please select Menu Type',
            invalid: 'Menu Type cannot be empty'
          },
          icon: {
            required: 'Please select Menu Icon',
            invalid: 'Menu Icon cannot be empty'
          },
          menuIds: {
            required: 'Please select Menu',
            invalid: 'Menu cannot be empty'
          },
          menuName: {
            required: 'Please enter Menu Name',
            invalid: 'Menu Name cannot be empty'
          },
          perms: {
            required: 'Please enter permission code',
            invalid: 'Permission code cannot be empty'
          },
          orderNum: {
            required: 'Please enter order num',
            invalid: 'Order num cannot be empty'
          },
          isFrame: {
            required: 'Please select External Link',
            invalid: 'External Link cannot be empty'
          },
          path: {
            required: 'Please enter Route Path',
            invalid: 'Route Path cannot be empty'
          },
          component: {
            required: 'Please enter Component Path',
            invalid: 'Component Path cannot be empty'
          },
          query: {
            required: 'Please enter Route Parameters',
            invalid: 'Route Parameters cannot be empty'
          },
          isCache: {
            required: 'Please select Cache',
            invalid: 'Cache cannot be empty'
          },
          visible: {
            required: 'Please select Visible',
            invalid: 'Visible cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          permission: {
            required: 'Please enter Permission',
            invalid: 'Permission cannot be empty'
          }
        },
        placeholder: {
          iconifyIconPlaceholder: 'Please enter an icon',
          localIconPlaceholder: 'Please select the local icon',
          queryKey: 'Please enter a key',
          queryValue: 'Please enter a value',
          queryIframe: 'Please enter a iframe address'
        },
        directory: 'Directory',
        menu: 'Menu',
        button: 'Button',
        addMenu: 'Add Menu',
        addChildMenu: 'Add Child Menu',
        editMenu: 'Edit Menu',
        cascadeDelete: 'Cascade Delete Menu'
      },
      notice: {
        title: 'Notice List',
        noticeTitle: 'Notice Title',
        noticeType: 'Notice Type',
        noticeContent: 'Notice Content',
        status: 'Status',
        createTime: 'Create Time',
        form: {
          noticeTitle: {
            required: 'Please enter Notice Title',
            invalid: 'Notice Title cannot be empty'
          },
          noticeType: {
            required: 'Please select Notice Type',
            invalid: 'Notice Type cannot be empty'
          },
          noticeContent: {
            required: 'Please enter Notice Content',
            invalid: 'Notice Content cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          noticeId: {
            required: 'Please enter Notice ID',
            invalid: 'Notice ID cannot be empty'
          }
        },
        createByName: 'Creator',
        addNotice: 'Add Notice',
        editNotice: 'Edit Notice'
      },
      oss: {
        title: 'File List',
        fileName: 'File Name',
        originalName: 'Original Name',
        fileSuffix: 'File Extension',
        url: 'File URL',
        createTime: 'Create Time',
        service: 'Service Provider',
        form: {
          file: {
            required: 'Please select a file',
            invalid: 'File cannot be empty'
          },
          fileName: {
            required: 'Please enter File Name',
            invalid: 'File Name cannot be empty'
          },
          originalName: {
            required: 'Please enter Original Name',
            invalid: 'Original Name cannot be empty'
          },
          fileSuffix: {
            required: 'Please enter File Extension',
            invalid: 'File Extension cannot be empty'
          },
          service: {
            required: 'Please enter Service Provider',
            invalid: 'Service Provider cannot be empty'
          },
          url: {
            required: 'Please enter File URL',
            invalid: 'File URL cannot be empty'
          }
        },
        upload: 'Upload File',
        uploadImage: 'Upload Image',
        ossId: 'OSS ID',
        createByName: 'Uploader',
        preview: 'Preview',
        previewEnable: 'Enable Preview',
        previewDisable: 'Disable Preview',
        confirmPreview: 'Are you sure to {action} preview?',
        download: 'Download',
        copy: 'Copy Link',
        copySuccess: 'Copy Success',
        configManage: 'Config Management'
      },
      ossConfig: {
        title: 'OSS Config List',
        configKey: 'Config Key',
        accessKey: 'Access Key',
        secretKey: 'Secret Key',
        bucketName: 'Bucket Name',
        prefix: 'Prefix',
        endpoint: 'Endpoint',
        domain: 'Custom Domain',
        isHttps: 'HTTPS',
        region: 'Region',
        status: 'Status',
        remark: 'Remark',
        createTime: 'Create Time',
        form: {
          configKey: {
            required: 'Please enter Config Key',
            invalid: 'Config Key cannot be empty'
          },
          accessKey: {
            required: 'Please enter Access Key',
            invalid: 'Access Key cannot be empty'
          },
          secretKey: {
            required: 'Please enter Secret Key',
            invalid: 'Secret Key cannot be empty'
          },
          bucketName: {
            required: 'Please enter Bucket Name',
            invalid: 'Bucket Name cannot be empty'
          },
          prefix: {
            required: 'Please enter Prefix',
            invalid: 'Prefix cannot be empty'
          },
          endpoint: {
            required: 'Please enter Endpoint',
            invalid: 'Endpoint cannot be empty'
          },
          domain: {
            required: 'Please enter Custom Domain',
            invalid: 'Custom Domain cannot be empty'
          },
          isHttps: {
            required: 'Please select HTTPS',
            invalid: 'HTTPS cannot be empty'
          },
          region: {
            required: 'Please enter Region',
            invalid: 'Region cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addOssConfig: 'Add OSS Config',
        editOssConfig: 'Edit OSS Config'
      },
      post: {
        title: 'Post List',
        postCode: 'Post Code',
        postName: 'Post Name',
        postSort: 'Post Sort',
        status: 'Status',
        remark: 'Remark',
        createTime: 'Create Time',
        postCategory: 'Post Category',
        form: {
          postId: {
            required: 'Please enter Post ID',
            invalid: 'Post ID cannot be empty'
          },
          deptId: {
            required: 'Please select Belonging Dept',
            invalid: 'Belonging Dept cannot be empty'
          },
          postCode: {
            required: 'Please enter Post Code',
            invalid: 'Post Code cannot be empty'
          },
          postName: {
            required: 'Please enter Post Name',
            invalid: 'Post Name cannot be empty'
          },
          postSort: {
            required: 'Please enter Post Sort',
            invalid: 'Post Sort cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          },
          postCategory: {
            required: 'Please enter Category Code',
            invalid: 'Category Code cannot be empty'
          }
        },
        addPost: 'Add Post',
        editPost: 'Edit Post'
      },
      role: {
        title: 'Role List',
        roleName: 'Role Name',
        roleKey: 'Role Key',
        roleSort: 'Role Sort',
        status: 'Status',
        remark: 'Remark',
        menuPermission: 'Menu Permission',
        dataScope: 'Data Scope',
        createTime: 'Create Time',
        form: {
          roleName: {
            required: 'Please enter Role Name',
            invalid: 'Role Name cannot be empty'
          },
          roleKey: {
            required: 'Please enter Role Key',
            invalid: 'Role Key cannot be empty'
          },
          roleSort: {
            required: 'Please enter Role Sort',
            invalid: 'Role Sort cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          },
          menuIds: {
            required: 'Please select Menu Permission',
            invalid: 'Menu Permission cannot be empty'
          },
          deptIds: {
            required: 'Please select Dept Permission',
            invalid: 'Dept Permission cannot be empty'
          },
          dataScope: {
            required: 'Please select Data Scope',
            invalid: 'Data Scope cannot be empty'
          }
        },
        addRole: 'Add Role',
        editRole: 'Edit Role',
        configPermission: 'Assign Permissions',
        authorizedUsers: 'Assign Users',
        selectMenuPermission: 'Select Menu Permission',
        selectDataScope: 'Select Data Scope',
        selectDeptPermission: 'Select Dept Permission',
        cancelAuth: 'Cancel Authorization',
        batchCancelAuth: 'Batch Cancel Authorization',
        authUser: 'Authorize User',
        batchAuthUser: 'Batch Authorize Users',
        dataScopeScope: 'Data Scope',
        roleAuth: 'Role Authorization',
        role: 'Role',
        statusChangeSuccess: 'Status modified successfully'
      },
      tenant: {
        title: 'Tenant List',
        tenantName: 'Tenant Name',
        tenantId: 'Tenant ID',
        contactUserName: 'Contact Person',
        contactPhone: 'Contact Phone',
        companyName: 'Company Name',
        licenseNumber: 'License Number',
        address: 'Address',
        intro: 'Introduction',
        domain: 'Domain',
        packageId: 'Tenant Package',
        expireTime: 'Expiration Time',
        accountCount: 'Account Count',
        status: 'Status',
        createTime: 'Create Time',
        form: {
          tenantName: {
            required: 'Please enter Tenant Name',
            invalid: 'Tenant Name cannot be empty'
          },
          contactUserName: {
            required: 'Please enter Contact Person',
            invalid: 'Contact Person cannot be empty'
          },
          contactPhone: {
            required: 'Please enter Contact Phone',
            invalid: 'Contact Phone cannot be empty'
          },
          companyName: {
            required: 'Please enter Company Name',
            invalid: 'Company Name cannot be empty'
          },
          licenseNumber: {
            required: 'Please enter License Number',
            invalid: 'License Number cannot be empty'
          },
          address: {
            required: 'Please enter Address',
            invalid: 'Address cannot be empty'
          },
          intro: {
            required: 'Please enter Introduction',
            invalid: 'Introduction cannot be empty'
          },
          domain: {
            required: 'Please enter Domain',
            invalid: 'Domain cannot be empty'
          },
          packageId: {
            required: 'Please select Tenant Package',
            invalid: 'Tenant Package cannot be empty'
          },
          expireTime: {
            required: 'Please select Expiration Time',
            invalid: 'Expiration Time cannot be empty'
          },
          accountCount: {
            required: 'Please enter Account Count',
            invalid: 'Account Count cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          }
        },
        addTenant: 'Add Tenant',
        editTenant: 'Edit Tenant'
      },
      tenantPackage: {
        title: 'Tenant Package List',
        packageName: 'Package Name',
        menuIds: 'Menu Permission',
        remark: 'Remark',
        status: 'Status',
        createTime: 'Create Time',
        form: {
          packageName: {
            required: 'Please enter Package Name',
            invalid: 'Package Name cannot be empty'
          },
          menuIds: {
            required: 'Please select Menu Permission',
            invalid: 'Menu Permission cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addTenantPackage: 'Add Tenant Package',
        editTenantPackage: 'Edit Tenant Package',
        statusChangeSuccess: 'Status modified successfully'
      },
      user: {
        title: 'User List',
        userName: 'Username',
        nickName: 'Nickname',
        deptName: 'Department',
        phonenumber: 'Phone Number',
        status: 'Status',
        createTime: 'Create Time',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        sex: 'Gender',
        roleIds: 'Roles',
        postIds: 'Posts',
        email: 'Email',
        avatar: 'Avatar',
        remark: 'Remark',
        form: {
          userName: {
            required: 'Please enter Username',
            invalid: 'Username cannot be empty'
          },
          nickName: {
            required: 'Please enter Nickname',
            invalid: 'Nickname cannot be empty'
          },
          deptId: {
            required: 'Please select Department',
            invalid: 'Department cannot be empty'
          },
          phonenumber: {
            required: 'Please enter Phone Number',
            invalid: 'Phone Number cannot be empty'
          },
          status: {
            required: 'Please select Status',
            invalid: 'Status cannot be empty'
          },
          password: {
            required: 'Please enter Password',
            invalid: 'Password cannot be empty'
          },
          confirmPassword: {
            required: 'Please enter Confirm Password',
            invalid: 'Confirm Password cannot be empty'
          },
          sex: {
            required: 'Please select Gender',
            invalid: 'Gender cannot be empty'
          },
          roleIds: {
            required: 'Please select Roles',
            invalid: 'Roles cannot be empty'
          },
          postIds: {
            required: 'Please select Posts',
            invalid: 'Posts cannot be empty'
          },
          email: {
            required: 'Please enter Email',
            invalid: 'Email cannot be empty'
          },
          remark: {
            required: 'Please enter Remark',
            invalid: 'Remark cannot be empty'
          }
        },
        addUser: 'Add User',
        editUser: 'Edit User',
        resetPassword: 'Reset Password',
        importUsers: 'Import Users',
        exportTemplate: 'Export Template',
        importSuccess: 'Import successful',
        statusChangeSuccess: 'Status modified successfully'
      }
    },
    monitor: {
      logininfor: {
        title: 'Login Log List',
        userName: 'User Account',
        ipaddr: 'Login Address',
        loginLocation: 'Login Location',
        browser: 'Browser',
        os: 'OS',
        status: 'Login Status',
        msg: 'Message',
        loginTime: 'Access Time',
        client: 'Client',
        deviceType: 'Device Type',
        unlock: 'Unlock',
        exportSuccess: 'Export Success',
        clean: 'Clean',
        cleanConfirm: 'Are you sure you want to clean all login log data items?',
        cleanSuccess: 'Cleaned successfully',
        unlockConfirm: 'Are you sure you want to unlock user {userName}?',
        unlockSuccess: 'Unlocked successfully',
        viewDetail: 'Detail',
        detailTitle: 'Login Information Detail',
        accountInfo: 'Account Information',
        form: {
          ipaddr: {
            required: 'Please enter Login IP Address',
            invalid: 'Invalid IP Address format'
          },
          userName: {
            required: 'Please enter User Account',
            invalid: 'User Account cannot be empty'
          },
          status: {
            required: 'Please select Login Status',
            invalid: 'Login Status cannot be empty'
          },
          loginTime: {
            required: 'Please select Login Time',
            invalid: 'Login Time cannot be empty'
          }
        }
      },
      operlog: {
        title: 'Operation Log List',
        module: 'System Module',
        businessType: 'Operation Type',
        operName: 'Operator',
        operIp: 'Operator IP',
        operLocation: 'Operator Location',
        status: 'Operation Status',
        operTime: 'Operation Time',
        costTime: 'Cost Time',
        viewDetail: 'Detail',
        detailTitle: 'Operation Log Detail',
        logId: 'Log ID',
        operInfo: 'Operation Info',
        requestInfo: 'Request Info',
        requestParam: 'Request Parameter',
        responseParam: 'Response Parameter',
        errorMsg: 'Error Message',
        clean: 'Clean',
        cleanConfirm: 'Are you sure you want to clean all operation log data items?',
        cleanSuccess: 'Cleaned successfully',
        form: {
          title: {
            required: 'Please enter System Module',
            invalid: 'System Module cannot be empty'
          },
          businessType: {
            required: 'Please select Operation Type',
            invalid: 'Operation Type cannot be empty'
          },
          operName: {
            required: 'Please enter Operator',
            invalid: 'Operator cannot be empty'
          },
          operIp: {
            required: 'Please enter Operator IP',
            invalid: 'Invalid Operator IP format'
          },
          status: {
            required: 'Please select Operation Status',
            invalid: 'Operation Status cannot be empty'
          },
          operTime: {
            required: 'Please select Operation Time',
            invalid: 'Operation Time cannot be empty'
          }
        }
      }
    },
    nodeDefinition: {
      title: 'Node Definition Management',
      tableView: 'Table View',
      jsonView: 'JSON View',
      import: 'Import Config',
      export: 'Export Config',
      save: 'Save Config',
      reset: 'Reset Config',
      formatJson: 'Format JSON',
      searchPlaceholder: 'Search node type, label, description...',
      filterCategory: 'Filter Category',
      listTitle: 'Node Definition List',
      jsonEditorTitle: 'JSON Editor',
      confirmSaveTitle: 'Confirm Save',
      confirmSaveContent:
        'Are you sure you want to save {count} node definitions? Existing definitions may be overwritten.',
      confirmResetTitle: 'Confirm Reset',
      confirmResetContent: 'Resetting will reload data from the server and discard unsaved changes. Continue?',
      saveSuccess: 'Saved successfully',
      saveFail: 'Save failed',
      importSuccess: 'Imported successfully',
      importFail: 'Import failed',
      exportSuccess: 'Exported successfully',
      exportFail: 'Export failed',
      jsonParseSuccess: 'JSON parsed successfully',
      jsonParseFail: 'JSON parse failed',
      jsonFormatError: 'JSON format error',
      editTip: 'Editing node definition...',
      saving: 'Saving...',
      load_workflow_failed: 'Failed to load workflow'
    },
    about: {
      title: 'About',
      introduction: `KMatrix is a core AI workflow orchestration platform and knowledge base based on Ruoyi_Vue_Plus/Langchain4j/Langgraph, providing developers with a complete AI application development solution.`,
      projectInfo: {
        title: 'Project Info',
        version: 'Version',
        latestBuildTime: 'Latest Build Time',
        documentLink: 'Document Link',
        previewLink: 'Preview Link',
        repositoryLink: 'Repository Link'
      },
      prdDep: 'Production Dependency',
      devDep: 'Development Dependency'
    },
    ai_rateLimit: {
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
    }
  },
  form: {
    required: 'Cannot be empty',
    userName: {
      required: 'Please enter user name',
      invalid: 'User name format is incorrect'
    },
    phone: {
      required: 'Please enter phone number',
      invalid: 'Phone number format is incorrect'
    },
    pwd: {
      required: 'Please enter password',
      invalid: '6-18 characters, including letters, numbers, and underscores'
    },
    confirmPwd: {
      required: 'Please enter password again',
      invalid: 'The two passwords are inconsistent'
    },
    code: {
      required: 'Please enter verification code',
      invalid: 'Verification code format is incorrect'
    },
    email: {
      required: 'Please enter email',
      invalid: 'Email format is incorrect'
    }
  },
  dropdown: {
    closeCurrent: 'Close Current',
    closeOther: 'Close Other',
    closeLeft: 'Close Left',
    closeRight: 'Close Right',
    closeAll: 'Close All',
    pin: 'Pin Tab',
    unpin: 'Unpin Tab'
  },
  icon: {
    themeConfig: 'Theme Configuration',
    themeSchema: 'Theme Schema',
    lang: 'Switch Language',
    fullscreen: 'Fullscreen',
    fullscreenExit: 'Exit Fullscreen',
    reload: 'Reload Page',
    collapse: 'Collapse Menu',
    expand: 'Expand Menu',
    pin: 'Pin',
    unpin: 'Unpin'
  },

  ai: {
    chat: {
      new_chat: 'New Chat',
      expand_sidebar: 'Expand Sidebar',
      load_app_info_fail: 'Failed to load app information',
      load_history_fail: 'Failed to load history messages',
      clear_history_success: 'All sessions cleared',
      delete_session_success: 'Session deleted',
      op_fail: 'Operation failed',
      chat_title: 'Chat',
      chat_failed: 'Chat failed',
      thinking_process: 'Thinking Process',
      time_cost: 'Time Cost',
      execution_details: 'Execution Details',
      node_count: 'Node Count',
      ai_thinking: 'AI Thinking...',
      ai_responding: 'AI Responding...',
      input_placeholder: "Input message, type {'@'} to select skills, Enter to send",
      close_execution_details: 'Collapse execution details',
      open_execution_details: 'View execution details',
      citation_details: 'Citation Details',
      similarity: 'Similarity',
      chunk_id: 'Chunk ID',
      unknown_document: 'Unknown Document',
      title_required: 'Title required',
      title_update_success: 'Title updated',
      title_update_fail: 'Failed to update title',
      history: 'History',
      clear_all: 'Clear all',
      no_sessions: 'No sessions',
      recent_sessions_tip: 'Recent sessions',
      read_stream_error: 'Failed to read stream',
      debug: 'Debug',
      debug_tip1:
        'In debug mode, you can see the execution process of the workflow and the output of each node in real-time.',
      debug_tip2: 'Conversations in debug mode will not be saved to history.',
      like: 'Like',
      dislike: 'Dislike',
      cancel_like: 'Cancel Like',
      cancel_dislike: 'Cancel Dislike',
      upload_image: 'Upload Image',
      upload_audio: 'Upload Audio',
      upload_fail: 'Upload failed',
      upload_error: 'Upload error',
      abort: 'Abort',
      abort_success: 'Aborted',
      abort_failed: 'Abort failed',
      abortSuccess: 'Abort successful',
      abortFailed: 'Abort failed',
      aborted: 'Aborted',
      resume_session: 'Resume Session',
      resumable_sessions: 'Resumable Sessions',
      no_resumable_sessions: 'No resumable sessions',
      load_resumable_failed: 'Failed to load resumable sessions',
      resume_success: 'Session resumed',
      resume_failed: 'Failed to resume session',
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
      messageCount: 'Message Count'
    },
    msg: {
      rate_limit: {
        request_exceeded: 'Request frequency exceeded, please try again later',
        token_exceeded: 'Token consumption exceeded, please try again later'
      }
    },
    common: {
      provider_type: {
        public: 'Public',
        local: 'Local'
      },
      model_type: {
        llm: 'Language Model',
        vector: 'Vector Model',
        rerank: 'Rerank Model',
        speech: 'Speech Model',
        image: 'Image Model',
        video: 'Video Model'
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
    },
    skill: {
      label: 'Skill',
      info: 'Skill Info',
      add: 'Add Skill',
      edit: 'Edit Skill',
      listTitle: 'Skill List',
      name: 'Skill Name',
      description: 'Skill Description',
      toolBindings: 'Tool Bindings',
      inputSchema: 'Input Schema',
      outputSchema: 'Output Schema',
      providedBySkillConfig: 'Provided by skill configuration',
      noAvailableToolsOrSkills: 'No available tools or skills',
      confirmDelete: 'Are you sure you want to delete this skill?',
      confirmBatchDelete: 'Are you sure you want to delete the selected skills?',
      placeholder: {
        name: 'Please enter skill name (used as LLM Function name, English recommended)',
        nameSearch: 'Please enter skill name',
        description: 'Please enter skill description (for LLM reference)',
        toolBindings: 'Please enter tool binding JSON configuration',
        inputSchema: 'JSON Schema format',
        statusSearch: 'Please select status'
      },
      tip: {
        jsonBinding: 'Temporarily use JSON format for tool binding: [{"type":"builtin","id":1}, {"type":"mcp","id":2}]'
      }
    },
    datasource: {
      name: 'Name',
      type: 'Type',
      metadata_manage: 'Manage Metadata',
      add: 'New Data Source',
      search_placeholder: 'Enter name to search...',
      ddl_import: 'DDL Import',
      sync_metadata: 'Sync Metadata',
      table_name: 'Table Name',
      table_comment: 'Comment',
      search: 'Search',
      list_title: 'Data Source List',
      connection_info: 'Connection Info',
      status: 'Status',
      operation: 'Operations',
      type_dynamic: 'Dynamic',
      type_manual: 'Manual',
      status_enabled: 'Enabled',
      status_disabled: 'Disabled',
      edit: 'Edit',
      delete: 'Delete',
      delete_confirm: 'Are you sure to delete this data source?',
      delete_success: 'Data source deleted successfully',
      delete_fail: 'Failed to delete data source: {error}',
      load_fail: 'Failed to load data sources: {error}',
      unknown_error: 'Unknown error',
      form: {
        add_title: 'New Data Source',
        edit_title: 'Edit Data Source',
        name_label: 'Name',
        name_placeholder: 'Enter data source name',
        name_required: 'Name is required',
        source_type_label: 'Type',
        source_type_required: 'Please select data source type',
        type_manual_label: 'Manual',
        type_dynamic_label: 'Dynamic',
        dynamic_select: 'Select dynamic data source...',
        ds_key_label: 'Dynamic DS Key',
        driver_label: 'Driver',
        jdbc_url_label: 'JDBC URL',
        jdbc_url_required: 'JDBC URL is required',
        username_label: 'Username',
        username_required: 'Username is required',
        password_label: 'Password',
        password_placeholder: 'Enter password',
        db_type_label: 'DB Type',
        is_enabled_label: 'Enabled',
        cancel: 'Cancel',
        confirm: 'Confirm',
        add_success: 'Data source created successfully',
        edit_success: 'Data source edited successfully',
        submit_fail: 'Save failed: {error}',
        driver_required: 'Driver name is required',
        dynamic_ds_required: 'Please select a dynamic data source'
      },
      metadata: {
        title: '元数据管理',
        ddl_import_title: 'DDL 语句导入',
        sync_metadata_title: 'JDBC 同步',
        ddl_placeholder: '请输入 DDL 语句...',
        import_success: '获取成功',
        import_fail: '获取失败',
        sync_success: '同步成功',
        sync_fail: '同步失败',
        load_fail: '数据加载失败',
        ddl_required: '请输入 DDL',
        confirm_sync: '确认从该数据源同步元数据吗？',
        source_label: '数据来源',
        source_ddl: 'DDL导入',
        source_jdbc: 'JDBC同步',
        list_tab: '已导入表',
        jdbc_tab: '数据库表',
        close: '关闭',
        delete_success: '删除成功',
        delete_fail: '删除失败',
        unknown_error: '未知错误',
        ddl_tip: '通过 DDL 语句识别并导入表结构',
        parse_and_import: '解析并导入',
        jdbc_sync_tip: '直接从配置的 JDBC 数据源中读取元数据并同步'
      }
    },
    node_definition: {
      icon: 'Icon',
      node_type: 'Node Type',
      name: 'Name',
      category: 'Category',
      system_reserved: 'System Reserved',
      operation: 'Operation',
      search_title: 'Search',
      category_label: 'Category',
      select_category: 'Please select category',
      node_definition_title: 'Node Definition',
      copy_suffix: ' (Copy)',
      source_node: 'Source Node',
      new_node_type: 'New Node Type',
      input_new_node_type: 'Input new unique node type',
      unique_id_placeholder: 'Unique identifier (e.g., LLM_CHAT)',
      node_name: 'Node Name',
      display_name: 'Display Name',
      icon_placeholder: 'e.g., mdi:robot',
      color: 'Color',
      status: 'Status',
      enable: 'Enable',
      disable: 'Disable',
      description: 'Description',
      node_desc_placeholder: 'Node description',
      custom_input_params: 'Custom Input Params',
      allow: 'Allow',
      forbid: 'Forbid',
      custom_output_params: 'Custom Output Params',
      parameters: 'Parameters',
      type_string: 'String',
      type_number: 'Number',
      type_boolean: 'Boolean',
      type_object: 'Object',
      type_array: 'Array',
      add_parameter: 'Add Parameter',
      no_parameter_click_add: 'No parameter, click button to add',
      parameter_index: 'Parameter {index}',
      required: 'Required',
      param_key_name: 'Param Key Name *',
      param_key_placeholder: 'e.g., userInput',
      param_label: 'Param Label *',
      param_label_placeholder: 'e.g., User Input',
      param_type: 'Param Type',
      default_value: 'Default Value',
      optional: 'Optional',
      param_desc_placeholder: 'Parameter Description',
      required_parameter: 'Required Parameter',
      parameter_config: 'Parameter Configuration',
      prompt: 'Prompt',
      param_config_warning1:
        'Parameter configuration is closely related to development. Do not modify it unless you know what you are doing',
      param_config_warning2:
        'The parameter key is used to reference the value of this parameter in the workflow. Please ensure the key is unique and the data type is correct',
      input_params: 'Input Parameters',
      output_params: 'Output Parameters'
    },
    knowledge_manager: {
      stats: {
        knowledgeBase: 'Knowledge Base',
        dataset: 'Dataset',
        document: 'Document',
        chunk: 'Chunk',
        processing: 'Processing',
        failed: 'Failed'
      },
      search: 'Search',
      searchPlaceholder: 'Enter knowledge base name',
      listTitle: 'Knowledge Base List',
      retrievalTest: 'Retrieval Test',
      createKnowledgeBase: 'Create Knowledge Base',
      status: {
        active: 'Active',
        archived: 'Archived'
      },
      noDescription: 'No description',
      datasetCount: '{count} datasets',
      documentCount: '{count} documents',
      manage: 'Manage',
      edit: 'Edit',
      delete: 'Delete',
      deleteConfirmTitle: 'Confirm Delete',
      deleteConfirmContent:
        'Are you sure to delete knowledge base "{name}"? All associated datasets and documents will be deleted!',
      deleteSuccess: 'Deleted successfully',
      emptyDescription: 'No knowledge base yet, click top right to create',
      modal: {
        create: 'Create',
        edit: 'Edit Knowledge Base',
        save: 'Save',
        cancel: 'Cancel',
        name: 'Name',
        namePlaceholder: 'Enter knowledge base name',
        description: 'Description',
        descPlaceholder: 'Enter knowledge base description',
        nameMaxLength: 'Name cannot exceed 50 characters',
        nameRequired: 'Please enter knowledge base name',
        addSuccess: 'Created successfully',
        updateSuccess: 'Updated successfully',
        embeddingModel: 'Embedding Model',
        embeddingModelPlaceholder: 'Select embedding model (cannot be modified after creation)',
        embeddingModelEditTip: 'Embedding model cannot be changed once bound to ensure vector space consistency.',
        embeddingModelRequired: 'Please select an embedding model in Independent Model mode'
      },
      sandbox: {
        title: 'Retrieval Test Sandbox',
        reset: 'Reset',
        searchPlaceholder: 'Enter test question...',
        search: 'Search',
        config: 'Retrieval Config',
        knowledgeBase: 'Knowledge Base',
        kbPlaceholder: 'Select knowledge base (multi-select)',
        dataset: 'Dataset',
        datasetPlaceholder: 'Select dataset (multi-select)',
        topK: 'Return Count (TopK)',
        threshold: 'Similarity Threshold',
        mode: 'Retrieval Mode',
        modeVector: 'Vector',
        modeKeyword: 'Keyword',
        modeHybrid: 'Hybrid',
        enableRerank: 'Enable Rerank',
        rerankTooltip: 'Use rerank model to re-sort results for better accuracy',
        enableHighlight: 'Enable Highlight',
        highlightTooltip: 'Highlight matching keywords in search results',
        downloadError: 'Download failed',
        noDocIdError: 'Cannot download: missing document ID',
        hitContent: 'Hit Content',
        hitTitle: 'Hit Title',
        hitQuestion: 'Hit Question',
        resultTitle: 'Search Results',
        items: '{count} items',
        unknownDoc: 'Unknown Document',
        downloadFile: 'Download Original File',
        matchedQuestions: 'Matched Questions:',
        noResult: 'No matching results, please adjust your query or parameters',
        emptyInput: 'Enter a question and click search',
        detailTitle: 'Chunk Detail',
        similarity: 'Similarity: {score}'
      },
      permission: 'Permission',
      select_permission_level: 'Select Permission Level',
      download_failed: 'Download Failed'
    },
    knowledge_detail: {
      index: {
        loadKBFail: 'Failed to load knowledge base',
        confirmDelete: 'Confirm Delete',
        deleteDatasetConfirm: 'Are you sure to delete dataset "{name}"? All associated documents will be deleted!',
        deleteSuccess: 'Deleted successfully',
        onlineDocSaveSuccess: 'Online document saved successfully',
        saveFail: 'Save failed',
        addWebLinkSuccess: 'Successfully added {count} web links',
        addFail: 'Add failed',
        processType: {
          QA_PAIR: 'QA Pair',
          ONLINE_DOC: 'Online Document',
          WEB_LINK: 'Web Link',
          GENERIC_FILE: 'Generic File',
          UNKNOWN: 'Unknown'
        },
        stats: {
          question: 'Questions',
          chunk: 'Chunks',
          document: 'Documents',
          processing: 'Processing',
          failed: 'Failed'
        },
        retrievalTest: 'Retrieval Test',
        tabs: {
          documents: 'Documents',
          questions: 'Questions'
        },
        dataset: {
          title: 'Dataset',
          desc1: 'Datasets are used to organize knowledge base documents',
          desc2: 'Different datasets correspond to different collection methods and processing rules',
          add: 'Add Dataset',
          system: 'System',
          docCount: '{count} documents',
          empty: 'No datasets',
          edit: 'Edit',
          delete: 'Delete',
          pleaseSelect: 'Please select or create a dataset'
        }
      },
      document: {
        documentName: 'Document Name',
        fileSize: 'File Size',
        enabled: 'Enabled',
        disabled: 'Disabled',
        embeddingStatus: 'Embedding',
        statusUnembedded: 'Not Generated',
        statusEmbedding: 'Generating',
        statusEmbedded: 'Generated',
        statusFailed: 'Failed',
        questionStatus: 'Question Generation',
        chunkCount: 'Chunks',
        tokenCount: 'Tokens',
        createTime: 'Created At',
        actionChunkManage: 'Chunk Management',
        actionEmbedding: 'Embedding',
        actionGenerateQuestion: 'AI Generate Questions',
        actionStatusRecord: 'Status Record',
        actionDelete: 'Delete',
        enableSuccess: 'Enabled successfully',
        disableSuccess: 'Disabled successfully',
        confirmDeleteDoc: 'Are you sure to delete this document?',
        editSuccess: 'Updated successfully',
        editFail: 'Update failed',
        startEmbeddingSuccess: 'Embedding task started, please wait',
        operateFail: 'Operation failed',
        startGenerateQuestionSuccess: 'Question generation task started',
        uploadSuccess: 'Upload successful, processing...',
        uploadFile: 'Upload File',
        uploadQA: 'Upload QA Pairs',
        addOnlineDoc: 'Add Online Document',
        addWebLink: 'Add Web Link',
        addDoc: 'Add Document',
        customChunk: 'Custom Chunking',
        dragUpload: 'Click or drag files here to upload',
        qaFormatTip: 'QA pairs support Excel(.xlsx/.xls) and CSV files, first column for questions, second for answers',
        fileFormatTip: 'Supports PDF, Word, TXT, Markdown and other common formats',
        batchEnable: 'Enable',
        batchDisable: 'Disable',
        batchEmbedding: 'Embedding',
        batchGenerateQuestion: 'Generate Questions',
        documentPromptTip:
          'The {code} in the prompt is a placeholder for the segment content, which will be replaced with the segment content and sent to the AI model during execution;\nThe AI model generates related questions based on the segment content, returning one question per line;\nThe generation quality depends on the selected model and prompt, users can adjust for best results.',
        documentPromptText:
          'Based on the following reference text, identify 3-5 potential user questions.\nOnly output questions, one per line. Do not number them.\nReference text:\n{data}'
      },
      datasetModal: {
        editDataset: 'Edit Dataset',
        createDataset: 'Create Dataset',
        systemPreset: 'System preset dataset, some settings cannot be modified',
        name: 'Name',
        namePlaceholder: 'Enter dataset name',
        nameRequired: 'Please enter dataset name',
        nameMaxLength: 'Name cannot exceed 50 characters',
        type: 'Type',
        typePlaceholder: 'Select dataset type',
        typeRequired: 'Please select dataset type',
        typeOptions: {
          FILE: 'File Upload',
          WEB: 'Web Crawl',
          MANUAL: 'Manual Entry'
        },
        processType: 'Process Type',
        processTypePlaceholder: 'Select process type',
        processTypeRequired: 'Please select process type',
        processTypeOptions: {
          GENERIC_FILE: 'Generic File (PDF/Word/TXT)',
          QA_PAIR: 'QA Pair (Excel/CSV)',
          ONLINE_DOC: 'Online Document',
          WEB_LINK: 'Web Link'
        },
        sourceType: 'Source Type',
        sourceTypePlaceholder: 'Select data source type',
        sourceTypeOptions: {
          FILE_UPLOAD: 'File Upload',
          TEXT_INPUT: 'Text Input',
          WEB_CRAWL: 'Web Crawl'
        },
        chunkSetting: 'Chunk Settings',
        minChunkSize: 'Min Chunk Size',
        minChunkSizePlaceholder: 'Min token count',
        maxChunkSize: 'Max Chunk Size',
        maxChunkSizePlaceholder: 'Max token count',
        chunkOverlap: 'Chunk Overlap',
        chunkOverlapPlaceholder: 'Overlap token count',
        childChunkSize: 'Child Chunk Size (Optional)',
        childChunkSizePlaceholder: 'Leave empty to use system default',
        childChunkOverlap: 'Child Chunk Overlap (Optional)',
        childChunkOverlapPlaceholder: 'Leave empty to use system default',
        updateSuccess: 'Updated successfully',
        createSuccess: 'Created successfully',
        save: 'Save',
        create: 'Create'
      },
      onlineDocModal: {
        add: 'New Online Document',
        edit: 'Edit Online Document',
        title: 'Title',
        titlePlaceholder: 'Enter document title',
        titleRequired: 'Please enter document title',
        content: 'Content',
        contentPlaceholder: 'Enter document content (supports rich text)',
        contentRequired: 'Please enter document content'
      },
      webLinkModal: {
        add: 'Add Web Link',
        singleTab: 'Single Link',
        url: 'URL',
        urlPlaceholder: 'https://example.com',
        batchTab: 'Batch Import',
        batchUrlLabel: 'URL List (one per line)',
        batchUrlPlaceholder: 'https://example.com/page1\nhttps://example.com/page2\nhttps://example.com/page3',
        addBtn: 'Add',
        singleUrlRequired: 'Please enter web link',
        singleUrlInvalid: 'Please enter a valid URL (starting with http:// or https://)',
        batchUrlsRequired: 'Please enter web links (one per line)'
      },
      questionTable: {
        content: 'Question Content',
        clickToDetail: 'Click to view details',
        chunkCount: 'Linked Chunks',
        hitNum: 'Hit Count',
        sourceType: 'Source',
        sourceMap: {
          MANUAL: 'Manual',
          LLM: 'AI Generated',
          UNKNOWN: 'Unknown'
        },
        createTime: 'Created At',
        updateTime: 'Updated At',
        actionLink: 'Link Chunks',
        actionDelete: 'Delete',
        editSuccess: 'Updated successfully',
        editFail: 'Update failed',
        deleteConfirmTitle: 'Confirm Delete',
        deleteConfirmContent: 'Are you sure to delete this question?',
        deleteSuccess: 'Deleted successfully',
        listTitle: 'Question List',
        addQuestion: 'Add Question'
      },
      questionAddModal: {
        title: 'Batch Add Questions',
        tip: 'One question per line, will be created in batch after submission.',
        placeholder:
          'Enter questions, one per line\nExample:\nHow to use this system?\nWhat features does the system support?\nHow to export data?',
        addSuccess: 'Successfully added {count} questions',
        addFail: 'Add failed',
        requireContent: 'Please enter question content'
      },
      chunkLinkModal: {
        title: 'Link Chunks',
        selectDoc: 'Select Document',
        docCount: '{count}',
        searchDoc: 'Search documents...',
        loading: 'Loading...',
        noDoc: 'No documents',
        selectChunk: 'Select Chunk',
        linkedCount: '{count} linked',
        currentDocCount: 'Current doc {count}',
        displayLevel: 'Display',
        levelConcise: 'Concise',
        levelMedium: 'Medium',
        levelDetailed: 'Detailed',
        searchChunk: 'Search chunk title or content...',
        requireSelectDoc: 'Please select a document on the left',
        noChunk: 'No chunks',
        noTitle: 'No Title',
        linked: 'Linked',
        loadMore: 'Scroll down to load more',
        loadAll: 'All chunks loaded',
        linkSuccess: 'Linked successfully',
        linkFail: 'Link failed',
        unlinkSuccess: 'Unlinked successfully',
        unlinkFail: 'Unlink failed',
        loadDocFail: 'Failed to load document list',
        loadLinkedFail: 'Failed to load linked chunks',
        loadChunkFail: 'Failed to load chunk list'
      },
      questionDetailDrawer: {
        title: 'Question Detail',
        question: 'Question',
        edit: 'Edit',
        questionPlaceholder: 'Enter question content',
        sourceMap: {
          MANUAL: 'Manual',
          LLM: 'AI Generated'
        },
        sourcePrefix: 'Source: ',
        hitNumPrefix: 'Hit Count: ',
        createTimePrefix: 'Created: ',
        linkedChunksTitle: 'Linked Chunks ({count})',
        addLink: 'Add Link',
        loading: 'Loading...',
        noLinkedChunks: 'No linked chunks',
        noTitle: 'No Title',
        unlink: 'Unlink',
        documentLabel: 'Document: {title}',
        prev: 'Previous',
        next: 'Next',
        editSuccess: 'Updated successfully',
        editFail: 'Update failed',
        loadLinkFail: 'Failed to load linked chunks',
        unlinkConfirmTitle: 'Confirm Unlink',
        unlinkConfirmContent: 'Are you sure to unlink this question from this chunk?',
        unlinkSuccess: 'Unlinked successfully',
        contentEmpty: 'Content cannot be empty',
        saveSuccess: 'Saved successfully',
        saveFail: 'Save failed'
      },
      view_chunks: 'View Chunks',
      test: 'Retrieval Test'
    },
    documentSearch: {
      all: 'All',
      enabled: 'Enabled',
      disabled: 'Disabled',
      unGenerated: 'Not Generated',
      generating: 'Generating',
      generated: 'Generated',
      generateFailed: 'Generate Failed',
      keyword: 'Keyword',
      searchDocName: 'Search document name',
      enableStatus: 'Enable Status',
      embeddingStatus: 'Embedding Status',
      questionStatus: 'Question Generation Status'
    },
    documentStatusModal: {
      statusChangeRecord: 'Status Change Record',
      embeddingTask: 'Embedding Task',
      generateQuestionTask: 'Question Generation Task',
      unknownTask: 'Unknown Task',
      pending: 'Pending',
      started: 'Started',
      success: 'Success',
      failed: 'Failed',
      unknownStatus: 'Unknown Status',
      noStatusRecord: 'No status records'
    },
    embeddingConfirmModal: {
      selectChunk: 'Select Chunks',
      unembeddedOnly: 'Only process unsuccessful chunks',
      allChunks: 'All chunks'
    },
    chunk_manager: {
      batch_generate_loading: 'Batch generating questions...',
      batch_generate_success: 'Batch question generation successful',
      batch_generate_error: 'Batch question generation failed',
      content_empty_error: 'Content cannot be empty',
      select_chunk_prompt: 'Please select a chunk',
      add_chunk: 'New Chunk',
      edit_chunk: 'Edit Chunk',
      chunk_detail: 'Chunk Detail',
      chunk_title: 'Chunk Title',
      chunk_content: 'Chunk Content',
      chunk_index: 'Chunk {index}',
      chunk_count: '{count} chunks',
      no_title: 'No Title',
      title_placeholder: 'Enter title',
      title_optional_placeholder: 'Chunk title (optional)',
      content_placeholder: 'Enter chunk content',
      content_required_placeholder: 'Chunk content (required)',
      associated_questions: 'Associated Questions',
      ai_generate_question: 'AI Generate Questions',
      add_question_placeholder: 'Add: type and press Enter, or select existing',
      no_associated_questions: 'No associated questions',
      batch_mode: 'Batch Mode',
      selected_items: '{count} selected',
      batch_selection: 'Batch Select',
      exit_batch: 'Cancel Selection',
      add_new_chunk: 'Add New Chunk',
      no_chunks: 'No chunks',
      loading: 'Loading...',
      all_chunks_loaded: 'All chunks loaded',
      batch_enable: 'Batch Enable',
      batch_disable: 'Batch Disable',
      batch_delete: 'Batch Delete',
      delete: 'Delete',
      confirm_delete_chunk: 'Are you sure to delete this chunk?',
      operating: 'Operation in progress, please wait...',
      enabled_success: 'Enabled',
      disabled_success: 'Disabled',
      delete_success: 'Deleted successfully',
      delete_fail: 'Delete failed',
      save_success: 'Saved successfully',
      save_fail: 'Save failed',
      op_fail: 'Operation failed',
      link_success: 'Link successfully',
      unlink_success: 'Unlink successfully',
      generating: 'Generating...',
      batch_enable_success: 'Batch enable successful',
      batch_disable_success: 'Batch disable successful',
      please_select_chunks: 'Please select chunks first',
      displayLevel: 'Display',
      action: 'Action',
      display_concise: 'Concise',
      display_medium: 'Medium',
      display_detailed: 'Detailed',
      model_select_modal: {
        default_prompt:
          'Please identify 3-5 potential user questions based on the following reference text.\nOutput only the questions, one per line. Do not number them.\nReference text:\n{data}',
        alert_placeholders:
          'The {code} in the prompt is a placeholder for the chunk content, which will be replaced by the actual content when sent to the AI model;',
        alert_role:
          'The AI model will generate relevant questions based on the chunk content and return them one per line;',
        alert_adjustment:
          'The generation quality depends on the selected model and prompt. Users can adjust them for the best results.'
      }
    },
    document_upload: {
      step1: {
        title: 'Upload Files - Select Files',
        tip1: '1. Before uploading, it is recommended to standardize segment markers in the file',
        tip2: '2. Upload up to 50 files at a time, each no larger than 100 MB',
        upload_dragger_text: 'Click or drag files here to upload or',
        upload_folder_btn: 'Click to upload folder',
        upload_limit_tip: 'Supports TXT, PDF, DOCX, MD and other common formats',
        selected_files_count: 'Selected files ({count})',
        next_step: 'Next: Preview chunks',
        select_file_warning: 'Please select files first',
        no_valid_files: 'No valid files',
        upload_failed_no_data: 'Upload failed, no temporary file info returned',
        upload_error: 'File upload failed: {error}',
        files_selected_success: '{count} files selected',
        drag_support_tip: 'Supports TXT, PDF, DOCX, MD and other common formats',
        parsing: 'Parsing...',
        parse_success: 'Parsed successfully',
        parse_fail: 'Parse failed',
        waiting_upload: 'Waiting to upload',
        upload_success: 'Uploaded successfully',
        clear_upload_list: 'Clear upload list',
        clear_confirm: 'Are you sure to clear all upload files?',
        re_upload_fail: 'Re-upload failed'
      },
      step2: {
        title: 'Upload Files - Chunk Preview',
        chunk_preview: 'Chunk Preview',
        confirm_upload: 'Confirm Upload',
        cancel: 'Cancel',
        temp_file_id_invalid: 'Temporary file ID is invalid, please re-upload',
        file_count: '{count} files',
        chunk_rule: 'Chunk Rules',
        auto_segment: 'Smart Segmentation (Recommended)',
        auto_segment_tip: 'Use smart segmentation if you are unsure about segmentation rules',
        custom_segment: 'Advanced Segmentation',
        custom_segment_tip: 'Set segment markers, length and cleaning rules according to document specifications',
        separators: 'Segment Markers',
        separators_tip: 'If not set, double newline is used by default',
        separators_placeholder: 'Select or enter custom markers',
        chunk_size: 'Segment Length',
        overlap_size: 'Overlap Length',
        auto_clean: 'Auto Clean',
        auto_clean_tip: 'Remove duplicate symbols, spaces, empty lines, and tabs',
        generate_preview: 'Generate Preview',
        batch_preview_btn: 'Generate preview for all unreviewed files',
        file_list: 'File List',
        search_placeholder: 'Search files...',
        no_matching_files: 'No matching files',
        chunked_status: 'Chunked ({count})',
        waiting_status: 'Pending',
        no_chunks_prompt: 'No chunk data, please click "Generate Preview"',
        chunk_label: 'Chunk {index}',
        char_count: '{count} characters',
        prev_step: 'Previous',
        submit_btn: 'Submit',
        edit_modal_title: 'Edit Chunk Content',
        content_placeholder: 'Enter chunk content',
        separator_double_newline: 'Double Newline (\\n\\n)',
        separator_newline: 'Newline (\\n)',
        separator_period: 'Period (.)',
        separator_exclamation: 'Exclamation (!)',
        separator_question: 'Question (?)',
        separator_semicolon: 'Semicolon (;)',
        separator_space: 'Space ( )'
      }
    },
    app_manager: {
      title: 'App Management',
      search: 'Search',
      create_app: 'Create App',
      custom_workflow: 'Custom Workflow',
      fixed_template: 'Fixed Template',
      create_from_template: 'Create from Template',
      search_placeholder: 'Enter app name',
      app_name: 'App Name',
      app_name_placeholder: 'Enter app name',
      app_desc: 'App Description',
      app_desc_placeholder: 'Enter app description',
      confirm_delete_title: 'Confirm Delete',
      confirm_delete_content: 'Are you sure to delete app "{name}"? This action cannot be undone.',
      no_description: 'No description',
      creator: 'Creator',
      status_published: 'Published',
      status_unpublished: 'Unpublished',
      workflow_config: 'Workflow Config',
      go_to_chat: 'Go to Chat',
      template_select: {
        title: 'Create App from Template',
        search_placeholder: 'Search template name',
        all_categories: 'All Categories',
        all_types: 'All Types',
        system_template: 'System Template',
        custom_template: 'Custom Template',
        use_count: 'Used {count} times',
        use_this_template: 'Use This Template',
        set_name_title: 'Set App Name',
        based_on: 'Based on {name}',
        no_templates: 'No templates available'
      }
    },
    app_detail: {
      title: 'App Detail',
      public_access_opened: 'Public access enabled',
      public_access_closed: 'Public access disabled',
      refresh: 'Refresh',
      workflow_settings: 'Workflow Settings',
      app_config: 'App Config',
      run: 'Deploy & Run',
      debug: 'Debug',
      publish_btn: 'Publish',
      publish_confirm_content:
        'Confirm publishing this app? After publishing, it can be accessed through the chat entry.',
      public_access: 'Public Access',
      refresh_token_tip:
        'Regenerating the access link will invalidate embedded chat widgets in third-party sites. You will need to re-embed the new script.',
      enable_execution_detail: 'Enable Execution Detail',
      disable_execution_detail: 'Disable Execution Detail',
      enable_execution_detail_success: 'Execution detail enabled',
      disable_execution_detail_success: 'Execution detail disabled',
      public_link: 'Link',
      workflow_not_configured_yet_confirm: 'The workflow is not configured yet. Setup now?',
      workflow_missing_model_confirm: 'Missing required configuration: Reasoning model. Setup workflow now?',
      workflow_config_error_confirm: '{error}. Setup workflow now?',
      go_to_config: 'Go to Configuration',
      embed: {
        title: 'Embed in Third Party Page',
        fullscreen: 'Fullscreen Mode',
        mobile: 'Mobile Mode',
        float: 'Float Mode',
        copy_code_tip: 'Copy the code below to embed'
      },
      monitor: {
        title: 'Monitor Statistics',
        user_count: 'Total Users',
        question_count: 'Questions Asked',
        tokens_total: 'Total Tokens',
        satisfaction: 'User Satisfaction',
        period_7d: 'Last 7 Days',
        period_30d: 'Last 30 Days',
        period_90d: 'Last 90 Days',
        period_all: 'All Time'
      },
      config: {
        pleaseSelect: 'Please Select',
        knowledgeBase: 'Knowledge Base',
        ai_model_tab: 'AI Model Config',
        kb_retrieval_tab: 'Knowledge Retrieval Config',
        inference_model: 'Inference Model',
        system_prompt: 'System Prompt',
        system_prompt_placeholder: 'Define AI assistant role and behavior',
        user_prompt: 'User Prompt',
        user_prompt_placeholder: 'Specific questions or instructions from user to LLM (optional)',
        temperature: 'Temperature',
        enable_history: 'Enable History',
        history_count: 'History Count',
        stream_output: 'Stream Output',
        max_tokens: 'Max Tokens',
        threshold: 'Score Threshold',
        rerank: 'Rerank',
        empty_response: 'Empty Result Reply',
        empty_response_placeholder: 'Default reply when no relevant knowledge found (optional)',
        temp_precise: 'Precise',
        temp_balanced: 'Balanced',
        temp_creative: 'Creative',
        temp_random: 'Random',
        temp_very_random: 'Highly Random',
        retrieval_mode: 'Retrieval Mode',
        kb_mode_vector: 'Vector Search',
        kb_mode_keyword: 'Keyword Search',
        kb_mode_hybrid: 'Hybrid Search',
        save_btn: 'Save Config',
        save_success: 'Config saved',
        save_failed: 'Save failed',
        save_warning: 'Please fill in app name, select model and KB',
        load_options_failed: 'Failed to load options'
      },
      workflow_incomplete: 'Workflow Incomplete',
      workflow_not_configured: 'Workflow not configured',
      workflow_has_errors: 'Workflow has errors, please fix them before publishing',
      missing_required_config: 'Missing required configuration',
      go_config: 'Go to Config',
      cancel: 'Cancel',
      copy_link: 'Copy Link',
      copy_embed_code: 'Copy Embed Code',
      fullscreen_code: 'Fullscreen Embed Code',
      mobile_code: 'Mobile Embed Code',
      float_code: 'Float Embed Code',
      publish_from_detail: 'Publish from App Details Page',
      fill_app_name_model_kb: 'Please fill in app name, select model and knowledge base'
    },
    model_manager: {
      test: {
        title: 'Model Test (Playground)',
        current_model: 'Current model for testing:',
        chat_placeholder: 'Please enter a message to begin...',
        ctrl_enter_send: 'Ctrl + Enter to send...'
      },
      provider: {
        label: 'Provider',
        manage: 'Provider Model Management',
        name: 'Provider Name',
        supported_models: 'Supported Models',
        no_models_tip: 'No models, click button above to add'
      },
      all: 'All',
      no_provider: 'No Provider',
      confirm_delete: 'Confirm Delete',
      delete_model_confirm: 'Are you sure you want to delete model "{name}"?',
      status_label: 'Status',
      delete_model_confirm_simple: 'Confirm delete this model?',
      confirm: 'Confirm',
      cancel: 'Cancel',
      delete_success: 'Deleted successfully',
      copy_success: 'Copied successfully',
      model: 'Model',
      default_model: 'Default Model',
      set_default_model: 'Set as Default Model',
      set_default_confirm: 'Are you sure to set "{name}" as the default model for its type?',
      model_name: 'Model Name',
      base_model: 'Base Model',
      search_placeholder: 'Please enter keyword',
      add_model: 'Add Model',
      no_model_data: 'No model data',
      edit: 'Edit',
      copy: 'Copy',
      delete: 'Delete',
      status: 'Status',
      enable: 'Enable',
      disable: 'Disable',
      select_provider: 'Please select provider',
      input_model_name: 'Please enter model name',
      select_base_model: 'Please enter or select base model',
      select_model_type: 'Please select model type',
      select_model_source: 'Please select model source',
      input_api_key: 'Please enter apiKey',
      input_api_base: 'Please enter apiBase',
      add_model_title: 'Add Model',
      edit_model_title: 'Edit Model',
      select_provider_and_model_first: 'Please select provider and base model first',
      test_connection_success: 'Connection test successful',
      add_success: 'Added successfully',
      update_success: 'Modified successfully',
      basic_settings: 'Basic Settings',
      model_source: 'Model Source',
      model_name_placeholder: 'e.g. Qwen-Max, for easy memory',
      model_type: 'Model Type',
      base_model_placeholder: 'Select or input base model',
      no_api_key_tip: 'No API Key? Go to',
      official_website: 'Official Website',
      get: 'to get',
      api_base_placeholder1: 'Optional, leave empty to use provider default',
      api_base_placeholder2: 'Please enter API Base for local deployment LLM',
      advanced_settings: 'Advanced Settings',
      max_tokens: 'Max Tokens',
      max_tokens_placeholder: 'Default uses model limit',
      temperature: 'Temperature',
      no_advanced_settings: 'No advanced settings for this model type',
      test_connection: 'Test Connection',
      submit: 'Submit',
      playground: 'Model Playground',
      current_test_model: 'Current Test Model:',
      input_message_start: 'Please enter a message to begin...',
      ctrl_enter_send: 'Ctrl + Enter to send...',
      send: 'Send',
      language_model: 'Language Model',
      vector_model: 'Vector Model',
      model_key: 'Model Key',
      model_key_placeholder: 'e.g. gpt-4',
      operation: 'Operation',
      fill_all_model_keys: 'Please fill in all model identifiers',
      provider_model_manage: 'Provider Model Management',
      provider_name: 'Provider Name',
      supported_models: 'Supported Models',
      no_model_click_add: 'No models, click button to add',
      save: 'Save'
    },
    workflow: {
      unnamed_app: 'Unnamed App',
      debug: 'Debug',
      go_to_chat: 'Go to Chat',
      publish_history: 'Publish History',
      auto_save: 'Auto Save',
      save: 'Save',
      components: 'Components',
      tools: 'Tools',
      builtin_tools: 'Built-in Tools',
      message_not_empty: 'Message content cannot be empty',
      app_not_published: 'Your app has not been published yet. Please publish it before running functional tests',
      clear_chat_history: 'Clear Chat History',
      send: 'Send',
      ai_assistant: 'AI Assistant',
      run_test: 'Run Test',
      execution_time: 'Execution Time',
      tokens_consumed: 'Tokens Consumed',
      total: 'Total',
      input: 'Input',
      output: 'Output',
      get_execution_detail_failed: 'Failed to get execution details',
      workflow_execution_detail: 'Workflow Execution Details',
      unknown_status: 'Unknown Status',
      time_cost: 'Time Cost:',
      clear: 'Clear',
      set_default_test_params: 'Set as Default Test Parameters',
      save_success: 'Save Success',
      edit_node_properties: 'Edit Node Properties',
      copy_node: 'Copy Node',
      delete_node: 'Delete Node',
      add_node: 'Add Node',
      no_nodes_to_add: 'No Nodes to Add',
      publish_time: 'Publish Time',
      publisher: 'Publisher',
      remark: 'Remark',
      load_publish_history_failed: 'Failed to load publish history',
      no_publish_history: 'No Publish History',
      version: 'Version',
      zoom_in: 'Zoom In',
      zoom_out: 'Zoom Out',
      fit_view: 'Fit View',
      collapse_all_nodes: 'Collapse All Nodes',
      expand_all_nodes: 'Expand All Nodes',
      elegant_layout: 'Elegant Layout',
      collapse_and_layout: 'Collapse and Layout',
      undo: 'Undo (Ctrl+Z)',
      redo: 'Redo (Ctrl+Y)',
      operation_history: 'Operation History',
      current_status: 'Current Status',
      executed: 'Executed',
      can_redo: 'Can Redo',
      total_items: 'Total {count} Items',
      just_saved: 'Just Saved',
      pending_save: 'Pending Save',
      saving: 'Saving...',
      saved: 'Saved',
      saved_n_minutes_ago: 'Saved {n} minutes ago',
      saved_n_hours_ago: 'Saved {n} hours ago',
      saved_n_days_ago: 'Saved {n} days ago',
      unsaved_changes_title: 'Unsaved Changes',
      unsaved_changes_content: 'You have unsaved changes. Are you sure you want to leave?',
      save_and_leave: 'Save and Leave',
      discard_changes: 'Discard Changes',
      no_nodes_to_layout: 'No nodes to layout',
      layout_done: 'Layout done',
      all_nodes_collapsed: 'All nodes collapsed',
      all_nodes_expanded: 'All nodes expanded',
      missing_app_id: 'Missing app ID',
      workflow_data_not_exist: 'Workflow data does not exist',
      load_workflow_failed: 'Failed to load workflow',
      save_failed: 'Save failed',
      publish_failed: 'Publish failed',
      publish_error: 'Publish error',
      publish_failed_msg: 'Publish failed, please check the workflow configuration',
      publish_failed_config: 'Publish failed, missing required configuration',
      publish_app: 'Publish App',
      publish_remark_placeholder: 'Enter publish notes (optional)',
      confirm_publish: 'Confirm Publish',
      publish_success: 'Published successfully',
      invalid_connection: 'Invalid connection',
      cannot_connect: 'Cannot connect these nodes',
      debug_title: 'Debug Mode',
      debug_tip1: 'Debug mode allows you to test the workflow without publishing',
      debug_tip2: 'Changes made in debug mode will not affect the published version',
      init_history: 'Initialize',
      invalid_temp_file_id: 'Invalid temporary file ID',
      please_fill_app_info: 'Please ensure that the app name is filled in, and select a large model and knowledge base',
      please_finish_current_param_config: 'Please complete the configuration of existing parameters first',
      unnamed_param: 'Unnamed Parameter',
      snapshot: {
        drag_add_link_node: 'Drag and add link node',
        add_link_node: 'Add link node',
        add_node: 'Add node',
        delete_node: 'Delete node',
        copy_node: 'Copy node',
        move_node: 'Move node',
        link_nodes: 'Link nodes'
      },
      history: {
        custom_inputs: 'Custom Inputs',
        custom_outputs: 'Custom Outputs',
        add_node: 'Add Node',
        delete_node: 'Delete Node',
        add_link: 'Add Link',
        delete_link: 'Delete Link',
        link_condition_changed: 'Link Condition Changed'
      },
      msg: {
        connection_not_supported: 'Cannot connect: [{source}] does not support connection to [{target}]',
        invalid_connection: 'Invalid connection'
      }
    },
    workflow_node: {
      param_name: 'Parameter Name',
      global_params: 'Global Parameters',
      session_params: 'Session Parameters',
      specify_reply_content: 'Specify Reply Content',
      app_params: 'App Parameters',
      interface_params: 'Interface Parameters',
      history_context: 'History Context',
      max_return_rows: 'Max Return Rows',
      condition_branch: 'Condition Branch (IF / ELSE IF)',
      if_specify_reply_content_it_is_final_output:
        'If the reply content is specified, it will be the final output of the workflow.',
      config_branch_condition: 'Config Branch Condition',
      empty_result_reply: 'Empty Result Reply',
      table_whitelist: 'Table White List',
      table_blacklist: 'Table Black List',
      allowed_query_tables: 'Allowed query tables, separated by commas',
      forbidden_query_tables: 'Forbidden query tables, separated by commas',
      variable_selection: 'Variable Selection',
      similarity_threshold: 'Similarity Threshold:',
      config_condition: 'Configure Conditions',
      select_variable: 'Select Variable',
      select_datasource: 'Select Data Source',
      eg_username: 'e.g., userName',
      eg_add_intent_node: 'e.g., Add intent recognition node, optimize LLM config',
      eg_user_name: 'e.g., User Name',
      eg_professional_assistant:
        'e.g., You are a professional customer service assistant... (input / to select variable)',
      eg_analyze_problem: 'e.g., Please help me analyze this problem... (input / to select variable)',
      eg_hello_user: 'e.g., Hello {userName}.',
      keep_n_messages: 'Keep the latest N messages for context memory, 5-20 is recommended',
      keyword_search: 'Keyword Search',
      other_else: 'Other (Else)',
      parameter_key: 'Parameter Key',
      parameter_default_value: 'Parameter Default Value',
      define_ai_role: 'Define AI assistant role and behavior, input / select variable',
      define_intent_branch: 'Define intent branch',
      enable_context_memory: 'If enabled, AI can understand conversation context and maintain coherence',
      enable_stream_output:
        'If enabled, the model will output results in real-time instead of returning once after generation',
      description_purpose: 'Describe the purpose of the parameter',
      is_required: 'Is Required',
      max_tokens: 'Max Tokens',
      latest_n_messages: 'Latest N Messages',
      reply_when_no_result: 'Reply when no result found (optional)',
      condition_not_set: 'Condition Not Set',
      condition_group: 'Condition Group',
      max_tokens_desc: 'Maximum tokens generated by the model, leave empty to use model default',
      compare_value: 'Compare Value',
      add_type_name: 'Add {typeName}',
      click_copy_param: 'Click to copy parameter ',
      user_name: 'User Name',
      user_prompt_desc: 'Specific questions or instructions from user to LLM, input / select variable',
      type: 'Type',
      custom_parameters: 'Custom Parameters',
      custom_output: 'Custom Output',
      merge_node_desc:
        'This node can merge parameters from each node and define specific content. You can input / to reference input parameter values.',
      input_reply_content: 'Input specified reply text content (input / select variable)',
      input_end_node_content: 'Input specific content of the end node as the final output (input / select variable)',
      override_final_response: 'The content here will override the current node output parameter: finalResponse.',
      select_search_mode: 'Select Search Mode',
      select_knowledge_base: 'Select Knowledge Base (leave empty to search all)',
      config_llm_behavior: 'Configure LLM behavior parameters',
      rename_node: 'Rename Node',
      key_name: 'Key Name',
      hide_basenode_default_output: 'Hide default output of BaseNode -->',
      default_else: 'Default (ELSE)',
      default_use_model_limit: 'Default use model limit',
      history_messages_count: 'History Messages Count',
      no_session_params: 'No session parameters',
      no_global_params: 'No global parameters',
      click_above_to_add_condition: 'Click button above to add condition',
      user_prompt: 'User Prompt',
      stream_output: 'Stream Output',
      delete_node: 'Delete Node',
      data_type: 'Data Type',
      default_value: 'Default Value',
      param_desc: 'Parameter Description',
      node_param: 'Node Parameter',
      condition_branch_if_else: 'Condition Branch (IF / ELSE IF)',
      data_source: 'Data Source',
      vector_retrieval: 'Vector Retrieval',
      dialog_config: 'Dialog Configuration',
      enable_history_dialog: 'Enable History Dialog',
      user_id: 'User ID',
      hybrid_retrieval: 'Hybrid Retrieval',
      retrieval_config: 'Retrieval Configuration',
      knowledge_base: 'Knowledge Base',
      retrieval_mode: 'Retrieval Mode',
      return_count: 'Return Count (Top K)',
      enable_rerank: 'Enable Rerank',
      intent_name: 'Intent Name',
      session_id: 'Session ID',
      param_type_string: 'String',
      param_type_number: 'Number',
      param_type_boolean: 'Boolean',
      param_type_object: 'Object',
      param_type_array: 'Array',
      param_type_datetime: 'Datetime',
      node_category_basic: 'Basic Node',
      node_category_ai: 'AI Node',
      node_category_logic: 'Logic Node',
      node_category_database: 'Database Node',
      node_category_action: 'Action Node',
      op_eq: 'Equal (==)',
      op_ne: 'Not Equal (!=)',
      op_gt: 'Greater Than (>)',
      op_lt: 'Less Than (<)',
      op_gte: 'Greater Than or Equal (>=)',
      op_lte: 'Less Than or Equal (<=)',
      op_contains: 'Contains',
      op_not_contains: 'Not Contains',
      op_starts_with: 'Starts With',
      op_ends_with: 'Ends With',
      op_is_empty: 'Is Empty',
      op_is_not_empty: 'Is Not Empty',
      log_op_and: 'And (AND)',
      log_op_or: 'Or (OR)',
      complete_existing_params_first: 'Please complete existing parameter configuration first',
      unnamed_param: 'Unnamed Parameter',
      copy_success_ref: 'Reference copied',
      input_params: 'Input Parameters',
      output_params: 'Output Parameters',
      click_copy_tooltip: 'Click to copy variable reference',
      no_available_param_sources: 'No available parameter sources',
      no_matching_variables: 'No matching variables',
      input_or_select_variable: 'Input / to select variable',
      unknown_type: 'Unknown Type',
      copied_ref: 'Reference Copied',
      edit_type_name: 'Edit {typeName}',
      add_type_name2: 'Add {typeName}',
      new_param: 'New Parameter',
      greeting: 'Greeting',
      save: 'Save',
      rename: 'Rename',
      copy_node: 'Copy Node',
      unnamed_node: 'Unnamed Node',
      confirm: 'Confirm',
      branch_name: 'Branch Name',
      condition_label: 'Condition',
      loading: 'Loading...',
      nested_group: 'Nested Group',
      more_items: '{count} more',
      detail: 'Detail',
      delete: 'Delete',
      intent_name_default: 'Intent {index}',
      branch: 'Branch',
      param: 'Parameter',
      and_n_more: '{summary} and {count} more',
      system_prompt: 'System Prompt',
      no_limit: 'No limit',
      default_user_prompt: "Known Information: ${'{'}chatContext{'}'}\nQuestion: ${'{'}userInput{'}'}", // eslint-disable-line no-template-curly-in-string
      unknown: 'Unknown',
      start: 'Start',
      end: 'End',
      tool_config: 'Tool Config',
      bind_mcp_servers: 'Bind MCP Servers',
      mcp_select_placeholder: 'Select MCP Servers to use (Multiple Selection)',
      bind_builtin_tools: 'Bind Built-in Tools',
      tool_select_placeholder: 'Select Built-in Python Tools to use (Multiple Selection)',
      bind_skills: 'Bind Skills',
      skill_select_placeholder: 'Select custom Skills to use (Multiple Selection)',
      enable_tool_trace: 'Output Tool Execution Trace',
      enable_tool_trace_desc:
        'When enabled, the request parameters and return results of tool calls will be pushed to the frontend via SSE stream for debugging',
      providedBy: 'Provided by {type}',
      mcpService: 'MCP Service',
      builtinTool: 'Built-in Tool',
      continue_condition: 'Continue Condition',
      continue_when_all_met: 'Continue loop when all conditions are met, otherwise exit',
      config_continue_condition: 'Configure Continue Condition',
      continue_when_met: 'Loop when {varName} {op} {val} is met',
      loop_when: 'Loop when {summary}',
      max_iterations_label: 'Max Iterations',
      exit_or_end: 'Exit / End'
    },
    workflow_public: {
      select_model: 'Select Model',
      model: 'Model',
      ai_model: 'AI Model',
      ai_model_config: 'AI Model Configuration',
      please_select_ai_model: 'Please select AI model',
      please_select_llm_model: 'Please select LLM model',
      model_selector: 'Model Selection',
      creative: 'Creative',
      extremely_random: 'Extremely Random',
      temperature_desc:
        'The higher the temperature, the more random the model, leaning towards creativity and innovation, but may reduce accuracy.',
      param_settings: 'Parameter Settings',
      advanced_params: 'Advanced Parameters',
      load_model_list_failed: 'Failed to load model list',
      prompt: 'Prompt',
      temperature: 'Temperature',
      max_tokens: 'Max Tokens',
      precise: 'Precise',
      balanced: 'Balanced',
      random: 'Random'
    },
    workflow_template: {
      used_count_times: 'Used {count} times',
      template: 'Template',
      workflow_template: 'Workflow Template',
      init_failed: 'Initialization failed, please refresh the page and try again',
      template_edit: 'Template Edit',
      components: 'Components',
      save: 'Save',
      auto_save: 'Auto Save',
      missing_template_id: 'Missing Template ID',
      template_not_exist: 'Template data does not exist',
      load_template_failed: 'Failed to load template',
      save_failed: 'Save failed',
      save_success: 'Save successful',
      app_name: 'App Name',
      app_desc: 'App Description',
      search: 'Search',
      confirm: 'Confirm',
      cancel: 'Cancel',
      edit: 'Edit',
      create: 'Create',
      close: 'Close',
      open: 'Open',
      system: 'System',
      system_template: 'System Template',
      user_template: 'User Template',
      no_desc: 'No Description',
      no_template: 'No Template',
      unnamed_template: 'Unnamed Template',
      template_name: 'Template Name',
      new_workflow: 'New Workflow',
      template_desc: 'Template Description (Optional)',
      create_success: 'Created Successfully',
      delete_success: 'Deleted Successfully',
      load_category_failed: 'Failed to load categories',
      copy_failed: 'Copy failed, please copy manually',
      copy_success: 'Copy successful',
      copy_to_custom: 'Copy to Custom',
      copy_to_custom_template: 'Copy to Custom Template',
      create_success_jump: 'Created successfully, jumping to workflow orchestration page',
      publish_failed: 'Publish Failed',
      publish_error: 'Publish Error',
      unique_identifier: 'Unique identifier, e.g., knowledge_qa',
      base_info: 'Basic Info',
      base_config: 'Basic Config',
      missing_app_name: 'Missing required config: App Name',
      missing_reasoning_model: 'Missing required config: Reasoning Model',
      please_input_publish_summary: 'Please input publish summary',
      please_input_app_name: 'Please input app name',
      please_input_app_desc: 'Please input app description',
      please_input_greeting: 'Please input greeting',
      please_input_prompt: 'Please input prompt',
      please_input_new_template_name: 'Please input new template name',
      please_input_template_name: 'Please input template name',
      please_input_node_name: 'Please input node name',
      create_app_from_template: 'Create App from Template',
      select_category: 'Select Category',
      select_icon: 'Select Icon',
      system_template_cannot_delete: 'System templates cannot be deleted',
      system_template_cannot_edit: 'System templates cannot be edited',
      edit_template: 'Edit Template',
      advanced_config: 'Advanced Config',
      edit_icon: '📝 Edit',
      search_icon: '🔍 Search',
      robot_icon: '🤖 Robot',
      intelligence_icon: '🧠 Intelligence',
      publish: 'Publish',
      save_app_config_failed: 'Failed to save app configuration, cannot publish',
      icon_doc: 'Document',
      icon_chat: 'Chat',
      icon_data: 'Data',
      icon_auto: 'Auto',
      user_built: 'User Built',
      workflow_config: 'Workflow Config',
      create_failed: 'Create failed',
      copy_success_created: 'Copied successfully, app created',
      please_input_template_code: 'Please input template code',
      new_template: 'New Template',
      saving: 'Saving...',
      template_code: 'Template Code',
      category: 'Category',
      icon_label: 'Icon',
      description: 'Description',
      use_template: 'Use Template',
      uncategorized: 'Uncategorized',
      create_app_name_prefix: 'Based on ',
      copy_name_suffix: '_copy',
      confirm_delete_template: 'Delete template "{name}"? This operation cannot be undone.',
      unknown: 'Unknown',
      copy: 'Copy'
    },
    mcp: {
      listTitle: 'MCP Server List',
      addTitle: 'Add MCP Server',
      editTitle: 'Edit MCP Server',
      serverName: 'Server Name',
      description: 'Description',
      transportType: 'Transport Protocol',
      serverConfig: 'Server Config (JSON)',
      status: 'Status',
      searchPlaceholder: 'Enter Server Name to search',
      form: {
        serverNameRequired: 'Please enter Server Name',
        transportTypeRequired: 'Please select Transport Protocol',
        serverNamePlaceholder: 'Enter MCP Server Name',
        descriptionPlaceholder: 'Enter description',
        serverConfigPlaceholder: 'Enter Server Config in JSON format, e.g.: {"url": "http://...","headers": {}}'
      }
    },
    builtinTool: {
      listTitle: 'Built-in Tool List',
      addTitle: 'Add Built-in Tool',
      editTitle: 'Edit Built-in Tool',
      toolName: 'Tool Name (English ID)',
      description: 'Function Description',
      pythonCode: 'Python Script',
      inputSchema: 'Input Schema',
      initParamsTab: 'Init Params',
      inputSchemaTab: 'Input Params',
      outputSchemaTab: 'Output Params JSON Schema',
      status: 'Status',
      searchPlaceholder: 'Enter Tool Name to search',
      securityWarningTitle: 'Security Warning',
      securityWarning:
        'The Python script will execute with server process permissions. Ensure the code source is trusted. Do not write high-risk operations like deleting files or accessing unauthorized networks.',
      paramEditor: {
        defaultTitle: 'Param',
        addParam: 'Add {title}',
        editParam: 'Edit {title}',
        name: 'Param Name',
        namePlaceholder: 'Please enter the English identifier of the parameter, such as query',
        displayName: 'Display Name',
        displayNamePlaceholder: 'Please enter the display name (optional)',
        type: 'Data Type',
        required: 'Required',
        description: 'Description',
        descriptionPlaceholder: 'Please enter detailed parameter description for LLM to understand',
        defaultValue: 'Default Value',
        defaultValuePlaceholder: 'Please enter the default value (optional)',
        nameRequired: 'Please enter parameter name',
        namePattern:
          'Parameter name can only contain letters, numbers, and underscores, and must start with a letter or underscore',
        deleteConfirm: 'Are you sure you want to delete this parameter?',
        typeString: 'String',
        typeNumber: 'Number',
        typeBoolean: 'Boolean',
        typeObject: 'Object',
        typeArray: 'Array'
      },
      form: {
        toolNameRequired: 'Please enter Tool Name',
        toolNamePattern: 'Tool name must use lowercase letters, numbers, and underscores, and must start with a letter',
        toolNamePlaceholder: 'e.g., search_tool (used as LLM tool function name)',
        descriptionPlaceholder: 'Describe what the tool does, so LLM knows when to call it',
        codePlaceholder: 'Write Python code here...',
        schemaPlaceholder: 'Enter input parameter definition in JSON Schema format'
      }
    }
  },
  datatable: {
    itemCount: 'Total {count} items',
    oss: {
      access_policy: {
        private: 'Private',
        public: 'Public',
        custom: 'Custom'
      }
    },
    system: {
      data_scope: {
        all: 'All Data Permission',
        custom: 'Custom Data Permission',
        dept: 'Department Data Permission',
        dept_and_below: 'Department & Below Data Permission',
        self: 'Self Data Permission',
        dept_and_below_or_self: 'Department & Below or Self Data Permission'
      }
    }
  }
};

export default local;
