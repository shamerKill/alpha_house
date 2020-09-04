function formatTime(format: string = 'YYYY-MM-DD hh:mm:ss', time?: number): string {
  const newTime = time ? new Date(time) : new Date();
  // 那些显示
  const showTimetype: {[key: string]: number} = {
    YYYY: newTime.getFullYear(),
    MM: newTime.getMonth() + 1,
    DD: newTime.getDate(),
    hh: newTime.getHours(),
    mm: newTime.getMinutes(),
    ss: newTime.getSeconds(),
  };
  let backStr = format;
  Object.keys(showTimetype).forEach(key => {
    if (showTimetype[key] !== undefined) {
      backStr = backStr.replace(key, showTimetype[key] < 10 ? `0${showTimetype[key].toString()}` : showTimetype[key].toString());
    }
  });
  return backStr;
}
export default formatTime;
