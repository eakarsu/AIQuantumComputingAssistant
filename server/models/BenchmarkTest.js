const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BenchmarkTest = sequelize.define('BenchmarkTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  benchmarkType: { type: DataTypes.STRING, allowNull: false },
  circuitDepth: { type: DataTypes.INTEGER },
  qubitCount: { type: DataTypes.INTEGER },
  quantumVolume: { type: DataTypes.INTEGER },
  clops: { type: DataTypes.FLOAT },
  successRate: { type: DataTypes.FLOAT },
  executionTime: { type: DataTypes.STRING },
  hardwareTarget: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = BenchmarkTest;
