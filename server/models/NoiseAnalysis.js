const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NoiseAnalysis = sequelize.define('NoiseAnalysis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  noiseModel: { type: DataTypes.STRING, allowNull: false },
  depolarizingRate: { type: DataTypes.FLOAT },
  dampingRate: { type: DataTypes.FLOAT },
  dephazingRate: { type: DataTypes.FLOAT },
  measurementError: { type: DataTypes.FLOAT },
  mitigationStrategy: { type: DataTypes.STRING },
  fidelityImpact: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = NoiseAnalysis;
