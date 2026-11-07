AUDIT SINKRONISASI TOKO SIAP ANTAR

Perubahan yang diterapkan pada paket ini:
1) ewallet-admin.html: sebelum membaca saldo dan antrean, sekarang wajib memverifikasi users/{uid} dengan role=admin, status=aktif, aktif=true. Akun bukan admin tidak lagi memuat antrean atau saldo.
2) daftar-produk-mitra.html: akses pengelolaan produk dibatasi ke role mitra_usaha/mitra dan akun berstatus aktif serta aktif=true. Akun menunggu verifikasi tidak dapat menulis produk.

Temuan integrasi yang belum dapat dinyatakan selesai hanya dari 10 file:
- Banyak tautan navigasi menuju file yang tidak termasuk unggahan (mis. profil.html, index.html, admin-dashboard-rapi-v2.html/v3, riwayat.html, keranjang.html, semua-pesanan-admin*.html, verifikasi-pencairan.html, keuangan-admin.html, pengaturan-admin.html). Perlu file-file tersebut untuk memastikan navigasi end-to-end.
- Dashboard konter membaca Google Sheets CSV terpisah, bukan sumber Firestore transaksi; rekap ini belum sinkron dengan orders.
- Checkout membuat dokumen orders per mitra, tetapi status fulfillment/settlement perlu halaman mitra, kurir, riwayat, dan rules Firestore yang cocok untuk verifikasi end-to-end.
- Registrasi mitra/kurir menyimpan status menunggu_verifikasi dan aktif=false; admin pages harus konsisten mengubah status/status aktif serta role. Produk kini memblokir sebelum status aktif.
- E-wallet menggunakan collections ewallet_topups, ewallet_withdrawals, admin_saldo; rules dan halaman pelanggan/mitra yang mengajukan top-up/pencairan tidak ikut tersedia untuk audit.

Pemeriksaan statis:
- Script module dari 10 file asli lolos node --check sebelum perubahan.
- Perubahan di atas bersifat guard sisi-klien. Keamanan sesungguhnya tetap harus ditegakkan di Firebase Firestore Security Rules dan Cloud Functions; HTML tidak bisa menjadi kontrol keamanan utama.
- Belum dilakukan pengujian Firebase live karena tidak tersedia akses proyek/rules/runtime.
