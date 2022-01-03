import mongoose from 'mongoose';

const User = new mongoose.Schema({

  users: [
    {
      type:  mongoose.Schema.ObjectId, required: true, ref: 'User',
      required: true,
    }
  ],

  master_user: {
    type:  mongoose.Schema.ObjectId, required: true, ref: 'User',
    required: true,
  },

  server: {
    type:  mongoose.Schema.ObjectId, required: true, ref: 'Server',
    default: null,
  },

  music_label: {
    type: String,
    enum: ['Rock', 'Jazz', 'Rap', 'Country', 'Classic', 'Serie', 'Film', 'Metal', 'Pop', 'Punk' ],
    required: true,
  },

  public: {
    type: String,
    default: true,
    required: true,
  },

  tracks: [
    {
      name: {
        type: String,
        required: true,
      },
      artist: {
        type: String,
        required: true,
      },
    }
  ],

  created_at: {
    type: Date,
    default: Date.now,
  },
});

Party.statics.from = function (opts) {
  return new this(opts);
};

export default mongoose.model('Party', Party);
