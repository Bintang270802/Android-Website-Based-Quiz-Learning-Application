"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import api from '@/lib/api';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const router = useRouter();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login-admin', formData);
      const { token, guru } = response.data;

      // Simpan token dan data user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(guru));

      // Validasi token dengan permintaan sederhana ke API
      try {
        await api.get('/kategori'); // Coba akses endpoint yang memerlukan autentikasi
        
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${guru.nama}!`,
        });

        router.push('/dashboard');
      } catch (validationError) {
        console.error('Token validation error:', validationError);
        toast({
          title: "Login Gagal",
          description: "Terjadi kesalahan validasi token. Silakan coba lagi.",
          variant: "destructive",
        });
        
        // Hapus token dan data user jika validasi gagal
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error: any) {
      toast({
        title: "Login Gagal",
        description: error.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="hover:scale-110 transition-transform"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            Admin Panel
          </CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-300">
            Masuk ke panel admin quiz
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="nico@gmail.com"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              <strong>Admin Default:</strong><br />
              Email: nico@gmail.com<br />
              Password: nico
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}