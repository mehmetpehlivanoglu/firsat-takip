const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Gizli Anahtar (JWT Imzalama Icin)
const JWT_SECRET = 'firsat_takip_gizli_anahtar_123!';

// MONGODB BAĞLANTI LINKINIZ
const MONGODB_URI = 'mongodb+srv://mehmetpehlivanoglu0728_db_user:Kartal2652@cluster0.tvkww1d.mongodb.net/?appName=Cluster0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// --- OTURUM KONTROL MİDDLEWARE ---
const authKontrol = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Oturum açmanız gerekiyor.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.kullanici = decoded;
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.status(401).json({ error: 'Geçersiz oturum.' });
    }
};

// --- API ENDPOINTLERI ---

// 1. Kayıt Ol
app.post('/api/kayit', async (req, res) => {
    const { eposta, sifre } = req.body;
    if (!eposta || !sifre) return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });

    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('firsatDB');
        const kullanicilar = db.collection('kullanicilar');

        const mevcutKullanici = await kullanicilar.findOne({ eposta });
        if (mevcutKullanici) {
            return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        const hashliSifre = await bcrypt.hash(sifre, 10);
        await kullanicilar.insertOne({
            eposta,
            sifre: hashliSifre,
            isVIP: false, // Varsayılan olarak ücretsiz üye
            kayitTarihi: new Date()
        });

        res.json({ success: true, message: 'Kayıt başarılı! Giriş yapabilirsiniz.' });
    } catch (err) {
        res.status(500).json({ error: 'Kayıt sırasında hata oluştu: ' + err.message });
    } finally {
        await client.close();
    }
});

// 2. Giriş Yap
app.post('/api/giris', async (req, res) => {
    const { eposta, sifre } = req.body;
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('firsatDB');
        const kullanici = await db.collection('kullanicilar').findOne({ eposta });

        if (!kullanici) {
            return res.status(400).json({ error: 'E-posta veya şifre hatalı.' });
        }

        const sifreDogruMu = await bcrypt.compare(sifre, kullanici.sifre);
        if (!sifreDogruMu) {
            return res.status(400).json({ error: 'E-posta veya şifre hatalı.' });
        }

        const token = jwt.sign(
            { id: kullanici._id, eposta: kullanici.eposta, isVIP: kullanici.isVIP },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ success: true, isVIP: kullanici.isVIP, eposta: kullanici.eposta });
    } catch (err) {
        res.status(500).json({ error: 'Giriş hatası: ' + err.message });
    } finally {
        await client.close();
    }
});

// 3. Çıkış Yap
app.get('/api/cikis', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});

// 4. Mevcut Kullanıcı Bilgisi
app.get('/api/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ loggedIn: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ loggedIn: true, eposta: decoded.eposta, isVIP: decoded.isVIP });
    } catch (err) {
        res.json({ loggedIn: false });
    }
});

// 5. Fırsatları Getir
app.get('/api/firsatlar', async (req, res) => {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('firsatDB');
        const firsatlar = await db.collection('urunler')
                                 .find({})
                                 .sort({ eklenmeTarihi: -1 })
                                 .limit(30)
                                 .toArray();
        res.json(firsatlar);
    } catch (error) {
        res.status(500).json({ error: 'Veriler çekilemedi: ' + error.message });
    } finally {
        await client.close();
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Sunucu çalışıyor: http://localhost:${PORT}`);
});