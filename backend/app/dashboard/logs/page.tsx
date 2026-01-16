"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Activity, Search, Calendar, User, Database, Eye, Plus, Edit, Trash2, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import api from '@/lib/api';

interface LogGuru {
  _id: string;
  guru_id: {
    _id: string;
    nama: string;
  };
  pengguna_id?: {
    _id: string;
    nama: string;
  };
  aksi: string;
  tabel_terkait?: string;
  deskripsi?: string;
  dibuat_pada: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogGuru[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAksi, setFilterAksi] = useState('');
  const [filterTabel, setFilterTabel] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/logs');
      setLogs(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data log aktivitas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.guru_id.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.deskripsi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.pengguna_id?.nama.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAksi = filterAksi === '' || log.aksi === filterAksi;
    const matchesTabel = filterTabel === '' || log.tabel_terkait === filterTabel;
    
    return matchesSearch && matchesAksi && matchesTabel;
  });

  const getAksiBadge = (aksi: string) => {
    const aksiConfig = {
      LOGIN: { label: 'Login', variant: 'default' as const, icon: LogIn },
      INSERT: { label: 'Tambah', variant: 'default' as const, icon: Plus },
      UPDATE: { label: 'Edit', variant: 'secondary' as const, icon: Edit },
      DELETE: { label: 'Hapus', variant: 'destructive' as const, icon: Trash2 },
      VIEW: { label: 'Lihat', variant: 'outline' as const, icon: Eye }
    };
    
    const config = aksiConfig[aksi as keyof typeof aksiConfig] || aksiConfig.VIEW;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getTabelBadge = (tabel?: string) => {
    if (!tabel) return <span className="text-gray-400">-</span>;
    
    const tabelConfig = {
      pengguna: { label: 'Pengguna', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
      kategori: { label: 'Kategori', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
      pertanyaan: { label: 'Pertanyaan', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
      jawaban: { label: 'Jawaban', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
      skor: { label: 'Skor', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
      guru: { label: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    };
    
    const config = tabelConfig[tabel as keyof typeof tabelConfig];
    if (!config) return <Badge variant="outline">{tabel}</Badge>;
    
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const uniqueAksi = [...new Set(logs.map(log => log.aksi))];
  const uniqueTabel = [...new Set(logs.map(log => log.tabel_terkait).filter(Boolean))];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Log Aktivitas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor aktivitas admin dalam sistem
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2">
          <Activity className="h-4 w-4 mr-2" />
          {logs.length} aktivitas
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Riwayat Aktivitas
              </CardTitle>
              <CardDescription>
                Log semua aktivitas admin dalam sistem
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
                  placeholder="Cari admin, deskripsi, atau pengguna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterAksi} onValueChange={setFilterAksi}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter aksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Aksi</SelectItem>
                  {uniqueAksi.map((aksi) => (
                    <SelectItem key={aksi} value={aksi}>{aksi}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTabel} onValueChange={setFilterTabel}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter tabel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tabel</SelectItem>
                  {uniqueTabel.map((tabel) => (
                    <SelectItem key={tabel} value={tabel!}>{tabel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Tabel</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Pengguna Terkait</TableHead>
                    <TableHead>Waktu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm || filterAksi || filterTabel ? 'Tidak ada log yang sesuai dengan filter' : 'Belum ada data log aktivitas'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                {log.guru_id.nama[0].toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{log.guru_id.nama}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getAksiBadge(log.aksi)}
                        </TableCell>
                        <TableCell>
                          {getTabelBadge(log.tabel_terkait)}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="line-clamp-2 text-sm">
                            {log.deskripsi || '-'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {log.pengguna_id ? (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{log.pengguna_id.nama}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {format(new Date(log.dibuat_pada), 'dd MMM yyyy', { locale: id })}
                              </span>
                              <span className="text-xs">
                                {format(new Date(log.dibuat_pada), 'HH:mm:ss', { locale: id })}
                              </span>
                            </div>
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