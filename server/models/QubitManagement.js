const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QubitManagement = sequelize.define('QubitManagement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  qubitType: { type: DataTypes.STRING, allowNull: false },
  coherenceTime: { type: DataTypes.STRING },
  gateTime: { type: DataTypes.STRING },
  connectivity: { type: DataTypes.STRING },
  errorRate: { type: DataTypes.FLOAT },
  temperature: { type: DataTypes.STRING },
  calibrationStatus: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = QubitManagement;
