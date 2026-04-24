const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LearningResource = sequelize.define('LearningResource', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  resourceType: { type: DataTypes.STRING, allowNull: false },
  difficulty: { type: DataTypes.STRING },
  topic: { type: DataTypes.STRING },
  duration: { type: DataTypes.STRING },
  prerequisites: { type: DataTypes.STRING },
  author: { type: DataTypes.STRING },
  url: { type: DataTypes.STRING },
  rating: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = LearningResource;
