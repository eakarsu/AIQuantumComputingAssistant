const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const createCrudRoutes = require('./routes/crudFactory');
const authMiddleware = require('./middleware/auth');
const { apiRateLimiter, aiRateLimiter } = require('./middleware/rateLimiter');
const { queryAI, queryAIStructured } = require('./services/openRouterService');

const {
  CircuitDesign, ErrorCorrection, AlgorithmOptimization, QubitManagement,
  GateOperation, QuantumSimulation, NoiseAnalysis, StateVisualization,
  EntanglementAnalysis, QuantumML, ResearchPaper, QuantumProtocol,
  HardwareProfile, BenchmarkTest, LearningResource
} = require('./models');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting for all API routes
app.use('/api', apiRateLimiter);

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

// ── QASM Upload ──────────────────────────────────────────────────────────────
const qasmStorage = multer.memoryStorage();
const qasmUpload = multer({
  storage: qasmStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.qasm') || file.mimetype === 'text/plain' || file.mimetype === 'application/octet-stream') {
      cb(null, true);
    } else {
      cb(new Error('Only .qasm files are allowed'));
    }
  },
});

app.post('/api/circuit-designs/:id/upload-qasm', authMiddleware, qasmUpload.single('qasm'), async (req, res) => {
  try {
    const circuit = await CircuitDesign.findByPk(req.params.id);
    if (!circuit) return res.status(404).json({ error: 'Circuit Design not found' });
    if (!req.file) return res.status(400).json({ error: 'No QASM file provided' });

    const qasmContent = req.file.buffer.toString('utf-8');
    await circuit.update({
      qasmContent,
      qasmFilename: req.file.originalname,
    });

    res.json({ message: 'QASM file uploaded successfully', filename: req.file.originalname, size: req.file.size });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Quantum Simulator ────────────────────────────────────────────────────────
app.post('/api/quantum/simulate/:circuitId', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const circuit = await CircuitDesign.findByPk(req.params.circuitId);
    if (!circuit) return res.status(404).json({ error: 'Circuit Design not found' });

    const qasmContent = circuit.qasmContent || '';
    const prompt = `You are a quantum circuit simulator. Given the following QASM circuit (or circuit description), simulate its execution and return the resulting state vector probabilities as JSON.

Circuit Name: ${circuit.name}
Qubit Count: ${circuit.qubitCount}
Circuit Depth: ${circuit.circuitDepth || 'unknown'}
QASM Content:
${qasmContent || 'No QASM uploaded. Use circuit metadata to estimate probabilities for a ${circuit.qubitCount}-qubit circuit of type: ' + (circuit.complexity || 'general')}

Return JSON with this exact structure:
{
  "state_vector": [{"state": "|00>", "amplitude_real": 0.707, "amplitude_imag": 0.0, "probability": 0.5}, ...],
  "most_probable_state": "|00>",
  "entanglement_detected": false,
  "simulation_method": "statevector",
  "qubit_count": ${circuit.qubitCount},
  "notes": "Brief explanation of the results"
}`;

    const result = await queryAIStructured(prompt, '', {
      systemPrompt: 'You are a quantum circuit simulator expert. Always return valid JSON.',
      maxTokens: 2000,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.response });
    }

    res.json({
      circuit_id: circuit.id,
      circuit_name: circuit.name,
      simulation_result: result.parsed || { raw_response: result.response },
      model_used: result.model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Hardware Transpiler Advisor ──────────────────────────────────────────────
app.post('/api/hardware-profiles/:hwId/transpile/:circuitId', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const hardware = await HardwareProfile.findByPk(req.params.hwId);
    if (!hardware) return res.status(404).json({ error: 'Hardware Profile not found' });

    const circuit = await CircuitDesign.findByPk(req.params.circuitId);
    if (!circuit) return res.status(404).json({ error: 'Circuit Design not found' });

    const prompt = `You are a quantum hardware transpiler expert. Analyze the compatibility between this circuit and hardware, then provide transpilation optimization recommendations.

CIRCUIT:
${JSON.stringify(circuit.toJSON(), null, 2)}

HARDWARE:
${JSON.stringify(hardware.toJSON(), null, 2)}

Return JSON with this exact structure:
{
  "compatibility_score": 0.85,
  "transpilation_feasible": true,
  "estimated_depth_after_transpile": 45,
  "gate_overhead": "15%",
  "recommendations": [
    {"priority": "high", "action": "Replace CNOT gates with native CZ+H decomposition", "impact": "Reduces depth by 20%"},
    {"priority": "medium", "action": "Apply qubit routing for linear connectivity", "impact": "Reduces SWAP overhead"},
    {"priority": "low", "action": "Apply Clifford simplification passes", "impact": "Minor depth reduction"}
  ],
  "unsupported_gates": [],
  "required_swaps": 3,
  "estimated_fidelity": 0.92,
  "warnings": []
}`;

    const result = await queryAIStructured(prompt, '', {
      systemPrompt: 'You are a quantum transpiler expert. Return valid JSON only.',
      maxTokens: 2000,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.response });
    }

    res.json({
      hardware_id: hardware.id,
      hardware_name: hardware.name,
      circuit_id: circuit.id,
      circuit_name: circuit.name,
      transpiler_analysis: result.parsed || { raw_response: result.response },
      model_used: result.model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Benchmark Runner ─────────────────────────────────────────────────────────
app.post('/api/benchmark-tests/:id/run', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const benchmark = await BenchmarkTest.findByPk(req.params.id);
    if (!benchmark) return res.status(404).json({ error: 'Benchmark Test not found' });

    // Try to fetch associated hardware profile by target name
    let hardware = null;
    if (benchmark.hardwareTarget) {
      hardware = await HardwareProfile.findOne({ where: { name: { [Op.iLike]: `%${benchmark.hardwareTarget}%` } } });
    }

    const prompt = `You are a quantum benchmarking specialist. Evaluate the following benchmark test results and provide a comprehensive performance assessment.

BENCHMARK:
${JSON.stringify(benchmark.toJSON(), null, 2)}

${hardware ? `HARDWARE PROFILE:\n${JSON.stringify(hardware.toJSON(), null, 2)}` : ''}

Evaluate the benchmark metrics and return JSON with this structure:
{
  "overall_score": 78,
  "performance_grade": "B+",
  "metrics_analysis": {
    "quantum_volume": {"value": ${benchmark.quantumVolume || 0}, "assessment": "Above average for NISQ devices", "percentile": 65},
    "success_rate": {"value": ${benchmark.successRate || 0}, "assessment": "Good fidelity", "percentile": 70},
    "circuit_depth": {"value": ${benchmark.circuitDepth || 0}, "assessment": "Moderate depth", "percentile": 55}
  },
  "strengths": ["High quantum volume", "Good gate fidelity"],
  "weaknesses": ["Limited qubit connectivity", "Short coherence time"],
  "recommendations": ["Implement error mitigation", "Optimize circuit depth"],
  "comparison_to_baseline": "15% above baseline for similar hardware class",
  "readiness_level": "research",
  "summary": "This benchmark demonstrates competitive performance..."
}`;

    const result = await queryAIStructured(prompt, '', {
      systemPrompt: 'You are a quantum benchmarking expert. Return valid JSON only.',
      maxTokens: 2000,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.response });
    }

    // Persist AI analysis to BenchmarkTest record
    const analysisData = result.parsed || { raw_response: result.response };
    await benchmark.update({ aiAnalysis: analysisData });

    res.json({
      benchmark_id: benchmark.id,
      benchmark_name: benchmark.name,
      run_analysis: analysisData,
      model_used: result.model,
      persisted: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Research Paper Q&A ───────────────────────────────────────────────────────
app.post('/api/research-papers/:id/qa', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const paper = await ResearchPaper.findByPk(req.params.id);
    if (!paper) return res.status(404).json({ error: 'Research Paper not found' });

    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const paperData = paper.toJSON();
    const prompt = `You are an expert quantum computing research analyst. Answer the following question about this research paper, citing specific content from the paper.

PAPER:
Title: ${paperData.title}
Authors: ${paperData.authors || 'Unknown'}
Journal: ${paperData.journal || 'Unknown'}
Year: ${paperData.year || 'Unknown'}
Abstract: ${paperData.abstract || 'Not available'}
Key Findings: ${paperData.keyFindings || 'Not available'}
Research Area: ${paperData.researchArea || 'Unknown'}

QUESTION: ${question}

Provide a detailed, cited answer referencing specific parts of the paper. Include:
1. Direct answer to the question
2. Supporting evidence from the paper (cite specific sections/findings)
3. Context and implications
4. Limitations or caveats if relevant`;

    const result = await queryAI(prompt, '', {
      systemPrompt: 'You are a quantum computing research expert. Provide detailed, academically rigorous answers with citations.',
      maxTokens: 1500,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.response });
    }

    res.json({
      paper_id: paper.id,
      paper_title: paperData.title,
      question,
      answer: result.response,
      model_used: result.model,
      usage: result.usage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Global Quantum Query ─────────────────────────────────────────────────────
app.post('/api/ai/quantum-query', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { question, include_context } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Optionally gather context from models
    let contextData = '';
    if (include_context) {
      const [circuitCount, hardwareCount, paperCount, benchmarkCount] = await Promise.all([
        CircuitDesign.count(),
        HardwareProfile.count(),
        ResearchPaper.count(),
        BenchmarkTest.count(),
      ]);

      const recentCircuits = await CircuitDesign.findAll({ limit: 3, order: [['createdAt', 'DESC']], attributes: ['name', 'qubitCount', 'complexity'] });
      const recentHardware = await HardwareProfile.findAll({ limit: 3, order: [['createdAt', 'DESC']], attributes: ['name', 'manufacturer', 'qubitCount'] });

      contextData = `
Platform Context:
- Total Circuit Designs: ${circuitCount}
- Total Hardware Profiles: ${hardwareCount}
- Total Research Papers: ${paperCount}
- Total Benchmark Tests: ${benchmarkCount}
Recent Circuits: ${recentCircuits.map(c => `${c.name} (${c.qubitCount} qubits)`).join(', ')}
Recent Hardware: ${recentHardware.map(h => `${h.name} by ${h.manufacturer}`).join(', ')}`;
    }

    const result = await queryAI(question, contextData, {
      systemPrompt: 'You are a comprehensive quantum computing expert assistant. Answer questions about quantum computing concepts, algorithms, hardware, circuits, error correction, and related topics. Provide detailed, accurate, educational responses with practical insights.',
      maxTokens: 2000,
    });

    if (!result.success) {
      return res.status(500).json({ error: result.response });
    }

    res.json({
      question,
      answer: result.response,
      model_used: result.model,
      usage: result.usage,
      context_included: !!include_context,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Algorithm Explainer ──────────────────────────────────────────────────────
app.post('/api/ai/algorithm-explainer', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { algorithm, audience_level } = req.body;
    if (!algorithm || !algorithm.trim()) {
      return res.status(400).json({ error: 'Algorithm name or description is required' });
    }

    const level = audience_level || 'intermediate';
    const prompt = `Explain the quantum algorithm "${algorithm}" in plain English for a ${level} audience. Cover:
1. What problem it solves and why classical approaches struggle
2. Core quantum principles it relies on (superposition, interference, entanglement, etc.)
3. High-level steps of the algorithm
4. Known speedup vs classical (e.g. polynomial, exponential) with caveats
5. Realistic implementation notes (qubit count, depth, hardware requirements)`;

    const result = await queryAI(prompt, '', {
      systemPrompt: 'You are a quantum computing educator. Be clear, accurate, and pedagogical.',
      maxTokens: 1500,
    });

    if (!result.success) return res.status(500).json({ error: result.response });

    res.json({
      algorithm,
      audience_level: level,
      explanation: result.response,
      model_used: result.model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Optimization Problem Mapper ──────────────────────────────────────────────
app.post('/api/ai/optimization-problem-mapper', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { problem_description } = req.body;
    if (!problem_description || !problem_description.trim()) {
      return res.status(400).json({ error: 'problem_description is required' });
    }

    const prompt = `Map the following classical optimization problem to a quantum formulation.

PROBLEM:
${problem_description}

Return JSON with this exact structure:
{
  "classical_problem_class": "e.g. NP-hard combinatorial / convex / etc.",
  "recommended_quantum_approach": "QAOA | VQE | Grover | Quantum Annealing | Hybrid",
  "rationale": "Why this approach fits",
  "qubo_formulation_sketch": "If applicable, a QUBO/Ising sketch",
  "estimated_qubit_count": 0,
  "expected_speedup": "polynomial | quadratic | exponential | unclear",
  "hybrid_classical_steps": ["step 1", "step 2"],
  "hardware_recommendation": "gate-model | annealer | photonic",
  "caveats": ["caveat 1", "caveat 2"]
}`;

    const result = await queryAIStructured(prompt, '', {
      systemPrompt: 'You are a quantum optimization expert. Return valid JSON only.',
      maxTokens: 1800,
    });

    if (!result.success) return res.status(500).json({ error: result.response });

    res.json({
      problem_description,
      mapping: result.parsed || { raw_response: result.response },
      model_used: result.model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Hardware Recommendation ──────────────────────────────────────────────────
app.post('/api/ai/hardware-recommendation', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    const { algorithm, qubit_count, depth, priority } = req.body;
    if (!algorithm || !algorithm.trim()) {
      return res.status(400).json({ error: 'algorithm is required' });
    }

    // Pull a few hardware profiles for context
    const hardware = await HardwareProfile.findAll({
      limit: 10,
      attributes: ['name', 'manufacturer', 'qubitCount', 'gateSet', 'connectivity', 'coherenceTime'],
    });

    const prompt = `Recommend the best quantum hardware platform for the given algorithm.

REQUIREMENTS:
- Algorithm: ${algorithm}
- Estimated qubits needed: ${qubit_count || 'unspecified'}
- Estimated circuit depth: ${depth || 'unspecified'}
- Priority: ${priority || 'fidelity'}

AVAILABLE HARDWARE PROFILES:
${JSON.stringify(hardware.map(h => h.toJSON()), null, 2)}

Return JSON with this structure:
{
  "ranked_recommendations": [
    {"hardware": "name", "manufacturer": "name", "fit_score": 0.85, "rationale": "why", "concerns": ["..."]}
  ],
  "top_choice": "hardware name",
  "alternative_providers_to_consider": ["IBM", "IonQ", "Rigetti", "Google", "Quantinuum"],
  "general_guidance": "summary"
}`;

    const result = await queryAIStructured(prompt, '', {
      systemPrompt: 'You are a quantum hardware advisor. Return valid JSON only.',
      maxTokens: 1800,
    });

    if (!result.success) return res.status(500).json({ error: result.response });

    res.json({
      algorithm,
      recommendation: result.parsed || { raw_response: result.response },
      model_used: result.model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Helper: 503 if no OpenRouter key ────────────────────────────────────────
function _noKey() {
  const k = process.env.OPENROUTER_API_KEY;
  return !k || k === 'your_openrouter_key_here' || k.trim() === '';
}

// ── Circuit Generator (apply pass 4 — mechanical backlog) ────────────────────
app.post('/api/ai/circuit-generator', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    if (_noKey()) {
      return res.status(503).json({ error: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env to enable this endpoint.' });
    }
    const { problem_description, qubit_count, target_hardware, gate_set } = req.body;
    if (!problem_description || !String(problem_description).trim()) {
      return res.status(400).json({ error: 'problem_description is required' });
    }

    const prompt = `Generate an OpenQASM 2.0 quantum circuit that solves the following problem.

PROBLEM:
${problem_description}

CONSTRAINTS:
- Target qubit count: ${qubit_count || 'auto'}
- Target hardware: ${target_hardware || 'generic gate-model'}
- Gate set: ${gate_set || 'standard (h, x, y, z, cx, rz, ry, measure)'}

Return strict JSON with this structure:
{
  "qasm": "<OPENQASM 2.0; ... full source ...>",
  "qubit_count": 0,
  "depth": 0,
  "gate_summary": {"h": 0, "cx": 0, "rz": 0},
  "explanation": "what the circuit does, step by step",
  "assumptions": ["assumption 1", "assumption 2"],
  "caveats": ["caveat 1", "caveat 2"]
}`;

    const result = await queryAIStructured(prompt, '', {
      systemPrompt: 'You are a quantum circuit author. Return valid JSON with a complete OpenQASM 2.0 program in the "qasm" field. No prose outside JSON.',
      maxTokens: 2000,
    });

    if (!result.success) {
      const status = /not configured|api key/i.test(result.response) ? 503 : 500;
      return res.status(status).json({ error: result.response });
    }

    res.json({
      problem_description,
      circuit: result.parsed || { raw_response: result.response },
      model_used: result.model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Benchmark Analysis (apply pass 4 — mechanical backlog) ───────────────────
app.post('/api/ai/benchmark-analysis', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    if (_noKey()) {
      return res.status(503).json({ error: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env to enable this endpoint.' });
    }
    const { benchmark_results, hardware_filter } = req.body;

    // Pull hardware profiles
    const where = {};
    if (hardware_filter && typeof hardware_filter === 'string') {
      where.name = { [Op.iLike]: `%${hardware_filter}%` };
    }
    let hardware = [];
    try {
      hardware = await HardwareProfile.findAll({
        where,
        limit: 15,
        attributes: ['name', 'manufacturer', 'qubitCount', 'gateSet', 'connectivity', 'coherenceTime'],
      });
    } catch (_) {}

    // Pull recent benchmark tests
    let tests = [];
    try {
      tests = await BenchmarkTest.findAll({
        limit: 25,
        order: [['createdAt', 'DESC']],
      });
    } catch (_) {}

    const prompt = `Analyse and compare quantum hardware platforms based on benchmark results.

PROVIDED BENCHMARK DATA (from caller, optional):
${benchmark_results ? JSON.stringify(benchmark_results, null, 2) : 'none — use database tests below'}

HARDWARE PROFILES:
${JSON.stringify(hardware.map(h => h.toJSON ? h.toJSON() : h), null, 2)}

RECENT BENCHMARK TESTS (DB):
${JSON.stringify(tests.map(t => t.toJSON ? t.toJSON() : t), null, 2)}

Return strict JSON:
{
  "ranking": [
    {"hardware": "name", "score": 0.0, "strengths": ["..."], "weaknesses": ["..."]}
  ],
  "best_for_low_depth": "<hardware>",
  "best_for_high_qubit_count": "<hardware>",
  "best_for_fidelity": "<hardware>",
  "comparative_summary": "1-paragraph summary",
  "recommendations": ["recommendation 1"],
  "caveats": ["caveat 1"]
}`;

    const result = await queryAIStructured(prompt, '', {
      systemPrompt: 'You are a quantum hardware benchmarking analyst. Return valid JSON only.',
      maxTokens: 2000,
    });

    if (!result.success) {
      const status = /not configured|api key/i.test(result.response) ? 503 : 500;
      return res.status(status).json({ error: result.response });
    }

    res.json({
      analysis: result.parsed || { raw_response: result.response },
      hardware_count: hardware.length,
      tests_count: tests.length,
      model_used: result.model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Error Mitigation Advisor (apply pass 4 — mechanical backlog) ─────────────
app.post('/api/ai/error-mitigation-advisor', authMiddleware, aiRateLimiter, async (req, res) => {
  try {
    if (_noKey()) {
      return res.status(503).json({ error: 'OpenRouter API key not configured. Set OPENROUTER_API_KEY in .env to enable this endpoint.' });
    }
    const { circuit_description, hardware, noise_profile, target_fidelity } = req.body;
    if (!circuit_description || !String(circuit_description).trim()) {
      return res.status(400).json({ error: 'circuit_description is required' });
    }

    const prompt = `Recommend error-mitigation strategies for the following quantum circuit on the specified hardware.

CIRCUIT:
${circuit_description}

HARDWARE: ${hardware || 'unspecified'}
NOISE PROFILE: ${noise_profile ? JSON.stringify(noise_profile) : 'unspecified'}
TARGET FIDELITY: ${target_fidelity || 'unspecified'}

Return strict JSON:
{
  "primary_techniques": [
    {"name": "Zero-Noise Extrapolation | Probabilistic Error Cancellation | Dynamical Decoupling | Readout Error Mitigation | Symmetry Verification | Clifford Data Regression", "rationale": "why", "overhead": "low|medium|high", "expected_improvement": "estimated %"}
  ],
  "circuit_modifications": ["mod 1", "mod 2"],
  "post_processing_steps": ["step 1"],
  "estimated_total_overhead": "qualitative estimate",
  "expected_fidelity_gain": "qualitative estimate",
  "caveats": ["caveat 1"]
}`;

    const result = await queryAIStructured(prompt, '', {
      systemPrompt: 'You are an expert in quantum error mitigation. Return valid JSON only.',
      maxTokens: 1800,
    });

    if (!result.success) {
      const status = /not configured|api key/i.test(result.response) ? 503 : 500;
      return res.status(status).json({ error: result.response });
    }

    res.json({
      circuit_description,
      advice: result.parsed || { raw_response: result.response },
      model_used: result.model,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Dashboard aggregate stats ────────────────────────────────────────────────
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
    await sequelize.sync({ alter: false });
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

// AI feature mount: algorithm-tutor
app.use('/api/ai/algorithm-tutor', require('./routes/ai-algorithm-tutor'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-algorithmexplainer-plainenglish-explanati', require('./routes/gap-no-algorithmexplainer-plainenglish-explanati'));
app.use('/api/gap-no-circuitgenerator-from-problem-description', require('./routes/gap-no-circuitgenerator-from-problem-description'));
app.use('/api/gap-no-optimizationproblemmapper-classical-quant', require('./routes/gap-no-optimizationproblemmapper-classical-quant'));
app.use('/api/gap-no-hardwarerecommendation-ibm-ionq-rigetti-r', require('./routes/gap-no-hardwarerecommendation-ibm-ionq-rigetti-r'));
app.use('/api/gap-no-benchmarkanalysis-across-providers', require('./routes/gap-no-benchmarkanalysis-across-providers'));
app.use('/api/gap-no-errormitigation-advisor', require('./routes/gap-no-errormitigation-advisor'));
app.use('/api/gap-no-circuit-diagram-visualizationeditor', require('./routes/gap-no-circuit-diagram-visualizationeditor'));
app.use('/api/gap-no-quantum-simulator-integration-qiskitcirqb', require('./routes/gap-no-quantum-simulator-integration-qiskitcirqb'));
app.use('/api/gap-no-educational-courselesson-structure', require('./routes/gap-no-educational-courselesson-structure'));
app.use('/api/gap-no-benchmarking-framework-or-result-store', require('./routes/gap-no-benchmarking-framework-or-result-store'));
app.use('/api/gap-no-hardware-provider-accountcredential-mgmt', require('./routes/gap-no-hardware-provider-accountcredential-mgmt'));
app.use('/api/gap-no-saved-circuits-sharing-or-library', require('./routes/gap-no-saved-circuits-sharing-or-library'));
app.use('/api/gap-no-notifications-or-rbac', require('./routes/gap-no-notifications-or-rbac'));
// === End Batch 07 ===
