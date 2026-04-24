const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuantumSimulation = sequelize.define('QuantumSimulation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  simulationType: { type: DataTypes.STRING, allowNull: false },
  systemSize: { type: DataTypes.INTEGER },
  hamiltonianType: { type: DataTypes.STRING },
  timeSteps: { type: DataTypes.INTEGER },
  accuracy: { type: DataTypes.FLOAT },
  method: { type: DataTypes.STRING },
  memoryUsage: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = QuantumSimulation;
