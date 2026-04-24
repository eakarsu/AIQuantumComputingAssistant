const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EntanglementAnalysis = sequelize.define('EntanglementAnalysis', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  entanglementType: { type: DataTypes.STRING, allowNull: false },
  qubitPairs: { type: DataTypes.JSONB },
  concurrence: { type: DataTypes.FLOAT },
  bellStateType: { type: DataTypes.STRING },
  schmidtDecomposition: { type: DataTypes.JSONB },
  entanglementWitness: { type: DataTypes.STRING },
  applications: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = EntanglementAnalysis;
