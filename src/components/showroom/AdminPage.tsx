'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Car, Stats } from '@/lib/types';
import { BRANDS, FUEL_TYPES, TRANSMISSIONS, OWNER_TYPES, TAGS } from '@/lib/types';
import { useStore } from '@/lib/store';
import {
  fetchCars,
  fetchCar,
  fetchStats,
  createCar,
  updateCar,
  deleteCar,
  toggleCarActive,
  uploadImages,
  loginAdmin,
  checkAuth,
  logoutAdmin,
} from '@/lib/api';
import { formatPrice, parseImages, getTagLabel, getTagColor } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Car,
  BarChart3,
  Plus,
  List,
  LogOut,
  Upload,
  X,
  Eye,
  Phone,
  MessageCircle,
  Trash2,
  Pencil,
  Power,
  ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// ─── Neon Orange Tag Colors for Admin ─────────────────────
function getAdminTagColor(tag: string): string {
  const map: Record<string, string> = {
    featured: 'bg-[#FF4D00]/20 text-[#FF6B2B] border border-[#FF4D00]/30',
    urgent: 'bg-red-500/20 text-red-400 border border-red-500/30',
    best_deal: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  };
  return map[tag] || 'bg-white/5 text-gray-400 border border-white/10';
}

// ─── Login Form ───────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const success = await loginAdmin(username, password);
      if (success) {
        onLogin();
        toast({ title: 'Logged in successfully' });
      } else {
        setError('Invalid credentials');
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#FF4D00] shadow-[0_0_20px_rgba(255,77,0,0.4)]">
            <Car className="h-7 w-7 text-white" suppressHydrationWarning />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-[#808080]">Sign in to manage your listings</p>
        </div>
        <div className="rounded-lg border border-[rgba(255,77,0,0.15)] bg-[#0A0A0A] p-6 shadow-[0_0_30px_rgba(255,77,0,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-[#C0C0C0]">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                suppressHydrationWarning
                className="h-11 rounded-lg border-[rgba(255,255,255,0.06)] bg-[#111111] text-white placeholder:text-[#808080] focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-[#C0C0C0]">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                suppressHydrationWarning
                className="h-11 rounded-lg border-[rgba(255,255,255,0.06)] bg-[#111111] text-white placeholder:text-[#808080] focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/50"
                required
              />
            </div>
            {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
            <Button
              type="submit"
              suppressHydrationWarning
              className="h-11 w-full rounded-lg bg-[#FF4D00] font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(255,77,0,0.35)] hover:bg-[#FF6B2B] hover:shadow-[0_0_25px_rgba(255,77,0,0.5)] transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState<(Stats & { topViewedCars: Car[]; inactiveCars: number }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg bg-[#111111]" />
        ))}
      </div>
    );
  }

  if (!stats) return <p className="text-[#808080]">Failed to load stats.</p>;

  const statCards = [
    { label: 'Total Cars', value: stats.totalCars, icon: <Car className="h-4 w-4 text-[#FF4D00]" suppressHydrationWarning /> },
    { label: 'Active', value: stats.activeCars, icon: <Power className="h-4 w-4 text-[#FF4D00]" suppressHydrationWarning /> },
    { label: 'Total Views', value: stats.totalViews, icon: <Eye className="h-4 w-4 text-[#FF4D00]" suppressHydrationWarning /> },
    { label: 'Call Clicks', value: stats.totalCallClicks, icon: <Phone className="h-4 w-4 text-[#FF4D00]" suppressHydrationWarning /> },
    { label: 'WhatsApp Clicks', value: stats.totalWhatsappClicks, icon: <MessageCircle className="h-4 w-4 text-[#FF4D00]" suppressHydrationWarning /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="rounded-lg border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] hover:border-[rgba(255,77,0,0.2)] transition-colors duration-200">
              <CardContent className="p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  {s.icon}
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#808080]">{s.label}</span>
                </div>
                <p className="text-xl font-bold text-white">{s.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Top Viewed Cars */}
      {stats.topViewedCars.length > 0 && (
        <Card className="rounded-lg border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold uppercase tracking-wider text-white">Top Viewed Cars</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                  <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#808080]">Car</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[#808080]">Views</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[#808080]">Calls</TableHead>
                  <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[#808080]">WhatsApp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topViewedCars.slice(0, 5).map((car) => (
                  <TableRow key={car.id} className="border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,77,0,0.05)] transition-colors">
                    <TableCell className="font-semibold text-white">{car.name}</TableCell>
                    <TableCell className="text-right text-[#C0C0C0]">{car.views}</TableCell>
                    <TableCell className="text-right text-[#C0C0C0]">{car.callClicks}</TableCell>
                    <TableCell className="text-right text-[#C0C0C0]">{car.whatsappClicks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Add Car Tab ──────────────────────────────────────────
function AddCarTab({ editCar, onDone }: { editCar?: Car | null; onDone: () => void }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    name: editCar?.name || '',
    brand: editCar?.brand || '',
    model: editCar?.model || '',
    year: editCar?.year?.toString() || '',
    price: editCar?.price?.toString() || '',
    fuelType: editCar?.fuelType || '',
    transmission: editCar?.transmission || '',
    kmDriven: editCar?.kmDriven?.toString() || '',
    ownerType: editCar?.ownerType || '',
    location: editCar?.location || '',
    description: editCar?.description || '',
    contactPhone: editCar?.contactPhone || '',
    carNumber: editCar?.carNumber || '',
    tags: editCar
      ? (() => {
          if (!editCar.tags) return [];
          const t = typeof editCar.tags === 'string'
            ? editCar.tags.split(',').filter(Boolean)
            : editCar.tags;
          return Array.isArray(t) ? t : [];
        })()
      : [] as string[],
    images: editCar ? parseImages(editCar.images) : [] as string[],
  });

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setUploading(true);
    try {
      const paths = await uploadImages(fileArray);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...paths] }));
      toast({ title: `${paths.length} image(s) uploaded` });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        name: form.name,
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        price: Number(form.price),
        fuelType: form.fuelType,
        transmission: form.transmission,
        kmDriven: Number(form.kmDriven),
        ownerType: form.ownerType,
        location: form.location,
        description: form.description,
        contactPhone: form.contactPhone,
        carNumber: form.carNumber,
        tags: form.tags,
        images: form.images,
      };

      if (editCar) {
        await updateCar(editCar.id, data);
        toast({ title: 'Car updated successfully' });
      } else {
        await createCar(data as Parameters<typeof createCar>[0]);
        toast({ title: 'Car created successfully' });
      }
      onDone();
    } catch (err) {
      toast({ title: 'Failed to save car', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "h-10 rounded-lg border-[rgba(255,255,255,0.06)] bg-[#111111] text-white placeholder:text-[#808080] focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/50";
  const requiredLabelClass = "text-[#FF4D00] font-bold uppercase tracking-wider text-xs";
  const optionalLabelClass = "text-[#808080] font-bold uppercase tracking-wider text-xs";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Name */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Name *</Label>
          <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} className={inputClass} required />
        </div>
        {/* Brand */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Brand *</Label>
          <Select value={form.brand} onValueChange={(v) => updateField('brand', v)}>
            <SelectTrigger className={inputClass}><SelectValue placeholder="Select brand" /></SelectTrigger>
            <SelectContent>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {/* Model */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Model *</Label>
          <Input value={form.model} onChange={(e) => updateField('model', e.target.value)} className={inputClass} required />
        </div>
        {/* Year */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Year *</Label>
          <Input type="number" min={2000} max={new Date().getFullYear()} value={form.year} onChange={(e) => updateField('year', e.target.value)} className={inputClass} required />
        </div>
        {/* Price */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Price (₹) *</Label>
          <Input type="number" min={0} value={form.price} onChange={(e) => updateField('price', e.target.value)} className={inputClass} required />
        </div>
        {/* Fuel Type */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Fuel Type *</Label>
          <Select value={form.fuelType} onValueChange={(v) => updateField('fuelType', v)}>
            <SelectTrigger className={inputClass}><SelectValue placeholder="Select fuel type" /></SelectTrigger>
            <SelectContent>{FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {/* Transmission */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Transmission *</Label>
          <Select value={form.transmission} onValueChange={(v) => updateField('transmission', v)}>
            <SelectTrigger className={inputClass}><SelectValue placeholder="Select transmission" /></SelectTrigger>
            <SelectContent>{TRANSMISSIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {/* KM Driven */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>KM Driven *</Label>
          <Input type="number" min={0} value={form.kmDriven} onChange={(e) => updateField('kmDriven', e.target.value)} className={inputClass} required />
        </div>
        {/* Owner Type */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Owner Type *</Label>
          <Select value={form.ownerType} onValueChange={(v) => updateField('ownerType', v)}>
            <SelectTrigger className={inputClass}><SelectValue placeholder="Select owner type" /></SelectTrigger>
            <SelectContent>{OWNER_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {/* Location */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Location *</Label>
          <Input value={form.location} onChange={(e) => updateField('location', e.target.value)} className={inputClass} required />
        </div>
        {/* Contact Phone */}
        <div className="space-y-2">
          <Label className={requiredLabelClass}>Contact Phone *</Label>
          <Input value={form.contactPhone} onChange={(e) => updateField('contactPhone', e.target.value)} className={inputClass} placeholder="+91 98765 43210" required />
        </div>
        {/* Car Number (Registration) */}
        <div className="space-y-2">
          <Label className={optionalLabelClass}>Car Number</Label>
          <Input value={form.carNumber} onChange={(e) => updateField('carNumber', e.target.value)} className={inputClass} placeholder="MH 01 AB 1234" />
        </div>
        {/* Description */}
        <div className="space-y-2 sm:col-span-2">
          <Label className={requiredLabelClass}>Description *</Label>
          <Textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} className="min-h-[100px] rounded-lg border-[rgba(255,255,255,0.06)] bg-[#111111] text-white placeholder:text-[#808080] focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00]/50" required />
        </div>
        {/* Tags */}
        <div className="space-y-2 sm:col-span-2">
          <Label className={optionalLabelClass}>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                suppressHydrationWarning
                onClick={() => toggleTag(tag)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  form.tags.includes(tag)
                    ? getAdminTagColor(tag)
                    : 'bg-[#111111] text-[#808080] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,77,0,0.3)] hover:text-[#C0C0C0]'
                }`}
              >
                {getTagLabel(tag)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-3">
        <Label className={optionalLabelClass}>Images</Label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-200 ${
            dragOver
              ? 'border-[#FF4D00] bg-[#FF4D00]/5 shadow-[0_0_20px_rgba(255,77,0,0.1)]'
              : 'border-[#FF4D00]/30 bg-[#0A0A0A] hover:border-[#FF4D00]/60 hover:bg-[#FF4D00]/5'
          }`}
        >
          <Upload className="mb-3 h-8 w-8 text-[#FF4D00]" suppressHydrationWarning />
          <p className="text-sm font-bold uppercase tracking-wider text-[#C0C0C0]">
            {uploading ? 'Uploading...' : 'Drag & drop images or click to upload'}
          </p>
          <p className="mt-1 text-xs text-[#808080]">PNG, JPG up to 5MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        {/* Image Previews */}
        {form.images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {form.images.map((img, idx) => {
              const isLocal = img.startsWith('/uploads/');
              return (
                <div key={idx} className="group relative h-20 w-28 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#111111]">
                  {isLocal ? (
                    <Image src={img} alt={`Upload ${idx}`} fill className="object-cover" sizes="112px" />
                  ) : (
                    <img src={img} alt={`Upload ${idx}`} className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-sm bg-[#FF4D00] text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" suppressHydrationWarning />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="h-11 rounded-lg bg-[#FF4D00] px-8 font-bold uppercase tracking-wider text-white shadow-[0_0_15px_rgba(255,77,0,0.35)] hover:bg-[#FF6B2B] hover:shadow-[0_0_25px_rgba(255,77,0,0.5)] transition-all duration-200"
        disabled={saving}
      >
        {saving ? 'Saving...' : editCar ? 'Update Car' : 'Create Car'}
      </Button>
    </form>
  );
}

// ─── Manage Listings Tab ──────────────────────────────────
function ManageListingsTab() {
  const { toast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [editCar, setEditCar] = useState<Car | null>(null);
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

  const loadCars = useCallback(async () => {
    try {
      const data = await fetchCars({ all: true } as { all: boolean });
      setCars(data.cars);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      await toggleCarActive(id, !active);
      toast({ title: `Car ${!active ? 'activated' : 'deactivated'}` });
      loadCars();
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCar(id);
      toast({ title: 'Car deleted' });
      setDeleteDialogId(null);
      loadCars();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg bg-[#111111]" />
        ))}
      </div>
    );
  }

  if (editCar) {
    return (
      <div>
        <Button
          variant="ghost"
          onClick={() => setEditCar(null)}
          className="mb-4 gap-2 text-[#FF4D00] hover:text-[#FF6B2B] hover:bg-[#FF4D00]/10"
        >
          ← Back to listings
        </Button>
        <AddCarTab editCar={editCar} onDone={() => { setEditCar(null); loadCars(); }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cars.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <ImageIcon className="mb-4 h-10 w-10 text-[#808080]" suppressHydrationWarning />
          <p className="text-[#808080] font-medium">No cars yet. Add your first listing!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[rgba(255,255,255,0.06)]">
          <Table>
            <TableHeader>
              <TableRow className="border-[rgba(255,255,255,0.06)] hover:bg-transparent">
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#808080]">Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#808080]">Price</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#808080]">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-[#808080]">Views</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest text-[#808080]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => {
                const images = parseImages(car.images);
                const mainImg = images[0] || '';
                const isLocal = mainImg.startsWith('/uploads/');
                return (
                  <TableRow key={car.id} className="border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,77,0,0.05)] transition-colors duration-150">
                    <TableCell>
                      <div className="h-10 w-14 overflow-hidden rounded-md bg-[#111111]">
                        {mainImg ? (
                          isLocal ? (
                            <Image src={mainImg} alt={car.name} width={56} height={40} className="h-full w-full object-cover" />
                          ) : (
                            <img src={mainImg} alt={car.name} className="h-full w-full object-cover" />
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-[#808080]" suppressHydrationWarning />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-white">{car.name}</TableCell>
                    <TableCell className="text-[#C0C0C0]">{formatPrice(car.price)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          car.active
                            ? 'bg-[#FF4D00]/15 text-[#FF6B2B] border border-[#FF4D00]/30 hover:bg-[#FF4D00]/25'
                            : 'bg-white/5 text-[#808080] border border-[rgba(255,255,255,0.06)]'
                        }`}
                        variant="outline"
                      >
                        {car.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#C0C0C0]">{car.views}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#FF4D00] hover:text-[#FF6B2B] hover:bg-[#FF4D00]/10"
                          onClick={() => handleToggleActive(car.id, car.active)}
                          title={car.active ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="h-4 w-4" suppressHydrationWarning />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#C0C0C0] hover:text-[#FF4D00] hover:bg-[#FF4D00]/10"
                          onClick={() => setEditCar(car)}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" suppressHydrationWarning />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => setDeleteDialogId(car.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" suppressHydrationWarning />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogId} onOpenChange={() => setDeleteDialogId(null)}>
        <DialogContent className="rounded-lg border-[rgba(255,77,0,0.2)] bg-[#0A0A0A] shadow-[0_0_40px_rgba(255,77,0,0.1)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold uppercase tracking-wider text-white">Delete Car</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#808080]">
            Are you sure you want to delete this car? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogId(null)}
              className="border-[rgba(255,255,255,0.06)] text-[#C0C0C0] hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 font-bold uppercase tracking-wider text-white hover:bg-red-500"
              onClick={() => deleteDialogId && handleDelete(deleteDialogId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────
export default function AdminPage() {
  const { isAdmin, setIsAdmin, authToken, setAuthToken } = useStore();
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    // If we have a stored token, verify it's still valid
    if (authToken) {
      checkAuth()
        .then((authed) => {
          if (authed) {
            setIsAdmin(true);
          } else {
            // Token is invalid/expired, clear it
            setAuthToken(null);
            setIsAdmin(false);
          }
        })
        .catch(() => {
          setAuthToken(null);
          setIsAdmin(false);
        })
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [authToken, setIsAdmin, setAuthToken]);

  const handleLogout = async () => {
    await logoutAdmin();
    setIsAdmin(false);
    toast({ title: 'Logged out' });
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF4D00] border-t-transparent" />
      </div>
    );
  }

  if (!isAdmin) {
    return <LoginForm onLogin={() => setIsAdmin(true)} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tight text-white">Admin Panel</h1>
            <p className="mt-1 text-sm text-[#808080]">Manage your car listings</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            suppressHydrationWarning
            className="gap-2 rounded-lg border-[rgba(255,77,0,0.2)] text-[#FF4D00] hover:bg-[#FF4D00]/10 hover:text-[#FF6B2B] hover:border-[#FF4D00]/40"
          >
            <LogOut className="h-4 w-4" suppressHydrationWarning />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 w-full justify-start rounded-lg bg-[#0A0A0A] p-1 border border-[rgba(255,255,255,0.06)] sm:w-auto">
            <TabsTrigger
              value="dashboard"
              className="gap-2 rounded-md text-[10px] font-bold uppercase tracking-widest text-[#808080] data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(255,77,0,0.3)]"
            >
              <BarChart3 className="h-4 w-4" suppressHydrationWarning />
              Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className="gap-2 rounded-md text-[10px] font-bold uppercase tracking-widest text-[#808080] data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(255,77,0,0.3)]"
            >
              <Plus className="h-4 w-4" suppressHydrationWarning />
              Add Car
            </TabsTrigger>
            <TabsTrigger
              value="listings"
              className="gap-2 rounded-md text-[10px] font-bold uppercase tracking-widest text-[#808080] data-[state=active]:bg-[#FF4D00] data-[state=active]:text-white data-[state=active]:shadow-[0_0_10px_rgba(255,77,0,0.3)]"
            >
              <List className="h-4 w-4" suppressHydrationWarning />
              Manage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="add">
            <Card className="rounded-lg border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
              <CardContent className="p-6">
                <h2 className="mb-6 text-lg font-bold uppercase tracking-wider text-white">Add New Car</h2>
                <AddCarTab onDone={() => setActiveTab('listings')} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings">
            <ManageListingsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
