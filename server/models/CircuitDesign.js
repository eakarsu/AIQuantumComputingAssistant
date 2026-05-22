const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CircuitDesign = sequelize.define('CircuitDesign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  qubitCount: { type: DataTypes.INTEGER, allowNull: false },
  gateSequence: { type: DataTypes.JSONB },
  circuitDepth: { type: DataTypes.INTEGER },
  targetFidelity: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'draft' },
  category: { type: DataTypes.STRING },
  complexity: { type: DataTypes.STRING },
  estimatedRuntime: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB },
  qasmContent: { type: DataTypes.TEXT },
  qasmFilename: { type: DataTypes.STRING }
}, { timestamps: true });

module.exports = CircuitDesign;
