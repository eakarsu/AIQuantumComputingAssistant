const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuantumML = sequelize.define('QuantumML', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  modelType: { type: DataTypes.STRING, allowNull: false },
  datasetSize: { type: DataTypes.INTEGER },
  featureMap: { type: DataTypes.STRING },
  ansatzType: { type: DataTypes.STRING },
  layers: { type: DataTypes.INTEGER },
  trainingAccuracy: { type: DataTypes.FLOAT },
  classicalBaseline: { type: DataTypes.FLOAT },
  quantumAdvantage: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = QuantumML;
