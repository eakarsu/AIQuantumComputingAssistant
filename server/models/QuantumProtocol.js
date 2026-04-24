const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuantumProtocol = sequelize.define('QuantumProtocol', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  protocolType: { type: DataTypes.STRING, allowNull: false },
  securityLevel: { type: DataTypes.STRING },
  keyRate: { type: DataTypes.STRING },
  distance: { type: DataTypes.STRING },
  resourceRequirements: { type: DataTypes.STRING },
  implementation: { type: DataTypes.STRING },
  verificationMethod: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = QuantumProtocol;
