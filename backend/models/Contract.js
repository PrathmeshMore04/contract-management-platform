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
  data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

contractSchema.virtual('contractName').get(function() {
  return `Contract-${this._id.toString().slice(-6)}`;
});

contractSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Contract', contractSchema);
