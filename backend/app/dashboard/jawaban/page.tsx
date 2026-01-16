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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckSquare, Search, Calendar, User, CheckCircle, XCircle, Edit } from 'lucide-react';
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

interface Jawaban {
  _id: string;
  pengguna_id: {
    _id: string;
    nama: string;
  };
  pertanyaan_id: {
    _id: string;
    teks_pertanyaan: string;
    pilihan_benar: string;
  };
  pilihan_dipilih: string;
  benar: boolean;
  dikoreksi_oleh?: {
    _id: string;
    nama: string;
  };
  dibuat_pada: string;
}

export default function JawabanPage() {
  const [jawaban, setJawaban] = useState<Jawaban[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedJawaban, setSelectedJawaban] = useState<Jawaban | null>(null);
  const [isKoreksiOpen, setIsKoreksiOpen] = useState(false);
  const [koreksiBenar, setKoreksiBenar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchJawaban();
  }, []);

  const fetchJawaban = async () => {
    try {
      const response = await api.get('/jawaban');
      setJawaban(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data jawaban",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKoreksi = async () => {
    if (!selectedJawaban) return;

    try {
      await api.put(`/jawaban/${selectedJawaban._id}/koreksi`, {
        benar: koreksiBenar
      });
      
      setJawaban(prev => prev.map(j => 
        j._id === selectedJawaban._id 
          ? { ...j, benar: koreksiBenar, dikoreksi_oleh: { _id: 'current', nama: 'Admin' } }
          : j
      ));
      
      toast({
        title: "Berhasil",
        description: "Jawaban berhasil dikoreksi",
      });
      
      setIsKoreksiOpen(false);
      setSelectedJawaban(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengoreksi jawaban",
        variant: "destructive",
      });
    }
  };

  const openKoreksi = (jawaban: Jawaban) => {
    setSelectedJawaban(jawaban);
    setKoreksiBenar(jawaban.benar);
    setIsKoreksiOpen(true);
  };

  const filteredJawaban = jawaban.filter(j => {
    const matchesSearch = 
      (j.pengguna_id?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (j.pertanyaan_id?.teks_pertanyaan?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    
    const matchesStatus = filterStatus === '' || 
      (filterStatus === 'benar' && j.benar) ||
      (filterStatus === 'salah' && !j.benar);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (benar: boolean) => {
    return benar ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Benar
      </Badge>
    ) : (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Salah
      </Badge>
    );
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Jawaban</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Kelola dan koreksi jawaban pengguna
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <CheckSquare className="h-4 w-4 mr-2" />
          {jawaban.length} jawaban
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Daftar Jawaban
              </CardTitle>
              <CardDescription>
                Data jawaban pengguna yang perlu dikoreksi
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari pengguna atau pertanyaan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="benar">Benar</SelectItem>
                  <SelectItem value="salah">Salah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Pertanyaan</TableHead>
                    <TableHead>Pilihan</TableHead>
                    <TableHead>Jawaban Benar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJawaban.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        {searchTerm || filterStatus ? 'Tidak ada jawaban yang sesuai dengan filter' : 'Belum ada data jawaban'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJawaban.map((item) => (
                      <TableRow key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {item.pengguna_id?.nama?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <span className="font-medium">{item.pengguna_id?.nama || 'Pengguna tidak diketahui'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="line-clamp-2 text-sm">{item.pertanyaan_id.teks_pertanyaan}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {item.pilihan_dipilih}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {item.pertanyaan_id && item.pertanyaan_id.pilihan_benar ? item.pertanyaan_id.pilihan_benar : '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item.benar)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {format(new Date(item.dibuat_pada), 'dd MMM yyyy, HH:mm', { locale: id })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openKoreksi(item)}
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

      {/* Dialog Koreksi */}
      <Dialog open={isKoreksiOpen} onOpenChange={setIsKoreksiOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Koreksi Jawaban</DialogTitle>
            <DialogDescription>
              Koreksi jawaban dari {selectedJawaban?.pengguna_id?.nama || 'Pengguna tidak diketahui'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedJawaban && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium mb-2">Pertanyaan:</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {selectedJawaban.pertanyaan_id?.teks_pertanyaan || 'Pertanyaan tidak tersedia'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pilihan Pengguna:</p>
                  <Badge variant="outline" className="mt-1 font-mono">
                    {selectedJawaban.pilihan_dipilih}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jawaban Benar:</p>
                  <Badge variant="outline" className="mt-1 font-mono bg-green-50 text-green-700">
                    {selectedJawaban.pertanyaan_id && selectedJawaban.pertanyaan_id.pilihan_benar ? selectedJawaban.pertanyaan_id.pilihan_benar : '-'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Status Koreksi:</p>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="koreksi"
                      checked={koreksiBenar === true}
                      onChange={() => setKoreksiBenar(true)}
                      className="text-green-600"
                    />
                    <span className="text-sm">Benar</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="koreksi"
                      checked={koreksiBenar === false}
                      onChange={() => setKoreksiBenar(false)}
                      className="text-red-600"
                    />
                    <span className="text-sm">Salah</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsKoreksiOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleKoreksi} className="bg-blue-600 hover:bg-blue-700">
              Simpan Koreksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}