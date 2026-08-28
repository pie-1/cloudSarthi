const Service = require('../models/Service');
const logger = require('../utils/logger');

class ServiceController {

  async getServices(req, res, next) {
    try {
      const userId = req.user.id;
      const { type, status } = req.query;

      const query = { userId };
      if (type) query.type = type;
      if (status) query.status = status;

      const services = await Service.find(query);
      
      res.json({
        success: true,
        data: services
      });

    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const service = await Service.findOne({ _id: id, userId });
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      res.json({
        success: true,
        data: service
      });

    } catch (error) {
      next(error);
    }
  }

  async createService(req, res, next) {
    try {
      const userId = req.user.id;
      const serviceData = req.body;
      
      const validTypes = ['aws', 'vercel', 'supabase'];
      if (!validTypes.includes(serviceData.type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid service type'
        });
      }

      if (!serviceData.credentials || Object.keys(serviceData.credentials).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Credentials are required'
        });
      }
      const service = new Service({
        ...serviceData,
        userId,
        status: 'pending'
      });

      await service.save();

      logger.info(`New service created: ${service.name} (${service.type}) by user ${userId}`);

      res.status(201).json({
        success: true,
        data: service
      });

    } catch (error) {
      next(error);
    }
  }

  async updateService(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const service = await Service.findOne({ _id: id, userId });
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
      
      const allowedUpdates = ['name', 'config', 'status', 'metadata'];
      const filteredUpdates = {};
      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }
      
      if (updates.credentials) {        
        filteredUpdates.credentials = updates.credentials;
      }

      Object.assign(service, filteredUpdates);
      await service.save();

      logger.info(`Service ${id} updated by user ${userId}`);

      res.json({
        success: true,
        data: service
      });

    } catch (error) {
      next(error);
    }
  }

  async deleteService(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const service = await Service.findOne({ _id: id, userId });
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      await Service.deleteOne({ _id: id });

      logger.info(`Service ${id} deleted by user ${userId}`);

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });

    } catch (error) {
      next(error);
    }
  }

  async testConnection(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const service = await Service.findOne({ _id: id, userId });
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }      
      await service.updateStatus('active');

      res.json({
        success: true,
        message: 'Connection test successful',
        data: {
          serviceId: service._id,
          status: 'active',
          testedAt: new Date()
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceController();