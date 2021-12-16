import mongoose from 'mongoose';

const User = new mongoose.Schema({

  first_name: {
    type: String,
    required: true,
  },

  last_name: {
    type: String,
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

}, {
  shardKey: {
    _id: 'hashed',
  },
});

User.statics.from = function (opts) {
  return new this(opts);
};

export default mongoose.model('User', User);
