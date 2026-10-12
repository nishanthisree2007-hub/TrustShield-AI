import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Globe,
  AtSign,
  ShieldCheck,
  Tag,
  Headphones,
  Search,
  Check,
  X,
  AlertCircle,
  Dna,
  RefreshCw
} from 'lucide-react';
import api from '../api/client';
import { Brand } from '../types';

export default function BrandManagementPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [search, setSearch] = useState('');
  const [formError, setFormError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [altNames, setAltNames] = useState('');
  const [approvedHandles, setApprovedHandles] = useState('');
  const [supportChannels, setSupportChannels] = useState('');
  const [knownKeywords, setKnownKeywords] = useState('');
  const [description, setDescription] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await api.get('/brands');
      setBrands(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setWebsite('');
    setAltNames('');
    setApprovedHandles('');
    setSupportChannels('');
    setKnownKeywords('');
    setDescription('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setWebsite(b.official_website);
    setAltNames(b.alt_names.join(', '));
    setApprovedHandles(b.approved_handles.join(', '));
    setSupportChannels(b.support_channels.join(', '));
    setKnownKeywords(b.known_keywords.join(', '));
    setDescription(b.description || '');
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const payload = {
      name: name.trim(),
      official_website: website.trim(),
      alt_names: altNames.split(',').map(s => s.trim()).filter(Boolean),
      approved_handles: approvedHandles.split(',').map(s => s.trim()).filter(Boolean),
      support_channels: supportChannels.split(',').map(s => s.trim()).filter(Boolean),
      known_keywords: knownKeywords.split(',').map(s => s.trim()).filter(Boolean),
      description: description.trim(),
    };

    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, payload);
      } else {
        await api.post('/brands', payload);
      }
      setShowModal(false);
      fetchBrands();
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || 'Failed to save brand information.');
    }
  };

  const handleDelete = async (id: number, bname: string) => {
    if (!window.confirm(`Are you sure you want to delete brand identity "${bname}"?`)) return;
    try {
      await api.delete(`/brands/${id}`);
      fetchBrands();
    } catch (err) {
      alert('Failed to delete brand.');
    }
  };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.official_website.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-cyan-400" />
            <span>Brand DNA Registry</span>
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Register official brand identities to establish baseline DNA fingerprints for impersonation analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBrands}
            className="btn-ghost flex items-center gap-2 text-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2 text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register Brand DNA</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registered brands or domains..."
            className="input-field pl-10 text-xs"
          />
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {filteredBrands.length} of {brands.length} Brands Active
        </div>
      </div>

      {/* Brands Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Dna className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Brands Found</h3>
          <p className="text-gray-400 text-xs mt-1">Get started by registering an official brand identity to enable automated threat scanning.</p>
          <button onClick={openCreateModal} className="btn-primary text-xs mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Register New Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand) => (
            <div key={brand.id} className="glass-card p-5 flex flex-col justify-between border-t-2 border-t-cyan-500/50 hover:border-white/10 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>{brand.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">DNA-ACTIVE</span>
                    </h3>
                    <a
                      href={brand.official_website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-gray-400 hover:text-cyan-400 transition-colors flex items-center gap-1 mt-0.5"
                    >
                      <Globe className="w-3.5 h-3.5 text-gray-500" />
                      <span>{brand.official_website}</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(brand)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                      title="Edit Brand"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id, brand.name)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {brand.description && (
                  <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                    {brand.description}
                  </p>
                )}

                <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
                  {/* Approved Handles */}
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1 font-semibold text-[11px] uppercase tracking-wider">
                      <AtSign className="w-3 h-3 text-cyan-400" />
                      <span>Whitelisted Handles</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {brand.approved_handles && brand.approved_handles.length > 0 ? (
                        brand.approved_handles.map((h, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-gray-300 font-mono text-[11px]">
                            {h}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">No handles recorded</span>
                      )}
                    </div>
                  </div>

                  {/* Brand Keywords */}
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1 font-semibold text-[11px] uppercase tracking-wider">
                      <Tag className="w-3 h-3 text-yellow-400" />
                      <span>Fingerprint Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {brand.known_keywords && brand.known_keywords.length > 0 ? (
                        brand.known_keywords.map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 text-[10px]">
                            {kw}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 italic">None configured</span>
                      )}
                    </div>
                  </div>

                  {/* Support Channels */}
                  <div>
                    <div className="flex items-center gap-1.5 text-gray-400 mb-1 font-semibold text-[11px] uppercase tracking-wider">
                      <Headphones className="w-3 h-3 text-green-400" />
                      <span>Official Support Channels</span>
                    </div>
                    <div className="text-gray-400 truncate">
                      {brand.support_channels && brand.support_channels.length > 0 ? (
                        brand.support_channels.join(' • ')
                      ) : (
                        <span className="text-gray-500 italic">None registered</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                <span>DNA ID: #{brand.id}</span>
                <span>Registered: {new Date(brand.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl p-6 border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">
                {editingBrand ? 'Edit Brand DNA Profile' : 'Register Brand Identity DNA'}
              </h2>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Official Brand Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. ApexPay or Kampus Digital"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Official Website URL *</label>
                <input
                  type="url"
                  required
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://apexpay.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Alternative Brand Names (Comma Separated)</label>
                <input
                  type="text"
                  value={altNames}
                  onChange={(e) => setAltNames(e.target.value)}
                  placeholder="Apex, Apex Wallet, Apex Payments"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Approved Social Handles Whitelist (Comma Separated)</label>
                <input
                  type="text"
                  value={approvedHandles}
                  onChange={(e) => setApprovedHandles(e.target.value)}
                  placeholder="@apexpay, @apexpay_support, @apex_official"
                  className="input-field"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">Handles in this whitelist are treated as confirmed authentic with 0% risk penalty.</span>
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Known Brand Keywords (Comma Separated)</label>
                <input
                  type="text"
                  value={knownKeywords}
                  onChange={(e) => setKnownKeywords(e.target.value)}
                  placeholder="payments, wallet, instant transfer, apex token"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Official Support Channels (Comma Separated)</label>
                <input
                  type="text"
                  value={supportChannels}
                  onChange={(e) => setSupportChannels(e.target.value)}
                  placeholder="support@apexpay.com, +1-800-APEX-HELP"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-medium mb-1.5">Brand Overview & Risk Context</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fintech consumer payment processing gateway..."
                  className="input-field"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs"
                >
                  {editingBrand ? 'Save Changes' : 'Register Brand DNA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
