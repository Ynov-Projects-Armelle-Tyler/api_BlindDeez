import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail';

import { User } from '@blinddeez/api-core/models';
import { assert } from '@blinddeez/api-core/utils/assert';
import { load } from '@blinddeez/api-core/views';
import { EMAIL_SENDER } from '@blinddeez/api-core/utils/env';
import {
  BadRequest,
  Conflict,
  NotFound,
} from '@blinddeez/api-core/utils/errors';

export const create = async (req, res) => {
  const userInfo = assert(req.body.user, BadRequest('invalid_request'));
  const email = assert(req.body.email, BadRequest('email_format'), isEmail);
  const password = assert(req.body.password, BadRequest('invalid_request'));

  const exists = await User.findOne({ email });

  if (exists) {
    throw Conflict('already_exists');
  }

  const user = await User.from({
    ...userInfo,
    email,
    password,
  });

  await user.save();

  req.app.get('Sendgrid').send({
    from: EMAIL_SENDER,
    to: account.email,
    subject: 'Welcome',
    body: load('emails/welcome', {
      user: `${user.username}`,
    }),
  });

  res.json({ created: true });
};

export const get = async (req, res) => {
  const userId = assert(req.params.id, BadRequest('wrong_user_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const user = assert(
    await User.findOne({ _id: userId }),
    NotFound('user_not_found')
  );

  res.json({ user });
};

export const getAll = async (req, res) => {
  const users = assert(
    await User.find({}),
    NotFound('user_not_found')
  );

  res.json({ users });
};

export const update = async (req, res) => {
  const userId = assert(req.params.id, BadRequest('wrong_user_id'),
    val => mongoose.Types.ObjectId.isValid(val));
  const userInfo = assert(req.body.user, BadRequest('invalid_request'));
  const email = assert(req.body.email, BadRequest('invalid_request'), isEmail);
  const password = assert(req.body.password, BadRequest('invalid_request'));

  const user = assert(
    await User.findOne({ _id: userId }),
    NotFound('user_not_found')
  );

  Object.assign(user, {
    ...userInfo,
    email,
    password
  });

  await user.save();

  res.json({ user });
};

export const remove = async (req, res) => {
  const userId = assert(req.params.id, BadRequest('wrong_user_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const user = assert(
    await User.findOne({ _id: userId }),
    NotFound('user_not_found')
  );

  await user.remove();

  res.json({ deleted: true });
};
