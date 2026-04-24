const sequelize = require('../config/database');
const User = require('./User');
const CircuitDesign = require('./CircuitDesign');
const ErrorCorrection = require('./ErrorCorrection');
const AlgorithmOptimization = require('./AlgorithmOptimization');
const QubitManagement = require('./QubitManagement');
const GateOperation = require('./GateOperation');
const QuantumSimulation = require('./QuantumSimulation');
const NoiseAnalysis = require('./NoiseAnalysis');
const StateVisualization = require('./StateVisualization');
const EntanglementAnalysis = require('./EntanglementAnalysis');
const QuantumML = require('./QuantumML');
const ResearchPaper = require('./ResearchPaper');
const QuantumProtocol = require('./QuantumProtocol');
const HardwareProfile = require('./HardwareProfile');
const BenchmarkTest = require('./BenchmarkTest');
const LearningResource = require('./LearningResource');

module.exports = {
  sequelize,
  User,
  CircuitDesign,
  ErrorCorrection,
  AlgorithmOptimization,
  QubitManagement,
  GateOperation,
  QuantumSimulation,
  NoiseAnalysis,
  StateVisualization,
  EntanglementAnalysis,
  QuantumML,
  ResearchPaper,
  QuantumProtocol,
  HardwareProfile,
  BenchmarkTest,
  LearningResource
};
