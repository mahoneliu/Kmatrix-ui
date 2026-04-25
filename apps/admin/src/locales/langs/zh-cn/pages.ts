const page = {
  login: {
    common: {
      title: '企业级AI开发平台+知识库',
      subTitle: '为开发者提供了完整的企业级AI开发+本地知识库解决方案',
      loginOrRegister: '登录 / 注册',
      register: '注册',
      userNamePlaceholder: '请输入用户名',
      phonePlaceholder: '请输入手机号',
      codePlaceholder: '请输入验证码',
      passwordPlaceholder: '请输入密码',
      confirmPasswordPlaceholder: '请再次输入密码',
      codeLogin: '验证码登录',
      confirm: '确定',
      back: '返回',
      validateSuccess: '验证成功',
      loginSuccess: '登录成功',
      welcomeBack: '欢迎回来，{userName} ！'
    },
    pwdLogin: {
      title: '密码登录',
      rememberMe: '记住密码',
      forgetPassword: '忘记密码？',
      register: '注册账号',
      otherAccountLogin: '其他账号登录',
      otherLoginMode: '其他登录方式',
      superAdmin: '超级管理员',
      admin: '管理员',
      user: '普通用户'
    },
    codeLogin: {
      title: '验证码登录',
      getCode: '获取验证码',
      reGetCode: '{time}秒后重新获取',
      sendCodeSuccess: '验证码发送成功',
      imageCodePlaceholder: '请输入图片验证码'
    },
    register: {
      title: '注册账号',
      agreement: '我已经仔细阅读并接受',
      protocol: '《用户协议》',
      policy: '《隐私权政策》'
    },
    resetPwd: {
      title: '重置密码'
    },
    bindWeChat: {
      title: '绑定微信'
    }
  },
  home: {
    branchDesc:
      '为了方便大家开发和更新合并，我们对main分支的代码进行了精简，只保留了首页菜单，其余内容已移至example分支进行维护。预览地址显示的内容即为example分支的内容。',
    greeting: '早安，{userName}, 今天又是充满活力的一天!',
    weatherDesc: '今日多云转晴，20℃ - 25℃!',
    projectCount: '项目数',
    todo: '待办',
    message: '消息',
    downloadCount: '下载量',
    registerCount: '注册量',
    schedule: '作息安排',
    study: '学习',
    work: '工作',
    rest: '休息',
    entertainment: '娱乐',
    visitCount: '访问量',
    turnover: '成交额',
    dealCount: '成交量',
    projectNews: {
      title: '项目动态',
      moreNews: '更多动态',
      desc1: '在2026年1月3日创建了开源项目 kmatrix!',
      desc2: '向 kmatrix 提交了一个bug，多标签栏不会自适应。',
      desc3: '准备为 kmatrix 的发布做充分的准备工作!',
      desc4: '正在忙于为kmatrix写项目说明文档！',
      desc5: '刚才把工作台页面随便写了一些，凑合能看了！'
    },
    creativity: '创意',
    total_docs: '总文档数',
    ai_token_cost: 'AI 消耗 Token',
    active_knowledge_base: '活跃知识库',
    yesterday_new_notes: '昨日新增笔记',
    recent_docs: '最近编辑文档',
    view_all: '查看全部',
    minutes_ago: '{count} 分钟前',
    hours_ago: '{count} 小时前',
    yesterday: '昨天',
    ai_resource_usage: 'AI 资源使用',
    token_consumption: 'Token 消耗',
    last_7_days: '最近7天',
    this_month: '本月',
    new_kb: '新建知识库',
    week: {
      monday: '周一',
      tuesday: '周二',
      wednesday: '周三',
      thursday: '周四',
      friday: '周五',
      saturday: '周六',
      sunday: '周日'
    }
  },
  common: {
    id: 'ID',
    createBy: '创建者',
    createTime: '创建时间',
    updateBy: '更新者',
    updateTime: '更新时间',
    remark: '备注',
    form: {
      remark: {
        required: '请输入备注',
        invalid: '备注不能为空'
      }
    }
  },
  userCenter: {
    personalInfo: '个人信息',
    basicInfo: '基本资料',
    changePassword: '修改密码',
    thirdPartyApp: '第三方应用',
    onlineDevice: '在线设备',
    nickname: '昵称',
    email: '邮箱',
    phoneNumber: '手机号码',
    gender: '性别',
    department: '所属部门',
    role: '所属角色',
    createTime: '创建日期',
    save: '保存',
    nicknamePlaceholder: '请输入昵称',
    emailPlaceholder: '请输入邮箱',
    phonePlaceholder: '请输入手机号',
    genderMale: '男',
    genderFemale: '女',
    oldPassword: '旧密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    oldPasswordPlaceholder: '请输入旧密码',
    newPasswordPlaceholder: '请输入新密码',
    confirmPasswordPlaceholder: '请再次输入新密码',
    updateSuccess: '更新成功',
    passwordSuccess: '密码修改成功',
    passwordDiff: '两次输入的密码不一致',
    rules: {
      nickname: '昵称不能为空',
      gender: '性别不能为空',
      oldPassword: '旧密码不能为空',
      newPassword: '新密码不能为空',
      confirmPassword: '确认密码不能为空'
    },
    onlineDeviceColumns: {
      deviceType: '设备类型',
      ipaddr: 'IP地址',
      loginLocation: '登录地点',
      browser: '浏览器',
      os: '操作系统',
      loginTime: '登录时间'
    },
    forceLogout: '强制下线',
    confirmForceLogout: '确定强制下线吗？',
    forceLogoutSuccess: '强制下线成功',
    social: {
      wechat: '微信',
      bindTime: '绑定时间',
      unbind: '解绑',
      bind: '绑定',
      unbindSuccess: '账户解绑成功'
    },
    avatar: {
      changeTitle: '修改头像',
      uploadTip: '请上传图片类型文件（JPG、PNG等）',
      updateSuccess: '头像更新成功！',
      selectImage: '选择图片',
      confirmCrop: '确认裁剪'
    }
  },
  system: {
    client: {
      title: '客户端列表',
      clientId: '客户端 ID',
      clientKey: '客户端 Key',
      clientSecret: '客户端秘钥',
      grantTypeList: '授权类型',
      deviceType: '设备类型',
      activeTimeout: 'Token 活跃超时时间',
      timeout: 'Token 固定超时',
      status: '状态',
      form: {
        clientId: {
          required: '请输入客户端 ID',
          invalid: '客户端 ID 不能为空'
        },
        clientKey: {
          required: '请输入客户端 Key',
          invalid: '客户端 Key 不能为空'
        },
        clientSecret: {
          required: '请输入客户端秘钥',
          invalid: '客户端秘钥不能为空'
        },
        grantTypeList: {
          required: '请选择授权类型',
          invalid: '授权类型不能为空'
        },
        deviceType: {
          required: '请选择设备类型',
          invalid: '设备类型不能为空'
        },
        activeTimeout: {
          required: '请输入 Token 活跃超时时间',
          invalid: 'Token 活跃超时时间不能为空',
          tooltip: '指定时间无操作则过期(单位：秒), 默认30分钟(1800秒)'
        },
        timeout: {
          required: '请输入 Token 固定超时',
          invalid: 'Token 固定超时不能为空',
          tooltip: '指定时间必定过期(单位：秒)，默认七天(604800秒)'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        }
      },
      addClient: '新增客户端',
      editClient: '编辑客户端'
    },
    config: {
      title: '参数配置列表',
      configName: '参数名称',
      configKey: '参数键名',
      configValue: '参数键值',
      configType: '是否内置',
      remark: '备注',
      createTime: '创建时间',
      refreshCache: '刷新缓存',
      refreshCacheSuccess: '刷新缓存成功',
      form: {
        configId: {
          required: '请输入参数主键',
          invalid: '参数主键不能为空'
        },
        configName: {
          required: '请输入参数名称',
          invalid: '参数名称不能为空'
        },
        configKey: {
          required: '请输入参数键名',
          invalid: '参数键名不能为空'
        },
        configValue: {
          required: '请输入参数键值',
          invalid: '参数键值不能为空'
        },
        configType: {
          required: '请选择是否内置',
          invalid: '是否内置不能为空'
        },
        remark: {
          required: '请输入备注',
          invalid: '备注不能为空'
        }
      },
      addConfig: '新增参数配置',
      editConfig: '编辑参数配置',
      refreshCacheFailed: ''
    },
    dept: {
      empty: '暂无部门信息',
      title: '部门列表',
      parentId: '上级部门',
      deptName: '部门名称',
      orderNum: '排序',
      deptCategory: '类别编码',
      leader: '负责人',
      phone: '联系电话',
      email: '邮箱',
      status: '状态',
      sort: '排序',
      createTime: '创建时间',
      expandAll: '全部展开',
      collapseAll: '全部收起',
      form: {
        parentId: {
          required: '请选择上级部门',
          invalid: '上级部门不能为空'
        },
        deptName: {
          required: '请输入部门名称',
          invalid: '部门名称不能为空'
        },
        orderNum: {
          required: '请输入排序',
          invalid: '排序不能为空'
        },
        deptCategory: {
          required: '请输入类别编码',
          invalid: '类别编码不能为空'
        },
        leader: {
          required: '请输入负责人',
          invalid: '负责人不能为空'
        },
        phone: {
          required: '请输入联系电话',
          invalid: '联系电话不能为空'
        },
        email: {
          required: '请输入邮箱',
          invalid: '邮箱不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        },
        sort: {
          required: '请输入排序',
          invalid: '排序不能为空'
        },
        deptId: {
          required: '请输入部门id',
          invalid: '部门id不能为空'
        }
      },
      error: {
        getDeptDataFail: '获取部门用户数据失败',
        getDeptUserDataFail: '获取部门用户数据失败'
      },
      placeholder: {
        defaultLeaderPlaceHolder: '请选择负责人',
        addDataLeaderPlaceHolder: '仅在更新时可选择部门负责人',
        deptUserIsEmptyLeaderPlaceHolder: '该部门没有负责人'
      },
      addDept: '新增部门',
      editDept: '编辑部门'
    },
    dict: {
      title: '字典列表',
      dictTypeTitle: '字典类型列表',
      dictName: '字典名称',
      dictType: '字典类型',
      status: '状态',
      remark: '备注',
      createTime: '创建时间',
      refreshCacheSuccess: '刷新缓存成功',
      refreshCache: '刷新缓存',
      confirmDeleteDictType: '确定删除字典类型',
      data: {
        title: '字典数据列表',
        label: '字典标签',
        value: '字典键值',
        dictSort: '字典排序',
        isDefault: '是否默认',
        listClass: '标签样式',
        cssClass: 'CSS样式',
        status: '状态',
        remark: '备注',
        createTime: '创建时间'
      },
      form: {
        dictId: {
          required: '请输入字典主键',
          invalid: '字典主键不能为空'
        },
        dictCode: {
          required: '请输入字典编码',
          invalid: '字典编码不能为空'
        },
        dictName: {
          required: '请输入字典名称',
          invalid: '字典名称不能为空'
        },
        dictType: {
          required: '请输入字典类型',
          invalid: '字典类型不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        },
        remark: {
          required: '请输入备注',
          invalid: '备注不能为空'
        },
        dictLabel: {
          required: '请输入字典标签',
          invalid: '字典标签不能为空'
        },
        dictValue: {
          required: '请输入字典键值',
          invalid: '字典键值不能为空'
        },
        dictSort: {
          required: '请输入字典排序',
          invalid: '字典排序不能为空'
        },
        isDefault: {
          required: '请选择是否默认',
          invalid: '是否默认不能为空'
        },
        listClass: {
          required: '请选择回显样式',
          invalid: '回显样式不能为空'
        },
        cssClass: {
          required: '请输入样式属性（其他样式扩展）',
          invalid: 'CSS样式不能为空'
        }
      },
      addDict: '新增字典',
      editDict: '编辑字典',
      addDictData: '新增字典数据',
      editDictData: '编辑字典数据',
      addDictType: '新增字典类型',
      editDictType: '编辑字典类型',
      exportDictType: '导出字典类型',
      refreshDictType: '刷新列表',
      dictTypeIsEmpty: '暂无字典类型',
      refreshCacheFailed: ''
    },
    menu: {
      title: '菜单列表',
      parentId: '上级菜单',
      iconType: '图标类型',
      menuName: '菜单名称',
      icon: '菜单图标',
      orderNum: '排序',
      perms: '权限字符',
      component: '组件路径',
      path: '路由地址',
      layout: '布局方式',
      externalPath: '外链地址',
      query: '路由参数',
      iframeQuery: 'iframe 地址',
      isFrame: '是否外链',
      isCache: '是否缓存',
      menuType: '菜单类型',
      visible: '显示状态',
      status: '菜单状态',
      createTime: '创建时间',
      cache: '缓存',
      noCache: '不缓存',
      rootName: '根目录',
      buttonPermissionList: '按钮权限列表',
      emptyMenu: '暂无菜单',
      menuDetail: '菜单详情',
      cascadeDeleteContent: '级联删除菜单将删除所选中的菜单，是否继续？',
      iconifyTip: 'iconify 地址：https://icones.js.org',
      isFrameTip: '选择是外链则路由地址需要以`http(s)://`开头',
      isCacheTip: '选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致',
      visibleTip: '选择隐藏则路由将不会出现在侧边栏，但仍然可以访问',
      statusTip: '选择停用则路由将不会出现在侧边栏，也不能被访问',
      permsTip: "控制器中定义的权限字符，如：`{'@'}SaCheckPermission('system:user:list')`",
      componentTip: '访问的组件路径，如：`system/user/index`，默认在`views`目录下',
      pathTip: '访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头',
      layoutTip: '默认布局：具有公共部分的布局，如全局头部、侧边栏、底部等\n空白布局：无公共部分的布局，如登录页',
      form: {
        parentId: {
          required: '请选择上级菜单',
          invalid: '上级菜单不能为空'
        },
        menuType: {
          required: '请选择菜单类型',
          invalid: '菜单类型不能为空'
        },
        menuIds: {
          required: '请选择菜单',
          invalid: '菜单不能为空'
        },
        icon: {
          required: '请选择菜单图标',
          invalid: '菜单图标不能为空'
        },
        menuName: {
          required: '请输入菜单名称',
          invalid: '菜单名称不能为空'
        },
        orderNum: {
          required: '请输入排序',
          invalid: '排序不能为空'
        },
        perms: {
          required: '请输入权限字符',
          invalid: '权限字符不能为空'
        },
        isFrame: {
          required: '请选择是否外链',
          invalid: '是否外链不能为空'
        },
        path: {
          required: '请输入路由地址',
          invalid: '路由地址不能为空'
        },
        component: {
          required: '请输入组件路径',
          invalid: '组件路径不能为空'
        },
        query: {
          required: '请输入路由参数',
          invalid: '路由参数不能为空'
        },
        isCache: {
          required: '请选择是否缓存',
          invalid: '是否缓存不能为空'
        },
        visible: {
          required: '请选择显示状态',
          invalid: '显示状态不能为空'
        },
        status: {
          required: '请选择菜单状态',
          invalid: '菜单状态不能为空'
        },
        permission: {
          required: '请输入权限标识',
          invalid: '权限标识不能为空'
        }
      },
      placeholder: {
        iconifyIconPlaceholder: '请输入图标',
        localIconPlaceholder: '请选择本地图标',
        queryKey: '请输入 Key',
        queryValue: '请输入 Value',
        queryIframe: '请输入 iframe 地址'
      },
      directory: '目录',
      menu: '菜单',
      button: '按钮',
      addMenu: '新增菜单',
      addChildMenu: '新增子菜单',
      editMenu: '编辑菜单',
      cascadeDelete: '级联删除菜单'
    },
    notice: {
      title: '通知公告列表',
      noticeTitle: '公告标题',
      noticeType: '公告类型',
      noticeContent: '公告内容',
      status: '状态',
      createTime: '创建时间',
      form: {
        noticeTitle: {
          required: '请输入公告标题',
          invalid: '公告标题不能为空'
        },
        noticeType: {
          required: '请选择公告类型',
          invalid: '公告类型不能为空'
        },
        noticeContent: {
          required: '请输入公告内容',
          invalid: '公告内容不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        },
        noticeId: {
          required: '请输入公告ID',
          invalid: '公告ID不能为空'
        }
      },
      createByName: '创建者',
      addNotice: '新增公告',
      editNotice: '编辑公告'
    },
    oss: {
      title: '文件列表',
      fileName: '文件名称',
      originalName: '原始名称',
      fileSuffix: '文件后缀',
      url: '文件地址',
      createTime: '创建时间',
      service: '服务商',
      form: {
        file: {
          required: '请选择文件',
          invalid: '文件不能为空'
        },
        fileName: {
          required: '请输入文件名称',
          invalid: '文件名称不能为空'
        },
        originalName: {
          required: '请输入原始名称',
          invalid: '原始名称不能为空'
        },
        fileSuffix: {
          required: '请输入文件后缀',
          invalid: '文件后缀不能为空'
        },
        service: {
          required: '请输入服务商',
          invalid: '服务商不能为空'
        },
        url: {
          required: '请输入文件地址',
          invalid: '文件地址不能为空'
        }
      },
      upload: '上传文件',
      uploadImage: '上传图片',
      ossId: '对象存储主键',
      createByName: '上传人',
      preview: '预览',
      previewEnable: '开启预览',
      previewDisable: '禁用预览',
      confirmPreview: '是否确认{action}预览？',
      download: '下载',
      copy: '复制链接',
      copySuccess: '复制成功',
      configManage: '配置管理'
    },
    ossConfig: {
      title: 'OSS配置列表',
      configKey: '配置键',
      accessKey: 'accessKey',
      secretKey: 'secretKey',
      bucketName: '桶名称',
      prefix: '前缀',
      endpoint: '域名',
      domain: '自定义域名',
      isHttps: '是否https',
      region: '地域',
      status: '状态',
      remark: '备注',
      createTime: '创建时间',
      form: {
        configKey: {
          required: '请输入配置键',
          invalid: '配置键不能为空'
        },
        accessKey: {
          required: '请输入accessKey',
          invalid: 'accessKey不能为空'
        },
        secretKey: {
          required: '请输入secretKey',
          invalid: 'secretKey不能为空'
        },
        bucketName: {
          required: '请输入桶名称',
          invalid: '桶名称不能为空'
        },
        prefix: {
          required: '请输入前缀',
          invalid: '前缀不能为空'
        },
        endpoint: {
          required: '请输入域名',
          invalid: '域名不能为空'
        },
        domain: {
          required: '请输入自定义域名',
          invalid: '自定义域名不能为空'
        },
        isHttps: {
          required: '请选择是否https',
          invalid: '是否https不能为空'
        },
        region: {
          required: '请输入地域',
          invalid: '地域不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        },
        remark: {
          required: '请输入备注',
          invalid: '备注不能为空'
        }
      },
      addOssConfig: '新增OSS配置',
      editOssConfig: '编辑OSS配置'
    },
    post: {
      title: '岗位列表',
      postCode: '岗位编码',
      postName: '岗位名称',
      postSort: '岗位排序',
      status: '状态',
      remark: '备注',
      createTime: '创建时间',
      postCategory: '岗位类别',
      form: {
        postId: {
          required: '请输入岗位ID',
          invalid: '岗位ID不能为空'
        },
        deptId: {
          required: '请选择归属部门',
          invalid: '归属部门不能为空'
        },
        postCode: {
          required: '请输入岗位编码',
          invalid: '岗位编码不能为空'
        },
        postName: {
          required: '请输入岗位名称',
          invalid: '岗位名称不能为空'
        },
        postSort: {
          required: '请输入岗位排序',
          invalid: '岗位排序不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        },
        remark: {
          required: '请输入备注',
          invalid: '备注不能为空'
        },
        postCategory: {
          required: '请输入类别编码',
          invalid: '类别编码不能为空'
        }
      },
      addPost: '新增岗位',
      editPost: '编辑岗位'
    },
    role: {
      title: '角色列表',
      roleName: '角色名称',
      roleKey: '权限字符',
      roleSort: '角色排序',
      status: '状态',
      remark: '备注',
      menuPermission: '菜单权限',
      dataScope: '数据权限',
      createTime: '创建时间',
      form: {
        roleName: {
          required: '请输入角色名称',
          invalid: '角色名称不能为空'
        },
        roleKey: {
          required: '请输入权限字符',
          invalid: '权限字符不能为空'
        },
        roleSort: {
          required: '请输入角色排序',
          invalid: '角色排序不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        },
        remark: {
          required: '请输入备注',
          invalid: '备注不能为空'
        },
        menuIds: {
          required: '请选择菜单权限',
          invalid: '菜单权限不能为空'
        },
        deptIds: {
          required: '请选择部门权限',
          invalid: '部门权限不能为空'
        },
        dataScope: {
          required: '请选择数据范围',
          invalid: '数据范围不能为空'
        }
      },
      addRole: '新增角色',
      editRole: '编辑角色',
      configPermission: '分配权限',
      authorizedUsers: '分配用户',
      selectMenuPermission: '选择菜单权限',
      selectDataScope: '选择数据权限',
      selectDeptPermission: '选择部门权限',
      cancelAuth: '取消授权',
      batchCancelAuth: '批量取消授权',
      authUser: '授权用户',
      batchAuthUser: '批量授权用户',
      dataScopeScope: '数据范围',
      roleAuth: '角色授权',
      role: '角色',
      statusChangeSuccess: '状态修改成功'
    },
    tenant: {
      title: '租户列表',
      tenantName: '租户名称',
      tenantId: '租户编号',
      contactUserName: '联系人',
      contactPhone: '联系电话',
      companyName: '公司名称',
      licenseNumber: '营业执照编号',
      address: '地址',
      intro: '企业简介',
      domain: '域名',
      packageId: '租户套餐',
      expireTime: '过期时间',
      accountCount: '账号数量',
      status: '状态',
      createTime: '创建时间',
      form: {
        tenantName: {
          required: '请输入租户名称',
          invalid: '租户名称不能为空'
        },
        contactUserName: {
          required: '请输入联系人',
          invalid: '联系人不能为空'
        },
        contactPhone: {
          required: '请输入联系电话',
          invalid: '联系电话不能为空'
        },
        companyName: {
          required: '请输入公司名称',
          invalid: '公司名称不能为空'
        },
        licenseNumber: {
          required: '请输入营业执照编号',
          invalid: '营业执照编号不能为空'
        },
        address: {
          required: '请输入地址',
          invalid: '地址不能为空'
        },
        intro: {
          required: '请输入企业简介',
          invalid: '企业简介不能为空'
        },
        domain: {
          required: '请输入域名',
          invalid: '域名不能为空'
        },
        packageId: {
          required: '请选择租户套餐',
          invalid: '租户套餐不能为空'
        },
        expireTime: {
          required: '请选择过期时间',
          invalid: '过期时间不能为空'
        },
        accountCount: {
          required: '请输入账号数量',
          invalid: '账号数量不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        }
      },
      addTenant: '新增租户',
      editTenant: '编辑租户'
    },
    tenantPackage: {
      title: '租户套餐列表',
      packageName: '套餐名称',
      menuIds: '菜单权限',
      remark: '备注',
      status: '状态',
      createTime: '创建时间',
      form: {
        packageName: {
          required: '请输入套餐名称',
          invalid: '套餐名称不能为空'
        },
        menuIds: {
          required: '请选择菜单权限',
          invalid: '菜单权限不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        },
        remark: {
          required: '请输入备注',
          invalid: '备注不能为空'
        }
      },
      addTenantPackage: '新增租户套餐',
      editTenantPackage: '编辑租户套餐',
      statusChangeSuccess: '状态修改成功'
    },
    user: {
      title: '用户列表',
      userName: '用户账号',
      nickName: '用户昵称',
      deptName: '部门',
      phonenumber: '手机号码',
      status: '状态',
      createTime: '创建时间',
      password: '密码',
      confirmPassword: '确认密码',
      sex: '性别',
      roleIds: '角色',
      postIds: '岗位',
      email: '邮箱',
      avatar: '头像',
      remark: '备注',
      form: {
        userName: {
          required: '请输入用户名称',
          invalid: '用户名称不能为空'
        },
        nickName: {
          required: '请输入用户昵称',
          invalid: '用户昵称不能为空'
        },
        deptId: {
          required: '请选择部门',
          invalid: '部门不能为空'
        },
        phonenumber: {
          required: '请输入手机号码',
          invalid: '手机号码不能为空'
        },
        status: {
          required: '请选择状态',
          invalid: '状态不能为空'
        },
        password: {
          required: '请输入密码',
          invalid: '密码不能为空'
        },
        confirmPassword: {
          required: '请输入确认密码',
          invalid: '确认密码不能为空'
        },
        sex: {
          required: '请选择性别',
          invalid: '性别不能为空'
        },
        roleIds: {
          required: '请选择角色',
          invalid: '角色不能为空'
        },
        postIds: {
          required: '请选择岗位',
          invalid: '岗位不能为空'
        },
        email: {
          required: '请输入邮箱',
          invalid: '邮箱不能为空'
        },
        remark: {
          required: '请输入备注',
          invalid: '备注不能为空'
        }
      },
      addUser: '新增用户',
      editUser: '编辑用户',
      resetPassword: '重置密码',
      importUsers: '导入用户',
      exportTemplate: '导出模板',
      importSuccess: '导入成功',
      statusChangeSuccess: '状态修改成功'
    }
  },
  monitor: {
    logininfor: {
      title: '登录日志列表',
      userName: '用户账号',
      ipaddr: '登录地址',
      loginLocation: '登录地点',
      browser: '浏览器',
      os: '操作系统',
      status: '登录状态',
      msg: '提示消息',
      loginTime: '访问时间',
      client: '客户端',
      deviceType: '设备类型',
      unlock: '解锁',
      exportSuccess: '导出成功',
      clean: '清空',
      cleanConfirm: '是否确认清空所有登录日志数据项?',
      cleanSuccess: '清空成功',
      unlockConfirm: '确认解锁用户 {userName} 吗？',
      unlockSuccess: '解锁成功',
      viewDetail: '详情',
      detailTitle: '登录信息详情',
      accountInfo: '账号信息',
      form: {
        ipaddr: {
          required: '请输入登录IP地址',
          invalid: 'IP地址格式不正确'
        },
        userName: {
          required: '请输入用户账号',
          invalid: '用户账号不能为空'
        },
        status: {
          required: '请选择登录状态',
          invalid: '登录状态不能为空'
        },
        loginTime: {
          required: '请选择登录时间',
          invalid: '登录时间不能为空'
        }
      }
    },
    operlog: {
      title: '操作日志列表',
      module: '系统模块',
      businessType: '操作类型',
      operName: '操作人员',
      operIp: '操作IP',
      operLocation: '操作地点',
      status: '操作状态',
      operTime: '操作时间',
      costTime: '消耗时间',
      viewDetail: '详情',
      detailTitle: '操作日志详情',
      logId: '日志编号',
      operInfo: '操作信息',
      requestInfo: '请求信息',
      requestParam: '请求参数',
      responseParam: '返回参数',
      errorMsg: '错误消息',
      clean: '清空',
      cleanConfirm: '是否确认清空所有操作日志数据项?',
      cleanSuccess: '清空成功',
      form: {
        title: {
          required: '请输入系统模块',
          invalid: '系统模块不能为空'
        },
        businessType: {
          required: '请选择操作类型',
          invalid: '操作类型不能为空'
        },
        operName: {
          required: '请输入操作人员',
          invalid: '操作人员不能为空'
        },
        operIp: {
          required: '请输入操作IP',
          invalid: '操作IP格式不正确'
        },
        status: {
          required: '请选择操作状态',
          invalid: '操作状态不能为空'
        },
        operTime: {
          required: '请选择操作时间',
          invalid: '操作时间不能为空'
        }
      }
    }
  },
  about: {
    title: '关于',
    introduction:
      'KMatrix 是基于Ruoyi_Vue_Plus/Langchain4j/Langgraph为核心的AI工作流编排平台和知识库，为开发者提供了完整的AI应用开发解决方案。',
    projectInfo: {
      title: '项目信息',
      version: '版本',
      latestBuildTime: '最新构建时间',
      documentLink: '文档地址',
      previewLink: '预览地址',
      repositoryLink: '仓库地址'
    },
    prdDep: '生产依赖',
    devDep: '开发依赖'
  }
};

export default page;
