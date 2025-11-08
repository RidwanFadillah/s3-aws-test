# 📦 Aplikasi S3 File Uploader (Node.js & EC2)

Aplikasi web sederhana ini memungkinkan pengguna untuk mengunggah, melihat, dan menghapus file dari bucket Amazon S3.

[cite_start]Proyek ini dibuat untuk memenuhi tugas [cite: 119-123] [cite_start]yang membutuhkan aplikasi web yang di-hosting di **Amazon EC2** [cite: 121] [cite_start]dan menggunakan **Amazon S3** untuk penyimpanan file[cite: 121].

![](https://placeholder.com/url-to-your-screenshot)

---

## 🚀 Fitur Utama

* **Upload File:** Mengunggah file dengan aman ke bucket S3.
* **Lihat File:** Menampilkan semua file yang ada di bucket sebagai daftar yang bisa diklik.
* **Hapus File:** Menghapus file dari bucket dengan konfirmasi.
* **UI Modern:** Antarmuka yang bersih dan responsif menggunakan **Tailwind CSS**.
* **Notifikasi:** Pesan *flash* (alert) untuk status sukses atau error.

## ⚙️ Tumpukan Teknologi (Tech Stack)

* **Backend:** Node.js, Express.js
* **Frontend:** EJS (Embedded JavaScript)
* **Styling:** Tailwind CSS (via CDN)
* **Penyimpanan:** Amazon S3 (menggunakan AWS SDK v3)
* **Hosting:** Amazon EC2 (Ubuntu)
* **Server:** Nginx (sebagai Reverse Proxy)
* **Manajemen Proses:** PM2

---

## Deploy ke Produksi (EC2)

[cite_start]Ini adalah langkah-langkah yang diambil untuk men-deploy aplikasi ini di server produksi (sesuai laporan tugas ).

### 1. Persiapan AWS

1.  **Luncurkan Instance EC2:** Menggunakan AMI Ubuntu.
2.  **Buat IAM Role:** Membuat role baru di IAM (misal: `EC2-S3-Access-Role`) dengan *policy* `AmazonS3FullAccess`.
3.  **Pasang Role ke EC2:** Memasang *role* tersebut ke instance EC2 agar aplikasi memiliki izin ke S3 tanpa *access key*.
4.  **Konfigurasi Security Group:** Membuka port:
    * `SSH (22)`: Untuk me-remote server.
    * `HTTP (80)`: Untuk lalu lintas web Nginx.
    * (Port `3000` ditutup untuk publik demi keamanan).

### 2. Persiapan Server (Ubuntu)

1.  **Update Server:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
2.  **Install Kebutuhan:**
    ```bash
    sudo apt install git nginx -y
    ```
3.  **Install Node.js (via nvm):**
    ```bash
    curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh) | bash
    source ~/.bashrc
    nvm install --lts
    ```
4.  **Install PM2:**
    ```bash
    sudo npm install pm2 -g
    ```

### 3. Deploy Aplikasi

1.  **Clone Repositori:**
    ```bash
    git clone https://github.com/RidwanFadillah/s3-aws-test.git
    cd s3-aws-test/
    ```
2.  **Install Dependensi:**
    ```bash
    npm install
    ```
3.  **Konfigurasi Aplikasi:**
    * Mengedit `index.js`.
    * Memastikan bagian `s3Client` untuk EC2 (yang hanya menggunakan `region`) aktif.
    * Memastikan bagian `s3Client` untuk Lokal (yang menggunakan *access key*) sudah diberi komentar.
    * Mengisi variabel `YOUR_REGION` dan `YOUR_BUCKET_NAME` dengan benar.
4.  **Jalankan dengan PM2:**
    ```bash
    pm2 start index.js --name "s3-uploader"
    ```

### 4. Konfigurasi Nginx (Reverse Proxy)

1.  **Mengatur Batas Upload:**
    * Mengedit `/etc/nginx/nginx.conf`.
    * Menambahkan `client_max_body_size 100M;` di dalam blok `http { ... }`.
2.  **Mengatur Reverse Proxy:**
    * Mengedit `/etc/nginx/sites-available/default`.
    * Mengubah isi `location / { ... }` menjadi:
        ```nginx
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
        ```
3.  **Restart Nginx:**
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```
4.  **Selesai!** Aplikasi dapat diakses melalui IP publik EC2 di `http://[IP_PUBLIK_EC2]`.

---

## 🖥️ Pengembangan Lokal

Untuk menjalankan aplikasi ini di komputer lokal (bukan di EC2):

1.  **Clone repositori:**
    ```bash
    git clone [URL_GITHUB_ANDA]
    cd [nama-folder-proyek]
    ```
2.  **Install dependensi:**
    ```bash
    npm install
    ```
3.  **Konfigurasi `index.js`:**
    * Beri komentar pada `s3Client` untuk EC2.
    * Aktifkan (uncomment) `s3Client` untuk lokal.
    * Isi `YOUR_ACCESS_KEY_ID`, `YOUR_SECRET_ACCESS_KEY`, `YOUR_REGION`, dan `YOUR_BUCKET_NAME` dengan kredensial IAM Anda.
4.  **Jalankan server:**
    ```bash
    node index.js
    ```
5.  Buka `http://localhost:3000` di browser Anda.
