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

  const masterUser = req?.decoded?.user_id
    ? assert(
      await User.findOne({ _id: req.decoded.user_id }),
      NotFound('user_not_found'))
    : party.master_user;

  const createdParty = await Party.from({
    ...party,
    master_user: masterUser,
  }).save();

  log('bgBlue', `${masterUser.username} Create a party`);

  res.json({ created: true, room: createdParty._id });
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

export const getAllPending = async (req, res) => {
  const types = Party.schema.path('music_label').enumValues;
  const parties = [];

  types.forEach(type => {
    parties.push({ _id: type, count: 0 });
  });

  const partiesCount = await Party.aggregate([
    { $match: { status: 'pending' }},
    { $group: { _id: '$music_label', count: { $sum: 1 }}}
 ]);

 partiesCount.forEach(label => {
    const index = parties.findIndex(type => type._id === label._id);

    parties[index] = {
      _id: label._id,
      count: label.count,
    };
 });

  res.json({ parties });
};

export const getPendingByMusicLabel = async (req, res) => {
  const musicLabel = req.params.musicLabel;

  const parties = assert(
    await Party.find({ status: 'pending', music_label: musicLabel }),
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

  if (isPublic && party?.code) {
    delete party.code;
  } else if (!isPublic) {
    party.code = Party.genCode();
  }

  socket.to(party._id.toString())
    .emit('edit_public', { isPublic, code: party.code });

  await party.save();

  res.json({ party });
};

export const editPlayers = async (req, res, next) => {
  const partyId = assert(req.params.id, BadRequest('wrong_party_id'));

  return req.app.get('Brute').prevent(req, res, async () => {
    try {
      if (partyId !== 'code') {
        await editPlayersWithoutCode(req, res);
      } else {
        await editPlayersWithCode(req, res);
      }
    } catch (e) {
      next(e, req, res, next);
    }
  });
};

const editPlayersWithCode = async (req, res) => {
  const player = assert(req.body.player, BadRequest('invalid_request'));
  const editType = assert(req.body.edit_type, BadRequest('invalid_request'));
  const code = assert(req.body.code, BadRequest('invalid_request'));

  const party = assert(
    await Party.findOne({ code: code }),
    NotFound('party_not_found')
  );

  if (code !== party.code) {
    throw NotFound('wrong_code');
  }

  let playersUpdated = party.users;

  switch (editType) {
    case 'add': {
      const exist = playersUpdated.find(obj =>
        obj.username === player.username);

      if (!exist) {
        playersUpdated.push(player);

      }

      break;
    }
    case 'delete': {
      const exist = playersUpdated.find(obj =>
        obj.username === player.username);

      if (exist) {
        playersUpdated = party.users.filter(
          obj => obj.username !== player.username);

      }

      break;
    }
    default:

  }

  party.users = playersUpdated;

  await party.save();

  res.json({ party });
};

const editPlayersWithoutCode = async (req, res) => {
  const partyId = assert(req.params.id, BadRequest('wrong_party_id'),
    val => mongoose.Types.ObjectId.isValid(val));

  const party = assert(
    await Party.findOne({ _id: partyId }),
    NotFound('party_not_found')
  );

  const player = assert(req.body.player, BadRequest('invalid_request'));
  const editType = assert(req.body.edit_type, BadRequest('invalid_request'));

  let playersUpdated = party.users;

  switch (editType) {
    case 'add': {
      const exist = playersUpdated.find(obj =>
        obj.username === player.username);

      if (!exist) {
        playersUpdated.push(player);

      }

      break;
    }
    case 'delete': {
      const exist = playersUpdated.find(obj =>
        obj.username === player.username);

      if (exist) {
        playersUpdated = party.users.filter(
          obj => obj.username !== player.username);

      }

      break;
    }
    default:

  }

  party.users = playersUpdated;

  await party.save();

  res.json({ party });
};
