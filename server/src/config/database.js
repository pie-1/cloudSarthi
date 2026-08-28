const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
  * Handles connection pooling, retries, and graceful shutdown
 */
class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) {
      logger.info('Using existing database connection');
      return;
    }

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudsarthi';

    try {
      const options = {
        maxPoolSize: 10,          
        minPoolSize: 5,            
        socketTimeoutMS: 45000,    
        connectTimeoutMS: 10000,   
        serverSelectionTimeoutMS: 5000,
        retryWrites: true,
        retryReads: true,
        family: 4                  
      };

      await mongoose.connect(MONGODB_URI, options);
      
      this.isConnected = true;
      logger.info(`MongoDB connected successfully`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        logger.error(`MongoDB connection error: ${err.message}`);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

    } catch (error) {
      logger.error(`Failed to connect to MongoDB: ${error.message}`);
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) return;
    
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected gracefully');
    } catch (error) {
      logger.error(`Error disconnecting from MongoDB: ${error.message}`);
      throw error;
    }
  }

  getConnection() {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    return mongoose.connection;
  }
}

module.exports = new Database();