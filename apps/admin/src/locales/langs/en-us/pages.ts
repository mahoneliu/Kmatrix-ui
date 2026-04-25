const login: App.I18n.Schema['page']['login'] = {
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
};

const home: App.I18n.Schema['page']['home'] = {
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
};

const common: App.I18n.Schema['page']['common'] = {
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
};

const userCenter: App.I18n.Schema['page']['userCenter'] = {
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
};

const system: App.I18n.Schema['page']['system'] = {
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
    editConfig: 'Edit Config',
    refreshCacheFailed: ''
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
    dictTypeIsEmpty: 'Dictionary type is empty',
    refreshCacheFailed: ''
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
};

const monitor: App.I18n.Schema['page']['monitor'] = {
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
};

const about: App.I18n.Schema['page']['about'] = {
  title: 'About',
  introduction:
    'KMatrix is a core AI workflow orchestration platform and knowledge base based on Ruoyi_Vue_Plus/Langchain4j/Langgraph, providing developers with a complete AI application development solution.',
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
};

export default {
  login,
  home,
  common,
  userCenter,
  system,
  monitor,
  about
};
