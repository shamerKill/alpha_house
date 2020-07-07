// 验证手机号
export const isPhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone);
};
// 验证邮箱
export const isEmail = (email: string): boolean => {
  return /^([a-zA-Z]|[0-9])(\w|-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/.test(email);
};
// 验证密码
export const isPass = (pass: string): boolean => {
  return /^[0-9a-zA-Z]{8,20}$/.test(pass);
};
