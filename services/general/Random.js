import mongoose from 'mongoose';

import { Random } from '@blinddeez/api-core/models';
import { assert } from '@blinddeez/api-core/utils/assert';
import log from '@blinddeez/api-core/utils/log';
import {
  BadRequest,
  NotFound,
  Unauthorized,
} from '@blinddeez/api-core/utils/errors';

export const create = async (req, res) => {
  const musicLabel = req.params.musicLabel;
  const tracks = assert(req.body.tracks, BadRequest('invalid_request'));

  const randomExists = await Random.findOne({ music_label: musicLabel });

  if (randomExists) {
    res.json('use patch path instead');
  }

  await new Random({
    tracks,
    music_label: musicLabel,
  }).save();

  res.json({ created: true });
};

export const get = async (req, res) => {
  const musicLabel = req.params.musicLabel;

  const random = assert(
    await Random.findOne({ music_label: musicLabel }),
    NotFound('random_not_found')
  );

  res.json({ random });
};

export const edit = async (req, res, next) => {
  const musicLabel = req.params.musicLabel;
  const tracks = assert(req.body.tracks, BadRequest('invalid_request'));
  const editType = assert(req.body.edit_type, BadRequest('invalid_request'));

  const random = assert(
    await Random.findOne({ music_label: musicLabel }),
    NotFound('random_not_found')
  );

  const tracksUpdated = random.tracks;

  switch (editType) {
    case 'add': {
      tracksUpdated.push(tracks);

      break;
    }
    case 'delete': {
      tracksUpdated.filter(obj => obj.url !== tracks.url);

      break;
    }
    default:
  }

  random.tracks = tracksUpdated;

  await random.save();

  res.json({ random });
};
