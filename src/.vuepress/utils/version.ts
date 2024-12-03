const getDocVersion = (defaultValue = 'latest', path = '') => {
  if (path.indexOf('UserGuide/Master') > -1 || path.indexOf('UserGuide') === -1) {
    return defaultValue;
  }
  /**
   * 路径 /zh/UserGuide/V1.3.0-2/QuickStart/QuickStart_apache.html, 匹配 V1.3.0-2
   * 路径 /zh/UserGuide/V1.2.x/QuickStart/QuickStart_apache.html, 匹配 V1.2.x
   * 路径 /zh/UserGuide/latest/QuickStart/QuickStart_apache.html, 匹配 latest
   *
   * 匹配路径中的版本号，UserGuide 后面的版本号为当前文档的版本号, 版本号不一定为数字，可能为 latest或其它，因此只用 / 作为分隔符
   */
  // eslint-disable-next-line no-useless-escape
  const versionRex = /UserGuide\/([^\/]+)/;

  if (versionRex.test(path)) {
    const tag = versionRex.exec(path)![1];
    return tag;
  }
  return defaultValue;
};

export { getDocVersion };
