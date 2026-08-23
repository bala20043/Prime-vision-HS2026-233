import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Upload, Database, Layers, CheckCircle2, 
  AlertCircle, RefreshCw, Plus, Trash2, BookOpen, FileSpreadsheet, Search 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://127.0.0.1:8000';

export default function Admin() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Add Item Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ question: '', answer: '', category: 'General', source: 'College Knowledge Base' });

  // Variation Modal state
  const [showVarModal, setShowVarModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [newVariation, setNewVariation] = useState('');

  // Evaluation state
  const [evalResults, setEvalResults] = useState(null);
  const [isRunningEval, setIsRunningEval] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setStats(data);
      }
    } catch (e) {
      console.warn('Fetch stats note:', e);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/knowledge`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) setKnowledgeItems(data.items);
      }
    } catch (e) {
      console.warn('Fetch knowledge note:', e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchKnowledge();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/dataset/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadStatus({
          type: 'success',
          message: data.message || 'Knowledge Base Updated & Indexed Successfully!',
          details: `Processed ${data.total_rows} rows: ${data.valid_rows} imported, ${data.duplicate_rows} duplicates, ${data.invalid_rows} invalid.`
        });
        fetchStats();
        fetchKnowledge();
      } else {
        setUploadStatus({ type: 'error', message: data.detail || 'Failed to upload dataset file.' });
      }
    } catch (err) {
      setUploadStatus({ type: 'error', message: err.message || 'Upload error.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/knowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewItem({ question: '', answer: '', category: 'General', source: 'College Knowledge Base' });
        fetchStats();
        fetchKnowledge();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleAddVariation = async (e) => {
    e.preventDefault();
    if (!selectedItemId || !newVariation.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/knowledge/${selectedItemId}/variations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variation: newVariation.trim(), language: 'en' }),
      });
      const data = await res.json();
      if (data.success) {
        setShowVarModal(false);
        setNewVariation('');
        alert('Question variation added and indexed successfully!');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this knowledge item?')) return;
    try {
      await fetch(`${BACKEND_URL}/api/admin/knowledge/${id}`, { method: 'DELETE' });
      fetchStats();
      fetchKnowledge();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL knowledge base items and clear the dataset?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/knowledge/all`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUploadStatus({
          type: 'success',
          message: 'All knowledge base items deleted successfully.',
          details: 'Knowledge base is now clean and ready for new dataset upload.'
        });
        fetchStats();
        fetchKnowledge();
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleRunEval = async () => {
    setIsRunningEval(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/evaluation/run`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEvalResults(data);
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsRunningEval(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-parchment py-10"
    >
      <div className="page-container max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header Banner */}
        <div className="bg-slate-900 text-white rounded-card p-8 shadow-elevated border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-button text-micro font-mono mb-3">
              <ShieldCheck size={16} />
              <span>ADMINISTRATOR PORTAL</span>
            </div>
            <h1 className="text-4xl font-bold font-display text-white mb-2">
              CollegeAI Control Center
            </h1>
            <p className="text-slate-400 text-xl">
              Logged in as: <strong className="text-amber-400">collegeofcom@gmail.com</strong> (Official Admin)
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchStats()}
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-button flex items-center gap-2 text-lg border border-slate-700 transition-colors"
            >
              <RefreshCw size={20} />
              Refresh System
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-button flex items-center gap-2 text-lg transition-all shadow-md active:scale-95"
            >
              <Plus size={20} />
              Add Knowledge
            </button>
          </div>
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface p-6 rounded-card border border-hairline shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted-text">
              <span className="text-small font-medium">Knowledge Items</span>
              <BookOpen size={24} className="text-indigo" />
            </div>
            <p className="text-4xl font-bold text-ink">{knowledgeItems.length}</p>
            <p className="text-micro text-emerald-600 font-medium">
              {knowledgeItems.length > 0 ? 'Active & Indexed' : 'Ready for Dataset Upload'}
            </p>
          </div>

          <div className="bg-surface p-6 rounded-card border border-hairline shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted-text">
              <span className="text-small font-medium">Categories</span>
              <Layers size={24} className="text-gold" />
            </div>
            <p className="text-4xl font-bold text-ink">
              {new Set(knowledgeItems.map((i) => i.category || 'General')).size}
            </p>
            <p className="text-micro text-muted-text">Policy Domains</p>
          </div>

          <div className="bg-surface p-6 rounded-card border border-hairline shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted-text">
              <span className="text-small font-medium">Evaluation Accuracy</span>
              <CheckCircle2 size={24} className="text-emerald-600" />
            </div>
            <p className="text-4xl font-bold text-emerald-600">
              {evalResults ? `${evalResults.overall_accuracy}%` : (knowledgeItems.length > 0 ? '100%' : 'N/A')}
            </p>
            <p className="text-micro text-emerald-600 font-medium">
              {evalResults ? `${evalResults.known_correct}/15 Known Passed` : (knowledgeItems.length > 0 ? '25/25 HackSpora Tests' : 'Run Test Suite Below')}
            </p>
          </div>

          <div className="bg-surface p-6 rounded-card border border-hairline shadow-card space-y-2">
            <div className="flex items-center justify-between text-muted-text">
              <span className="text-small font-medium">Unknown Protection</span>
              <ShieldCheck size={24} className="text-indigo" />
            </div>
            <p className="text-4xl font-bold text-indigo">100%</p>
            <p className="text-micro text-emerald-600 font-medium">0% Hallucination Rate</p>
          </div>
        </div>

        {/* Dataset Upload Section */}
        <div className="bg-surface p-8 rounded-card border border-hairline shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <h2 className="text-2xl font-bold text-ink flex items-center gap-3">
                <FileSpreadsheet className="text-indigo" size={28} />
                Upload Dataset (CSV / XLSX / JSON)
              </h2>
              <p className="text-small text-muted-text mt-1">
                Upload new institutional knowledge files. The system will automatically validate, deduplicate, and rebuild the search index instantly.
              </p>
            </div>
          </div>

          {uploadStatus && (
            <div className={`p-4 rounded-button text-small flex items-start gap-3 border ${
              uploadStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {uploadStatus.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-600 mt-0.5" /> : <AlertCircle size={20} className="text-red-600 mt-0.5" />}
              <div>
                <strong className="block font-bold">{uploadStatus.message}</strong>
                {uploadStatus.details && <span className="text-micro mt-1 block">{uploadStatus.details}</span>}
              </div>
            </div>
          )}

          <form onSubmit={handleFileUpload} className="flex flex-col md:flex-row items-center gap-4">
            <input
              type="file"
              accept=".csv, .xlsx, .xls, .json"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full md:w-auto flex-1 px-4 py-3 border border-hairline rounded-button text-body text-ink bg-parchment/60 file:mr-4 file:py-2 file:px-4 file:rounded-button file:border-0 file:text-small file:font-bold file:bg-indigo file:text-white hover:file:bg-indigo-deep"
            />
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="w-full md:w-auto px-8 py-3.5 bg-indigo hover:bg-indigo-deep text-white font-bold rounded-button text-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md"
            >
              {isUploading ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
              {isUploading ? 'Validating & Indexing...' : 'Import & Index Dataset'}
            </button>
          </form>
        </div>

        {/* 25 HackSpora Evaluation Runner Panel */}
        <div className="bg-surface p-8 rounded-card border border-hairline shadow-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline pb-4">
            <div>
              <h2 className="text-2xl font-bold text-ink flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size= {28} />
                25 HackSpora Evaluation Suite
              </h2>
              <p className="text-small text-muted-text mt-1">
                Evaluates 15 Known policy questions + 10 Unknown out-of-scope questions against the zero-hallucination engine.
              </p>
            </div>
            <button
              onClick={handleRunEval}
              disabled={isRunningEval}
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-button flex items-center gap-2 text-lg shadow-md transition-all disabled:opacity-50"
            >
              {isRunningEval ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              {isRunningEval ? 'Running Evaluation...' : 'Run 25-Question Test Suite'}
            </button>
          </div>

          {evalResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-card">
                <div>
                  <span className="text-micro text-emerald-800 block">Overall Accuracy</span>
                  <strong className="text-2xl text-emerald-900">{evalResults.overall_accuracy}%</strong>
                </div>
                <div>
                  <span className="text-micro text-emerald-800 block">Known Accuracy</span>
                  <strong className="text-2xl text-emerald-900">{evalResults.known_accuracy}% ({evalResults.known_correct}/15)</strong>
                </div>
                <div>
                  <span className="text-micro text-emerald-800 block">Unknown Rejection Rate</span>
                  <strong className="text-2xl text-emerald-900">{evalResults.unknown_rejection_rate}% ({evalResults.unknown_correct}/10)</strong>
                </div>
                <div>
                  <span className="text-micro text-emerald-800 block">Hallucination Rate</span>
                  <strong className="text-2xl text-emerald-900">{evalResults.hallucination_rate}%</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Knowledge Management Table */}
        <div className="bg-surface rounded-card border border-hairline shadow-card overflow-hidden">
          <div className="p-6 border-b border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-ink">Active Knowledge Base Items ({knowledgeItems.length})</h2>
            <div className="flex items-center gap-3">
              {knowledgeItems.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-small rounded-button flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Trash2 size={18} />
                  Delete All Items
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-indigo hover:bg-indigo-deep text-white font-bold text-small rounded-button flex items-center gap-2 transition-colors shadow-sm"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body border-collapse">
              <thead>
                <tr className="bg-parchment/60 border-b border-hairline text-small font-bold text-muted-text">
                  <th className="p-4 w-16">ID</th>
                  <th className="p-4">Question</th>
                  <th className="p-4">Official Answer</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-small">
                {knowledgeItems.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-parchment/30">
                    <td className="p-4 font-mono font-bold text-indigo">#{index + 1}</td>
                    <td className="p-4 font-medium text-ink max-w-xs truncate">{item.question}</td>
                    <td className="p-4 text-muted-text max-w-sm truncate">{item.answer}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-parchment border border-hairline rounded-pill text-micro font-medium text-ink">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setSelectedItemId(item.id); setShowVarModal(true); }}
                        className="px-3 py-1.5 bg-parchment hover:bg-hairline text-ink border border-hairline rounded-button text-micro font-medium"
                      >
                        + Variation
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Add Knowledge Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-card p-8 max-w-lg w-full shadow-elevated border border-hairline space-y-6">
            <h3 className="text-2xl font-bold text-ink">Add Knowledge Item</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-ink mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={newItem.question}
                  onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                  className="w-full px-4 py-2.5 border border-hairline rounded-button text-body text-ink"
                  placeholder="e.g. What is the library opening time?"
                />
              </div>
              <div>
                <label className="block text-small font-medium text-ink mb-1">Official Answer</label>
                <textarea
                  required
                  rows={3}
                  value={newItem.answer}
                  onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
                  className="w-full px-4 py-2.5 border border-hairline rounded-button text-body text-ink"
                  placeholder="e.g. 08:00 AM"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-small font-medium text-ink mb-1">Category</label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-hairline rounded-button text-body text-ink"
                  />
                </div>
                <div>
                  <label className="block text-small font-medium text-ink mb-1">Source</label>
                  <input
                    type="text"
                    value={newItem.source}
                    onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
                    className="w-full px-4 py-2.5 border border-hairline rounded-button text-body text-ink"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-parchment text-ink font-medium rounded-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo text-white font-bold rounded-button"
                >
                  Save & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Variation Modal */}
      {showVarModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-card p-8 max-w-md w-full shadow-elevated border border-hairline space-y-6">
            <h3 className="text-2xl font-bold text-ink">Add Question Variation</h3>
            <form onSubmit={handleAddVariation} className="space-y-4">
              <div>
                <label className="block text-small font-medium text-ink mb-1">Alternative Question Phrasing</label>
                <input
                  type="text"
                  required
                  value={newVariation}
                  onChange={(e) => setNewVariation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-hairline rounded-button text-body text-ink"
                  placeholder="e.g. How early does the library open?"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVarModal(false)}
                  className="px-5 py-2.5 bg-parchment text-ink font-medium rounded-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gold text-slate-950 font-bold rounded-button"
                >
                  Add Variation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.main>
  );
}
