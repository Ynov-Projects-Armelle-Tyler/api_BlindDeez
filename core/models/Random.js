import mongoose from 'mongoose';

const Random = new mongoose.Schema({

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

  tracks: [{
    id: { type: String, required: true },
  }],

});

export default mongoose.model('Random', Random);