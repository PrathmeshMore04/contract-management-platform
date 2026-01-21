const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  fieldType: {
    type: String,
    enum: ['text', 'date', 'signature', 'checkbox'],
    required: true
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  }
}, { _id: false });

const blueprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  fields: {
    type: [fieldSchema],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blueprint', blueprintSchema);
