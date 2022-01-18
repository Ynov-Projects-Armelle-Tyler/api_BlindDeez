import mongoose from 'mongoose';

import { User, Party } from '@blinddeez/api-core/models';
import { assert } from '@blinddeez/api-core/utils/assert';
import log from '@blinddeez/api-core/utils/log';
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from '@blinddeez/api-core/utils/errors';

export const create = async (req, res) => {
  const party = assert(req.body.party, BadRequest('invalid_request'));
  const socket = req.app.get('Socket');

  const masterUser = req?.decoded?.user_id
    ? assert(
      await User.findOne({ _id: req.decoded.user_id }),
      NotFound('user_not_found'))
    : party.master_user;

  const createdParty = await Party.from({
    ...party,
    master_user: masterUser,
  }).save();

  socket.join(createdParty._id);
  log('bgBlue', `${masterUser.username} Create a party`);

  res.json({ created: true });
};

export const get = async (req, res) => {
  const partyId = assert(req.params.id, BadRequest('wrong_party_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const party = assert(
    await Party.findOne({ _id: partyId }),
    NotFound('party_not_found')
  );

  res.json({ party });
};

export const getAll = async (req, res) => {
  const parties = assert(
    await Party.find({}),
    NotFound('party_not_found')
  );

  res.json({ parties });
};

export const remove = async (req, res) => {
  const partyId = assert(req.params.id, BadRequest('wrong_party_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const masterUser = req?.decoded?.user_id
    ? assert(
      await User.findOne({ _id: req.decoded.user_id }).username,
      NotFound('user_not_found'))
    : req?.master_username;

  const party = assert(
    await Party.findOne({ _id: partyId }),
    NotFound('party_not_found')
  );

  if (party.master_user.username !== masterUser) {
    throw Unauthorized('authorization_error');
  }

  await party.remove();

  res.json({ deleted: true });
};

export const editName = async (req, res) => {
  const partyId = assert(req.params.id, BadRequest('wrong_party_id'),
    val => mongoose.Types.ObjectId.isValid(val));
  const name = assert(req.body.name, BadRequest('invalid_request'));

  const socket = req.app.get('Socket');

  const party = assert(
    await Party.findOne({ _id: partyId }),
    NotFound('party_not_found')
  );

  party.name = name;

  socket.emit('edit_name', name);

  await party.save();

  res.json({ party });
};

export const editPublic = async (req, res) => {
  const partyId = assert(req.params.id, BadRequest('wrong_party_id'),
    val => mongoose.Types.ObjectId.isValid(val));
  const isPublic = assert(req.body.public, BadRequest('invalid_request'));

  const socket = req.app.get('Socket');

  const party = assert(
    await Party.findOne({ _id: partyId }),
    NotFound('party_not_found')
  );

  party.public = isPublic;

  socket.emit('edit_public', isPublic);

  await party.save();

  res.json({ party });
};

export const editPlayers = async (req, res) => {
  const partyId = assert(req.params.id, BadRequest('wrong_party_id'),
    val => mongoose.Types.ObjectId.isValid(val));
  const player = assert(req.body.player, BadRequest('invalid_request'));
  const editType = assert(req.body.edit_type, BadRequest('invalid_request'));

  const socket = req.app.get('Socket');

  const party = assert(
    await Party.findOne({ _id: partyId }),
    NotFound('party_not_found')
  );

  let playersUpdated = party.users;

  switch (editType) {
    case 'add': {
      const exist = playersUpdated.find(obj =>
        obj.username === player.username);

      if (!exist) {
        playersUpdated.push(player);

        socket.emit('add_player', player);
      }

      break;
    }
    case 'delete': {
      const exist = playersUpdated.find(obj =>
        obj.username === player.username);

      if (exist) {
        playersUpdated = party.users.filter(
          obj => obj.username !== player.username);

        socket.emit('delete_player', player);
      }

      break;
    }
    default:

  }

  party.users = playersUpdated;

  await party.save();

  res.json({ party });
};
