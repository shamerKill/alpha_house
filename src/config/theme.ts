// 头部背景色
export const defaultThemeBarColor = '#f5f5f5';
// 背景色
export const defaultThemeBgColor = '#f5f5f5';
// 主要颜色
export const defaultThemeColor = '#7373f7';
// 主要颜色浅色
export const defaultThemeSmallColor = '#e3e3fd';
// 黑色
export const themeBlack = '#282828';
// 白色
export const themeWhite = '#ffffff';
// 灰色
export const themeGray = '#abb1cb';
// 字体灰色
export const themeTextGray = '#666666';
// 红色
export const themeRed = '#f65449';
// 绿色
export const themeGreen = '#32b28f';
// 深蓝色
export const themeMoreBlue = '#141f31';
// 蓝色
export const themeBlue = '#7373f7';

// 处理半透明
export const getThemeOpacity = (color: string, opacity: number) => {
  return (color + Math.round((opacity * 255)).toString(16));
};
