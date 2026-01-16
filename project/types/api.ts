export interface User {
  id: string;
  nama: string;
}

export interface LoginResponse {
  token: string;
  pengguna: User;
}

export interface Kategori {
  _id: string;
  nama: string;
  url_gambar: string;
  dibuat_pada: string;
}

export interface Pertanyaan {
  _id: string;
  teks_pertanyaan: string;
  pilihan_a: string;
  pilihan_b: string;
  pilihan_c: string;
  pilihan_benar: string;
  url_gambar?: string;
  status: string;
}

export interface JawabanResponse {
  _id: string;
  pengguna_id: string;
  pertanyaan_id: string;
  pilihan_dipilih: string;
  benar: boolean;
  dibuat_pada: string;
}

export interface Skor {
  _id: string;
  pengguna_id: string;
  nama_pengguna: string;
  total_benar: number;
  total_salah: number;
  total_pertanyaan: number;
  persentase: number;
  dibuat_pada: string;
}
