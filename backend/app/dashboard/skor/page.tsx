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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3, Search, Plus, Edit, Calendar, Trophy, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '@/lib/api';

interface Pengguna {
  _id: string;
  nama: string;
}

interface Kategori {
  _id: string;
  nama: string;
}

interface Skor {
  _id: string;
  pengguna_id: {
    _id: string;
    nama: string;
  };
  kategori_id?: {
    _id: string;
    nama: string;
  };
  total_benar: number;
  total_salah: number;
  total_pertanyaan: number;
  persentase: number;
  direview_oleh?: {
    _id: string;
    nama: string;
  };
  dibuat_pada: string;
}

export default function SkorPage() {
  const [skor, setSkor] = useState<Skor[]>([]);
  const [pengguna, setPengguna] = useState<Pengguna[]>([]);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkor, setEditingSkor] = useState<Skor | null>(null);
  const [formData, setFormData] = useState({
    pengguna_id: '',
    kategori_id: '',
    total_benar: 0,
    total_salah: 0,
    total_pertanyaan: 0,
    persentase: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [skorRes, penggunaRes, kategoriRes] = await Promise.all([
        api.get('/skor'),
        api.get('/pengguna'),
        api.get('/kategori')
      ]);
      setSkor(skorRes.data);
      setPengguna(penggunaRes.data);
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

  const calculateNilai = (benar: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((benar / total) * 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const skorData = {
      ...formData,
      total_salah: formData.total_pertanyaan - formData.total_benar,
      persentase: calculateNilai(formData.total_benar, formData.total_pertanyaan)
    };

    try {
      if (editingSkor) {
        await api.put(`/skor/${editingSkor._id}`, skorData);
        toast({
          title: "Berhasil",
          description: "Skor berhasil diperbarui",
        });
      } else {
        await api.post('/skor', skorData);
        toast({
          title: "Berhasil",
          description: "Skor berhasil ditambahkan",
        });
      }
      
      fetchData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan skor",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (skor: Skor) => {
    setEditingSkor(skor);
    setFormData({
      pengguna_id: skor.pengguna_id._id,
      kategori_id: skor.kategori_id?._id || '',
      total_benar: skor.total_benar,
      total_pertanyaan: skor.total_pertanyaan,
      total_salah: skor.total_salah,
      persentase: skor.persentase
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      pengguna_id: '',
      kategori_id: '',
      total_benar: 0,
      total_salah: 0,
      total_pertanyaan: 0,
      persentase: 0
    });
    setEditingSkor(null);
  };

  const filteredSkor = skor.filter(s => {
    const matchesSearch = s.pengguna_id?.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = filterKategori === '' || s.kategori_id?._id === filterKategori;
    return matchesSearch && matchesKategori;
  });

  const getNilaiBadge = (nilai: number) => {
    if (nilai >= 90) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Excellent</Badge>;
    } else if (nilai >= 80) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Very Good</Badge>;
    } else if (nilai >= 70) {
      return <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">Good</Badge>;
    } else if (nilai >= 60) {
      return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">Average</Badge>;
    } else if (nilai >= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Fair</Badge>;
    } else if (nilai >= 40) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Need Improvement</Badge>;
    } else if (nilai >= 30) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Poor</Badge>;
    } else {
      return <Badge variant="destructive">Insufficient</Badge>;
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skor</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kelola skor dan nilai pengguna
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <BarChart3 className="h-4 w-4 mr-2" />
          {skor.length} skor
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daftar Skor
              </CardTitle>
              <CardDescription>
                Data skor dan nilai pengguna dalam sistem
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Skor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingSkor ? 'Edit Skor' : 'Tambah Skor Baru'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSkor ? 'Perbarui informasi skor' : 'Buat skor baru untuk pengguna'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="pengguna_id">Pengguna</Label>
                      <Select 
                        value={formData.pengguna_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, pengguna_id: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pengguna" />
                        </SelectTrigger>
                        <SelectContent>
                          {pengguna.map((p) => (
                            <SelectItem key={p._id} value={p._id}>{p.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="kategori_id">Kategori (Opsional)</Label>
                      <Select 
                        value={formData.kategori_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, kategori_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Tanpa Kategori</SelectItem>
                          {kategori.map((k) => (
                            <SelectItem key={k._id} value={k._id}>{k.nama}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="total_benar">Total Benar</Label>
                        <Input
                          id="total_benar"
                          type="number"
                          min="0"
                          value={formData.total_benar}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            total_benar: parseInt(e.target.value) || 0 
                          }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="total_pertanyaan">Total Pertanyaan</Label>
                        <Input
                          id="total_pertanyaan"
                          type="number"
                          min="1"
                          value={formData.total_pertanyaan}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            total_pertanyaan: parseInt(e.target.value) || 0 
                          }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Nilai Otomatis</Label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-2xl font-bold text-blue-600">
                          {calculateNilai(formData.total_benar, formData.total_pertanyaan)}%
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Dihitung dari {formData.total_benar}/{formData.total_pertanyaan} jawaban benar
                        </p>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Batal
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingSkor ? 'Perbarui' : 'Simpan'}
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
                  placeholder="Cari nama pengguna..."
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
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Skor</TableHead>
                    <TableHead>Persentase</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSkor.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm || filterKategori ? 'Tidak ada skor yang sesuai dengan filter' : 'Belum ada data skor'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSkor.map((item) => (
                      <TableRow key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {item.pengguna_id.nama[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{item.pengguna_id.nama}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.kategori_id ? (
                            <Badge variant="outline">{item.kategori_id.nama}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span className="font-mono">
                              {item.total_benar}/{item.total_pertanyaan}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            <span className="text-lg font-bold text-blue-600">
                              {item.persentase}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getNilaiBadge(item.persentase)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {format(new Date(item.dibuat_pada), 'dd MMM yyyy', { locale: id })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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
