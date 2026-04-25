const common: App.I18n.Schema['common'] = {
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
  copySuccess: '复制成功',
  copyFailed: '复制失败',
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
  createFailed: '创建失败',
  refreshCache: '刷新缓存',
  refreshCacheSuccess: '刷新缓存成功',
  refreshCacheFailed: '刷新缓存失败'
};

const request: App.I18n.Schema['request'] = {
  logout: '请求失败后登出用户',
  logoutMsg: '用户状态失效，请重新登录',
  logoutWithModal: '请求失败后弹出模态框再登出用户',
  logoutWithModalMsg: '用户状态失效，请重新登录',
  refreshToken: '请求的token已过期，刷新token',
  tokenExpired: 'token已过期'
};

const theme: App.I18n.Schema['theme'] = {
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
};

const form: App.I18n.Schema['form'] = {
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
};

const dropdown: App.I18n.Schema['dropdown'] = {
  closeCurrent: '关闭',
  closeOther: '关闭其它',
  closeLeft: '关闭左侧',
  closeRight: '关闭右侧',
  closeAll: '关闭所有',
  pin: '固定标签',
  unpin: '取消固定'
};

const icon: App.I18n.Schema['icon'] = {
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
};

const datatable: App.I18n.Schema['datatable'] = {
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
};

export default {
  common,
  request,
  theme,
  form,
  dropdown,
  icon,
  datatable
};
