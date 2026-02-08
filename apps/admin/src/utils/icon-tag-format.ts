/**
 * 获取请求方法标签类型
 *
 * @param method 请求方法
 * @returns 标签类型
 */
export function getRequestMethodTagType(method: string): NaiveUI.ThemeColor {
  const methodUpper = method.toUpperCase();
  const colors: { [key: string]: NaiveUI.ThemeColor } = {
    DELETE: 'error',
    GET: 'success',
    POST: 'primary',
    PUT: 'warning'
  };

  return colors[methodUpper] ?? 'default';
}

const browserOptions = [
  { localIcon: 'logos-chrome', value: 'chrome' },
  { localIcon: 'logos-microsoft-edge', value: 'edge' },
  { localIcon: 'logos-firefox', value: 'firefox' },
  { localIcon: 'logos-opera', value: 'opera' },
  { localIcon: 'logos-safari', value: 'safari' },
  { localIcon: 'ic-baseline-wechat', value: 'micromessenger' },
  { localIcon: 'ic-baseline-wechat', value: 'windowswechat' },
  { localIcon: 'arcticons-quark-browser', value: 'quark' },
  { localIcon: 'ic-baseline-wechat', value: 'wxwork' },
  { localIcon: 'simple-icons-tencentqq', value: 'qq' },
  { localIcon: 'arcticons-dingtalk', value: 'dingtalk' },
  { localIcon: 'arcticons-uc-browser', value: 'uc' },
  { localIcon: 'ri-baidu-fill', value: 'baidu' }
];

const osOptions = [
  { localIcon: 'devicon-windows8', value: 'windows' },
  { localIcon: 'cbi-imac', value: 'osx' },
  { localIcon: 'devicon-linux', value: 'linux' },
  { localIcon: 'logos-android-icon', value: 'android' },
  { localIcon: 'file-icons-apple', value: 'ios' }
];
/**
 * 获取浏览器图标
 *
 * @param browser 浏览器
 * @returns 浏览器图标
 */
export function getBrowserIcon(browser: string): string {
  const icon = browserOptions.find(item => browser.toLocaleLowerCase().includes(item.value));
  return icon?.localIcon ?? 'stash-browser-light';
}

/**
 * 获取操作系统图标
 *
 * @param os 操作系统
 * @returns 操作系统图标
 */
export function getOsIcon(os: string): string {
  const icon = osOptions.find(item => os.toLocaleLowerCase().includes(item.value));
  return icon?.localIcon || 'mingcute-device-fill';
}
