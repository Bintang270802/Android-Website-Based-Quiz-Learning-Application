import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, Kategori, Pertanyaan, JawabanResponse, Skor } from '@/types/api';

class QuizAPI {
  private baseURL = 'http://192.168.1.3:5000/api'; // Sesuaikan dengan IP server Anda

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token');
  }

  async getUser() {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async loginUser(nama: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: LoginResponse = await response.json();
      if (data.token) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.pengguna));
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Perbaiki method ini di class QuizAPI
  private getFullImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    // Hapus /api dari path jika path dimulai dengan /uploads
    if (path.startsWith('/uploads')) {
      return `${this.baseURL.replace('/api', '')}${path}`;
    }
    
    return `${this.baseURL}${path}`;
  }
  
  async getKategori(): Promise<Kategori[]> {
    try {
      const token = await this.getToken();
      const response = await fetch(`${this.baseURL}/kategori/user`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Ubah URL gambar menjadi URL lengkap
      return data.map((kategori: Kategori) => ({
        ...kategori,
        url_gambar: this.getFullImageUrl(kategori.url_gambar)
      }));
    } catch (error) {
      console.error('Get kategori error:', error);
      throw error;
    }
  }

  async getPertanyaan(kategoriId: string): Promise<Pertanyaan[]> {
    try {
      const token = await this.getToken();
      // Ubah endpoint dari /pertanyaan menjadi /pertanyaan/user
      const response = await fetch(`${this.baseURL}/pertanyaan/user?kategori_id=${kategoriId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Ubah URL gambar menjadi URL lengkap
      return data.map((pertanyaan: Pertanyaan) => ({
        ...pertanyaan,
        url_gambar: this.getFullImageUrl(pertanyaan.url_gambar || '')
      }));
    } catch (error) {
      console.error('Get pertanyaan error:', error);
      throw error;
    }
  }

  async submitJawaban(penggunaId: string, pertanyaanId: string, pilihanDipilih: string): Promise<JawabanResponse> {
    try {
      const token = await this.getToken();
      const response = await fetch(`${this.baseURL}/jawaban/submit`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pengguna_id: penggunaId,
          pertanyaan_id: pertanyaanId,
          pilihan_dipilih: pilihanDipilih
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Submit jawaban error:', error);
      throw error;
    }
  }

  async getSkor(): Promise<Skor[]> {
    try {
      const token = await this.getToken();
      const response = await fetch(`${this.baseURL}/skor/user`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get skor error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  }
}

export const quizAPI = new QuizAPI();