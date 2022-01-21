import mongoose from 'mongoose';
import { generate } from 'randomstring';

const Party = new mongoose.Schema({

  name: {
    type: String,
    default: 'Add a name',
  },

  users: [{

    username: {
      type: String,
    },

    points: {
      type: Number,
      default: 0,
    },

    // WARNING: we can add a 'user' field if he have account
    // without putting it there
    // user: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'User',
    // },
  }],

  master_user: {
    type: Object,
    default: {
      player: {
        type: Boolean,
        default: false,
      },

      username: {
        type: String,
      },

      // WARNING: we can add a 'user' field if he have account
      // without putting it there
      // user: {
      //   type: mongoose.Schema.ObjectId,
      //   ref: 'User',
      // },
    },
  },

  server: {
    type: mongoose.Schema.ObjectId,
    ref: 'Server',
    default: null,
  },

  music_label: {
    type: String,
    enum: [
      'Rock',
      'Jazz',
      'Rap',
      'Country',
      'Classic',
      'Serie',
      'Film',
      'Metal',
      'Pop',
      'Punk',
    ],
    required: true,
  },

  public: {
    type: Boolean,
    default: true,
    required: true,
  },

  code: {
    type: String,
  },

  tracks: [{
    type: String,
  }],

  status: {
    type: String,
    default: 'pending',
    enum: [
      'pending',
      'in_game',
      'archived',
    ],
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

});

Party.statics.from = function (opts) {
  return new this(opts);
};

Party.statics.genCode = function (n = 5) {
  return generate(n);
};

export default mongoose.model('Party', Party);
