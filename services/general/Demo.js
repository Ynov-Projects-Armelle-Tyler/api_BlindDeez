/* eslint-disable max-len */
/*eslint-disable no-unused-vars*/
import { Forbidden } from '@blinddeez/api-core/utils/errors';

export const send = async (req, res) => {

  if (!__DEV__) {
    throw Forbidden();
  }

  res.json({ send: true });
};

export const socket = async (req, res) => {

  if (!__DEV__) {
    throw Forbidden();
  }

  req.app.get('Socket').emit('key', 'send from API Controller !!');

  res.json({ created: true });
};
