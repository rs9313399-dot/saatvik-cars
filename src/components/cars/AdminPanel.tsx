'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, Car, Trash2, Edit3, Plus,
  Loader2, Search, RefreshCw, ToggleLeft, ToggleRight,
  MapPin, Fuel, Gauge, Calendar, Phone, ChevronDown,
  ArrowLeft, Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/lib/store';
import { fetchCars, deleteCar, toggleCarActive, updateCar, createCar } from '@/lib/api';
import type { Car as CarType } from '@/lib/types';
import { formatPrice, formatKM, formatEMI, calcEMI, parseImages, getTagLabel, getTagColor } from '@/lib/helpers';
import { BUSINESS } from '@/lib/business';
import { toast } from 'sonner';

const CYAN = '#00D4FF';

const BRANDS = [
  'Maruti Suzuki', 'Hyundai', 'Tata', 'Honda', 'Toyota',
  'Mahindra', 'Kia', 'Volkswagen', 'Skoda', 'BMW',
  'Mercedes-Benz', 'Audi', 'Renault', 'Nissan', 'Ford',
  'MG', 'Jeep', 'Volvo', 'Land Rover', 'Jaguar',
];

const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric'];
const TRANSMISSIONS = ['Manual', 'Automatic'];
const OWNER_TYPES = ['1st Owner', '2nd Owner', '3rd Owner'];
const YEARS = Array.from({ length: 11 }, (_, i) => String(2025 - i));

type ViewMode = 'list' | 'edit' | 'add';

interface EditForm {
  id?: string;
  name: string;
  brand: string;
  model: string;
  year: string;
  price: string;
  fuelType: string;
  transmission: string;
  kmDriven: string;
  ownerType: string;
  location: string;
  description: string;
  tags: string;
  contactPhone: string;
  carNumber: string;
  active: boolean;
}

const emptyForm: EditForm = {
  name: '', brand: '', model: '', year: '2024', price: '',
  fuelType: 'Petrol', transmission: 'Manual', kmDriven: '',
  ownerType: '1st Owner', location: '', description: '',
  tags: '', contactPhone: '', carNumber: '', active: true,
};

