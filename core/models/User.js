import { genSalt, hash } from 'bcrypt';
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
  },

  profile_img: {
    type: String,
  },

  favorites_tracks: [{
    deezer_id: String,
  }],

  percentage_success: {
    type: Number,
    default: 0,
  },

  notifications: {
    type: Boolean,
  },

  access_token: {
    type: String,
  },

  refresh_token: {
    type: String,
  },

  refresh_token_salt: {
    type: String,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

User.statics.from = function (opts) {
  return new this(opts);
};

User.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.salt = await genSalt(10);
    this.password = await hash(this.password, this.salt);
  }

  next();
});

User.methods.genSalt = async function () {
  return await genSalt(10);
};

export default mongoose.model('User', User);
