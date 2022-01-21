/* eslint-disable no-console */
import colors from 'colors/safe';

export default (keys, message) => {
  const [a, b] = keys.split('.');

  // WARNING: 'a' and 'b' must be a property of module 'colors/safe'

  return console.log(b ? colors[a][b](message) : colors[a](message));
};
