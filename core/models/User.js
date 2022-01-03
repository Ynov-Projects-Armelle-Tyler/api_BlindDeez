import mongoose from 'mongoose';

const User = new mongoose.Schema({

  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  google_id: {
    type: String,
    required: true,
  },

  profile_img: {
    type: String,
    required: true,
  },

  favorites_tracks: {
    type: String,
    required: true,
  },

  percentage_success: {
    type: Number,
    default: 0,
  },

  notifications: {
    type: Boolean,
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

User.statics.from = function (opts) {
  return new this(opts);
};

export default mongoose.model('User', User);
