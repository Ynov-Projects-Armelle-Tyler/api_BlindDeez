import { compare } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';

import isEmail from '@blinddeez/api-core/utils/validate';
import { User } from '@blinddeez/api-core/models';
import { assert } from '@blinddeez/api-core/utils/assert';
import {
  BadRequest,
  Unauthorized,
  NotFound,
} from '@blinddeez/api-core/utils/errors';
import {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  TOKEN_NORMAL_EXPIRY,
  TOKEN_EXTENDED_EXPIRY,
} from '@blinddeez/api-core/utils/env';

const grantWithPassword = async (req, res) => {
  const email = assert(req.body.email, BadRequest('invalid_request'), isEmail);
  const password = assert(req.body.password, BadRequest('invalid_request'));

  const user = assert(
    await User.findOne({ email }),
    NotFound('user_not_found')
  );
  const cmp = await compare(password, user.password);

  if (!cmp) {
    throw Unauthorized('access_denied');
  }

  const accessToken = await sign(
    {
      user_id: user._id,
      email,
    },
    TOKEN_KEY,
    { expiresIn: TOKEN_NORMAL_EXPIRY }
  );

  const salt = await user.genSalt();

  const refreshToken = await sign({ salt: salt }, REFRESH_TOKEN_KEY,
    { expiresIn: TOKEN_EXTENDED_EXPIRY });

  user.access_token = accessToken;
  user.refresh_token = refreshToken;
  user.refresh_token_salt = salt;
  await user.save();

  res.json({
    accessToken: accessToken,
    refreshToken: refreshToken,
    tokenType: 'bearer',
  });
};

export const login = async (req, res, next) => {
  return req.app.get('Brute').prevent(req, res, async () => {
    try {
      await grantWithPassword(req, res);
    } catch (e) {
      next(e, req, res, next);
    }
  });
};

export const refresh = async (req, res) => {
  const accessToken = assert(req.body.access_token,
    BadRequest('invalid_request'));
  const refreshToken = assert(req.body.refresh_token,
    BadRequest('invalid_request'));

  const user = assert(await User.findOne({
    access_token: accessToken,
    refresh_token: refreshToken,
  }), NotFound('refresh_token_not_found'));

  let decoded;

  try {
    decoded = await verify(refreshToken, REFRESH_TOKEN_KEY, {
      expiresIn: TOKEN_EXTENDED_EXPIRY,
    });
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      const salt = await user.genSalt();

      const newRefreshToken = await sign({ salt: salt }, REFRESH_TOKEN_KEY,
        { expiresIn: TOKEN_EXTENDED_EXPIRY });

      user.refresh_token = newRefreshToken;
      user.refresh_token_salt = salt;
      await user.save();

      refresh(req, res);
    }
  }

  if (decoded?.salt !== user.refresh_token_salt) {
    Unauthorized('invalid_refresh_token');
  }

  const newAccessToken = await sign({ user_id: user._id, email: user.email },
    TOKEN_KEY, { expiresIn: TOKEN_NORMAL_EXPIRY });

  user.access_token = newAccessToken;
  await user.save();

  res.json({
    accessToken: newAccessToken,
    refreshToken: refreshToken,
    tokenType: 'bearer',
  });
};
