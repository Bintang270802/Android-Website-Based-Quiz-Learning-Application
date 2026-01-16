"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Search, Trash2, Edit, Plus, Calendar, Image, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '@/lib/api';

interface Kategori {
  _id: string;
  nama: string;
}

interface Pertanyaan {
  _id: string;
  teks_pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_benar: string;
  url_gambar: string;
  kategori_id: {
    _id: string;
    nama: string;
  };
  dibuat_oleh: {
    _id: string;
    nama: string;
  };
  status: string;
  dibuat_pada: string;
}

export default function PertanyaanPage() {
  const [pertanyaan, setPertanyaan] = useState<Pertanyaan[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPertanyaan, setEditingPertanyaan] = useState<Pertanyaan | null>(null);
  const [formData, setFormData] = useState({
    teks_pertanyaan: '',
    pilihan_a: '',
    pilihan_b: '',
    pilihan_c: '',
    pilihan_benar: '',
    kategori_id: '',
    status: 'draft',
    gambar: null as File | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pertanyaanRes, kategoriRes] = await Promise.all([
        api.get('/pertanyaan'),
        api.get('/kategori')
      ]);
      setPertanyaan(pertanyaanRes.data);
      setKategori(kategoriRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'gambar' && value) {
        formDataToSend.append(key, value as string);
      }
    });
    
    if (formData.gambar) {
      formDataToSend.append('gambar', formData.gambar);
    }

    try {
      if (editingPertanyaan) {
        await api.put(`/pertanyaan/${editingPertanyaan._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Berhasil",
          description: "Pertanyaan berhasil diperbarui",
        });
      } else {
        await api.post('/pertanyaan', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Berhasil",
          description: "Pertanyaan berhasil ditambahkan",
        });
      }
      
      fetchData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan pertanyaan",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/pertanyaan/${id}`);
      setPertanyaan(prev => prev.filter(p => p._id !== id));
      toast({
        title: "Berhasil",
        description: "Pertanyaan berhasil dihapus",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus pertanyaan",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pertanyaan: Pertanyaan) => {
    setEditingPertanyaan(pertanyaan);
    setFormData({
      teks_pertanyaan: pertanyaan.teks_pertanyaan,
      pilihan_a: pertanyaan.pilihan_a,
      pilihan_b: pertanyaan.pilihan_b,
      pilihan_c: pertanyaan.pilihan_c,
      pilihan_benar: pertanyaan.pilihan_benar,
      kategori_id: pertanyaan.kategori_id._id,
      status: pertanyaan.status,
      gambar: null
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      teks_pertanyaan: '',
      pilihan_a: '',
      pilihan_b: '',
      pilihan_c: '',
      pilihan_benar: '',
      kategori_id: '',
      status: 'draft',
      gambar: null
    });
    setEditingPertanyaan(null);
  };

  const filteredPertanyaan = pertanyaan.filter(p => {
    const matchesSearch = p.teks_pertanyaan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = filterKategori === '' || p.kategori_id._id === filterKategori;
    return matchesSearch && matchesKategori;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const },
      aktif: { label: 'Aktif', variant: 'default' as const },
      nonaktif: { label: 'Non-aktif', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pertanyaan</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kelola pertanyaan quiz dalam sistem
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <MessageSquare className="h-4 w-4 mr-2" />
          {pertanyaan.length} pertanyaan
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Daftar Pertanyaan
              </CardTitle>
              <CardDescription>
                Data pertanyaan quiz yang tersedia dalam sistem
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pertanyaan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPertanyaan ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPertanyaan ? 'Perbarui informasi pertanyaan' : 'Buat pertanyaan quiz baru'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="kategori_id">Kategori</Label>
                      <Select 
                        value={formData.kategori_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, kategori_id: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {kategori.map((k) => (
                            <SelectItem key={k._id} value={k._id}>{k.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="teks_pertanyaan">Teks Pertanyaan</Label>
                      <Textarea
                        id="teks_pertanyaan"
                        value={formData.teks_pertanyaan}
                        onChange={(e) => setFormData(prev => ({ ...prev, teks_pertanyaan: e.target.value }))}
                        placeholder="Masukkan teks pertanyaan"
                        required
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pilihan_a">Pilihan A</Label>
                        <Input
                          id="pilihan_a"
                          value={formData.pilihan_a}
                          onChange={(e) => setFormData(prev => ({ ...prev, pilihan_a: e.target.value }))}
                          placeholder="Masukkan pilihan A"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pilihan_b">Pilihan B</Label>
                        <Input
                          id="pilihan_b"
                          value={formData.pilihan_b}
                          onChange={(e) => setFormData(prev => ({ ...prev, pilihan_b: e.target.value }))}
                          placeholder="Masukkan pilihan B"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pilihan_c">Pilihan C</Label>
                        <Input
                          id="pilihan_c"
                          value={formData.pilihan_c}
                          onChange={(e) => setFormData(prev => ({ ...prev, pilihan_c: e.target.value }))}
                          placeholder="Masukkan pilihan C"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pilihan_benar">Pilihan Benar</Label>
                      <Select 
                        value={formData.pilihan_benar} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, pilihan_benar: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jawaban yang benar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="aktif">Aktif</SelectItem>
                          <SelectItem value="nonaktif">Non-aktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gambar">Gambar Pertanyaan (Opsional)</Label>
                      <Input
                        id="gambar"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          gambar: e.target.files?.[0] || null 
                        }))}
                      />
                      <p className="text-xs text-gray-500">
                        Format: JPG, PNG, GIF. Maksimal 5MB.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingPertanyaan ? 'Perbarui' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari pertanyaan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {kategori.map((k) => (
                    <SelectItem key={k._id} value={k._id}>{k.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pertanyaan</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Jawaban Benar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPertanyaan.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm || filterKategori ? 'Tidak ada pertanyaan yang sesuai dengan filter' : 'Belum ada data pertanyaan'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPertanyaan.map((item) => (
                      <TableRow key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium line-clamp-2">{item.teks_pertanyaan}</p>
                            {item.url_gambar && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Image className="h-3 w-3 mr-1" />
                                Ada gambar
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.kategori_id?.nama}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{item.pilihan_benar}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.status)}
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.dibuat_oleh?.nama || 'Sistem'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Pertanyaan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus pertanyaan ini? 
                                    Tindakan ini tidak dapat dibatalkan dan akan menghapus semua jawaban terkait.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item._id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}