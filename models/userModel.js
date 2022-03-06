const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, min: 8, max: 20 },
  friends: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    maxItems: 100,
    default: []
  },
  // Who added you (not yet accepted)
  addedBy: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: []
  },
  // You added (not yet accepted)
  added: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: []
  },
});

module.exports = mongoose.model('User', userSchema);