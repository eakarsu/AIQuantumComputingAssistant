const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GateOperation = sequelize.define('GateOperation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  gateType: { type: DataTypes.STRING, allowNull: false },
  matrixRepresentation: { type: DataTypes.JSONB },
  qubitCount: { type: DataTypes.INTEGER },
  fidelity: { type: DataTypes.FLOAT },
  executionTime: { type: DataTypes.STRING },
  decomposition: { type: DataTypes.STRING },
  isUniversal: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = GateOperation;
