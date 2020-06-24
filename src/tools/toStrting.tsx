const toString = (obj: object) => {
  const startString = '--just--';
  const endString = '--just--';
  let result = JSON.stringify(obj, (_k, v) => {
    if (typeof v === 'function') {
      return `${startString}${v.toString()}${endString}`;
    }
    return v;
  });
  const resultReg = new RegExp(`\\"${startString}(.*?)${endString}\\"`, 'g');
  result = result.replace(resultReg, '$1').replace(/\\n/g, '');
  return result;
};

export default toString;
