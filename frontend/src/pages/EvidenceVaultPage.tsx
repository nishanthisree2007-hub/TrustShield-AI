import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Upload,
  FileText,
  Trash2,
  Copy,
  Check,
  Search,
  RefreshCw,
  AlertTriangle,
  Lock,
  FileCheck,
  X,
  Plus
} from 'lucide-react';
import api from '../api/client';
import { EvidenceRecord } from '../types';

export default function EvidenceVaultPage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const res = await api.get('/vault');
      setEvidenceList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Delete evidence artifact #${id}?`)) return;
    try {
      await api.delete(`/vault/${id}`);
      fetchEvidence();
    } catch (err) {
      alert('Failed to delete evidence.');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('title', uploadTitle.trim());
    formData.append('description', uploadDesc.trim());
    formData.append('file', selectedFile);

    try {
      await api.post('/vault/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setSelectedFile(null);
      fetchEvidence();
    } catch (err: any) {
      setUploadError(err?.response?.data?.detail || 'Failed to archive evidence artifact.');
    } finally {
      setUploading(false);
    }
  };

  const filtered = evidenceList.filter(ev =>
    ev.title.toLowerCase().includes(search.toLowerCase()) ||
    ev.sha256_hash.toLowerCase().includes(search.toLowerCase()) ||
    ev.file_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-cyan-400" />
            <span>Forensic Evidence Vault</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Cryptographically sealed repository for investigation artifacts, WHOIS snapshots, and SHA-256 verified dossiers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchEvidence} className="btn-ghost flex items-center gap-2 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setUploadError('');
              setShowUploadModal(true);
            }}
            className="btn-primary flex items-center gap-2 text-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Archive Forensic Evidence</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, file name, or SHA-256 hash..."
            className="input-field pl-10 text-xs"
          />
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {filtered.length} of {evidenceList.length} Sealed Artifacts
        </div>
      </div>

      {/* Evidence Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            No evidence records matched your search query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/5 text-gray-400 uppercase font-semibold text-[10px]">
                  <th className="py-3 px-4">Artifact Title</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">SHA-256 Cryptographic Hash</th>
                  <th className="py-3 px-4">Archived At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div>{ev.title}</div>
                          {ev.description && (
                            <div className="text-[11px] text-gray-500 font-normal line-clamp-1">{ev.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">{ev.file_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase text-[10px] font-mono text-gray-300">
                        {ev.mime_type.split('/')[1] || ev.evidence_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {(ev.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-300">
                        <span>{ev.sha256_hash.slice(0, 16)}...{ev.sha256_hash.slice(-8)}</span>
                        <button
                          onClick={() => handleCopyHash(ev.sha256_hash)}
                          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                          title="Copy Full SHA-256"
                        >
                          {copiedHash === ev.sha256_hash ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(ev.created_at).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(ev.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete Artifact"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg p-6 border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Archive Evidence Artifact</h2>
            </div>

            {uploadError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Evidence Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Rogue Website Screenshot or DNS Packet Log"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Context Description</label>
                <textarea
                  rows={3}
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Notes on source, chain of custody, and observed threat behavior..."
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Artifact File (Max 5MB) *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="input-field text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Safe storage verified: images (PNG/JPG) and forensic text logs (.txt, .json). No script execution.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn-primary text-xs flex items-center gap-2"
                >
                  {uploading ? (
                    <div className="w-3.5 h-3.5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Seal & Compute Hash</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
