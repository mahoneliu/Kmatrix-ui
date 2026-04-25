const common: App.I18n.Schema['common'] = {
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
  copySuccess: 'Copy Success',
  copyFailed: 'Copy Failed',
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
  createFailed: 'Create Failed',
  refreshCache: 'Refresh Cache',
  refreshCacheSuccess: 'Refresh Cache Success',
  refreshCacheFailed: 'Refresh Cache Failed'
};

const request: App.I18n.Schema['request'] = {
  logout: 'Logout user after request failed',
  logoutMsg: 'User status is invalid, please log in again',
  logoutWithModal: 'Pop up modal after request failed and then log out user',
  logoutWithModalMsg: 'User status is invalid, please log in again',
  refreshToken: 'The requested token has expired, refresh the token',
  tokenExpired: 'The requested token has expired'
};

const theme: App.I18n.Schema['theme'] = {
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
};

const form: App.I18n.Schema['form'] = {
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
};

const dropdown: App.I18n.Schema['dropdown'] = {
  closeCurrent: 'Close Current',
  closeOther: 'Close Other',
  closeLeft: 'Close Left',
  closeRight: 'Close Right',
  closeAll: 'Close All',
  pin: 'Pin Tab',
  unpin: 'Unpin Tab'
};

const icon: App.I18n.Schema['icon'] = {
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
};

const datatable: App.I18n.Schema['datatable'] = {
  itemCount: '共 {count} 条',
  oss: {
    access_policy: {
      private: 'Private',
      public: 'Public',
      custom: 'Custom'
    }
  },
  system: {
    data_scope: {
      all: 'All Data Scope',
      custom: 'Custom Data Scope',
      dept: 'Own Dept Data Scope',
      dept_and_below: 'Own Dept and Below Data Scope',
      self: 'Only Self Data Scope',
      dept_and_below_or_self: 'Own Dept and Below or Only Self Data Scope'
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
