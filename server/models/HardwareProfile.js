const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HardwareProfile = sequelize.define('HardwareProfile', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  manufacturer: { type: DataTypes.STRING, allowNull: false },
  qubitCount: { type: DataTypes.INTEGER },
  qubitType: { type: DataTypes.STRING },
  connectivity: { type: DataTypes.STRING },
  gateSet: { type: DataTypes.STRING },
  t1Time: { type: DataTypes.STRING },
  t2Time: { type: DataTypes.STRING },
  gateError: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = HardwareProfile;
