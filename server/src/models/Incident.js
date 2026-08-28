const mongoose = require('mongoose');
const { SEVERITY, INCIDENT_STATUS } = require('../config/constants');

// Incident Schema - Represents a correlated incident across services

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Incident title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  severity: {
    type: String,
    required: true,
    enum: Object.values(SEVERITY),
    default: SEVERITY.WARNING,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(INCIDENT_STATUS),
    default: INCIDENT_STATUS.OPEN,
    index: true
  },
  services: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    anomalies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Anomaly'
    }],
    metrics: {
      type: Object,
      default: () => ({})
    }
  }],

  aiAnalysis: {
    rootCause: {
      type: String,
      maxlength: [1000, 'Root cause cannot exceed 1000 characters']
    },
    explanation: {
      type: String,
      maxlength: [2000, 'Explanation cannot exceed 2000 characters']
    },
    recommendation: {
      type: String,
      maxlength: [1000, 'Recommendation cannot exceed 1000 characters']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    generatedAt: Date,
    modelUsed: String
  },
  costImpact: {
    estimated: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    actual: {
      type: Number,
      min: 0
    },
    verifiedOnChain: {
      type: Boolean,
      default: false
    },
    blockchainHash: String
  },
  // Timeline
  startedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  
  acknowledgedAt: Date,
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: String,

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  alerts: [{
    channel: String,
    sentAt: Date,
    delivered: Boolean,
    readAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

incidentSchema.index({ userId: 1, severity: 1, status: 1 });
incidentSchema.index({ userId: 1, startedAt: -1 });
incidentSchema.index({ 'services.serviceId': 1 });
incidentSchema.index({ status: 1, severity: 1 });

incidentSchema.virtual('duration').get(function() {
  const end = this.resolvedAt || new Date();
  return end - this.startedAt;
});

incidentSchema.virtual('durationFormatted').get(function() {
  const duration = this.duration;
  const minutes = Math.floor(duration / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
});

incidentSchema.methods.acknowledge = async function(userId) {
  this.status = INCIDENT_STATUS.ACKNOWLEDGED;
  this.acknowledgedAt = new Date();
  this.acknowledgedBy = userId;
  return await this.save();
};

incidentSchema.methods.resolve = async function(userId, notes = '') {
  this.status = INCIDENT_STATUS.RESOLVED;
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  this.resolutionNotes = notes;
  return await this.save();
};

// Static method to get incident statistics
incidentSchema.statics.getStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    { 
      $group: {
        _id: '$severity',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
};

// Static method to find incidents by time range
incidentSchema.statics.findByTimeRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    startedAt: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ startedAt: -1 });
};

module.exports = mongoose.model('Incident', incidentSchema);