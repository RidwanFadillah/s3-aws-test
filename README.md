# 📦 CloudBox - S3 Storage Manager

Aplikasi cloud storage modern yang memungkinkan pengguna untuk mengunggah, melihat, dan mengelola file di Amazon S3 dengan antarmuka yang menarik dan fitur-fitur canggih.

![Screenshot Aplikasi](./assets/view.png)

---

## 🌟 Fitur Utama

### **Core Features**
* 📤 **Multiple Upload:** Upload hingga 10 file sekaligus dengan drag & drop
* 🔍 **Smart Search:** Real-time search dan filter berdasarkan tipe file
* 🎯 **Advanced Sort:** Sort berdasarkan nama, ukuran, atau tanggal
* 🗑️ **Delete Files:** Hapus file dengan konfirmasi
* 🌙 **Dark Mode:** Toggle antara light/dark theme dengan persistensi

### **Visual Features**
* 🖼️ **Image Preview:** Thumbnail otomatis untuk gambar
* 🔎 **Lightbox Modal:** Klik gambar untuk view fullscreen
* 🎨 **Colored Badges:** 10 jenis badge gradient untuk tipe file berbeda
* ✨ **Smooth Animations:** Hover effects, transitions, dan micro-interactions
* 📊 **Statistics Dashboard:** Total files, size, dan image count

### **Interactive Features**
* 🔗 **Copy Link:** Copy file URL ke clipboard dengan satu klik
* 📥 **Download Button:** Download file langsung
* 🔔 **Toast Notifications:** Feedback real-time untuk setiap aksi
* 🎊 **Confetti Animation:** Celebrasi saat upload sukses!
* 💬 **Welcome Message:** Greeting untuk first-time visitors

### **Developer Features**
* 🚀 **CI/CD Pipeline:** Auto-deploy ke EC2 via GitHub Actions
* 🔄 **PM2 Process Manager:** Zero-downtime deployments
* 📦 **Modular Code:** Clean architecture

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express.js v5 |
| **Frontend** | EJS Templates |
| **Styling** | Tailwind CSS, Custom CSS Animations |
| **Storage** | Amazon S3 (AWS SDK v3) |
| **Hosting** | Amazon EC2 (Ubuntu) |
| **Web Server** | Nginx (Reverse Proxy) |
| **Process Manager** | PM2 |
| **CI/CD** | GitHub Actions |
| **Libraries** | Font Awesome, Canvas Confetti, Multer |

---

## 🚀 CI/CD Pipeline Setup

### **Prerequisites**

1. **GitHub Repository** (sudah ada ✅)
2. **EC2 Instance** dengan:
   - Ubuntu 20.04+
   - Node.js (via nvm)
   - PM2
   - Nginx
   - Git
3. **SSH Key Pair** untuk akses EC2

---

### **Step 1: Setup GitHub Secrets**

Tambahkan secrets di GitHub Repository Settings:

1. Buka: `https://github.com/RidwanFadillah/s3-aws-test/settings/secrets/actions`
2. Klik **"New repository secret"**
3. Tambahkan 3 secrets berikut:

#### **Secret 1: EC2_HOST**
```
Name: EC2_HOST
Value: 52.12.34.56  # Ganti dengan IP Public EC2 Anda
```

#### **Secret 2: EC2_USERNAME**
```
Name: EC2_USERNAME
Value: ubuntu  # Default untuk Ubuntu AMI
```

#### **Secret 3: EC2_SSH_KEY**
```
Name: EC2_SSH_KEY
Value: (paste isi private key Anda)
```

**Cara get private key:**
```bash
# Di komputer lokal (Windows)
notepad C:\Users\YourUser\.ssh\your-key.pem

# Copy semua isinya termasuk:
-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----
```

---

### **Step 2: Persiapan EC2 (One-Time Setup)**

SSH ke EC2 Anda dan jalankan:

```bash
# 1. Update sistem
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
sudo apt install git nginx -y

# 3. Install Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# 4. Install PM2
npm install pm2 -g

# 5. Clone repository (pertama kali)
cd ~
git clone https://github.com/RidwanFadillah/s3-aws-test.git
cd s3-aws-test

# 6. Install dependencies
npm install

# 7. Configure region & bucket di index.js
nano index.js
# Edit YOUR_REGION dan YOUR_BUCKET_NAME

# 8. Start aplikasi dengan PM2
pm2 start index.js --name "s3-uploader"
pm2 save
pm2 startup  # Follow instructions

# 9. Configure Nginx
sudo nano /etc/nginx/nginx.conf
# Tambahkan di dalam http { }:
#   client_max_body_size 100M;

sudo nano /etc/nginx/sites-available/default
# Edit location / menjadi:
#   location / {
#       proxy_pass http://localhost:3000;
#       proxy_http_version 1.1;
#       proxy_set_header Upgrade $http_upgrade;
#       proxy_set_header Connection 'upgrade';
#       proxy_set_header Host $host;
#       proxy_cache_bypass $http_upgrade;
#   }

# 10. Restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# 11. Make deploy script executable
chmod +x ~/s3-aws-test/deploy.sh
```

---

### **Step 3: Testing CI/CD**

Sekarang setiap kali Anda push ke GitHub, aplikasi akan auto-deploy!

```bash
# Di komputer lokal
git add .
git commit -m "feat: add awesome feature"
git push origin main

# ✅ GitHub Actions akan otomatis:
# 1. Checkout code
# 2. SSH ke EC2
# 3. Git pull latest code
# 4. Install dependencies
# 5. Restart PM2
# 6. Verify deployment
```

