import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  getFiltered,
  create,
  update,
  deleteItem,
  analyzeWithAI,
  queryAI,
  exportJSON,
  exportCSV,
  importItems,
  bulkDelete,
  bulkUpdate,
  duplicateItem,
  getStats,
} from '../services/api';
import Modal from '../components/Modal';
import AIResponsePanel from '../components/AIResponsePanel';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import ComparisonModal from '../components/ComparisonModal';
import { useToast } from '../components/Toast';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiZap,
  FiMessageSquare,
  FiEye,
  FiRefreshCw,
  FiDownload,
  FiUpload,
  FiCopy,
  FiCheckSquare,
  FiSquare,
  FiArrowUp,
  FiArrowDown,
  FiColumns,
  FiBarChart2,
} from 'react-icons/fi';

const FEATURE_CONFIG = {
  'circuit-design': {
    label: 'Circuit Design',
    endpoint: 'circuit-designs',
    tableColumns: ['name', 'qubitCount', 'circuitDepth', 'complexity', 'status'],
    statusOptions: ['draft', 'active', 'completed', 'experimental'],
    fields: [
      { key: 'name', label: 'Circuit Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'qubitCount', label: 'Qubit Count', type: 'number', required: true },
      { key: 'circuitDepth', label: 'Circuit Depth', type: 'number' },
      { key: 'targetFidelity', label: 'Target Fidelity', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'complexity', label: 'Complexity', type: 'select', options: ['Low', 'Medium', 'High', 'Very High'] },
      { key: 'estimatedRuntime', label: 'Estimated Runtime', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'completed', 'experimental'], required: true },
    ],
  },
  'error-correction': {
    label: 'Error Correction',
    endpoint: 'error-corrections',
    tableColumns: ['name', 'codeType', 'errorRate', 'qubitOverhead', 'status'],
    statusOptions: ['active', 'experimental', 'deprecated'],
    fields: [
      { key: 'name', label: 'Code Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'codeType', label: 'Code Type', type: 'text', required: true },
      { key: 'errorRate', label: 'Error Rate', type: 'number' },
      { key: 'correctionCapability', label: 'Correction Capability', type: 'text' },
      { key: 'qubitOverhead', label: 'Qubit Overhead', type: 'number' },
      { key: 'syndromeExtraction', label: 'Syndrome Extraction', type: 'text' },
      { key: 'decoderType', label: 'Decoder Type', type: 'text' },
      { key: 'logicalErrorRate', label: 'Logical Error Rate', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'experimental', 'deprecated'], required: true },
    ],
  },
  'algorithm-optimization': {
    label: 'Algorithm Optimization',
    endpoint: 'algorithm-optimizations',
    tableColumns: ['name', 'algorithmType', 'speedup', 'qubitRequirement', 'status'],
    statusOptions: ['active', 'experimental', 'optimized', 'draft'],
    fields: [
      { key: 'name', label: 'Algorithm Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'algorithmType', label: 'Algorithm Type', type: 'text', required: true },
      { key: 'originalComplexity', label: 'Original Complexity', type: 'text' },
      { key: 'optimizedComplexity', label: 'Optimized Complexity', type: 'text' },
      { key: 'speedup', label: 'Speedup', type: 'text' },
      { key: 'qubitRequirement', label: 'Qubit Requirement', type: 'number' },
      { key: 'gateCount', label: 'Gate Count', type: 'number' },
      { key: 'applicationDomain', label: 'Application Domain', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'experimental', 'optimized', 'draft'], required: true },
    ],
  },
  'qubit-management': {
    label: 'Qubit Management',
    endpoint: 'qubit-managements',
    tableColumns: ['name', 'qubitType', 'coherenceTime', 'errorRate', 'status'],
    statusOptions: ['active', 'calibrating', 'offline', 'experimental'],
    fields: [
      { key: 'name', label: 'Qubit Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'qubitType', label: 'Qubit Type', type: 'text', required: true },
      { key: 'coherenceTime', label: 'Coherence Time', type: 'text' },
      { key: 'gateTime', label: 'Gate Time', type: 'text' },
      { key: 'connectivity', label: 'Connectivity', type: 'text' },
      { key: 'errorRate', label: 'Error Rate', type: 'number' },
      { key: 'temperature', label: 'Temperature', type: 'text' },
      { key: 'calibrationStatus', label: 'Calibration Status', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'calibrating', 'offline', 'experimental'], required: true },
    ],
  },
  'gate-operations': {
    label: 'Gate Operations',
    endpoint: 'gate-operations',
    tableColumns: ['name', 'gateType', 'qubitCount', 'fidelity', 'status'],
    statusOptions: ['active', 'experimental', 'deprecated'],
    fields: [
      { key: 'name', label: 'Gate Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'gateType', label: 'Gate Type', type: 'text', required: true },
      { key: 'qubitCount', label: 'Qubit Count', type: 'number' },
      { key: 'fidelity', label: 'Fidelity', type: 'number' },
      { key: 'executionTime', label: 'Execution Time', type: 'text' },
      { key: 'decomposition', label: 'Decomposition', type: 'text' },
      { key: 'isUniversal', label: 'Universal Gate', type: 'select', options: ['true', 'false'] },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'experimental', 'deprecated'], required: true },
    ],
  },
  'quantum-simulation': {
    label: 'Quantum Simulation',
    endpoint: 'quantum-simulations',
    tableColumns: ['name', 'simulationType', 'systemSize', 'method', 'status'],
    statusOptions: ['active', 'running', 'completed', 'failed'],
    fields: [
      { key: 'name', label: 'Simulation Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'simulationType', label: 'Simulation Type', type: 'text', required: true },
      { key: 'systemSize', label: 'System Size', type: 'number' },
      { key: 'hamiltonianType', label: 'Hamiltonian Type', type: 'text' },
      { key: 'timeSteps', label: 'Time Steps', type: 'number' },
      { key: 'accuracy', label: 'Accuracy', type: 'number' },
      { key: 'method', label: 'Method', type: 'text' },
      { key: 'memoryUsage', label: 'Memory Usage', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'running', 'completed', 'failed'], required: true },
    ],
  },
  'noise-analysis': {
    label: 'Noise Analysis',
    endpoint: 'noise-analyses',
    tableColumns: ['name', 'noiseModel', 'depolarizingRate', 'mitigationStrategy', 'status'],
    statusOptions: ['active', 'experimental', 'completed'],
    fields: [
      { key: 'name', label: 'Analysis Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'noiseModel', label: 'Noise Model', type: 'text', required: true },
      { key: 'depolarizingRate', label: 'Depolarizing Rate', type: 'number' },
      { key: 'dampingRate', label: 'Damping Rate', type: 'number' },
      { key: 'dephazingRate', label: 'Dephasing Rate', type: 'number' },
      { key: 'measurementError', label: 'Measurement Error', type: 'number' },
      { key: 'mitigationStrategy', label: 'Mitigation Strategy', type: 'text' },
      { key: 'fidelityImpact', label: 'Fidelity Impact', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'experimental', 'completed'], required: true },
    ],
  },
  'state-visualization': {
    label: 'State Visualization',
    endpoint: 'state-visualizations',
    tableColumns: ['name', 'stateType', 'qubitCount', 'purity', 'status'],
    statusOptions: ['active', 'draft', 'archived'],
    fields: [
      { key: 'name', label: 'State Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'stateType', label: 'State Type', type: 'text', required: true },
      { key: 'qubitCount', label: 'Qubit Count', type: 'number' },
      { key: 'purity', label: 'Purity', type: 'number' },
      { key: 'entropy', label: 'Entropy', type: 'number' },
      { key: 'visualizationType', label: 'Visualization Type', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft', 'archived'], required: true },
    ],
  },
  'entanglement-analysis': {
    label: 'Entanglement Analysis',
    endpoint: 'entanglement-analyses',
    tableColumns: ['name', 'entanglementType', 'concurrence', 'bellStateType', 'status'],
    statusOptions: ['active', 'experimental', 'verified'],
    fields: [
      { key: 'name', label: 'Analysis Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'entanglementType', label: 'Entanglement Type', type: 'text', required: true },
      { key: 'concurrence', label: 'Concurrence', type: 'number' },
      { key: 'bellStateType', label: 'Bell State Type', type: 'text' },
      { key: 'entanglementWitness', label: 'Entanglement Witness', type: 'text' },
      { key: 'applications', label: 'Applications', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'experimental', 'verified'], required: true },
    ],
  },
  'quantum-ml': {
    label: 'Quantum ML',
    endpoint: 'quantum-mls',
    tableColumns: ['name', 'modelType', 'layers', 'trainingAccuracy', 'status'],
    statusOptions: ['active', 'training', 'completed', 'experimental'],
    fields: [
      { key: 'name', label: 'Model Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'modelType', label: 'Model Type', type: 'text', required: true },
      { key: 'datasetSize', label: 'Dataset Size', type: 'number' },
      { key: 'featureMap', label: 'Feature Map', type: 'text' },
      { key: 'ansatzType', label: 'Ansatz Type', type: 'text' },
      { key: 'layers', label: 'Layers', type: 'number' },
      { key: 'trainingAccuracy', label: 'Training Accuracy', type: 'number' },
      { key: 'classicalBaseline', label: 'Classical Baseline', type: 'number' },
      { key: 'quantumAdvantage', label: 'Quantum Advantage', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'training', 'completed', 'experimental'], required: true },
    ],
  },
  'research-papers': {
    label: 'Research Papers',
    endpoint: 'research-papers',
    tableColumns: ['title', 'authors', 'journal', 'year', 'citations'],
    statusOptions: ['active', 'archived', 'featured'],
    fields: [
      { key: 'title', label: 'Paper Title', type: 'text', required: true },
      { key: 'authors', label: 'Authors', type: 'text' },
      { key: 'abstract', label: 'Abstract', type: 'textarea' },
      { key: 'journal', label: 'Journal', type: 'text' },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'doi', label: 'DOI', type: 'text' },
      { key: 'citations', label: 'Citations', type: 'number' },
      { key: 'researchArea', label: 'Research Area', type: 'text' },
      { key: 'keyFindings', label: 'Key Findings', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'archived', 'featured'], required: true },
    ],
  },
  'quantum-protocols': {
    label: 'Quantum Protocols',
    endpoint: 'quantum-protocols',
    tableColumns: ['name', 'protocolType', 'securityLevel', 'keyRate', 'status'],
    statusOptions: ['active', 'experimental', 'production', 'theoretical'],
    fields: [
      { key: 'name', label: 'Protocol Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'protocolType', label: 'Protocol Type', type: 'text', required: true },
      { key: 'securityLevel', label: 'Security Level', type: 'text' },
      { key: 'keyRate', label: 'Key Rate', type: 'text' },
      { key: 'distance', label: 'Distance', type: 'text' },
      { key: 'resourceRequirements', label: 'Resource Requirements', type: 'text' },
      { key: 'implementation', label: 'Implementation', type: 'text' },
      { key: 'verificationMethod', label: 'Verification Method', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'experimental', 'production', 'theoretical'], required: true },
    ],
  },
  'hardware-profiles': {
    label: 'Hardware Profiles',
    endpoint: 'hardware-profiles',
    tableColumns: ['name', 'manufacturer', 'qubitCount', 'qubitType', 'status'],
    statusOptions: ['active', 'available', 'maintenance', 'retired'],
    fields: [
      { key: 'name', label: 'System Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'manufacturer', label: 'Manufacturer', type: 'text', required: true },
      { key: 'qubitCount', label: 'Qubit Count', type: 'number' },
      { key: 'qubitType', label: 'Qubit Type', type: 'text' },
      { key: 'connectivity', label: 'Connectivity', type: 'text' },
      { key: 'gateSet', label: 'Gate Set', type: 'text' },
      { key: 't1Time', label: 'T1 Time', type: 'text' },
      { key: 't2Time', label: 'T2 Time', type: 'text' },
      { key: 'gateError', label: 'Gate Error Rate', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'available', 'maintenance', 'retired'], required: true },
    ],
  },
  'benchmark-tests': {
    label: 'Benchmark Tests',
    endpoint: 'benchmark-tests',
    tableColumns: ['name', 'benchmarkType', 'quantumVolume', 'successRate', 'status'],
    statusOptions: ['active', 'completed', 'scheduled', 'failed'],
    fields: [
      { key: 'name', label: 'Benchmark Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'benchmarkType', label: 'Benchmark Type', type: 'text', required: true },
      { key: 'circuitDepth', label: 'Circuit Depth', type: 'number' },
      { key: 'qubitCount', label: 'Qubit Count', type: 'number' },
      { key: 'quantumVolume', label: 'Quantum Volume', type: 'number' },
      { key: 'clops', label: 'CLOPS', type: 'number' },
      { key: 'successRate', label: 'Success Rate', type: 'number' },
      { key: 'executionTime', label: 'Execution Time', type: 'text' },
      { key: 'hardwareTarget', label: 'Hardware Target', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'scheduled', 'failed'], required: true },
    ],
  },
  'learning-resources': {
    label: 'Learning Resources',
    endpoint: 'learning-resources',
    tableColumns: ['title', 'resourceType', 'difficulty', 'topic', 'rating'],
    statusOptions: ['active', 'archived', 'featured'],
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'resourceType', label: 'Resource Type', type: 'select', options: ['Course', 'Tutorial', 'Textbook', 'Paper', 'Video', 'Interactive', 'Workshop'], required: true },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { key: 'topic', label: 'Topic', type: 'text' },
      { key: 'duration', label: 'Duration', type: 'text' },
      { key: 'prerequisites', label: 'Prerequisites', type: 'text' },
      { key: 'author', label: 'Author', type: 'text' },
      { key: 'url', label: 'URL', type: 'text' },
      { key: 'rating', label: 'Rating', type: 'number' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'archived', 'featured'], required: true },
    ],
  },
};

