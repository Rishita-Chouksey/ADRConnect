'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  PlusCircle,
  Factory,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  X,
} from 'lucide-react';

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any>({ products: [], manufacturers: [], batches: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'batches' | 'products' | 'manufacturers'>('batches');
  const [search, setSearch] = useState('');

  // Modals state
  const [modalType, setModalType] = useState<'batch' | 'product' | 'manufacturer' | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Batch Form State
  const [batchProductId, setBatchProductId] = useState('');
  const [batchMfrId, setBatchMfrId] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [batchMfgDate, setBatchMfgDate] = useState('');
  const [batchExpDate, setBatchExpDate] = useState('');
  const [batchBarcode, setBatchBarcode] = useState('');

  // New Product Form State
  const [prodName, setProdName] = useState('');
  const [prodGeneric, setProdGeneric] = useState('');
  const [prodForm, setProdForm] = useState('500ml IV infusion');

  // New Manufacturer Form State
  const [mfrName, setMfrName] = useState('');
  const [mfrAddress, setMfrAddress] = useState('');
  const [mfrLicense, setMfrLicense] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => {
        setInventory(data);
        if (data.products?.length > 0) setBatchProductId(data.products[0].id);
        if (data.manufacturers?.length > 0) setBatchMfrId(data.manufacturers[0].id);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleAddBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'batch',
          productId: batchProductId,
          manufacturerId: batchMfrId,
          batchNo: batchNo.trim().toUpperCase(),
          mfgDate: batchMfgDate || null,
          expDate: batchExpDate || null,
          barcodeData: batchBarcode || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save batch');

      setActionMessage(`Batch ${batchNo.toUpperCase()} successfully added to hospital inventory!`);
      setBatchNo('');
      setModalType(null);
      fetchInventory();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'product',
          name: prodName.trim(),
          genericName: prodGeneric.trim(),
          form: prodForm.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      setActionMessage(`Product ${prodName} successfully added!`);
      setProdName('');
      setProdGeneric('');
      setModalType(null);
      fetchInventory();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'manufacturer',
          name: mfrName.trim(),
          address: mfrAddress.trim(),
          licenseNo: mfrLicense.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save manufacturer');

      setActionMessage(`Manufacturer ${mfrName} successfully registered!`);
      setMfrName('');
      setMfrAddress('');
      setModalType(null);
      fetchInventory();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Filter items
  const filteredBatches = (inventory.batches || []).filter((b: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.batchNo.toLowerCase().includes(q) ||
      b.product?.name.toLowerCase().includes(q) ||
      b.manufacturer?.name.toLowerCase().includes(q)
    );
  });

  const filteredProducts = (inventory.products || []).filter((p: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.genericName && p.genericName.toLowerCase().includes(q));
  });

  const filteredMfrs = (inventory.manufacturers || []).filter((m: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || (m.address && m.address.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Link href="/admin" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-black text-slate-900">Hospital Drug &amp; Batch Inventory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain verified hospital medications, batch lots, and manufacturer credentials to ensure standardized reporting.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setModalType('batch')}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-medred-600 hover:bg-medred-700 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Batch</span>
          </button>
          <button
            onClick={() => setModalType('product')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
          >
            <span>+ Add Product</span>
          </button>
          <button
            onClick={() => setModalType('manufacturer')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all"
          >
            <span>+ Add Mfr</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 border-b sm:border-b-0 pb-2 sm:pb-0 w-full sm:w-auto">
          <button
            onClick={() => setTab('batches')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              tab === 'batches'
                ? 'bg-medred-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Batches ({inventory.batches?.length || 0})
          </button>
          <button
            onClick={() => setTab('products')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              tab === 'products'
                ? 'bg-medred-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Drug Products ({inventory.products?.length || 0})
          </button>
          <button
            onClick={() => setTab('manufacturers')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              tab === 'manufacturers'
                ? 'bg-medred-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Manufacturers ({inventory.manufacturers?.length || 0})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${tab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-medred-500"
          />
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading inventory catalog...</div>
        ) : tab === 'batches' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Batch No.</th>
                  <th className="p-3.5">Drug Product</th>
                  <th className="p-3.5">Manufacturer</th>
                  <th className="p-3.5">Mfg Date</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Hospital ADRs</th>
                  <th className="p-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBatches.map((b: any) => {
                  const hasAlert = b.highAlerts?.length > 0;
                  const adrCount = b._count?.medications || 0;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900 text-sm">
                        {b.batchNo}
                        {b.barcodeData && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Barcode: {b.barcodeData}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{b.product?.name}</div>
                        <div className="text-[10px] text-slate-500">{b.product?.form}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">{b.manufacturer?.name}</td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {b.mfgDate ? new Date(b.mfgDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="p-3.5 font-mono font-medium text-slate-700">
                        {b.expDate ? new Date(b.expDate).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-black text-sm ${
                            hasAlert || adrCount >= 3
                              ? 'text-medred-600'
                              : adrCount >= 1
                              ? 'text-amber-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {adrCount} ADRs
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {hasAlert ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                            🚩 Quarantined
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Active Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : tab === 'products' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Generic Name</th>
                  <th className="p-3.5">Formulation Type</th>
                  <th className="p-3.5 text-right">Registered Batches</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3.5 text-slate-600 italic">{p.genericName || '—'}</td>
                    <td className="p-3.5 text-slate-700 font-medium">{p.form}</td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {p._count?.batches || 0} batches
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Manufacturer Name</th>
                  <th className="p-3.5">Facility Address</th>
                  <th className="p-3.5">Drug Manufacturing License</th>
                  <th className="p-3.5 text-right">Batches Produced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMfrs.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{m.name}</td>
                    <td className="p-3.5 text-slate-600">{m.address || '—'}</td>
                    <td className="p-3.5 font-mono text-slate-700">{m.licenseNo || '—'}</td>
                    <td className="p-3.5 text-right font-bold text-slate-800">
                      {m._count?.batches || 0} batches
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add New Batch */}
      {modalType === 'batch' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add New Drug / IV Fluid Batch</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Drug Product</label>
                <select
                  value={batchProductId}
                  onChange={(e) => setBatchProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  required
                >
                  {inventory.products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.form})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                <select
                  value={batchMfrId}
                  onChange={(e) => setBatchMfrId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  required
                >
                  {inventory.manufacturers.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Batch Number</label>
                <input
                  type="text"
                  placeholder="e.g. MP2603098 or RL-2026-101"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    value={batchMfgDate}
                    onChange={(e) => setBatchMfgDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={batchExpDate}
                    onChange={(e) => setBatchExpDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Barcode / GS1 Identifier</label>
                <input
                  type="text"
                  placeholder="e.g. 8901234567899"
                  value={batchBarcode}
                  onChange={(e) => setBatchBarcode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-medred-600 hover:bg-medred-700 text-white font-bold"
                >
                  {saving ? 'Adding...' : 'Add Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Product */}
      {modalType === 'product' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Register New Drug Product</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Brand / Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. DNS (Dextrose Normal Saline 500ml)"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Generic Name / Composition</label>
                <input
                  type="text"
                  placeholder="e.g. Dextrose Anhydrous IP + Sodium Chloride IP"
                  value={prodGeneric}
                  onChange={(e) => setProdGeneric(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Formulation</label>
                <input
                  type="text"
                  placeholder="e.g. 500ml IV infusion or 2ml injection"
                  value={prodForm}
                  onChange={(e) => setProdForm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-medred-600 hover:bg-medred-700 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Manufacturer */}
      {modalType === 'manufacturer' && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Register Manufacturer</h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManufacturer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cadila Healthcare / Vision Parenteral"
                  value={mfrName}
                  onChange={(e) => setMfrName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Manufacturing Address / Plant Location</label>
                <input
                  type="text"
                  placeholder="e.g. Pithampur Pharma Zone, MP"
                  value={mfrAddress}
                  onChange={(e) => setMfrAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Drug License Number</label>
                <input
                  type="text"
                  placeholder="e.g. MP/MFG/2022/991"
                  value={mfrLicense}
                  onChange={(e) => setMfrLicense(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-medred-600 hover:bg-medred-700 text-white font-bold"
                >
                  {saving ? 'Saving...' : 'Register Manufacturer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
