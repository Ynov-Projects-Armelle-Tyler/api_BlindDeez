import { verify } from 'jsonwebtoken';

import { Account } from '../models';
import { Forbidden, Unauthorized } from '../utils/errors';
import { TOKEN_KEY, TOKEN_NORMAL_EXPIRY } from '../utils/env';

export default () => {
  return async function AuthInterceptor (req, res, next) {
    const [authMode, authValue] = (req.get('authorization') || '').split(' ');

    let decoded;

    if (!authMode || !authValue) {
      throw Forbidden('access_token_mandatory');
    }

    const user = await Account.findOne({
      access_token: authValue,
    });

    if (!user) {
      throw Forbidden('authorization_error');
    }

    try {
      decoded = await verify(authValue, TOKEN_KEY, {
        expiresIn: TOKEN_NORMAL_EXPIRY,
      });
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw Forbidden('token_expired');
      }
    }

    if (user.email !== decoded.email) {
      throw Unauthorized('invalid_token');
    }

    req.decoded = decoded;

    next();
  };
};
