const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StateVisualization = sequelize.define('StateVisualization', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  stateType: { type: DataTypes.STRING, allowNull: false },
  qubitCount: { type: DataTypes.INTEGER },
  blochCoordinates: { type: DataTypes.JSONB },
  densityMatrix: { type: DataTypes.JSONB },
  purity: { type: DataTypes.FLOAT },
  entropy: { type: DataTypes.FLOAT },
  visualizationType: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = StateVisualization;
