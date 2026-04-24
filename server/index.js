const express = require('express');
const cors = require('cors');
const { Op } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const createCrudRoutes = require('./routes/crudFactory');
const authMiddleware = require('./middleware/auth');

const {
  CircuitDesign, ErrorCorrection, AlgorithmOptimization, QubitManagement,
  GateOperation, QuantumSimulation, NoiseAnalysis, StateVisualization,
  EntanglementAnalysis, QuantumML, ResearchPaper, QuantumProtocol,
  HardwareProfile, BenchmarkTest, LearningResource
} = require('./models');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth routes
app.use('/api/auth', authRoutes);

// Feature routes
app.use('/api/circuit-designs', createCrudRoutes(CircuitDesign, 'Circuit Design',
  'You are a quantum circuit design expert. Analyze circuits for optimization, gate reduction, and fidelity improvement.'));
app.use('/api/error-corrections', createCrudRoutes(ErrorCorrection, 'Error Correction',
  'You are a quantum error correction specialist. Analyze error correction codes for effectiveness and overhead.'));
app.use('/api/algorithm-optimizations', createCrudRoutes(AlgorithmOptimization, 'Algorithm Optimization',
  'You are a quantum algorithm optimization expert. Analyze algorithms for speedup potential and resource efficiency.'));
app.use('/api/qubit-managements', createCrudRoutes(QubitManagement, 'Qubit Management',
  'You are a qubit management specialist. Analyze qubit configurations for coherence, connectivity, and error rates.'));
app.use('/api/gate-operations', createCrudRoutes(GateOperation, 'Gate Operation',
  'You are a quantum gate specialist. Analyze gate operations for fidelity, decomposition, and universality.'));
app.use('/api/quantum-simulations', createCrudRoutes(QuantumSimulation, 'Quantum Simulation',
  'You are a quantum simulation expert. Analyze simulation configurations for accuracy and resource usage.'));
app.use('/api/noise-analyses', createCrudRoutes(NoiseAnalysis, 'Noise Analysis',
  'You are a quantum noise analysis specialist. Analyze noise models and mitigation strategies.'));
app.use('/api/state-visualizations', createCrudRoutes(StateVisualization, 'State Visualization',
  'You are a quantum state visualization expert. Analyze quantum states for purity, entropy, and entanglement.'));
app.use('/api/entanglement-analyses', createCrudRoutes(EntanglementAnalysis, 'Entanglement Analysis',
  'You are a quantum entanglement specialist. Analyze entanglement properties and applications.'));
app.use('/api/quantum-mls', createCrudRoutes(QuantumML, 'Quantum ML',
  'You are a quantum machine learning expert. Analyze QML models for quantum advantage and performance.'));
app.use('/api/research-papers', createCrudRoutes(ResearchPaper, 'Research Paper',
  'You are a quantum computing research analyst. Analyze research papers for significance and applicability.'));
app.use('/api/quantum-protocols', createCrudRoutes(QuantumProtocol, 'Quantum Protocol',
  'You are a quantum protocol specialist. Analyze protocols for security, key rates, and implementation feasibility.'));
app.use('/api/hardware-profiles', createCrudRoutes(HardwareProfile, 'Hardware Profile',
  'You are a quantum hardware expert. Analyze hardware specifications for performance and suitability.'));
app.use('/api/benchmark-tests', createCrudRoutes(BenchmarkTest, 'Benchmark Test',
  'You are a quantum benchmarking specialist. Analyze benchmark results for system performance evaluation.'));
app.use('/api/learning-resources', createCrudRoutes(LearningResource, 'Learning Resource',
  'You are a quantum computing educator. Analyze learning resources for quality and effectiveness.'));

// Dashboard aggregate stats
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const models = {
      'circuit-designs': CircuitDesign,
      'error-corrections': ErrorCorrection,
      'algorithm-optimizations': AlgorithmOptimization,
      'qubit-managements': QubitManagement,
      'gate-operations': GateOperation,
      'quantum-simulations': QuantumSimulation,
      'noise-analyses': NoiseAnalysis,
      'state-visualizations': StateVisualization,
      'entanglement-analyses': EntanglementAnalysis,
      'quantum-mls': QuantumML,
      'research-papers': ResearchPaper,
      'quantum-protocols': QuantumProtocol,
      'hardware-profiles': HardwareProfile,
      'benchmark-tests': BenchmarkTest,
      'learning-resources': LearningResource,
    };

    const stats = {};
    let totalRecords = 0;
    for (const [key, Model] of Object.entries(models)) {
      const count = await Model.count();
      stats[key] = count;
      totalRecords += count;
    }

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let recentTotal = 0;
    for (const Model of Object.values(models)) {
      const count = await Model.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } });
      recentTotal += count;
    }

    res.json({ totalRecords, featureCounts: stats, recentActivity: recentTotal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ alter: true });
    console.log('Database synced.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
