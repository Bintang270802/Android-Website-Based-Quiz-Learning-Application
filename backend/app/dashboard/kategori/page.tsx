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
import { FolderOpen, Search, Trash2, Edit, Plus, Calendar, Image } from 'lucide-react';
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
  url_gambar: string;
  dibuat_oleh: {
    _id: string;
    nama: string;
  };
  dibuat_pada: string;
}

export default function KategoriPage() {
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKategori, setEditingKategori] = useState<Kategori | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    gambar: null as File | null
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      const response = await api.get('/kategori');
      setKategori(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data kategori",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('nama', formData.nama);
    if (formData.gambar) {
      formDataToSend.append('gambar', formData.gambar);
    }

    try {
      if (editingKategori) {
        await api.put(`/kategori/${editingKategori._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Berhasil",
          description: "Kategori berhasil diperbarui",
        });
      } else {
        await api.post('/kategori', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Berhasil",
          description: "Kategori berhasil ditambahkan",
        });
      }
      
      fetchKategori();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan kategori",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    try {
      await api.delete(`/kategori/${id}`);
      setKategori(prev => prev.filter(k => k._id !== id));
      toast({
        title: "Berhasil",
        description: `Kategori ${nama} berhasil dihapus`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus kategori",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (kategori: Kategori) => {
    setEditingKategori(kategori);
    setFormData({
      nama: kategori.nama,
      gambar: null
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ nama: '', gambar: null });
    setEditingKategori(null);
  };

  const filteredKategori = kategori.filter(k =>
    k.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kategori</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kelola kategori quiz dalam sistem
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <FolderOpen className="h-4 w-4 mr-2" />
          {kategori.length} kategori
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Daftar Kategori
              </CardTitle>
              <CardDescription>
                Data kategori quiz yang tersedia dalam sistem
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kategori
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingKategori ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingKategori ? 'Perbarui informasi kategori' : 'Buat kategori quiz baru'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama">Nama Kategori</Label>
                      <Input
                        id="nama"
                        value={formData.nama}
                        onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                        placeholder="Masukkan nama kategori"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gambar">Gambar Kategori</Label>
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
                      {editingKategori ? 'Perbarui' : 'Simpan'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari nama kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gambar</TableHead>
                    <TableHead>Nama Kategori</TableHead>
                    <TableHead>Dibuat Oleh</TableHead>
                    <TableHead>Tanggal Dibuat</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKategori.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Tidak ada kategori yang sesuai dengan pencarian' : 'Belum ada data kategori'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKategori.map((item) => (
                      <TableRow key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                            {item.url_gambar ? (
                              <img 
                                src={`http://localhost:5000${item.url_gambar}`} 
                                alt={item.nama}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Image className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{item.nama}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-600 dark:text-gray-400">
                            {item.dibuat_oleh?.nama || 'Sistem'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(item.dibuat_pada), 'dd MMMM yyyy, HH:mm', { locale: id })}
                            </span>
                          </div>
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
                                  <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus kategori "{item.nama}"? 
                                    Tindakan ini tidak dapat dibatalkan dan akan menghapus semua pertanyaan dalam kategori ini.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item._id, item.nama)}
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