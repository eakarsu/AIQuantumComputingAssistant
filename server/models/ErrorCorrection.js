const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ErrorCorrection = sequelize.define('ErrorCorrection', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  codeType: { type: DataTypes.STRING, allowNull: false },
  errorRate: { type: DataTypes.FLOAT },
  correctionCapability: { type: DataTypes.STRING },
  qubitOverhead: { type: DataTypes.INTEGER },
  syndromeExtraction: { type: DataTypes.STRING },
  decoderType: { type: DataTypes.STRING },
  logicalErrorRate: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = ErrorCorrection;