**Cek deployment status:**
- Buka: `https://github.com/RidwanFadillah/s3-aws-test/actions`
- Lihat workflow "Deploy to AWS EC2"
- Hijau ✅ = Success
- Merah ❌ = Failed (lihat logs untuk debug)

---

### **Step 4: Manual Deployment (Optional)**

Jika butuh deploy manual tanpa push:

1. Buka: `https://github.com/RidwanFadillah/s3-aws-test/actions`
2. Klik workflow **"Deploy to AWS EC2"**
3. Klik **"Run workflow"**
4. Pilih branch `main`
5. Klik **"Run workflow"**

---

## 🖥️ Pengembangan Lokal

### **Setup Environment**

1. **Clone repository:**
   ```bash
   git clone https://github.com/RidwanFadillah/s3-aws-test.git
   cd s3-aws-test/
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure AWS Credentials:**
   Edit `index.js`:
   ```javascript
   // Comment EC2 config
   // const s3Client = new S3Client({ region: YOUR_REGION });

   // Uncomment local config
   const s3Client = new S3Client({
       region: 'us-east-1',  // Your region
       credentials: {
           accessKeyId: 'YOUR_ACCESS_KEY_ID',
           secretAccessKey: 'YOUR_SECRET_ACCESS_KEY'
       }
   });

   const YOUR_REGION = 'us-east-1';
   const YOUR_BUCKET_NAME = 'your-bucket-name';
   ```

4. **Run server:**
   ```bash
   node index.js
   ```

5. **Open browser:**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
s3-aws-test/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD workflow
├── assets/
│   └── 1.png                   # Screenshot
├── views/
│   └── index.ejs               # Main template
├── node_modules/
├── index.js                    # Express server
├── deploy.sh                   # Deployment script
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

---

## 🔧 Configuration

### **AWS IAM Role (EC2)**
EC2 instance harus punya IAM role dengan policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### **AWS Security Group**
| Port | Protocol | Source | Description |
|------|----------|--------|-------------|
| 22 | TCP | Your IP | SSH |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS (optional) |

---

## 🐛 Troubleshooting

### **Deployment Failed?**

1. **Check GitHub Actions logs:**
   ```
   https://github.com/RidwanFadillah/s3-aws-test/actions
   ```

2. **SSH to EC2 and check logs:**
   ```bash
   pm2 logs s3-uploader
   ```

3. **Restart PM2 manually:**
   ```bash
   cd ~/s3-aws-test
   git pull origin main
   npm install
   pm2 restart s3-uploader
   ```

### **Can't access website?**

1. **Check Nginx:**
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

2. **Check PM2:**
   ```bash
   pm2 status
   pm2 logs s3-uploader --lines 50
   ```

3. **Check EC2 Security Group:** Port 80 harus terbuka

---

## 📊 Monitoring

### **Check Application Status**
```bash
# PM2 status
pm2 status

# PM2 logs
pm2 logs s3-uploader --lines 100

# PM2 monitoring
pm2 monit

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🚀 Deployment Workflow

```
┌─────────────┐
│ Local Dev   │
└──────┬──────┘
       │ git push
       ▼
┌─────────────┐
│   GitHub    │ ◄── Code Repository
└──────┬──────┘
       │ trigger
       ▼
┌─────────────┐
│GitHub Actions│ ◄── CI/CD Pipeline
└──────┬──────┘
       │ SSH deploy
       ▼
┌─────────────┐
│   AWS EC2   │ ◄── Production Server
│   + Nginx   │
│   + PM2     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   AWS S3    │ ◄── File Storage
└─────────────┘
```

---

## 📝 Development Workflow

1. **Local development:**
   ```bash
   # Make changes
   git add .
   git commit -m "feat: awesome feature"
   ```

2. **Test locally:**
   ```bash
   node index.js
   # Open http://localhost:3000
   ```

3. **Deploy:**
   ```bash
   git push origin main
   # CI/CD automatically deploys to EC2
   ```

4. **Verify:**
   ```
   http://[EC2_PUBLIC_IP]
   ```

---

## 🎨 Features Showcase

### **10 File Type Badges:**
- 🔵 Images (jpg, png, gif, webp, svg)
- 🔴 PDF
- 📘 Word (doc, docx)
- 📗 Excel (xls, xlsx)
- 🟠 PowerPoint (ppt, pptx)
- 🟣 Video (mp4, avi, mov)
- 🌸 Audio (mp3, wav, flac)
- 🟡 Archive (zip, rar, 7z)
- 🔷 Code (js, html, css, py, java, cpp)
- ⚪ Default (other files)

### **Animations:**
- ✨ Slide-in cards
- 🎪 Bounce buttons
- 💫 Pulse logo
- 🔍 Hover zoom
- 🎊 Confetti on success
- 🌊 Smooth transitions

---

## 📜 License

ISC

---

## 👤 Author

**Ridwan Fadillah**
- GitHub: [@RidwanFadillah](https://github.com/RidwanFadillah)

---

## 🙏 Acknowledgments

- AWS SDK Team
- Tailwind CSS
- Font Awesome
- Canvas Confetti Library
- Express.js Community

---

## 🔥 Live Demo

Access the live application at:
```
http://[YOUR_EC2_PUBLIC_IP]
```

---

**Built with ❤️ using Node.js, AWS S3, and modern web technologies**
