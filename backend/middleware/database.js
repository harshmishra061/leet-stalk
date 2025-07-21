import mongoose from 'mongoose';

export const ensureDBConnection = async (req, res, next) => {
  try {
    // Check if mongoose is connected and ready
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Database not connected, attempting to reconnect...');
      
      // Try to reconnect
      await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
      });
      
      // Wait for connection to be fully established
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Database connection timeout'));
        }, 10000);
        
        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
        
        mongoose.connection.once('error', (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });
      
      console.log('✅ Database reconnected successfully');
    }
    
    next();
  } catch (error) {
    console.error('❌ Database connection failed in middleware:', error);
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'Service temporarily unavailable'
    });
  }
}; 