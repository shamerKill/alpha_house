import { isPhone, isEmail } from './verify';

// 处理账户字符串
// eslint-disable-next-line import/prefer-default-export
export const encryptionAccount = (account: string) => {
  // 手机号处理
  if (isPhone(account)) {
    return account.replace(/(\d{3})(\d{4})(\d+)/, '$1****$3');
  }
  // 邮箱处理
  if (isEmail(account)) {
    // 获取后缀
    const [email, emailFix] = account.split('@');
    return `${email.replace(/^(.{2})(.*?)(.{1}$)/, '$1**$3')}@${emailFix}`;
  }
  return account;
};
