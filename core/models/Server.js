import mongoose from 'mongoose';

const Server = new mongoose.Schema({

  users: [
    {
      type:  mongoose.Schema.ObjectId, required: true, ref: 'User',
      required: true,
    }
  ],

  name: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

Server.statics.from = function (opts) {
  return new this(opts);
};

export default mongoose.model('Server', Server);
