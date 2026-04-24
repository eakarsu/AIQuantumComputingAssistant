const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AlgorithmOptimization = sequelize.define('AlgorithmOptimization', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  algorithmType: { type: DataTypes.STRING, allowNull: false },
  originalComplexity: { type: DataTypes.STRING },
  optimizedComplexity: { type: DataTypes.STRING },
  speedup: { type: DataTypes.STRING },
  qubitRequirement: { type: DataTypes.INTEGER },
  gateCount: { type: DataTypes.INTEGER },
  applicationDomain: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = AlgorithmOptimization;
