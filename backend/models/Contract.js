const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Created', 'Approved', 'Sent', 'Signed', 'Locked', 'Revoked'],
      required: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    changedBy: {
      type: Object,
      required: true,
      default: {}
    },
    note: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

// Contract Schema
const contractSchema = new mongoose.Schema({
  blueprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blueprint',
    required: true
  },
  status: {
    type: String,
    enum: ['Created', 'Approved', 'Sent', 'Signed', 'Locked', 'Revoked'],
    default: 'Created'
  },
  history: {
    type: [historyEntrySchema],
    default: []
  },
  // Store the values entered for blueprint fields
  // Using Map type to store key-value pairs where key is field label/id
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Virtual to get contract name (can be derived or stored)
// For now, we'll add a method to get a readable name
contractSchema.virtual('contractName').get(function() {
  return `Contract-${this._id.toString().slice(-6)}`;
});

// Ensure virtuals are included in JSON
contractSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Contract', contractSchema);
