const mongoose = require('mongoose');
const { SERVICE_TYPES } = require('../config/constants');

// Handles AWS, Vercel, and Supabase integrations

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Service type is required'],
    enum: Object.values(SERVICE_TYPES),
    index: true
  },
  credentials: {
    type: Object,
    required: [true, 'Credentials are required'],
    validate: {
      validator: function(v) {        
        return v && Object.keys(v).length > 0;
      },
      message: 'Credentials must contain at least one field'
    }
  },
  config: {
    type: Object,
    default: () => ({})
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'pending'],
    default: 'pending'
  },
  lastConnection: {
    type: Date,
    default: null
  },
  metadata: {
    type: Object,
    default: () => ({})
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  }
}, {
  timestamps: true, 
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      // Remove sensitive data when sending JSON
      delete ret.credentials;
      return ret;
    }
  }
});

serviceSchema.index({ userId: 1, type: 1 });
serviceSchema.index({ status: 1, lastConnection: 1 });

serviceSchema.virtual('health').get(function() {
  if (this.status === 'error') return 'unhealthy';
  if (this.status === 'pending') return 'unknown';
  if (!this.lastConnection) return 'unknown';
  
  const hoursSinceLastConnection = (Date.now() - this.lastConnection) / (1000 * 60 * 60);
  if (hoursSinceLastConnection > 24) return 'warning';
  if (hoursSinceLastConnection > 1) return 'healthy';
  return 'excellent';
});

serviceSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  this.lastConnection = new Date();
  return await this.save();
};

serviceSchema.statics.findActiveByType = function(type) {
  return this.find({ 
    type, 
    status: 'active' 
  }).populate('userId');
};

module.exports = mongoose.model('Service', serviceSchema);