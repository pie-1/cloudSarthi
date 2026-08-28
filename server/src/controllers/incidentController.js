const Incident = require('../models/Incident');
const Service = require('../models/Service');
const logger = require('../utils/logger');
const { INCIDENT_STATUS, SEVERITY } = require('../config/constants');

class IncidentController {
  async getIncidents(req, res, next) {
    try {
      const userId = req.user.id;
      const { 
        page = 1, 
        limit = 20, 
        severity, 
        status,
        startDate,
        endDate 
      } = req.query;
      
      const query = { userId };
      if (severity) query.severity = severity;
      if (status) query.status = status;      
      
      if (startDate || endDate) {
        query.startedAt = {};
        if (startDate) query.startedAt.$gte = new Date(startDate);
        if (endDate) query.startedAt.$lte = new Date(endDate);
      }

      const incidents = await Incident.find(query)
        .populate('services.serviceId')
        .populate('acknowledgedBy', 'name email')
        .populate('resolvedBy', 'name email')
        .sort({ startedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await Incident.countDocuments(query);

      res.json({
        success: true,
        data: incidents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      next(error);
    }
  }

  async getIncidentById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const incident = await Incident.findOne({ 
        _id: id, 
        userId 
      })
      .populate('services.serviceId')
      .populate('services.anomalies')
      .populate('acknowledgedBy', 'name email')
      .populate('resolvedBy', 'name email');

      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }

      res.json({
        success: true,
        data: incident
      });

    } catch (error) {
      next(error);
    }
  }

  async createIncident(req, res, next) {
    try {
      const userId = req.user.id;
      const incidentData = req.body;
      
      if (incidentData.services) {
        const serviceIds = incidentData.services.map(s => s.serviceId);
        const services = await Service.find({ 
          _id: { $in: serviceIds },
          userId 
        });
        
        if (services.length !== serviceIds.length) {
          return res.status(400).json({
            success: false,
            message: 'One or more services not found'
          });
        }
      }

      const incident = new Incident({
        ...incidentData,
        userId
      });

      await incident.save();

      logger.info(`New incident created: ${incident.title} (${incident._id})`);

      res.status(201).json({
        success: true,
        data: incident
      });

    } catch (error) {
      next(error);
    }
  }

  async acknowledgeIncident(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const incident = await Incident.findOne({ _id: id, userId });
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }

      if (incident.status === INCIDENT_STATUS.RESOLVED) {
        return res.status(400).json({
          success: false,
          message: 'Cannot acknowledge a resolved incident'
        });
      }

      await incident.acknowledge(userId);

      logger.info(`Incident ${id} acknowledged by user ${userId}`);

      res.json({
        success: true,
        data: incident
      });

    } catch (error) {
      next(error);
    }
  }

  async resolveIncident(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { notes } = req.body;

      const incident = await Incident.findOne({ _id: id, userId });
      if (!incident) {
        return res.status(404).json({
          success: false,
          message: 'Incident not found'
        });
      }

      if (incident.status === INCIDENT_STATUS.RESOLVED) {
        return res.status(400).json({
          success: false,
          message: 'Incident is already resolved'
        });
      }

      await incident.resolve(userId, notes);

      incident.costImpact.actual = incident.costImpact.estimated || 0;
      await incident.save();

      logger.info(`Incident ${id} resolved by user ${userId}`);

      res.json({
        success: true,
        data: incident
      });

    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const userId = req.user.id;
      
      const statusCounts = await Incident.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
     
      const severityCounts = await Incident.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]);
      
      const avgResolution = await Incident.aggregate([
        { 
          $match: { 
            userId: mongoose.Types.ObjectId(userId),
            status: INCIDENT_STATUS.RESOLVED
          }
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: { $subtract: ['$resolvedAt', '$startedAt'] } }
          }
        }
      ]);
      
      const total = await Incident.countDocuments({ userId });
      
      const costImpact = await Incident.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { 
          $group: {
            _id: null,
            totalEstimated: { $sum: '$costImpact.estimated' },
            totalActual: { $sum: '$costImpact.actual' }
          }
        }
      ]);

      res.json({
        success: true,
        data: {
          total,
          byStatus: statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {}),
          bySeverity: severityCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {}),
          avgResolutionTime: avgResolution[0]?.avgDuration || 0,
          costImpact: costImpact[0] || { totalEstimated: 0, totalActual: 0 }
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IncidentController();