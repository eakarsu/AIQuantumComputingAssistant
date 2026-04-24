const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ResearchPaper = sequelize.define('ResearchPaper', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  authors: { type: DataTypes.STRING },
  abstract: { type: DataTypes.TEXT },
  journal: { type: DataTypes.STRING },
  year: { type: DataTypes.INTEGER },
  doi: { type: DataTypes.STRING },
  citations: { type: DataTypes.INTEGER },
  researchArea: { type: DataTypes.STRING },
  keyFindings: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  category: { type: DataTypes.STRING },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  aiAnalysis: { type: DataTypes.JSONB }
}, { timestamps: true });

module.exports = ResearchPaper;
