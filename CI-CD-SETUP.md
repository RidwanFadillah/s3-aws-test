# 🚀 CI/CD Setup Quick Guide

## 📋 Checklist

### ✅ Prerequisites
- [ ] GitHub repository created
- [ ] EC2 instance running (Ubuntu)
- [ ] SSH key pair downloaded (.pem file)
- [ ] EC2 has IAM role with S3 access
- [ ] Security group allows port 22, 80

---

## 🔧 Step-by-Step Setup

### **1️⃣ Setup GitHub Secrets (5 menit)**

Buka: `https://github.com/RidwanFadillah/s3-aws-test/settings/secrets/actions`

Tambahkan 3 secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `EC2_HOST` | IP Public EC2 | `54.123.45.67` |
| `EC2_USERNAME` | Username SSH | `ubuntu` |
| `EC2_SSH_KEY` | Private key (.pem) | `-----BEGIN RSA...` |

**Cara get SSH key:**
```bash
# Windows
notepad C:\Users\YourName\.ssh\your-key.pem

# Copy semua termasuk:
-----BEGIN RSA PRIVATE KEY-----
...content...
-----END RSA PRIVATE KEY-----
```

---

### **2️⃣ Initial EC2 Setup (10 menit)**

SSH ke EC2 dan copy-paste commands ini:

```bash
# Update & Install
sudo apt update && sudo apt upgrade -y
sudo apt install git nginx -y

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# Install PM2
npm install pm2 -g

# Clone repo
cd ~
git clone https://github.com/RidwanFadillah/s3-aws-test.git
cd s3-aws-test
npm install

# Configure app
nano index.js
# Edit line 17-18:
# const YOUR_REGION = 'us-east-1';  // Your region
# const YOUR_BUCKET_NAME = 'your-bucket-name';

# Start with PM2
pm2 start index.js --name "s3-uploader"
pm2 save
pm2 startup
# Copy-paste command yang muncul, lalu run

# Make deploy script executable
chmod +x ~/s3-aws-test/deploy.sh
```

---

### **3️⃣ Configure Nginx (5 menit)**

```bash
# Edit nginx.conf
sudo nano /etc/nginx/nginx.conf
```

Tambahkan di dalam block `http { }`:
```nginx
client_max_body_size 100M;
```

```bash
# Edit default site
sudo nano /etc/nginx/sites-available/default
```

Ganti `location / { }` dengan:
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

Restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### **4️⃣ Test Deployment (2 menit)**

```bash
# Di komputer lokal
cd s3-aws-test
git add .
git commit -m "test: CI/CD setup"
git push origin main
```

**Cek di GitHub:**
1. Buka: `https://github.com/RidwanFadillah/s3-aws-test/actions`
2. Lihat workflow "Deploy to AWS EC2"
3. Tunggu ✅ hijau (success)

**Cek di browser:**
```
http://[EC2_PUBLIC_IP]
```

---

## 🎯 How It Works

```
Local → Push to GitHub → GitHub Actions → SSH to EC2 → Deploy
```

**Setiap `git push` akan:**
1. Trigger GitHub Actions
2. SSH ke EC2
3. Pull latest code
4. Install dependencies
5. Restart PM2
6. Application live!

---

## 🐛 Troubleshooting

### Deployment Failed?

**1. Check GitHub Actions:**
```
https://github.com/RidwanFadillah/s3-aws-test/actions
```
Klik workflow yang failed → Lihat error di logs

**2. Common Issues:**

| Error | Solution |
|-------|----------|
| `Permission denied (publickey)` | SSH key salah di GitHub Secrets |
| `Host key verification failed` | EC2_HOST salah |
| `pm2 not found` | PM2 belum diinstall di EC2 |
| `git pull failed` | Repository belum di-clone di EC2 |

**3. Manual Deploy (Fallback):**
```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@EC2_IP

cd ~/s3-aws-test
git pull origin main
npm install
pm2 restart s3-uploader
```

---

## 📊 Monitoring

**Check deployment status:**
```bash
# SSH to EC2
pm2 status
pm2 logs s3-uploader --lines 50
```

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log
```

---

## 🔄 Workflow

### Normal Development:
```bash
# 1. Make changes locally
nano views/index.ejs

# 2. Test locally
node index.js

# 3. Commit & Push
git add .
git commit -m "feat: new feature"
git push origin main

# 4. Auto-deploy! ✨
# Check: http://EC2_IP
```

### Manual Trigger (No Push):
1. Go to: `https://github.com/RidwanFadillah/s3-aws-test/actions`
2. Click "Deploy to AWS EC2"
3. Click "Run workflow"
4. Select branch `main`
5. Click "Run workflow"

---

## 📁 Files Created

```
.github/workflows/deploy.yml  # GitHub Actions workflow
deploy.sh                     # Deployment script (optional)
CI-CD-SETUP.md               # This guide
```

---

## ✅ Success Checklist

- [ ] GitHub Secrets configured (3 secrets)
- [ ] EC2 initial setup done
- [ ] Nginx configured
- [ ] First deployment successful (green ✅)
- [ ] Website accessible via `http://EC2_IP`
- [ ] PM2 running and auto-restart enabled

---

## 🎉 You're Done!

Sekarang setiap push ke GitHub akan otomatis deploy ke EC2!

**Next Steps:**
- Tambahkan fitur baru
- Push ke GitHub
- Watch the magic happen! ✨

---

## 📞 Support

**GitHub Actions Logs:**
```
https://github.com/RidwanFadillah/s3-aws-test/actions
```

**Helpful Commands:**
```bash
# Check PM2
pm2 status
pm2 logs s3-uploader

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check disk space
df -h

# Check memory
free -h

# Restart everything
pm2 restart s3-uploader
sudo systemctl restart nginx
```

---

**Happy Deploying! 🚀**