function formatCell(value) {
  if (value === null || value === undefined) return '\u2014';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value).substring(0, 60) + '...';
  const str = String(value);
  return str.length > 60 ? str.substring(0, 60) + '...' : str;
}

function formatLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
}

function buildBlankForm(fields) {
  return fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {});
}

function FeaturePage() {
  const { featureName } = useParams();
  const config = FEATURE_CONFIG[featureName];
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(Number(localStorage.getItem('pageSize')) || 20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', category: '', startDate: '', endDate: '' });

  // Sort
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [compareItems, setCompareItems] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAIQuery, setShowAIQuery] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Form
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // AI
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiQueryText, setAiQueryText] = useState('');
  const [analyzeTarget, setAnalyzeTarget] = useState(null);

  const fetchItems = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    setFetchError('');
    try {
      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (searchTerm) params.search = searchTerm;
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await getFiltered(config.endpoint, params);
      const data = res.data;
      if (data && Array.isArray(data.data)) {
        setItems(data.data);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
        setTotalPages(1);
      } else {
        setItems([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err) {
      setFetchError(err.response?.data?.error || 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [config, page, limit, sortBy, sortOrder, searchTerm, filters]);

  const fetchStats = useCallback(async () => {
    if (!config) return;
    try {
      const res = await getStats(config.endpoint);
      setStats(res.data);
    } catch (err) {
      // stats are optional, don't block
    }
  }, [config]);

  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
    setSearchTerm('');
    setFilters({ status: '', category: '', startDate: '', endDate: '' });
    setSortBy('createdAt');
    setSortOrder('DESC');
    setStats(null);
    setShowStats(false);
  }, [featureName]);

  useEffect(() => { fetchItems(); }, [fetchItems]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (showFormModal || showDetailModal || showDeleteConfirm || showAIQuery || showComparison) return;
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleAddNew();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showFormModal, showDetailModal, showDeleteConfirm, showAIQuery, showComparison]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
  }, []);

  const handleFilter = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleSort = (col) => {
    if (sortBy === col) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(col);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    setSelectedIds(new Set());
  };

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    setSelectedIds(new Set());
  };

  // Selection
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  // CRUD handlers
  const handleAddNew = () => {
    setEditMode(false);
    setSelectedItem(null);
    setFormData(buildBlankForm(config.fields));
    setFormError('');
    setShowFormModal(true);
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setSelectedItem(item);
    const prefilled = config.fields.reduce(
      (acc, f) => ({ ...acc, [f.key]: item[f.key] !== undefined && item[f.key] !== null ? item[f.key] : '' }),
      {}
    );
    setFormData(prefilled);
    setFormError('');
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setAiResponse(null);
    setAiError('');
    setShowDetailModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      for (const f of config.fields) {
        if (f.required && !formData[f.key]) {
          setFormError(`"${f.label}" is required.`);
          setFormLoading(false);
          return;
        }
      }
      if (editMode && selectedItem) {
        await update(config.endpoint, selectedItem.id, formData);
        addToast('Record updated successfully', 'success');
      } else {
        await create(config.endpoint, formData);
        addToast('Record created successfully', 'success');
      }
      setShowFormModal(false);
      fetchItems();
      fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Save failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;
    try {
      await deleteItem(config.endpoint, selectedItem.id);
      setShowDeleteConfirm(false);
      setShowDetailModal(false);
      setSelectedItem(null);
      addToast('Record deleted successfully', 'success');
      fetchItems();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.error || 'Delete failed.', 'error');
    }
  };

  // Duplicate
  const handleDuplicate = async (item) => {
    try {
      await duplicateItem(config.endpoint, item.id);
      addToast('Record duplicated successfully', 'success');
      fetchItems();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.error || 'Duplicate failed.', 'error');
    }
  };

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    try {
      const res = await bulkDelete(config.endpoint, Array.from(selectedIds));
      addToast(`${res.data.deletedCount || selectedIds.size} records deleted`, 'success');
      setSelectedIds(new Set());
      setShowBulkActions(false);
      fetchItems();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.error || 'Bulk delete failed.', 'error');
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedIds.size === 0) return;
    try {
      await bulkUpdate(config.endpoint, Array.from(selectedIds), { status });
      addToast(`${selectedIds.size} records updated to "${status}"`, 'success');
      setSelectedIds(new Set());
      setShowBulkActions(false);
      fetchItems();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.error || 'Bulk update failed.', 'error');
    }
  };

  // Export
  const handleExportJSON = async () => {
    try {
      const res = await exportJSON(config.endpoint, { search: searchTerm, ...filters });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.endpoint}-export.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      addToast('JSON export downloaded', 'success');
    } catch (err) {
      addToast('Export failed.', 'error');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await exportCSV(config.endpoint, { search: searchTerm, ...filters });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.endpoint}-export.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      addToast('CSV export downloaded', 'success');
    } catch (err) {
      addToast('Export failed.', 'error');
    }
  };

  // Import
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const itemsArray = Array.isArray(data) ? data : data.items || [data];
      const res = await importItems(config.endpoint, itemsArray);
      addToast(`${res.data.importedCount || itemsArray.length} records imported`, 'success');
      fetchItems();
      fetchStats();
    } catch (err) {
      addToast(err.response?.data?.error || 'Import failed. Check file format.', 'error');
    }
    e.target.value = '';
  };

  // Compare
  const handleCompare = () => {
    if (selectedIds.size !== 2) {
      addToast('Select exactly 2 records to compare', 'warning');
      return;
    }
    const ids = Array.from(selectedIds);
    const selected = items.filter(i => ids.includes(i.id));
    setCompareItems(selected);
    setShowComparison(true);
  };

  // AI handlers
  const handleAnalyze = async (item) => {
    setAnalyzeTarget(item);
    setAiLoading(true);
    setAiError('');
    setAiResponse(null);
    setShowDetailModal(true);
    setSelectedItem(item);
    try {
      const res = await analyzeWithAI(config.endpoint, item.id);
      setAiResponse(res.data);
    } catch (err) {
      setAiError(err.response?.data?.error || 'AI analysis failed.');
    } finally {
      setAiLoading(false);
      setAnalyzeTarget(null);
    }
  };

  const handleAIQuery = async (e) => {
    e.preventDefault();
    if (!aiQueryText.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiResponse(null);
    try {
      const res = await queryAI(config.endpoint, aiQueryText, `Feature: ${featureName}`);
      setAiResponse(res.data);
    } catch (err) {
      setAiError(err.response?.data?.error || 'AI query failed.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="page-container">
        <div className="page-top-bar">
          <h1 className="page-title">Unknown Feature</h1>
        </div>
        <div className="error-state">
          <h2>Feature not found: {featureName}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-top-bar">
        <div>
          <h1 className="page-title">{config.label}</h1>
          <p className="page-breadcrumb">Dashboard &rsaquo; {config.label}</p>
        </div>
      </div>

      <main className="page-main">
        {/* Stats Bar */}
        {stats && showStats && (
          <div className="stats-bar">
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Records</span>
            </div>
            {stats.byStatus && Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="stat-card stat-card-sm">
                <span className="stat-value">{count}</span>
                <span className="stat-label">{status}</span>
              </div>
            ))}
            <div className="stat-card">
              <span className="stat-value">{stats.recentCount}</span>
              <span className="stat-label">Last 7 days</span>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <SearchBar
          onSearch={handleSearch}
          onFilter={handleFilter}
          statusOptions={config.statusOptions || []}
        />

        {/* Toolbar */}
        <div className="page-toolbar">
          <div className="toolbar-left">
            <span className="item-count">
              {loading ? 'Loading...' : `${total} record${total !== 1 ? 's' : ''}`}
            </span>
            {selectedIds.size > 0 && (
              <span className="selection-count">{selectedIds.size} selected</span>
            )}
          </div>
          <div className="toolbar-right">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowStats(!showStats)} title="Toggle Stats">
              <FiBarChart2 />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={fetchItems} disabled={loading} title="Refresh">
              <FiRefreshCw className={loading ? 'spin' : ''} />
            </button>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <>
                {selectedIds.size === 2 && (
                  <button className="btn btn-secondary btn-sm" onClick={handleCompare} title="Compare Selected">
                    <FiColumns /> Compare
                  </button>
                )}
                <div className="bulk-actions-dropdown">
                  <button className="btn btn-warning btn-sm" onClick={() => setShowBulkActions(!showBulkActions)}>
                    <FiCheckSquare /> Bulk ({selectedIds.size})
                  </button>
                  {showBulkActions && (
                    <div className="dropdown-menu">
                      <div className="dropdown-section-title">Change Status</div>
                      {(config.statusOptions || []).map(s => (
                        <button key={s} className="dropdown-item" onClick={() => handleBulkStatusUpdate(s)}>
                          Set to "{s}"
                        </button>
                      ))}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item dropdown-item-danger" onClick={handleBulkDelete}>
                        <FiTrash2 /> Delete Selected
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Export/Import */}
            <div className="export-dropdown">
              <button className="btn btn-secondary btn-sm" title="Export">
                <FiDownload /> Export
              </button>
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleExportJSON}>Export as JSON</button>
                <button className="dropdown-item" onClick={handleExportCSV}>Export as CSV</button>
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => fileInputRef.current?.click()} title="Import JSON">
              <FiUpload /> Import
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />

            <button className="btn btn-ai btn-sm" onClick={() => { setAiQueryText(''); setAiResponse(null); setAiError(''); setShowAIQuery(true); }}>
              <FiMessageSquare /> AI Query
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleAddNew}>
              <FiPlus /> Add New
            </button>
          </div>
        </div>

        {fetchError && <div className="error-banner"><span className="error-icon">!</span> {fetchError}</div>}

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading {config.label}...</p></div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#9674;</div>
            <h3>No records found</h3>
            <p>{searchTerm || Object.values(filters).some(v => v) ? 'Try adjusting your search or filters.' : `Add your first ${config.label} entry to get started.`}</p>
            {!searchTerm && !Object.values(filters).some(v => v) && (
              <button className="btn btn-primary" onClick={handleAddNew}><FiPlus /> Add First Record</button>
            )}
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <button className="checkbox-btn" onClick={toggleSelectAll} title="Select all">
                        {selectedIds.size === items.length ? <FiCheckSquare /> : <FiSquare />}
                      </button>
                    </th>
                    <th>#</th>
                    {config.tableColumns.map((col) => (
                      <th key={col} className="sortable-th" onClick={() => handleSort(col)}>
                        {formatLabel(col)}
                        {sortBy === col && (
                          <span className="sort-indicator">
                            {sortOrder === 'ASC' ? <FiArrowUp /> : <FiArrowDown />}
                          </span>
                        )}
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className={`table-row ${selectedIds.has(item.id) ? 'row-selected' : ''}`}
                      onClick={() => handleViewDetail(item)}
                    >
                      <td className="checkbox-col" onClick={(e) => e.stopPropagation()}>
                        <button className="checkbox-btn" onClick={() => toggleSelect(item.id)}>
                          {selectedIds.has(item.id) ? <FiCheckSquare /> : <FiSquare />}
                        </button>
                      </td>
                      <td className="row-num">{(page - 1) * limit + idx + 1}</td>
                      {config.tableColumns.map((col) => (
                        <td key={col}>{formatCell(item[col])}</td>
                      ))}
                      <td className="actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button className="icon-btn view-btn" title="View" onClick={() => handleViewDetail(item)}><FiEye /></button>
                        <button className="icon-btn edit-btn" title="Edit" onClick={() => handleEdit(item)}><FiEdit2 /></button>
                        <button className="icon-btn" title="Duplicate" onClick={() => handleDuplicate(item)}><FiCopy /></button>
                        <button className="icon-btn ai-btn" title="AI Analyze" onClick={() => handleAnalyze(item)} disabled={analyzeTarget?.id === item.id}><FiZap /></button>
                        <button className="icon-btn delete-btn" title="Delete" onClick={() => { setSelectedItem(item); setShowDeleteConfirm(true); }}><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </main>

      {/* Form Modal */}
      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editMode ? `Edit ${config.label}` : `Add New ${config.label}`} size="large">
        <form onSubmit={handleFormSubmit} className="feature-form">
          {formError && <div className="error-banner"><span className="error-icon">!</span> {formError}</div>}
          <div className="form-grid">
            {config.fields.map((field) => (
              <div key={field.key} className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`}>
                <label className="form-label">{field.label}{field.required && <span className="required-star"> *</span>}</label>
                {field.type === 'textarea' ? (
                  <textarea className="form-input form-textarea" value={formData[field.key] || ''} onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))} rows={3} placeholder={`Enter ${field.label.toLowerCase()}...`} />
                ) : field.type === 'select' ? (
                  <select className="form-input form-select" value={formData[field.key] || ''} onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}>
                    <option value="">Select {field.label}</option>
                    {field.options.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                  </select>
                ) : (
                  <input type={field.type} className="form-input" value={formData[field.key] || ''} onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))} placeholder={`Enter ${field.label.toLowerCase()}...`} step={field.type === 'number' ? 'any' : undefined} />
                )}
              </div>
            ))}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? <span className="btn-loading"><span className="spinner-small" /> Saving...</span> : (editMode ? 'Save Changes' : 'Create Record')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setAiResponse(null); setAiError(''); }} title={`${config.label} Details`} size="large">
        {selectedItem && (
          <div className="detail-view">
            <div className="detail-grid">
              {Object.entries(selectedItem)
                .filter(([k]) => !['updatedAt', 'aiAnalysis'].includes(k))
                .map(([key, value]) => (
                  <div key={key} className={`detail-field ${typeof value === 'string' && value.length > 80 ? 'full-width' : ''}`}>
                    <span className="detail-label">{formatLabel(key)}</span>
                    <span className="detail-value">
                      {value === null || value === undefined ? '\u2014' : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                    </span>
                  </div>
                ))}
            </div>
            <div className="detail-actions">
              <button className="btn btn-secondary" onClick={() => handleEdit(selectedItem)}><FiEdit2 /> Edit</button>
              <button className="btn btn-secondary" onClick={() => handleDuplicate(selectedItem)}><FiCopy /> Duplicate</button>
              <button className="btn btn-ai" onClick={() => handleAnalyze(selectedItem)} disabled={aiLoading}>
                {aiLoading ? <span className="btn-loading"><span className="spinner-small" /> Analyzing...</span> : <><FiZap /> AI Analyze</>}
              </button>
              <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}><FiTrash2 /> Delete</button>
            </div>
            {(aiLoading || aiResponse || aiError) && <AIResponsePanel response={aiResponse} loading={aiLoading} error={aiError} />}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion" size="small">
        <div className="confirm-dialog">
          <div className="confirm-icon">!</div>
          <p className="confirm-text">Are you sure you want to permanently delete this record? This action cannot be undone.</p>
          <div className="confirm-actions">
            <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteConfirm}><FiTrash2 /> Delete Permanently</button>
          </div>
        </div>
      </Modal>

      {/* AI Query Modal */}
      <Modal isOpen={showAIQuery} onClose={() => { setShowAIQuery(false); setAiResponse(null); setAiError(''); setAiQueryText(''); }} title={`AI Query - ${config.label}`} size="large">
        <div className="ai-query-container">
          <p className="ai-query-description">Ask the AI assistant anything about <strong>{config.label}</strong>.</p>
          <form onSubmit={handleAIQuery} className="ai-query-form">
            <textarea className="form-input form-textarea ai-query-input" value={aiQueryText} onChange={(e) => setAiQueryText(e.target.value)}
              placeholder={`e.g. "What are best practices for ${config.label.toLowerCase()}?"`} rows={4} />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => { setShowAIQuery(false); setAiResponse(null); setAiError(''); }}>Close</button>
              <button type="submit" className="btn btn-ai" disabled={aiLoading || !aiQueryText.trim()}>
                {aiLoading ? <span className="btn-loading"><span className="spinner-small" /> Thinking...</span> : <><FiZap /> Ask AI</>}
              </button>
            </div>
          </form>
          {(aiLoading || aiResponse || aiError) && <AIResponsePanel response={aiResponse} loading={aiLoading} error={aiError} />}
        </div>
      </Modal>

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        items={compareItems}
        title={`Compare ${config.label} Records`}
      />
    </div>
  );
}

export default FeaturePage;
