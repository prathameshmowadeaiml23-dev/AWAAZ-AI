const mongoose = require('mongoose');
const env = require('./env');
const connectDB = async () => { try { await mongoose.connect(env.MONGODB_URI); console.log('MongoDB connected'); } catch(e) { console.warn('MongoDB offline, using mock mode'); } };
module.exports = connectDB;