export default function AdminPanel() {
  const { adminPanelOpen, setAdminPanelOpen, setSellModalOpen, isAdmin, carListVersion, bumpCarListVersion } = useStore();
  const [cars, setCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editForm, setEditForm] = useState<EditForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadCars = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchCars({ all: true } as Record<string, unknown>);
      const parsedCars = result.cars.map((car) => ({
        ...car,
        images: typeof car.images === 'string' ? parseImages(car.images) : car.images,
      }));
      setCars(parsedCars as CarType[]);
    } catch (err) {
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (adminPanelOpen && isAdmin) {
      loadCars();
      setViewMode('list');
    }
  }, [adminPanelOpen, isAdmin, loadCars, carListVersion]);

  const handleClose = () => {
    setAdminPanelOpen(false);
    setViewMode('list');
    setEditForm(emptyForm);
    setDeleteConfirm(null);
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      await toggleCarActive(id, !currentActive);
      setCars((prev) => prev.map((c) => c.id === id ? { ...c, active: !currentActive } : c));
      bumpCarListVersion();
      toast.success(currentActive ? 'Car deactivated' : 'Car activated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCar(id);
      setCars((prev) => prev.filter((c) => c.id !== id));
      bumpCarListVersion();
      setDeleteConfirm(null);
      toast.success('Car deleted successfully');
    } catch {
      toast.error('Failed to delete car');
    }
  };

  const handleEdit = (car: CarType) => {
    const images = typeof car.images === 'string' ? parseImages(car.images) : car.images;
    setEditForm({
      id: car.id,
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: String(car.year),
      price: String(car.price),
      fuelType: car.fuelType,
      transmission: car.transmission,
      kmDriven: String(car.kmDriven),
      ownerType: car.ownerType,
      location: car.location,
      description: car.description,
      tags: car.tags,
      contactPhone: car.contactPhone,
      carNumber: car.carNumber || '',
      active: car.active,
    });
    setViewMode('edit');
  };

  const handleAdd = () => {
    setEditForm(emptyForm);
    setViewMode('add');
  };

  const handleSaveEdit = async () => {
    if (!editForm.name || !editForm.brand || !editForm.price) {
      toast.error('Name, brand, and price are required');
      return;
    }
    setSaving(true);
    try {
      const updateData = {
        name: editForm.name,
        brand: editForm.brand,
        model: editForm.model,
        year: parseInt(editForm.year),
        price: parseInt(editForm.price),
        fuelType: editForm.fuelType,
        transmission: editForm.transmission,
        kmDriven: parseInt(editForm.kmDriven) || 0,
        ownerType: editForm.ownerType,
        location: editForm.location,
        description: editForm.description,
        tags: editForm.tags,
        contactPhone: editForm.contactPhone,
        carNumber: editForm.carNumber,
        active: editForm.active,
      };
      if (editForm.id) {
        await updateCar(editForm.id, updateData);
        toast.success('Car updated successfully');
      } else {
        await createCar({ ...updateData, images: [] });
        toast.success('Car added successfully');
      }
      bumpCarListVersion();
      setViewMode('list');
      loadCars();
    } catch {
      toast.error('Failed to save car');
    } finally {
      setSaving(false);
    }
  };

  const filteredCars = cars.filter((car) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      car.name.toLowerCase().includes(q) ||
      car.brand.toLowerCase().includes(q) ||
      car.location.toLowerCase().includes(q)
    );
  });

  const activeCount = cars.filter((c) => c.active).length;
  const inactiveCount = cars.filter((c) => !c.active).length;

  return (
    <AnimatePresence>
      {adminPanelOpen && isAdmin && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[8px]"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-[101] w-full max-w-2xl bg-[#0d1117]/98 backdrop-blur-xl border-l border-white/[0.06] shadow-2xl flex flex-col"
          >
            {/* ── Header ── */}
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-3">
                {viewMode !== 'list' && (
                  <button
                    onClick={() => setViewMode('list')}
                    suppressHydrationWarning
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20">
                  <Shield className="h-4.5 w-4.5 text-[#00D4FF]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {viewMode === 'list' ? 'Admin Dashboard' : viewMode === 'edit' ? 'Edit Car' : 'Add New Car'}
                  </h2>
                  {viewMode === 'list' && (
                    <p className="text-[11px] text-slate-500">
                      {activeCount} active · {inactiveCount} inactive · {cars.length} total
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {viewMode === 'list' && (
                  <>
                    <Button
                      onClick={handleAdd}
                      suppressHydrationWarning
                      className="h-8 rounded-lg bg-[#00D4FF] px-3 text-xs font-bold text-[#0A0A0A] hover:bg-[#00B8E6] transition-all"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add Car
                    </Button>
                    <Button
                      onClick={() => setSellModalOpen(true)}
                      suppressHydrationWarning
                      className="h-8 rounded-lg border border-[#00D4FF]/30 bg-[#00D4FF]/5 px-3 text-xs font-semibold text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
                    >
                      <Car className="mr-1 h-3.5 w-3.5" />
                      Sell Car
                    </Button>
                  </>
                )}
                <button
                  onClick={handleClose}
                  suppressHydrationWarning
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.05] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {viewMode === 'list' && (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5"
                  >
                    {/* Search bar */}
                    <div className="relative mb-4">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search cars by name, brand, or location..."
                        suppressHydrationWarning
                        className="h-10 rounded-xl border-white/[0.06] bg-white/[0.03] pl-10 pr-10 text-sm text-slate-200 placeholder:text-slate-400"
                      />
                      <button
                        onClick={loadCars}
                        suppressHydrationWarning
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-colors"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {/* Cars list */}
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-[#00D4FF] animate-spin mb-3" />
                        <p className="text-sm text-slate-400">Loading cars...</p>
                      </div>
                    ) : filteredCars.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20">
                        <Car className="h-10 w-10 text-slate-700 mb-3" />
                        <p className="text-sm text-slate-500">No cars found</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {filteredCars.map((car) => {
                          const images = typeof car.images === 'string' ? parseImages(car.images) : car.images;
                          const imgSrc = Array.isArray(images) && images.length > 0 ? images[0] : '';
                          const tagList = car.tags ? car.tags.split(',').filter(Boolean) : [];

                          return (
                            <div
                              key={car.id}
                              suppressHydrationWarning
                              className={`group rounded-xl border transition-all duration-200 ${
                                car.active
                                  ? 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                                  : 'border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.04]'
                              }`}
                            >
                              <div className="flex items-center gap-3.5 p-3.5">
                                {/* Car image */}
                                <div className="h-16 w-20 shrink-0 rounded-lg bg-[#111827] overflow-hidden border border-white/[0.04]">
                                  {imgSrc ? (
                                    <img
                                      src={imgSrc}
                                      alt={car.name}
                                      className="h-full w-full object-cover"
                                      loading="lazy"
                                      suppressHydrationWarning
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <Car className="h-6 w-6 text-slate-700" />
                                    </div>
                                  )}
                                </div>

                                {/* Car info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-white truncate">{car.name}</p>
                                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{car.location}</span>
                                        <span className="flex items-center gap-1"><Fuel className="h-3 w-3" />{car.fuelType}</span>
                                        <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{formatKM(car.kmDriven)}</span>
                                      </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-sm font-bold text-white">{formatPrice(car.price)}</p>
                                      <p className="text-[11px] text-[#00D4FF]">EMI from {formatEMI(calcEMI(car.price))}/mo</p>
                                    </div>
                                  </div>

                                  {/* Tags + Actions row */}
                                  <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {!car.active && (
                                        <Badge suppressHydrationWarning className="bg-red-500/15 text-red-400 text-[10px] px-2 py-0 h-5 border-0">
                                          Inactive
                                        </Badge>
                                      )}
                                      {tagList.map((tag) => (
                                        <Badge key={tag} suppressHydrationWarning className={`${getTagColor(tag)} text-[10px] px-2 py-0 h-5 border-0`}>
                                          {getTagLabel(tag)}
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleToggleActive(car.id, car.active)}
                                        suppressHydrationWarning
                                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                          car.active
                                            ? 'text-emerald-400 hover:bg-emerald-500/10'
                                            : 'text-red-400 hover:bg-red-500/10'
                                        }`}
                                        title={car.active ? 'Deactivate' : 'Activate'}
                                      >
                                        {car.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                      </button>
                                      <button
                                        onClick={() => handleEdit(car)}
                                        suppressHydrationWarning
                                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                      {deleteConfirm === car.id ? (
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => handleDelete(car.id)}
                                            suppressHydrationWarning
                                            className="h-7 rounded-lg bg-red-500/20 px-2.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/30 transition-colors"
                                          >
                                            Confirm
                                          </button>
                                          <button
                                            onClick={() => setDeleteConfirm(null)}
                                            suppressHydrationWarning
                                            className="h-7 rounded-lg bg-white/[0.05] px-2.5 text-[10px] font-semibold text-slate-400 hover:bg-white/[0.1] transition-colors"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setDeleteConfirm(car.id)}
                                          suppressHydrationWarning
                                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                                          title="Delete"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ── Edit / Add Form ── */}
                {(viewMode === 'edit' || viewMode === 'add') && (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-5"
                  >
                    <div className="space-y-4">
                      {/* Section: Basic Info */}
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <Car className="h-3.5 w-3.5 text-[#00D4FF]" />
                          Car Details
                          <span className="flex-1 h-px bg-gradient-to-r from-[#00D4FF]/20 to-transparent ml-2" />
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Car Name *</label>
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              placeholder="e.g. Maruti Suzuki Swift VXI"
                              suppressHydrationWarning
                              className="h-10 rounded-lg border-white/[0.06] bg-white/[0.03] text-sm text-slate-200 placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Brand *</label>
                            <div className="relative">
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                              <select
                                value={editForm.brand}
                                onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                                suppressHydrationWarning
                                className="h-10 w-full appearance-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 pr-9 text-sm text-slate-200 outline-none hover:bg-white/[0.05]"
                              >
                                <option value="" className="bg-[#111827]">Select Brand</option>
                                {BRANDS.map((b) => <option key={b} value={b} className="bg-[#111827]">{b}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Model</label>
                            <Input
                              value={editForm.model}
                              onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                              placeholder="e.g. Swift VXI"
                              suppressHydrationWarning
                              className="h-10 rounded-lg border-white/[0.06] bg-white/[0.03] text-sm text-slate-200 placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Year</label>
                            <div className="relative">
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                              <select
                                value={editForm.year}
                                onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                                suppressHydrationWarning
                                className="h-10 w-full appearance-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 pr-9 text-sm text-slate-200 outline-none hover:bg-white/[0.05]"
                              >
                                {YEARS.map((y) => <option key={y} value={y} className="bg-[#111827]">{y}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Price (₹) *</label>
                            <Input
                              type="number"
                              value={editForm.price}
                              onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                              placeholder="e.g. 650000"
                              suppressHydrationWarning
                              className="h-10 rounded-lg border-white/[0.06] bg-white/[0.03] text-sm text-slate-200 placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section: Specs */}
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <Gauge className="h-3.5 w-3.5 text-[#00D4FF]" />
                          Specifications
                          <span className="flex-1 h-px bg-gradient-to-r from-[#00D4FF]/20 to-transparent ml-2" />
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Fuel Type</label>
                            <div className="relative">
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                              <select
                                value={editForm.fuelType}
                                onChange={(e) => setEditForm({ ...editForm, fuelType: e.target.value })}
                                suppressHydrationWarning
                                className="h-10 w-full appearance-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 pr-9 text-sm text-slate-200 outline-none hover:bg-white/[0.05]"
                              >
                                {FUEL_TYPES.map((f) => <option key={f} value={f} className="bg-[#111827]">{f}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Transmission</label>
                            <div className="relative">
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                              <select
                                value={editForm.transmission}
                                onChange={(e) => setEditForm({ ...editForm, transmission: e.target.value })}
                                suppressHydrationWarning
                                className="h-10 w-full appearance-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 pr-9 text-sm text-slate-200 outline-none hover:bg-white/[0.05]"
                              >
                                {TRANSMISSIONS.map((t) => <option key={t} value={t} className="bg-[#111827]">{t}</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">KM Driven</label>
                            <Input
                              type="number"
                              value={editForm.kmDriven}
                              onChange={(e) => setEditForm({ ...editForm, kmDriven: e.target.value })}
                              placeholder="e.g. 12000"
                              suppressHydrationWarning
                              className="h-10 rounded-lg border-white/[0.06] bg-white/[0.03] text-sm text-slate-200 placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Owner Type</label>
                            <div className="relative">
                              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                              <select
                                value={editForm.ownerType}
                                onChange={(e) => setEditForm({ ...editForm, ownerType: e.target.value })}
                                suppressHydrationWarning
                                className="h-10 w-full appearance-none rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 pr-9 text-sm text-slate-200 outline-none hover:bg-white/[0.05]"
                              >
                                {OWNER_TYPES.map((o) => <option key={o} value={o} className="bg-[#111827]">{o}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section: Location & Contact */}
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <Phone className="h-3.5 w-3.5 text-[#00D4FF]" />
                          Location & Contact
                          <span className="flex-1 h-px bg-gradient-to-r from-[#00D4FF]/20 to-transparent ml-2" />
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Location</label>
                            <Input
                              value={editForm.location}
                              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                              placeholder="e.g. Mumbai, Maharashtra"
                              suppressHydrationWarning
                              className="h-10 rounded-lg border-white/[0.06] bg-white/[0.03] text-sm text-slate-200 placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Contact Phone</label>
                            <Input
                              value={editForm.contactPhone}
                              onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                              placeholder={BUSINESS.phones[1].display}
                              suppressHydrationWarning
                              className="h-10 rounded-lg border-white/[0.06] bg-white/[0.03] text-sm text-slate-200 placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Car Number</label>
                            <Input
                              value={editForm.carNumber}
                              onChange={(e) => setEditForm({ ...editForm, carNumber: e.target.value })}
                              placeholder="MH 01 AB 1234"
                              suppressHydrationWarning
                              className="h-10 rounded-lg border-white/[0.06] bg-white/[0.03] text-sm text-slate-200 placeholder:text-slate-400"
                            />
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Tags (comma-separated)</label>
                            <Input
                              value={editForm.tags}
                              onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                              placeholder="featured, urgent, best_deal"
                              suppressHydrationWarning
                              className="h-10 rounded-lg border-white/[0.06] bg-white/[0.03] text-sm text-slate-200 placeholder:text-slate-400"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="mb-1.5 block text-[11px] font-medium text-slate-500">Description</label>
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              placeholder="Describe the car..."
                              rows={3}
                              suppressHydrationWarning
                              className="w-full rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-400 outline-none hover:bg-white/[0.05] focus:border-[#00D4FF]/30 resize-none"
                            />
                          </div>
                          <div className="col-span-2 flex items-center gap-3">
                            <label className="text-[11px] font-medium text-slate-500">Active Status:</label>
                            <button
                              type="button"
                              onClick={() => setEditForm({ ...editForm, active: !editForm.active })}
                              suppressHydrationWarning
                              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                editForm.active
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-red-500/15 text-red-400'
                              }`}
                            >
                              {editForm.active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                              {editForm.active ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Save button */}
                      <div className="sticky bottom-0 pt-3 pb-2 bg-[#0d1117]/90 backdrop-blur-sm border-t border-white/[0.04]">
                        <Button
                          onClick={handleSaveEdit}
                          disabled={saving}
                          suppressHydrationWarning
                          className="h-11 w-full rounded-xl bg-[#00D4FF] text-sm font-bold text-[#0A0A0A] hover:bg-[#00B8E6] transition-all shadow-[0_0_20px_rgba(0,212,255,0.15)] disabled:opacity-50"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              {viewMode === 'edit' ? 'Save Changes' : 'Add Car'}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
