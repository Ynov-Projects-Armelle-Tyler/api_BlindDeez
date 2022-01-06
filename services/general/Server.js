import mongoose from 'mongoose';

import { Server } from '@blinddeez/api-core/models';
import { assert } from '@blinddeez/api-core/utils/assert';
import {
  BadRequest,
  Conflict,
  NotFound,
} from '@blinddeez/api-core/utils/errors';

export const create = async (req, res) => {
  const name = assert(req.body.name, BadRequest('invalid_request'));

  const exists = await Server.findOne({ name });

  if (exists) {
    throw Conflict('already_exists');
  }

  const user = assert(
    await User.findOne({ _id: req.decoded.user_id }),
    NotFound('user_not_found')
  );

  await Server.from({
    name,
    users: user,
  });

  res.json({ created: true });
};

export const get = async (req, res) => {
  const serverId = assert(req.params.id, BadRequest('wrong_server_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const server = assert(
    await Server.findOne({ _id: serverId }),
    NotFound('server_not_found')
  );

  res.json({ server });
};

export const getAll = async (req, res) => {
  const servers = assert(
    await Server.find({}),
    NotFound('server_not_found')
  );

  res.json({ servers });
};

export const update = async (req, res) => {
  const serverId = assert(req.params.id, BadRequest('wrong_server_id'),
    val => mongoose.Types.ObjectId.isValid(val));
  const name = assert(req.body.name, BadRequest('invalid_request'));

  const user = assert(
    await User.findOne({ _id: req.decoded.user_id }),
    NotFound('user_not_found')
  );

  const server = assert(
    await Server.findOne({ _id: serverId }),
    NotFound('server_not_found')
  );

  if (server.users.indexOf(user) === 0) {
    Object.assign(server, { name });

    await server.save();

    res.json({ server });
  }
};

export const addUser = async (req, res) => {
  const serverId = assert(req.params.id, BadRequest('wrong_server_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const user = assert(
    await User.findOne({ _id: req.decoded.user_id }),
    NotFound('user_not_found')
  );

  const server = assert(
    await Server.findOne({ _id: serverId }),
    NotFound('server_not_found')
  );

  server.users.push(user);

  await server.save();

  res.json({ server });
};

export const removeUser = async (req, res) => {
  const serverId = assert(req.params.id, BadRequest('wrong_server_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const user = assert(
    await User.findOne({ _id: req.decoded.user_id }),
    NotFound('user_not_found')
  );

  const server = assert(
    await Server.findOne({ _id: serverId }),
    NotFound('server_not_found')
  );

  server.users = server.users.filter(item => item !== user)

  await server.save();

  res.json({ server });
};

export const remove = async (req, res) => {
  const serverId = assert(req.params.id, BadRequest('wrong_server_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const user = assert(
    await User.findOne({ _id: req.decoded.user_id }),
    NotFound('user_not_found')
  );

  const server = assert(
    await Server.findOne({ _id: serverId }),
    NotFound('server_not_found')
  );

  if (server.users.indexOf(user) === 0) {
    await server.remove();

    res.json({ deleted: true });
  }
};
