const local: App.I18n.Schema = {
  system: {
    title: 'KMATRIX',
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },
  common: {
    basicInfo: '基本信息',
    action: '操作',
    add: '新增',
    addSuccess: '添加成功',
    backToHome: '返回首页',
    back: '返回',
    batchDelete: '批量删除',
    import: '导入',
    export: '导出',
    importSuccess: '导入成功',
    importFail: '导入失败',
    importTemplate: '导入模板',
    downloadTemplate: '下载模板',
    importResult: '导入结果',
    importSize: '请上传大小不超过',
    importEnd: '的文件',
    importFormat: '且格式为',
    importTip: '请上传大小不超过',
    exportSuccess: '导出成功',
    exportFail: '导出失败',
    updateExisting: '是否更新已经存在的数据',
    cancel: '取消',
    close: '关闭',
    check: '勾选',
    expandColumn: '展开列',
    columnSetting: '列设置',
    config: '配置',
    login: '登录',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    deleteSuccess: '删除成功',
    deleteFail: '删除失败',
    confirmDelete: '确认删除吗？',
    edit: '编辑',
    download: '下载',
    warning: '警告',
    error: '错误',
    index: '序号',
    keywordSearch: '请输入关键词搜索',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    lookForward: '敬请期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '无数据',
    operate: '操作',
    pleaseCheckValue: '请检查输入的值是否合法',
    refresh: '刷新',
    reset: '重置',
    search: '搜索',
    permission: '权限',
    select_permission_level: '请选择权限级别',
    download_failed: '下载失败',
    switch: '切换',
    tip: '提示',
    trigger: '触发',
    update: '更新',
    saveSuccess: '保存成功',
    updateSuccess: '更新成功',
    noChange: '没有进行任何操作',
    userCenter: '个人中心',
    yesOrNo: {
      yes: '是',
      no: '否'
    },
    second: '秒',
    selected: '已选择',
    anyRecords: '条记录',
    clear: '清空',
    noSelectRecord: '未选中任何记录',
    copy: '复制',
    name: '名称',
    type: '类型',
    description: '描述',
    status: '状态',
    enable: '启用',
    disable: '禁用',
    remark: '备注',
    createTime: '创建时间',
    expandOrCollapse: '展开/折叠',
    checkAllOrNot: '全选/反选',
    cascade: '父子联动',
    uploadTip: '点击或者拖动文件到该区域来上传',
    fetchListFail: '获取列表失败',
    confirmAction: '确定要{action} {info} 吗？',
    deleteConfirmMsg: '文件删除后不可恢复，请确认是否删除！',
    fileNameError: '文件名不正确，不能包含英文逗号!',
    confirmDeleteFile: '确认删除文件？',
    errorDetail: {
      unknown: '系统未知错误，请反馈给管理员',
      auth_fail: '认证失败，无法访问系统资源',
      no_permission: '当前操作没有权限',
      not_found: '访问资源不存在'
    },
    copy_empty: '复制内容为空',
    copied: '已复制',
    copy_fail: '复制失败',
    input: '输入',
    output: '输出',
    publishSuccess: '发布成功',
    publishFailed: '发布失败',
    generateSuccess: '生成成功',
    generateFail: '生成失败',
    all: '全部',
    none: '无',
    createSuccess: '创建成功',
    createFailed: '创建失败'
  },
  request: {
    logout: '请求失败后登出用户',
    logoutMsg: '用户状态失效，请重新登录',
    logoutWithModal: '请求失败后弹出模态框再登出用户',
    logoutWithModalMsg: '用户状态失效，请重新登录',
    refreshToken: '请求的token已过期，刷新token',
    tokenExpired: 'token已过期'
  },
  theme: {
    themeDrawerTitle: '主题配置',
    tabs: {
      appearance: '外观',
      layout: '布局',
      general: '通用',
      preset: '预设'
    },
    appearance: {
      themeSchema: {
        title: '主题模式',
        light: '亮色模式',
        dark: '暗黑模式',
        auto: '跟随系统'
      },
      grayscale: '灰色模式',
      colourWeakness: '色弱模式',
      themeColor: {
        title: '主题颜色',
        primary: '主色',
        info: '信息色',
        success: '成功色',
        warning: '警告色',
        error: '错误色',
        followPrimary: '跟随主色'
      },
      themeRadius: {
        title: '主题圆角'
      },
      recommendColor: '应用推荐算法的颜色',
      recommendColorDesc: '推荐颜色的算法参照',
      preset: {
        title: '主题预设',
        apply: '应用',
        applySuccess: '预设应用成功',
        default: {
          name: '默认预设',
          desc: '系统默认主题预设'
        },
        soybean: {
          name: 'Soybean',
          desc: 'Soybean 默认主题预设'
        },
        dark: {
          name: '暗色预设',
          desc: '适用于夜间使用的暗色主题预设'
        },
        compact: {
          name: '紧凑型',
          desc: '适用于小屏幕的紧凑布局预设'
        },
        azir: {
          name: 'Azir的预设',
          desc: '是 Azir 比较喜欢的莫兰迪色系冷淡风'
        }
      }
    },
    layout: {
      layoutMode: {
        title: '布局模式',
        vertical: '左侧菜单模式',
        'vertical-mix': '左侧菜单混合模式',
        'vertical-hybrid-header-first': '左侧混合-顶部优先',
        horizontal: '顶部菜单模式',
        'top-hybrid-sidebar-first': '顶部混合-侧边优先',
        'top-hybrid-header-first': '顶部混合-顶部优先',
        vertical_detail: '左侧菜单布局，菜单在左，内容在右。',
        'vertical-mix_detail': '左侧双菜单布局，一级菜单在左侧深色区域，二级菜单在左侧浅色区域。',
        'vertical-hybrid-header-first_detail':
          '左侧混合布局，一级菜单在顶部，二级菜单在左侧深色区域，三级菜单在左侧浅色区域。',
        horizontal_detail: '顶部菜单布局，菜单在顶部，内容在下方。',
        'top-hybrid-sidebar-first_detail': '顶部混合布局，一级菜单在左侧，二级菜单在顶部。',
        'top-hybrid-header-first_detail': '顶部混合布局，一级菜单在顶部，二级菜单在左侧。'
      },
      tab: {
        title: '标签栏设置',
        visible: '显示标签栏',
        cache: '标签栏信息缓存',
        cacheTip: '一键开启/关闭全局 keepalive',
        height: '标签栏高度',
        mode: {
          title: '标签栏风格',
          slider: '滑块风格',
          chrome: '谷歌风格',
          button: '按钮风格'
        },
        closeByMiddleClick: '鼠标中键关闭标签页',
        closeByMiddleClickTip: '启用后可以使用鼠标中键点击标签页进行关闭'
      },
      header: {
        title: '头部设置',
        height: '头部高度',
        breadcrumb: {
          visible: '显示面包屑',
          showIcon: '显示面包屑图标'
        }
      },
      sider: {
        title: '侧边栏设置',
        inverted: '深色侧边栏',
        width: '侧边栏宽度',
        collapsedWidth: '侧边栏折叠宽度',
        mixWidth: '混合布局侧边栏宽度',
        mixCollapsedWidth: '混合布局侧边栏折叠宽度',
        mixChildMenuWidth: '混合布局子菜单宽度',
        autoSelectFirstMenu: '自动选择第一个子菜单',
        autoSelectFirstMenuTip: '点击一级菜单时，自动选择并导航到第一个子菜单的最深层级'
      },
      footer: {
        title: '底部设置',
        visible: '显示底部',
        fixed: '固定底部',
        height: '底部高度',
        right: '底部居右'
      },
      content: {
        title: '内容区域设置',
        scrollMode: {
          title: '滚动模式',
          tip: '主题滚动仅 main 部分滚动，外层滚动可携带头部底部一起滚动',
          wrapper: '外层滚动',
          content: '主体滚动'
        },
        page: {
          animate: '页面切换动画',
          mode: {
            title: '页面切换动画类型',
            'fade-slide': '滑动',
            fade: '淡入淡出',
            'fade-bottom': '底部消退',
            'fade-scale': '缩放消退',
            'zoom-fade': '渐变',
            'zoom-out': '闪现',
            none: '无'
          }
        },
        fixedHeaderAndTab: '固定头部和标签栏'
      }
    },
    general: {
      title: '通用设置',
      watermark: {
        title: '水印设置',
        visible: '显示全屏水印',
        text: '自定义水印文本',
        enableUserName: '启用用户名水印',
        enableTime: '显示当前时间',
        timeFormat: '时间格式'
      },
      multilingual: {
        title: '多语言设置',
        visible: '显示多语言按钮'
      },
      globalSearch: {
        title: '全局搜索设置',
        visible: '显示全局搜索按钮'
      }
    },
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    },
    tablePropsTitle: '表格配置',
    table: {
      size: {
        title: '表格大小',
        small: '小',
        medium: '中',
        large: '大'
      },
      bordered: '边框',
      bottomBordered: '底部边框',
      singleColumn: '设定行的分割线',
      singleLine: '设定列的分割线',
      striped: '斑马线条纹'
    }
  },
  route: {
    '403': '无权限',
    '404': '页面不存在',
    '500': '服务器错误',
    login: '登录',
    'iframe-page': '外链页面',
    home: '首页',
    system: '系统管理',
    system_user: '用户管理',
    system_role: '角色管理',
    system_menu: '菜单管理',
    system_dept: '部门管理',
    system_post: '岗位管理',
    system_dict: '字典管理',
    system_config: '参数设置',
    system_notice: '通知公告',
    system_oss: '文件管理',
    'system_oss-config': 'OSS 配置',
    system_client: '客户端管理',
    system_tenant: '租户管理',
    'system_tenant-package': '租户套餐',
    log: '日志管理',
    system_system_log: '日志管理',
    monitor: '系统监控',
    monitor_cache: '缓存监控',
    monitor_logininfor: '登录日志',
    monitor_operlog: '操作日志',
    monitor_online: '在线用户',
    'social-callback': '单点登录回调',
    'user-center': '个人中心',
    demo: '测试',
    demo_demo: '测试单表',
    demo_tree: '测试树表',
    exception: '异常页',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    tool: '系统工具',
    tool_gen: '代码生成',
    about: '关于',
    ai: 'AI 管理',
    'ai_model_model-manager': '模型管理',
    'ai_model_mcp-manager': 'MCP服务',
    'ai_model_tool-manager': '工具管理',
    'ai_model_skill-manager': '技能管理',
    'ai_knowledge_knowledge-manager': '知识库管理',
    'ai_knowledge_knowledge-detail': '知识库详情',
    'ai_knowledge_chunk-manager': '分块管理',
    'ai_knowledge_document-upload': '文档上传',
    'ai_knowledge_document-upload_step1': '文档上传-第一步',
    'ai_knowledge_document-upload_step2': '文档上传-第二步',
    'ai_workflow_workflow-template': '工作流模板',
    'ai_workflow_node-definition': '节点定义',
    'ai_workflow_template-editor': '模板编排',
    'ai_workflow_datasource-manager': '数据源管理',
    'ai_app_app-manager': '应用管理',
    'ai_app_app-detail': '应用详情',
    ai_app_chat: 'AI对话',
    'ai_app_rate-limit': '限流配置',
    ai_model: '大模型',
    ai_knowledge: '知识库',
    ai_app: '应用管理',
    ai_workflow: '工作流编排',
    ai_workflow_editor: '工作流编排',
    ai_ai_model: '大模型',
    ai_ai_knowledge: '知识库',
    ai_ai_workflow: '工作流',
    ai_ai_app: '应用管理',
    'ai_workflow_connection-rule-manager': '连接规则管理'
  },
  menu: {
    system_tenant: '租户管理',
    system_log: '日志管理',
    'monitor_snail-job': '任务调度中心',
    monitor_admin: 'Admin 监控'
  },
  dict: {
    sys_user_sex: {
      male: '男',
      female: '女',
      unknown: '未知'
    },
    sys_show_hide: {
      show: '显示',
      hide: '隐藏'
    },
    sys_normal_disable: {
      name: '状态',
      normal: '正常',
      disable: '停用'
    },
    sys_yes_no: {
      yes: '是',
      no: '否'
    },
    sys_notice_type: {
      notice: '通知',
      announcement: '公告'
    },
    sys_notice_status: {
      normal: '正常',
      close: '关闭'
    },
    sys_oper_type: {
      insert: '新增',
      update: '修改',
      delete: '删除',
      grant: '授权',
      export: '导出',
      import: '导入',
      force: '强退',
      gencode: '生成代码',
      clean: '清空数据',
      other: '其他'
    },
    sys_common_status: {
      success: '成功',
      fail: '失败'
    },
    sys_grant_type: {
      password: '密码认证',
      sms: '短信认证',
      email: '邮件认证',
      miniapp: '小程序认证',
      social: '三方登录认证'
    },
    sys_device_type: {
      pc: 'PC',
      android: '安卓',
      ios: 'iOS',
      miniapp: '小程序'
    },
    wf_business_status: {
      revoked: '已撤销',
      draft: '草稿',
      pending: '待审核',
      completed: '已完成',
      cancelled: '已作废',
      returned: '已退回',
      terminated: '已终止'
    },
    wf_form_type: {
      custom_form: '自定义表单',
      dynamic_form: '动态表单'
    },
    wf_task_status: {
      revoke: '撤销',
      pass: '通过',
      pending_review: '待审核',
      cancel: '作废',
      return: '退回',
      terminate: '终止',
      transfer: '转办',
      delegate: '委托',
      copy: '抄送',
      add_sign: '加签',
      minus_sign: '减签',
      timeout: '超时'
    }
  },
  page: {
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
        editConfig: '编辑参数配置'
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
        dictTypeIsEmpty: '暂无字典类型'
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
        userName: '用户名称',
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
    nodeDefinition: {
      title: '节点定义管理',
      tableView: '表格视图',
      jsonView: 'JSON 视图',
      import: '导入配置',
      export: '导出配置',
      save: '保存配置',
      reset: '重置',
      formatJson: '格式化',
      searchPlaceholder: '搜索节点类型、标签、描述...',
      filterCategory: '筛选分类',
      listTitle: '节点定义列表',
      jsonEditorTitle: 'JSON 编辑器',
      confirmSaveTitle: '确认保存',
      confirmSaveContent: '确定要保存 {count} 个节点定义吗?保存后会立即生效。',
      confirmResetTitle: '确认重置',
      confirmResetContent: '确定要重置所有修改吗?未保存的更改将丢失。',
      saveSuccess: '保存成功',
      saveFail: '保存失败',
      importSuccess: '导入成功',
      importFail: '导入失败',
      exportSuccess: '导出成功',
      exportFail: '导出失败',
      jsonParseSuccess: 'JSON 解析成功',
      jsonParseFail: 'JSON 解析失败',
      jsonFormatError: 'JSON 格式错误: 缺少 nodeTypes 数组',
      editTip: '编辑功能开发中...',
      saving: '保存中...',
      load_workflow_failed: '加载工作流失败'
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
    },
    ai_rateLimit: {
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
    }
  },
  form: {
    required: '不能为空',
    userName: {
      required: '请输入用户名',
      invalid: '用户名格式不正确'
    },
    phone: {
      required: '请输入手机号',
      invalid: '手机号格式不正确'
    },
    pwd: {
      required: '请输入密码',
      invalid: '密码格式不正确，6-18位字符，包含字母、数字、下划线'
    },
    confirmPwd: {
      required: '请输入确认密码',
      invalid: '两次输入密码不一致'
    },
    code: {
      required: '请输入验证码',
      invalid: '验证码格式不正确'
    },
    email: {
      required: '请输入邮箱',
      invalid: '邮箱格式不正确'
    }
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有',
    pin: '固定标签',
    unpin: '取消固定'
  },
  icon: {
    themeConfig: '主题配置',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定'
  },
  ai: {
    chat: {
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
    },
    msg: {
      rate_limit: {
        request_exceeded: '请求频率超限，请稍后再试',
        token_exceeded: 'Token 消耗超限，请稍后再试'
      }
    },
    common: {
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
    },
    skill: {
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
    },
    datasource: {
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
    },
    node_definition: {
      icon: '图标',
      node_type: '节点类型',
      name: '名称',
      category: '功能',
      system_reserved: '系统保留',
      operation: '操作',
      search_title: '搜索',
      category_label: '分类',
      select_category: '请选择分类',
      node_definition_title: '节点定义',
      copy_suffix: ' (副本)',
      source_node: '源节点',
      new_node_type: '新节点类型',
      input_new_node_type: '输入新的唯一节点类型',
      unique_id_placeholder: '唯一标识符 (例如: LLM_CHAT)',
      node_name: '节点名称',
      display_name: '显示名称',
      icon_placeholder: '例如: mdi:robot',
      color: '颜色',
      status: '状态',
      enable: '启用',
      disable: '禁用',
      description: '描述',
      node_desc_placeholder: '节点描述',
      custom_input_params: '自定义入参',
      allow: '允许',
      forbid: '禁止',
      custom_output_params: '自定义出参',
      parameters: '参数',
      type_string: '字符串',
      type_number: '数字',
      type_boolean: '布尔值',
      type_object: '对象',
      type_array: '数组',
      add_parameter: '添加参数',
      no_parameter_click_add: '暂无参数,点击上方按钮添加',
      parameter_index: '参数 {index}',
      required: '必填',
      param_key_name: '参数键名 *',
      param_key_placeholder: '例如: userInput',
      param_label: '参数标签 *',
      param_label_placeholder: '例如: 用户输入',
      param_type: '参数类型',
      default_value: '默认值',
      optional: '可选',
      param_desc_placeholder: '参数说明',
      required_parameter: '必填参数',
      parameter_config: '参数配置',
      prompt: '提示',
      param_config_warning1: '参数配置与开发密切相关，除非你清楚自己在干什么，否则不要随意修改',
      param_config_warning2: '参数键名在工作流中用于引用该参数的值,请确保键名唯一且数据类型正确',
      input_params: '输入参数',
      output_params: '输出参数'
    },
    knowledge_manager: {
      stats: {
        knowledgeBase: '知识库',
        dataset: '数据集',
        document: '文档',
        chunk: '切片',
        processing: '处理中',
        failed: '失败'
      },
      search: '搜索',
      searchPlaceholder: '请输入知识库名称',
      listTitle: '知识库列表',
      retrievalTest: '检索测试',
      createKnowledgeBase: '新建知识库',
      status: {
        active: '活跃',
        archived: '已归档'
      },
      noDescription: '暂无描述',
      datasetCount: '{count} 数据集',
      documentCount: '{count} 文档',
      manage: '管理',
      edit: '编辑',
      delete: '删除',
      deleteConfirmTitle: '确认删除',
      deleteConfirmContent: '确定要删除知识库"{name}"吗？所有关联的数据集和文档都将被删除！',
      deleteSuccess: '删除成功',
      emptyDescription: '暂无知识库，点击右上角新建',
      modal: {
        create: '创建',
        edit: '编辑知识库',
        save: '保存',
        cancel: '取消',
        name: '名称',
        namePlaceholder: '请输入知识库名称',
        description: '描述',
        descPlaceholder: '请输入知识库描述',
        nameMaxLength: '名称不能超过50个字符',
        nameRequired: '请输入知识库名称',
        addSuccess: '创建成功',
        updateSuccess: '更新成功',
        embeddingModel: '向量模型',
        embeddingModelPlaceholder: '请选择向量模型（创建后不可修改）',
        embeddingModelEditTip: '向量模型一旦绑定不可更改，以保证知识库向量空间的一致性。',
        embeddingModelRequired: '独立向量模型模式下，请选择知识库向量模型'
      },
      sandbox: {
        title: '检索测试沙箱',
        reset: '重置',
        searchPlaceholder: '输入测试问题...',
        search: '检索',
        config: '检索配置',
        knowledgeBase: '知识库',
        kbPlaceholder: '选择知识库 (可多选)',
        dataset: '数据集',
        datasetPlaceholder: '选择数据集 (可多选)',
        topK: '返回数量 (TopK)',
        threshold: '相似度阈值',
        mode: '检索模式',
        modeVector: '向量',
        modeKeyword: '关键词',
        modeHybrid: '混合',
        enableRerank: '启用 Rerank',
        rerankTooltip: '使用重排序模型对结果进行二次排序，提高准确性',
        enableHighlight: '启用高亮',
        highlightTooltip: '在检索结果中高亮显示匹配的关键词',
        downloadError: '下载失败',
        noDocIdError: '无法下载：缺少文档ID',
        hitContent: '命中全文',
        hitTitle: '命中标题',
        hitQuestion: '命中问题',
        resultTitle: '检索结果',
        items: '{count} 条',
        unknownDoc: '未知文档',
        downloadFile: '下载原文件',
        matchedQuestions: '匹配关联问题:',
        noResult: '未找到匹配结果，请调整查询或参数',
        emptyInput: '输入问题并点击检索',
        detailTitle: '片段详情',
        similarity: '相似度: {score}'
      },
      permission: '权限',
      select_permission_level: '选择权限级别',
      download_failed: '下载失败'
    },
    knowledge_detail: {
      index: {
        loadKBFail: '加载知识库失败',
        confirmDelete: '确认删除',
        deleteDatasetConfirm: '确定要删除数据集"{name}"吗？所有关联的文档都将被删除！',
        deleteSuccess: '删除成功',
        onlineDocSaveSuccess: '在线文档保存成功',
        saveFail: '保存失败',
        addWebLinkSuccess: '成功添加 {count} 个网页链接',
        addFail: '添加失败',
        processType: {
          QA_PAIR: '问答对',
          ONLINE_DOC: '在线文档',
          WEB_LINK: '网页链接',
          GENERIC_FILE: '通用文件',
          WORKFLOW_FILE: '工作流处理',
          UNKNOWN: '未知'
        },
        stats: {
          question: '问题',
          chunk: '切片',
          document: '文档',
          processing: '处理中',
          failed: '失败'
        },
        retrievalTest: '检索测试',
        tabs: {
          documents: '文档列表',
          questions: '问题列表'
        },
        dataset: {
          title: '数据集',
          desc1: '数据集用于归类管理知识库文档',
          desc2: '不同的数据集，对应不同的收录方式和处理规则',
          add: '添加数据集',
          system: '系统',
          docCount: '{count} 文档',
          empty: '暂无数据集',
          edit: '编辑',
          delete: '删除',
          pleaseSelect: '请先选择或创建数据集',
          processMode: '处理方式'
        }
      },
      document: {
        documentName: '文档名称',
        fileSize: '文件大小',
        enabled: '启用',
        disabled: '禁用',
        embeddingStatus: '向量化',
        statusUnembedded: '未生成',
        statusEmbedding: '生成中',
        statusEmbedded: '已生成',
        statusFailed: '失败',
        questionStatus: '问题生成',
        chunkCount: '切片数',
        tokenCount: 'Token数',
        createTime: '创建时间',
        actionChunkManage: '切片管理',
        actionEmbedding: '向量化',
        actionGenerateQuestion: 'AI生成问题',
        actionStatusRecord: '状态记录',
        actionDelete: '删除',
        enableSuccess: '启用成功',
        disableSuccess: '禁用成功',
        confirmDeleteDoc: '确定要删除该文档吗？',
        editSuccess: '修改成功',
        editFail: '修改失败',
        startEmbeddingSuccess: '向量化任务已开始，请稍候',
        operateFail: '操作失败',
        startGenerateQuestionSuccess: '问题生成任务已开始',
        uploadSuccess: '上传成功，正在处理中...',
        uploadFile: '上传文件',
        uploadQA: '上传QA对',
        addOnlineDoc: '添加在线文档',
        addWebLink: '添加网页链接',
        uploadWorkflow: '上传文件',
        addDoc: '添加文档',
        actionRetry: '重试处理',
        retrySuccess: '已重置为待处理状态，等待工作流调度',
        retryFail: '重试失败',
        customChunk: '我要自定义分块',
        dragUpload: '点击或拖拽文件到此处上传',
        qaFormatTip: 'QA对支持 Excel(.xlsx/.xls) 和 CSV 文件，第一列为问题，第二列为答案',
        fileFormatTip: '支持 PDF、Word、TXT、Markdown 等常见文件格式',
        batchEnable: '启用',
        batchDisable: '禁用',
        batchEmbedding: '向量化',
        batchGenerateQuestion: '生成问题',
        documentPromptTip:
          '提示词中的 {data} 为分段内容的占位符，执行时替换为分段内容发送给 AI 模型；\nAI 模型根据分段内容生成相关问题，每行一个问题返回；\n生成效果依赖于所选模型和提示词，用户可自行调整至最佳效果。',
        documentPromptText:
          '请根据以下参考文本，识别 3-5 个潜在的用户问题。\n仅输出问题，每行一个。不要对它们进行编号。\n参考文本：\n{data}',
        workflowAppRequired: '数据集尚未关联工作流应用，请先编辑数据集并选择合适的应用。',
        workflowAppUnpublished: '关联的工作流应用尚未发布，请先前往应用管理发布该应用。',
        workflowAppInvalidType: '关联的应用类型不正确（需为文件处理类型），请重新编辑数据集。',
        goToEdit: '去编辑'
      },
      datasetModal: {
        editDataset: '编辑数据集',
        createDataset: '新建数据集',
        systemPreset: '系统预设数据集，部分设置不可修改',
        name: '名称',
        namePlaceholder: '请输入数据集名称',
        nameRequired: '请输入数据集名称',
        nameMaxLength: '名称不能超过50个字符',
        type: '类型',
        typePlaceholder: '选择数据集类型',
        typeRequired: '请选择数据集类型',
        typeOptions: {
          FILE: '文件上传',
          WEB: '网页爬取',
          MANUAL: '手动录入'
        },
        processType: '处理方式',
        processTypePlaceholder: '选择处理方式',
        processTypeRequired: '请选择处理方式',
        processTypeOptions: {
          GENERIC_FILE: '通用文件 (PDF/Word/TXT)',
          QA_PAIR: 'QA问答对 (Excel/CSV)',
          ONLINE_DOC: '在线文档',
          WEB_LINK: '网页链接',
          WORKFLOW_FILE: '工作流处理'
        },
        workflowId: '关联应用',
        workflowIdPlaceholder: '选择用于处理文档的工作流应用（需 useType=fileProcess）',
        workflowIdRequired: '请选择关联的工作流应用',
        workflowIdTip: '工作流将接收 documentId 作为输入，处理完成后通过「数据集存储节点」写入知识库',
        goToAppManager: '去创建',
        maxConcurrency: '最大并行数',
        maxConcurrencyPlaceholder: '同一时刻最多并行处理的文档数量（默认1）',
        sourceType: '来源类型',
        sourceTypePlaceholder: '选择数据来源类型',
        sourceTypeOptions: {
          FILE_UPLOAD: '上传文件',
          TEXT_INPUT: '文本输入',
          WEB_CRAWL: '网页爬取'
        },
        chunkSetting: '分块设置',
        minChunkSize: '最小分块',
        minChunkSizePlaceholder: '最小 Token 数',
        maxChunkSize: '最大分块',
        maxChunkSizePlaceholder: '最大 Token 数',
        chunkOverlap: '重叠大小',
        chunkOverlapPlaceholder: '重叠 Token 数',
        childChunkSize: '子块大小(可选)',
        childChunkSizePlaceholder: '留空即使用系统默认大小',
        childChunkOverlap: '子块重叠(可选)',
        childChunkOverlapPlaceholder: '留空即使用系统默认大小',
        updateSuccess: '更新成功',
        createSuccess: '创建成功',
        save: '保存',
        create: '创建'
      },
      onlineDocModal: {
        add: '新建在线文档',
        edit: '编辑在线文档',
        title: '标题',
        titlePlaceholder: '请输入文档标题',
        titleRequired: '请输入文档标题',
        content: '内容',
        contentPlaceholder: '请输入文档内容 (支持富文本)',
        contentRequired: '请输入文档内容'
      },
      webLinkModal: {
        add: '添加网页链接',
        singleTab: '单个链接',
        url: 'URL',
        urlPlaceholder: 'https://example.com',
        batchTab: '批量导入',
        batchUrlLabel: 'URL 列表 (每行一个)',
        batchUrlPlaceholder: 'https://example.com/page1\nhttps://example.com/page2\nhttps://example.com/page3',
        addBtn: '添加',
        singleUrlRequired: '请输入网页链接',
        singleUrlInvalid: '请输入有效的 URL (以 http:// 或 https:// 开头)',
        batchUrlsRequired: '请输入网页链接 (每行一个)'
      },
      questionTable: {
        content: '问题内容',
        clickToDetail: '点击查看详情',
        chunkCount: '关联分段',
        hitNum: '命中次数',
        sourceType: '来源',
        sourceMap: {
          MANUAL: '手动添加',
          LLM: 'AI生成',
          UNKNOWN: '未知'
        },
        createTime: '创建时间',
        updateTime: '更新时间',
        actionLink: '关联分段',
        actionDelete: '删除',
        editSuccess: '修改成功',
        editFail: '修改失败',
        deleteConfirmTitle: '确认删除',
        deleteConfirmContent: '确定要删除该问题吗？',
        deleteSuccess: '删除成功',
        listTitle: '问题列表',
        addQuestion: '添加问题'
      },
      questionAddModal: {
        title: '批量添加问题',
        tip: '每行一个问题，提交后将批量创建。',
        placeholder: '请输入问题，每行一个问题\n例如：\n如何使用这个系统？\n系统支持哪些功能？\n如何导出数据？',
        addSuccess: '成功添加 {count} 个问题',
        addFail: '添加失败',
        requireContent: '请输入问题内容'
      },
      chunkLinkModal: {
        title: '关联分段',
        selectDoc: '选择文档',
        docCount: '{count} 个',
        searchDoc: '搜索文档...',
        loading: '加载中...',
        noDoc: '暂无文档',
        selectChunk: '选择分段',
        linkedCount: '已关联 {count} 个',
        currentDocCount: '当前文档 {count} 个',
        displayLevel: '显示',
        levelConcise: '精简',
        levelMedium: '中等',
        levelDetailed: '详细',
        searchChunk: '搜索分段标题或内容...',
        requireSelectDoc: '请先选择左侧文档',
        noChunk: '暂无分段',
        noTitle: '无标题',
        linked: '已关联',
        loadMore: '向下滚动加载更多',
        loadAll: '已加载全部分片',
        linkSuccess: '关联成功',
        linkFail: '关联失败',
        unlinkSuccess: '已取消关联',
        unlinkFail: '取消关联失败',
        loadDocFail: '加载文档列表失败',
        loadLinkedFail: '加载已关联分段失败',
        loadChunkFail: '加载分段列表失败'
      },
      questionDetailDrawer: {
        title: '问题详情',
        question: '问题',
        edit: '编辑',
        questionPlaceholder: '请输入问题内容',
        sourceMap: {
          MANUAL: '手动添加',
          LLM: 'AI生成'
        },
        sourcePrefix: '来源: ',
        hitNumPrefix: '命中次数: ',
        createTimePrefix: '创建时间: ',
        linkedChunksTitle: '关联分段 ({count}个)',
        addLink: '添加关联',
        loading: '加载中...',
        noLinkedChunks: '暂无关联分段',
        noTitle: '无标题',
        unlink: '取消关联',
        documentLabel: '文档: {title}',
        prev: '上一条',
        next: '下一条',
        editSuccess: '修改成功',
        editFail: '修改失败',
        loadLinkFail: '加载关联分段失败',
        unlinkConfirmTitle: '确认取消关联',
        unlinkConfirmContent: '确定要取消该问题与此知识分段的关联吗?',
        unlinkSuccess: '取消关联成功',
        contentEmpty: '内容不能为空',
        saveSuccess: '保存成功',
        saveFail: '保存失败'
      },
      view_chunks: '点击查看分块',
      test: '检索测试'
    },
    documentSearch: {
      all: '全部',
      enabled: '已启用',
      disabled: '已禁用',
      unGenerated: '未生成',
      generating: '生成中',
      generated: '已生成',
      generateFailed: '生成失败',
      keyword: '关键词',
      searchDocName: '搜索文档名称',
      enableStatus: '启用状态',
      embeddingStatus: '向量化状态',
      questionStatus: '问题生成状态'
    },
    documentStatusModal: {
      statusChangeRecord: '状态变更记录',
      embeddingTask: '向量化任务',
      generateQuestionTask: '问题生成任务',
      unknownTask: '未知任务',
      pending: '排队中 (Pending)',
      started: '执行中 (Started)',
      success: '已完成 (Success)',
      failed: '失败 (Failed)',
      unknownStatus: '未知状态',
      noStatusRecord: '暂无状态记录'
    },
    embeddingConfirmModal: {
      selectChunk: '选择分段',
      unembeddedOnly: '仅执行未成功分段',
      allChunks: '全部分段'
    },
    chunk_manager: {
      batch_generate_loading: '批量生成问题中...',
      batch_generate_success: '批量生成问题成功',
      batch_generate_error: '批量生成问题失败',
      content_empty_error: '内容不能为空',
      select_chunk_prompt: '请选择一个分块',
      add_chunk: '新建分块',
      edit_chunk: '编辑分块',
      chunk_detail: '分块详情',
      chunk_title: '分块标题',
      chunk_content: '分块内容',
      chunk_index: '分块 {index}',
      chunk_count: '{count}分块',
      no_title: '无标题',
      title_placeholder: '请输入标题',
      title_optional_placeholder: '分块标题（可选）',
      content_placeholder: '请输入分块内容',
      content_required_placeholder: '分块内容（必填）',
      associated_questions: '关联问题',
      ai_generate_question: 'AI 生成问题',
      add_question_placeholder: '新增：输入->回车，或者选择已有问题',
      no_associated_questions: '暂无关联问题',
      batch_mode: '批量模式',
      selected_items: '已选 {count} 项',
      batch_selection: '批量选择',
      exit_batch: '取消选择',
      add_new_chunk: '新增分块',
      no_chunks: '暂无分块',
      loading: '加载中...',
      all_chunks_loaded: '已加载全部分块',
      batch_enable: '批量启用',
      batch_disable: '批量禁用',
      batch_delete: '批量删除',
      delete: '删除',
      confirm_delete_chunk: '确定要删除该分块吗？',
      operating: '操作进行中，请稍候...',
      enabled_success: '已启用',
      disabled_success: '已禁用',
      delete_success: '删除成功',
      delete_fail: '删除失败',
      save_success: '保存成功',
      save_fail: '保存失败',
      op_fail: '操作失败',
      link_success: '关联成功',
      unlink_success: '取消关联成功',
      generating: '正在生成中...',
      batch_enable_success: '批量启用成功',
      batch_disable_success: '批量禁用成功',
      please_select_chunks: '请先选择分块',
      displayLevel: '显示',
      action: '操作',
      display_concise: '精简',
      display_medium: '中等',
      display_detailed: '详细',
      model_select_modal: {
        default_prompt:
          '请根据以下参考文本，识别 3-5 个潜在的用户问题。\n仅输出问题，每行一个。不要对它们进行编号。\n参考文本：\n{data}',
        alert_placeholders: '提示词中的{code}为分段内容的占位符,执行时替换为分段内容发送给 AI 模型;',
        alert_role: 'AI 模型会根据分段内容生成相关问题,每行一个问题返回;',
        alert_adjustment: '生成效果依赖于所选模型和提示词,用户可自行调整至最佳效果。'
      }
    },
    document_upload: {
      step1: {
        title: '上传文件 - 选择文件',
        tip1: '1、文件上传前，建议规范文件的分段标识',
        tip2: '2、每次最多上传 50 个文件, 每个文件不超过 100 MB',
        upload_dragger_text: '点击或拖拽文件到此处上传或',
        upload_folder_btn: '点击上传文件夹',
        upload_limit_tip: '支持 TXT, PDF, DOCX, MD 等常见格式',
        selected_files_count: '已选文件 ({count})',
        next_step: '下一步：预览分块',
        select_file_warning: '请先选择文件',
        no_valid_files: '没有有效的文件',
        upload_failed_no_data: '上传失败,未返回临时文件信息',
        upload_error: '文件上传失败: {error}',
        files_selected_success: '已选择 {count} 个文件',
        drag_support_tip: '支持 TXT, PDF, DOCX, MD 等常见格式',
        parsing: '解析中...',
        parse_success: '解析成功',
        parse_fail: '解析失败',
        waiting_upload: '等待上传',
        upload_success: '上传成功',
        clear_upload_list: '清空上传列表',
        clear_confirm: '确定要清空所有上传文件吗？',
        re_upload_fail: '重新上传失败'
      },
      step2: {
        title: '上传文件 - 分块预览',
        chunk_preview: '分块预览',
        confirm_upload: '确认上传',
        cancel: '取消',
        temp_file_id_invalid: '临时文件 ID 无效，请重新上传',
        file_count: '{count} 个文件',
        chunk_rule: '分块规则',
        auto_segment: '智能分段 (推荐)',
        auto_segment_tip: '不了解如何设置分段规则推荐使用智能分段',
        custom_segment: '高级分段',
        custom_segment_tip: '根据文档规范自行设置分段标识符、分段长度及清洗规则',
        separators: '分段标识',
        separators_tip: '如果不设置，则默认使用双换行符',
        separators_placeholder: '请选择或输入自定义标识符',
        chunk_size: '分段长度',
        overlap_size: 'OverLap 长度',
        auto_clean: '自动清洗',
        auto_clean_tip: '去掉重复多余符号空格、空行、制表符',
        generate_preview: '生成预览',
        batch_preview_btn: '为所有未预览文件生成预览',
        file_list: '文件列表',
        search_placeholder: '搜索文件...',
        no_matching_files: '暂无匹配文件',
        chunked_status: '已分块 ({count})',
        waiting_status: '待分块',
        no_chunks_prompt: '暂无分块数据，请点击“生成预览”',
        chunk_label: '分块 {index}',
        char_count: '{count} 字符',
        prev_step: '上一步',
        submit_btn: '提交入库',
        edit_modal_title: '编辑分块内容',
        content_placeholder: '请输入分块内容',
        separator_double_newline: '双换行符 (\\n\\n)',
        separator_newline: '换行符 (\\n)',
        separator_period: '句号 (。)',
        separator_exclamation: '感叹号 (！)',
        separator_question: '问号 (？)',
        separator_semicolon: '分号 (；)',
        separator_space: '空格 ( )'
      }
    },
    app_manager: {
      title: '应用管理',
      search: '搜索',
      create_app: '新建应用',
      custom_workflow: '自定义工作流',
      fixed_template: '固定模板',
      create_from_template: '从模板创建',
      search_placeholder: '请输入应用名称',
      use_type: '应用类型',
      use_type_placeholder: '请选择应用类型',
      use_type_chat: '对话应用',
      use_type_file: '文件处理',
      app_name: '应用名称',
      app_name_placeholder: '请输入应用名称',
      app_desc: '应用描述',
      app_desc_placeholder: '请输入应用描述',
      confirm_delete_title: '确认删除',
      confirm_delete_content: '确定要删除应用「{name}」吗？此操作不可恢复。',
      no_description: '暂无描述',
      creator: '创建者',
      status_published: '已发布',
      status_unpublished: '未发布',
      workflow_config: '工作流配置',
      edit_app: '编辑应用',
      go_to_chat: '去对话',
      template_select: {
        title: '从模版创建应用',
        search_placeholder: '搜索模版名称',
        all_categories: '全部分类',
        all_types: '全部类型',
        system_template: '系统模版',
        custom_template: '自定义模版',
        use_count: '已使用 {count} 次',
        use_this_template: '使用此模版',
        set_name_title: '设置应用名称',
        based_on: '基于 {name}',
        no_templates: '暂无可用模版'
      }
    },
    app_detail: {
      title: '应用详情',
      public_access_opened: '已开启公开访问',
      public_access_closed: '已关闭公开访问',
      refresh: '刷新',
      workflow_settings: '流程设置',
      app_config: '应用配置',
      run: '部署运行',
      debug: '调试',
      publish_btn: '发布',
      publish_confirm_content: '确认发布该应用？发布后可通过对话入口访问。',
      public_access: '公开访问',
      refresh_token_tip: '重新生成访问链接，会导致已经嵌入第三方的对话框无法使用，需要重新嵌入新的脚本。',
      enable_execution_detail: '启用执行详情',
      disable_execution_detail: '禁用执行详情',
      enable_execution_detail_success: '已启用执行详情',
      disable_execution_detail_success: '已禁用执行详情',
      public_link: '链接',
      workflow_not_configured_yet_confirm: '应用尚未配置工作流，是否现在配置？',
      workflow_missing_model_confirm: '缺少必填配置: 推理模型。是否现在配置工作流？',
      workflow_config_error_confirm: '{error}。是否现在配置工作流？',
      go_to_config: '去配置',
      embed: {
        title: '嵌入第三方页面',
        fullscreen: '全屏模式',
        mobile: '移动端模式',
        float: '浮窗模式',
        copy_code_tip: '复制以下代码进行嵌入'
      },
      monitor: {
        title: '监控统计',
        user_count: '用户总数',
        question_count: '提问次数',
        tokens_total: 'Tokens 总数',
        satisfaction: '用户满意度',
        period_7d: '过去7天',
        period_30d: '过去30天',
        period_90d: '过去90天',
        period_all: '全时段'
      },
      config: {
        pleaseSelect: '请先选择',
        knowledgeBase: '知识库',
        ai_model_tab: 'AI 模型配置',
        kb_retrieval_tab: '知识检索配置',
        inference_model: '推理模型',
        system_prompt: '系统提示词',
        system_prompt_placeholder: '定义 AI 助手的角色和行为规范',
        user_prompt: '用户提示词',
        user_prompt_placeholder: '用户向大模型提出的具体问题或指令 (可选)',
        temperature: '温度',
        enable_history: '携带历史',
        history_count: '历史条数',
        stream_output: '流式输出',
        max_tokens: '最大 Token',
        threshold: '分数阈值',
        rerank: '重排序',
        empty_response: '空结果回复',
        empty_response_placeholder: '未找到相关知识时的默认回复 (可选)',
        temp_precise: '精确',
        temp_balanced: '平衡',
        temp_creative: '创意',
        temp_random: '随机',
        temp_very_random: '极随机',
        retrieval_mode: '检索模式',
        kb_mode_vector: '向量检索',
        kb_mode_keyword: '关键词检索',
        kb_mode_hybrid: '混合检索',
        save_btn: '保存配置',
        save_success: '配置已保存',
        save_failed: '保存失败',
        save_warning: '请填写应用名称、选择大模型和知识库',
        load_options_failed: '加载配置选项失败'
      },
      ui_setting: {
        card_title: '对话界面 / 欢迎页',
        tab_form: '表单',
        tab_json: 'JSON',
        enabled: '启用欢迎页等扩展 UI',
        hide_prologue: '隐藏开场白气泡（与下方配置配合）',
        hero: '头部区域',
        hero_title: '主标题',
        hero_title_ph: '例如：你好！我是 AI 助手',
        hero_subtitle: '副标题',
        hero_subtitle_ph: '一句话说明',
        hero_image: '头图',
        hero_upload: '上传头图',
        hero_replace: '更换图片',
        hero_remove: '移除图片',
        hero_upload_tip: '推荐上传 PNG / JPG / GIF / WebP / SVG，走系统 OSS，保存配置后对话页即可使用。',
        hero_upload_success: '头图已上传',
        hero_upload_failed: '头图上传失败',
        hero_upload_image_only: '请选择图片文件',
        features: '功能卡片',
        features_hint: '可选快捷入口（常见为 2×2）。可排序、点选图标或自定义标识。',
        add_feature: '添加卡片',
        features_empty: '暂无卡片，点击「添加卡片」配置快捷入口',
        features_max: '最多 {n} 张功能卡片',
        remove: '移除',
        move_up: '上移',
        move_down: '下移',
        feature_card_label: '卡片 {n}',
        feature_title_placeholder: '未命名',
        feature_icon_pick: '快捷选图标',
        feature_icon_custom: '自定义图标',
        feature_icon_custom_ph: '如 mdi:camera 或本地图标名，与项目 SvgIcon 一致',
        feature_title: '标题',
        feature_title_ph: '如：识别花卉',
        feature_desc: '描述',
        feature_desc_ph: '简短说明，一行或两行即可',
        feature_input_prompt: '点击填入输入框的提示词',
        feature_input_prompt_ph: '可选；填写后点击卡片将把此处全文填入输入框。不填则使用标题，仍无则使用描述。',
        suggested_questions: '示例问题',
        suggested_questions_hint: '用于欢迎页等场景的可点选问句，最多 {n} 条；保存时会自动去掉空行。',
        suggested_add: '添加一条',
        suggested_question_input_ph: '输入一句完整问题，例如：蝴蝶兰怎么养护？',
        json_placeholder: 'AppUiSetting 结构的 JSON',
        json_invalid: 'JSON 格式不正确',
        save_btn: '保存 UI 配置',
        save_success: 'UI 配置已保存',
        save_failed: '保存失败',
        save_need_name: '请先保证应用名称有效'
      },
      workflow_incomplete: '工作流未完善',
      workflow_not_configured: '工作流未完成配置',
      workflow_has_errors: '工作流存在错误，请修复后再发布',
      missing_required_config: '缺少必要配置',
      go_config: '去配置',
      cancel: '取消',
      copy_link: '复制链接',
      copy_embed_code: '复制嵌入代码',
      fullscreen_code: '全屏嵌入代码',
      mobile_code: '移动端嵌入代码',
      float_code: '浮窗嵌入代码',
      publish_from_detail: '从APP详情页发布',
      fill_app_name_model_kb: '请填写应用名称、选择大模型和知识库'
    },
    model_manager: {
      test: {
        title: '模型测试 (Playground)',
        current_model: '当前测试模型:',
        chat_placeholder: '请输入消息开始测试...',
        ctrl_enter_send: 'Ctrl + Enter 发送...'
      },
      provider: {
        label: '供应商',
        manage: '供应商模型管理',
        name: '供应商名称',
        supported_models: '支持的模型',
        no_models_tip: '暂无模型，点击上方按钮添加'
      },
      all: '全部',
      no_provider: '暂无供应商',
      confirm_delete: '确认删除',
      delete_model_confirm: '确定要删除模型 "{name}" 吗？',
      status_label: '状态',
      delete_model_confirm_simple: '确认删除此模型?',
      confirm: '确定',
      cancel: '取消',
      delete_success: '删除成功',
      copy_success: '复制成功',
      model: '模型',
      default_model: '兜底模型',
      set_default_model: '设为兜底模型',
      set_default_confirm: '确定要将 "{name}" 设为其类型的兜底默认模型？',
      model_name: '模型名称',
      base_model: '基础模型',
      search_placeholder: '请输入关键词',
      add_model: '新增模型',
      no_model_data: '暂无模型数据',
      edit: '编辑',
      copy: '复制',
      delete: '删除',
      status: '状态',
      enable: '启用',
      disable: '禁用',
      select_provider: '请选择供应商',
      input_model_name: '请输入模型名称',
      select_base_model: '请输入或选择基础模型',
      select_model_type: '请选择模型类型',
      select_model_source: '请选择模型来源',
      input_api_key: '请输入apiKey',
      input_api_base: '请输入apiBase 地址',
      add_model_title: '新增模型',
      edit_model_title: '编辑模型',
      select_provider_and_model_first: '请先选择供应商和基础模型',
      test_connection_success: '连接测试成功',
      add_success: '新增成功',
      update_success: '修改成功',
      basic_settings: '基础设置',
      model_source: '模型来源',
      model_name_placeholder: '如：千问Max，方便记忆',
      model_type: '模型类型',
      base_model_placeholder: '选择基础模型或直接输入',
      no_api_key_tip: '没有 API Key？前往',
      official_website: '官网',
      get: '获取',
      api_base_placeholder1: '可选，留空使用供应商默认值',
      api_base_placeholder2: '请填写本地部署的大模型的 API Base 地址',
      advanced_settings: '高级参数',
      max_tokens: '最大 Token',
      max_tokens_placeholder: '默认使用模型上限',
      temperature: '温度',
      no_advanced_settings: '该模型类型暂无高级参数配置',
      test_connection: '测试连接',
      submit: '提交',
      playground: '模型测试 (Playground)',
      current_test_model: '当前测试模型:',
      input_message_start: '请输入消息开始测试...',
      ctrl_enter_send: 'Ctrl + Enter 发送...',
      send: '发送',
      language_model: '语言模型',
      vector_model: '向量模型',
      model_key: '模型标识',
      model_key_placeholder: '例如: gpt-4',
      operation: '操作',
      fill_all_model_keys: '请填写所有模型标识',
      provider_model_manage: '供应商模型管理',
      provider_name: '供应商名称',
      supported_models: '支持的模型',
      no_model_click_add: '暂无模型，点击上方添加',
      save: '保存'
    },
    workflow: {
      unnamed_app: '未命名应用',
      debug: '调试',
      go_to_chat: '去对话',
      publish_history: '发布历史',
      auto_save: '自动保存',
      save: '保存',
      components: '组件',
      tools: '工具',
      builtin_tools: '内置工具',
      message_not_empty: '消息内容不能为空',
      app_not_published: '您的应用还没有正式发布，请发布后再进行功能测试',
      clear_chat_history: '清空会话内容',
      send: '发送',
      ai_assistant: '智能助手',
      run_test: '运行测试',
      execution_time: '执行耗时',
      tokens_consumed: 'Tokens 消耗',
      total: '总计',
      input: '输入',
      output: '输出',
      get_execution_detail_failed: '获取执行详情失败',
      workflow_execution_detail: '工作流执行详情',
      unknown_status: '未知状态',
      time_cost: '耗时:',
      clear: '清除',
      set_default_test_params: '设置为默认测试参数',
      save_success: '保存成功',
      edit_node_properties: '编辑该节点属性',
      copy_node: '复制该节点',
      delete_node: '删除该节点',
      add_node: '添加节点',
      no_nodes_to_add: '没有节点可添加',
      publish_time: '发布时间',
      publisher: '发布人',
      remark: '备注',
      load_publish_history_failed: '加载发布历史失败',
      no_publish_history: '暂无发布历史',
      version: '版本号',
      zoom_in: '放大',
      zoom_out: '缩小',
      fit_view: '适应视图',
      collapse_all_nodes: '折叠所有节点',
      expand_all_nodes: '展开所有节点',
      elegant_layout: '优雅布局',
      collapse_and_layout: '折叠并优雅布局',
      undo: '撤销 (Ctrl+Z)',
      redo: '重做 (Ctrl+Y)',
      operation_history: '操作历史',
      current_status: '当前状态',
      executed: '已执行',
      can_redo: '可重做',
      total_items: '共 {count} 条',
      just_saved: '刚刚保存',
      pending_save: '待保存',
      saving: '保存中...',
      saved: '已保存',
      saved_n_minutes_ago: '{n} 分钟前已保存',
      saved_n_hours_ago: '{n} 小时前已保存',
      saved_n_days_ago: '{n} 天前已保存',
      unsaved_changes_title: '有未保存的更改',
      unsaved_changes_content: '您有未保存的更改，确定要离开吗？',
      save_and_leave: '保存并离开',
      discard_changes: '放弃更改',
      no_nodes_to_layout: '没有节点可以布局',
      layout_done: '布局完成',
      all_nodes_collapsed: '已折叠所有节点',
      all_nodes_expanded: '已展开所有节点',
      missing_app_id: '缺少应用 ID',
      workflow_data_not_exist: '工作流数据不存在',
      load_workflow_failed: '加载工作流失败',
      save_failed: '保存失败',
      publish_failed: '发布失败',
      publish_error: '发布出错',
      publish_failed_msg: '发布失败，请检查工作流配置',
      publish_failed_config: '发布失败，缺少必要配置',
      publish_app: '发布应用',
      publish_remark_placeholder: '请输入发布备注（可选）',
      confirm_publish: '确认发布',
      publish_success: '发布成功',
      invalid_connection: '无效的连接',
      cannot_connect: '无法连接这两个节点',
      debug_title: '调试模式',
      debug_tip1: '调试模式允许您在不发布的情况下测试工作流',
      debug_tip2: '调试模式下的更改不会影响已发布的版本',
      init_history: '初始化',
      invalid_temp_file_id: '临时文件ID无效',
      please_fill_app_info: '请确保已填写应用名称，并选择大模型和知识库',
      please_finish_current_param_config: '请先完成现有参数的配置',
      unnamed_param: '未命名参数',
      snapshot: {
        drag_add_link_node: '拖拽添加并链接节点[{label}]',
        add_link_node: '添加并连接节点[{label}]',
        add_node: '添加节点[{label}]',
        delete_node: '删除节点[{label}]',
        copy_node: '复制节点[{source}] 到 [{target}]',
        move_node: '移动节点[{label}]',
        link_nodes: '[{source}] 连接到 [{target}]'
      },
      history: {
        custom_inputs: '自定义入参',
        custom_outputs: '自定义出参',
        add_node: '添加节点',
        delete_node: '删除节点',
        add_link: '添加连线',
        delete_link: '删除连线',
        link_condition_changed: '连线条件变更'
      },
      msg: {
        connection_not_supported: '无法连接：[{source}] 不支持连接到 [{target}]',
        invalid_connection: '无效的连接'
      }
    },
    workflow_node: {
      param_name: '参数名',
      global_params: '全局参数',
      session_params: '会话参数',
      specify_reply_content: '指定回复内容',
      app_params: '应用参数',
      interface_params: '接口参数',
      history_context: '历史上下文',
      max_return_rows: '最大返回行数',
      condition_branch: '条件分支 (IF / ELSE IF)',
      if_specify_reply_content_it_is_final_output: '如果指定回复内容，就是最终工作流的输出。',
      config_branch_condition: '配置分支条件',
      empty_result_reply: '空结果回复',
      table_whitelist: '表白名单',
      table_blacklist: '表黑名单',
      allowed_query_tables: '允许查询的表,逗号分隔',
      forbidden_query_tables: '禁止查询的表,逗号分隔',
      variable_selection: '变量选择',
      similarity_threshold: '相似度阈值:',
      config_condition: '配置条件',
      select_variable: '选择变量',
      select_datasource: '选择数据源',
      eg_username: '例如: userName',
      eg_add_intent_node: '例如: 新增意图识别节点,优化LLM配置',
      eg_user_name: '例如: 用户名称',
      eg_professional_assistant: '例如:你是一个专业的客服助手... (输入 / 以选择变量)',
      eg_analyze_problem: '例如:请帮我分析这个问题... (输入 / 以选择变量)',
      eg_hello_user: '例如：{userName},你好。',
      keep_n_messages: '保留最近N条对话消息,用于上下文记忆,建议设置为 5-20 条',
      keyword_search: '关键词检索',
      other_else: '其他 (Else)',
      parameter_key: '参数键',
      parameter_default_value: '参数默认值',
      define_ai_role: '定义AI助手的角色 and 行为规范,输入 / 以选择变量',
      define_intent_branch: '定义意图分支',
      enable_context_memory: '开启后,AI 将能够理解对话上下文,保持对话连贯性',
      enable_stream_output: '开启后,模型将实时输出结果,而不是等待生成完成后一次性返回',
      description_purpose: '描述参数的用途',
      is_required: '是否必填',
      max_tokens: '最大 Token (Max Tokens)',
      latest_n_messages: '最近N条消息',
      reply_when_no_result: '未找到结果时的回复 (可选)',
      condition_not_set: '未设置条件',
      condition_group: '条件组',
      max_tokens_desc: '模型生成的最大token数,留空则使用模型默认值',
      compare_value: '比较值',
      add_type_name: '添加{typeName}',
      click_copy_param: '点击复制参数 ',
      user_name: '用户名称',
      user_prompt_desc: '用户向大模型提出的具体问题或指令,输入 / 以选择变量',
      type: '类型',
      custom_parameters: '自定义参数',
      custom_output: '自定义输出',
      merge_node_desc: '该节点可以汇合各节点参数，定义特定的内容端，可以通过输入/来引用输入参数的值。',
      input_reply_content: '输入指定的回复文本内容 (输入 / 以选择变量)',
      input_end_node_content: '输入结束节点的指定内容作为最终输出 (输入 / 以选择变量)',
      override_final_response: '这里的内容会覆盖当前节点的输出参数：finalResponse。',
      select_search_mode: '选择检索模式',
      select_knowledge_base: '选择知识库 (留空则搜索全部)',
      config_llm_behavior: '配置大语言模型的行为参数',
      rename_node: '重命名节点',
      key_name: '键名',
      hide_basenode_default_output: '隐藏 BaseNode 默认的输出点 -->',
      default_else: '默认 (ELSE)',
      default_use_model_limit: '默认使用模型上限',
      history_messages_count: '历史消息条数',
      no_session_params: '暂无会话参数',
      no_global_params: '暂无全局参数',
      click_above_to_add_condition: '点击上方按钮添加条件',
      user_prompt: '用户提示词',
      stream_output: '流式输出',
      delete_node: '删除节点',
      data_type: '数据类型',
      default_value: '默认值',
      param_desc: '参数描述',
      node_param: '节点参数',
      condition_branch_if_else: '条件分支 (IF / ELSE IF)',
      data_source: '数据源',
      vector_retrieval: '向量检索',
      dialog_config: '对话配置',
      enable_history_dialog: '启用历史对话',
      user_id: '用户ID',
      hybrid_retrieval: '混合检索',
      retrieval_config: '检索配置',
      knowledge_base: '知识库',
      dataset: '数据集(文件处理方式)',
      select_dataset: '选择数据集（仅工作流处理类型）',
      select_knowledge_base_first: '请先选择知识库',
      retrieval_mode: '检索模式',
      return_count: '返回数量 (Top K)',
      enable_rerank: '启用重排序 (Rerank)',
      intent_name: '意图名称',
      session_id: '会话ID',
      param_type_string: '字符串',
      param_type_number: '数字',
      param_type_boolean: '布尔值',
      param_type_object: '对象',
      param_type_array: '数组',
      param_type_datetime: '时间',
      node_category_basic: '基础',
      node_category_ai: 'AI',
      node_category_logic: '逻辑',
      node_category_database: '数据库',
      node_category_action: '动作',
      node_category_fileprocessing: '文件处理',
      op_eq: '等于 (==)',
      op_ne: '不等于 (!=)',
      op_gt: '大于 (>)',
      op_lt: '小于 (<)',
      op_gte: '大于等于 (>=)',
      op_lte: '小于等于 (<=)',
      op_contains: '包含',
      op_not_contains: '不包含',
      op_starts_with: '开头是',
      op_ends_with: '结尾是',
      op_is_empty: '为空',
      op_is_not_empty: '不为空',
      log_op_and: '且 (AND)',
      log_op_or: '或 (OR)',
      complete_existing_params_first: '请先完成已有参数的配置',
      unnamed_param: '未命名参数',
      copy_success_ref: '引用已复制',
      input_params: '输入参数',
      output_params: '输出参数',
      click_copy_tooltip: '点击复制变量引用',
      no_available_param_sources: '没有可用的参数来源',
      no_matching_variables: '没有匹配的变量',
      input_or_select_variable: '输入 / 以选择变量',
      unknown_type: '未知类型',
      copied_ref: '引用已复制',
      edit_type_name: '编辑{typeName}',
      add_type_name2: '添加{typeName}',
      new_param: '新建参数',
      greeting: '开场白',
      save: '保存',
      rename: '重命名',
      copy_node: '复制节点',
      unnamed_node: '未命名节点',
      confirm: '确定',
      branch_name: '分支名称',
      condition_label: '条件',
      loading: '加载中...',
      nested_group: '嵌套组',
      more_items: '还有{count}个',
      detail: '详情',
      delete: '删除',
      intent_name_default: '意图 {index}',
      branch: '分支',
      param: '参数',
      and_n_more: '{summary} 等{count}项',
      system_prompt: '系统提示词',
      no_limit: '不限制',
      // eslint-disable-next-line no-template-curly-in-string
      default_user_prompt: "已知信息：${'{'}chatContext{'}'}\n问题：${'{'}userInput{'}'}",
      unknown: '未知',
      start: '开始',
      end: '结束',
      tool_config: '工具配置',
      bind_mcp_servers: '绑定 MCP Server',
      mcp_select_placeholder: '选择要使用的 MCP Server（可多选）',
      bind_builtin_tools: '绑定内置工具',
      tool_select_placeholder: '选择要使用的内置 Python 工具（可多选）',
      bind_skills: '绑定技能',
      skill_select_placeholder: '选择要使用的自定义技能（可多选）',
      enable_tool_trace: '输出工具执行过程',
      enable_tool_trace_desc: '开启后，工具调用的请求参数与返回结果将通过 SSE 流式推送到前端，用于调试',
      providedBy: '由 {type} 提供',
      mcpService: 'MCP服务',
      builtinTool: '内置工具',
      continue_condition: '继续条件 (Continue Condition)',
      continue_when_all_met: '所有条件满足时继续循环，否则跳出',
      config_continue_condition: '配置继续循环条件',
      continue_when_met: '{varName} {op} {val} 满足时循环',
      loop_when: '{summary} 时循环',
      max_iterations_label: '最大迭代次数',
      exit_or_end: '跳出或结束 (Exit)',
      parse_config: '解析配置',
      process_type: '解析方式',
      process_type_desc: '选择特定解析 Handler 处理文件。默认根据关联数据集自动识别。',
      process_type_generic: '通用文件解析',
      process_type_qa: 'QA 对解析',
      process_type_online: '在线文档解析',
      process_type_web: '网页链接解析'
    },
    workflow_public: {
      select_model: '选择模型',
      model: '模型',
      ai_model: 'AI 模型',
      ai_model_config: 'AI模型配置',
      please_select_ai_model: '请选择 AI 模型',
      please_select_llm_model: '请选择 LLM 模型',
      model_selector: '模型选择',
      creative: '创意',
      extremely_random: '极随机',
      temperature_desc: '温度越高,模型越随机,越倾向于创造性和创新性,但可能会降低准确性。',
      param_settings: '参数设置',
      advanced_params: '高级参数',
      load_model_list_failed: '加载模型列表失败',
      prompt: '提示词',
      temperature: '温度 (Temperature)',
      max_tokens: '最大 Token (Max Tokens)',
      precise: '精确',
      balanced: '平衡',
      random: '随机'
    },
    workflow_template: {
      used_count_times: '使用 {count} 次',
      template: '模板',
      workflow_template: '工作流模板',
      init_failed: '初始化失败,请刷新页面重试',
      template_edit: '模板编辑',
      components: '组件',
      save: '保存',
      auto_save: '自动保存',
      missing_template_id: '缺少模板 ID',
      template_not_exist: '模板数据不存在',
      load_template_failed: '加载模板失败',
      save_failed: '保存失败',
      save_success: '保存成功',
      app_name: '应用名称',
      app_desc: '应用描述',
      search: '搜索',
      confirm: '确定',
      cancel: '取消',
      edit: '编辑',
      create: '创建',
      close: '关闭',
      open: '开启',
      system: '系统',
      system_template: '系统模板',
      user_template: '用户模板',
      no_desc: '暂无描述',
      no_template: '暂无模板',
      unnamed_template: '未命名模板',
      template_name: '模板名称',
      new_workflow: '新工作流',
      template_desc: '模板描述（可选）',
      create_success: '创建成功',
      delete_success: '删除成功',
      load_category_failed: '加载分类失败',
      copy_failed: '复制失败,请手动复制',
      copy_success: '复制成功',
      copy_to_custom: '复制至自定义',
      copy_to_custom_template: '复制至自定义模板',
      create_success_jump: '创建成功，即将跳转到工作流编排页面',
      publish_failed: '发布失败',
      publish_error: '发布异常',
      unique_identifier: '唯一标识，如 knowledge_qa',
      base_info: '基础信息',
      base_config: '基础配置',
      missing_app_name: '缺少必填配置: 应用名称',
      missing_reasoning_model: '缺少必填配置: 推理模型',
      please_input_publish_summary: '请输入发布摘要',
      please_input_app_name: '请输入应用名称',
      please_input_app_desc: '请输入应用描述',
      please_input_greeting: '请输入开场白',
      please_input_prompt: '请输入提示词',
      please_input_new_template_name: '请输入新模板名称',
      please_input_template_name: '请输入模板名称',
      please_input_node_name: '请输入节点名称',
      create_app_from_template: '通过模板创建应用',
      select_category: '选择分类',
      select_icon: '选择图标',
      system_template_cannot_delete: '系统模板不允许删除',
      system_template_cannot_edit: '系统模板不允许编辑',
      edit_template: '编辑模板',
      advanced_config: '高级配置',
      edit_icon: '📝 编辑',
      search_icon: '🔍 搜索',
      robot_icon: '🤖 机器人',
      intelligence_icon: '🧠 智能',
      publish: '发布',
      save_app_config_failed: '保存应用配置失败，无法发布',
      icon_doc: '文档',
      icon_chat: '对话',
      icon_data: '数据',
      icon_auto: '自动',
      user_built: '用户自建',
      workflow_config: '工作流配置',
      create_failed: '创建失败',
      copy_success_created: '复制成功，应用已创建',
      please_input_template_code: '请输入模板代码',
      new_template: '新建模板',
      saving: '保存中...',
      template_code: '模板代码',
      category: '分类',
      icon_label: '图标',
      description: '描述',
      use_template: '使用模板',
      uncategorized: '未分类',
      create_app_name_prefix: '基于',
      copy_name_suffix: '_副本',
      confirm_delete_template: '删除模板「{name}」吗？此操作不可恢复。',
      unknown: '未知',
      copy: '复制'
    },
    mcp: {
      listTitle: 'MCP Server 列表',
      addTitle: '新增 MCP Server',
      editTitle: '编辑 MCP Server',
      serverName: 'Server 名称',
      description: '描述',
      transportType: '传输协议',
      serverConfig: 'Server 配置（JSON）',
      status: '状态',
      searchPlaceholder: '请输入 Server 名称搜索',
      form: {
        serverNameRequired: '请输入 Server 名称',
        transportTypeRequired: '请选择传输协议',
        serverNamePlaceholder: '请输入 MCP Server 名称',
        descriptionPlaceholder: '请输入描述信息',
        serverConfigPlaceholder:
          "请输入 JSON 格式的 Server 配置，如：{' {'}\"url\": \"http://...\",\"headers\": {' {'}{' }'}{' }'}"
      }
    },
    builtinTool: {
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
        schemaPlaceholder: '请输入 JSON Schema 格式的输入参数定义'
      }
    },
    connection_rule: {
      matrix_view: '矩阵视图',
      list_view: '列表视图',
      source_node: '源节点',
      target_node: '目标节点',
      allowed: '是否允许',
      source_node_required: '请输入源节点类型',
      target_node_required: '请输入目标节点类型'
    }
  },
  datatable: {
    itemCount: '共 {count} 条',
    oss: {
      access_policy: {
        private: '私有',
        public: '公共',
        custom: '自定义'
      }
    },
    system: {
      data_scope: {
        all: '全部数据权限',
        custom: '自定数据权限',
        dept: '本部门数据权限',
        dept_and_below: '本部门及以下数据权限',
        self: '仅本人数据权限',
        dept_and_below_or_self: '本部门及以下或仅本人数据权限'
      }
    }
  }
};

export default local;
