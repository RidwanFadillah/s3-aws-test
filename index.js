const express = require('express');
const multer = require('multer');
const path = require('path');

// **BARU**: Impor DeleteObjectCommand
const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const session = require('express-session');
const flash = require('connect-flash');

const app = express();
const port = 3000;

// --- ⚠️ Kredensial Anda ---
// const YOUR_ACCESS_KEY_ID = '';
// const YOUR_SECRET_ACCESS_KEY = '';
// const YOUR_REGION = '';
// const YOUR_BUCKET_NAME = '';
// ------------------------------------------

// uncomment untuk menjalankan 
// const s3Client = new S3Client({
//     region: YOUR_REGION,
//     credentials: {
//         accessKeyId: YOUR_ACCESS_KEY_ID,
//         secretAccessKey: YOUR_SECRET_ACCESS_KEY
//     }
// });

const s3Client = new S3Client({
    region: YOUR_REGION
});

const upload = multer({
    storage: multer.memoryStorage()
});

// **BARU**: Tambahkan ini untuk membaca data dari form (untuk delete)
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
    secret: 'ini-adalah-rahasia-anda',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Rute GET (halaman utama) - Tidak berubah
app.get('/', async (req, res) => {
    const params = {
        Bucket: YOUR_BUCKET_NAME
    };
    const command = new ListObjectsV2Command(params);

    try {
        const data = await s3Client.send(command);
        res.render('index', { 
            files: data.Contents || [],
            bucket: YOUR_BUCKET_NAME,
            region: YOUR_REGION,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (err) {
        console.error('Error mengambil daftar S3:', err);
        req.flash('error', 'Gagal mengambil daftar file dari S3.');
        res.render('index', { 
            files: [], 
            bucket: YOUR_BUCKET_NAME, 
            region: YOUR_REGION,
            messages: { success: [], error: req.flash('error') }
        });
    }
});

// Rute POST (upload) - Tidak berubah
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        req.flash('error', 'Tidak ada file yang dipilih untuk di-upload.');
        return res.redirect('/');
    }
    const params = {
        Bucket: YOUR_BUCKET_NAME,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
    };
    try {
        const upload = new Upload({
            client: s3Client,
            params: params
        });
        await upload.done();
        req.flash('success', `File "${req.file.originalname}" berhasil di-upload!`);
    } catch (err) {
        console.error('Error mengunggah ke S3:', err);
        req.flash('error', `Gagal mengunggah file: ${err.message}`);
    }
    res.redirect('/');
});

// **RUTE BARU**: Endpoint untuk menangani DELETE
app.post('/delete', async (req, res) => {
    // Ambil 'fileKey' dari body form (dari input hidden)
    const { fileKey } = req.body;

    if (!fileKey) {
        req.flash('error', 'Gagal menghapus: Key file tidak ditemukan.');
        return res.redirect('/');
    }

    const params = {
        Bucket: YOUR_BUCKET_NAME,
        Key: fileKey // Nama file yang ingin dihapus
    };

    const command = new DeleteObjectCommand(params);

    try {
        await s3Client.send(command);
        req.flash('success', `File "${fileKey}" berhasil dihapus.`);
    } catch (err) {
        console.error('Error menghapus file S3:', err);
        req.flash('error', `Gagal menghapus file: ${err.message}`);
    }

    res.redirect('/');
});


app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});