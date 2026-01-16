"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FolderOpen, MessageSquare, BarChart3 } from 'lucide-react';
import api from '@/lib/api';

interface Stats {
  totalPengguna: number;
  totalKategori: number;
  totalPertanyaan: number;
  totalJawaban: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalPengguna: 0,
    totalKategori: 0,
    totalPertanyaan: 0,
    totalJawaban: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [penggunaRes, kategoriRes, pertanyaanRes, jawabanRes] = await Promise.all([
        api.get('/pengguna'),
        api.get('/kategori'),
        api.get('/pertanyaan'),
        api.get('/jawaban'),
      ]);

      setStats({
        totalPengguna: penggunaRes.data.length,
        totalKategori: kategoriRes.data.length,
        totalPertanyaan: pertanyaanRes.data.length,
        totalJawaban: jawabanRes.data.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Pengguna',
      value: stats.totalPengguna,
      description: 'Pengguna terdaftar',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Kategori',
      value: stats.totalKategori,
      description: 'Kategori quiz',
      icon: FolderOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Total Pertanyaan',
      value: stats.totalPertanyaan,
      description: 'Pertanyaan tersedia',
      icon: MessageSquare,
      color: 'bg-yellow-500',
    },
    {
      title: 'Total Jawaban',
      value: stats.totalJawaban,
      description: 'Jawaban pengguna',
      icon: BarChart3,
      color: 'bg-purple-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Ringkasan data sistem quiz
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value.toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Selamat Datang di Panel Admin</CardTitle>
            <CardDescription>
              Panel admin untuk mengelola sistem quiz online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Fitur Utama
                </h3>
                <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-300">
                  <li>• Kelola data pengguna dan guru</li>
                  <li>• Buat dan atur kategori quiz</li>
                  <li>• Tambah dan edit pertanyaan</li>
                  <li>• Monitor jawaban dan skor</li>
                  <li>• Lihat log aktivitas sistem</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tips Penggunaan</CardTitle>
            <CardDescription>
              Panduan singkat untuk menggunakan panel admin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Langkah Awal
                </h3>
                <ol className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                  <li>1. Buat kategori quiz terlebih dahulu</li>
                  <li>2. Tambahkan pertanyaan ke kategori</li>
                  <li>3. Monitor aktivitas pengguna</li>
                  <li>4. Review dan koreksi jawaban</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}