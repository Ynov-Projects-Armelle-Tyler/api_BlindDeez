import mongoose from 'mongoose';

import { Party } from '@blinddeez/api-core/models';
import { assert } from '@blinddeez/api-core/utils/assert';
import {
  BadRequest,
  NotFound,
} from '@blinddeez/api-core/utils/errors';

export const create = async (req, res) => {
  const party = assert(req.body, BadRequest('invalid_request'));

  const master_user = assert(
    await User.findOne({ _id: req.decoded.user_id }),
    NotFound('user_not_found')
  );

  await Party.from({
    party,
    master_user: master_user,
  });

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

  const master_user = assert(
    await User.findOne({ _id: req.decoded.user_id }),
    NotFound('user_not_found')
  );

  const party = assert(
    await Party.findOne({ _id: partyId }),
    NotFound('party_not_found')
  );

  if (party.master_user === master_user) {
    await party.remove();

    res.json({ deleted: true });
  }
};
