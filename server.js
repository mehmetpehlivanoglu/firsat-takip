const express = require('express');
const session = require('express-session');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = 'mongodb+srv://mehmetpehlivanoglu0728_db_user:Kartal2652@cluster0.tvkww1d.mongodb.net/?appName=Cluster0';
let client;

async function baglan() {
    if (!client) {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'gizli-anahtar-cok-gizli',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Kayıt Ol
app.post('/api/kayit', async (req, res) => {
    const { eposta, sifre } = req.body;
    try {
        await baglan();
        const db = client.db('firsatDB');
        const kullanicilar = db.collection('kullanicilar');

        const varMi = await kullanicilar.findOne({ eposta });
        if (varMi) {
            return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı!' });
        }

        await kullanicilar.insertOne({
            eposta,
            sifre,
            isVIP: false,
            favoriler: [],
            kayitTarihi: new Date()
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Kayıt olurken hata oluştu.' });
    }
});

// Giriş Yap
app.post('/api/giris', async (req, res) => {
    const { eposta, sifre } = req.body;
    try {
        await baglan();
        const db = client.db('firsatDB');
        const kullanicilar = db.collection('kullanicilar');

        const kullanici = await kullanicilar.findOne({ eposta, sifre });
        if (!kullanici) {
            return res.status(400).json({ error: 'E-posta veya şifre hatalı!' });
        }

        req.session.kullaniciId = kullanici._id.toString();
        req.session.eposta = kullanici.eposta;
        req.session.isVIP = kullanici.isVIP || false;

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Giriş yapılırken hata oluştu.' });
    }
});

// Oturum Bilgisi (/api/me) - Favoriler dahil
app.get('/api/me', async (req, res) => {
    if (!req.session.kullaniciId) {
        return res.json({ loggedIn: false });
    }
    try {
        await baglan();
        const db = client.db('firsatDB');
        const kullanici = await db.collection('kullanicilar').findOne({ _id: new ObjectId(req.session.kullaniciId) });

        res.json({
            loggedIn: true,
            eposta: req.session.eposta,
            isVIP: req.session.isVIP,
            favoriler: kullanici ? (kullanici.favoriler || []) : []
        });
    } catch (err) {
        res.json({ loggedIn: false });
    }
});

// Çıkış Yap
app.get('/api/cikis', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// Fırsatları Getir
app.get('/api/firsatlar', async (req, res) => {
    try {
        await baglan();
        const db = client.db('firsatDB');
        const urunler = await db.collection('urunler').find({}).toArray();
        res.json(urunler);
    } catch (err) {
        res.status(500).json({ error: 'Fırsatlar yüklenemedi.' });
    }
});

// Favoriye Ekle / Çıkar
app.post('/api/favori', async (req, res) => {
    if (!req.session.kullaniciId) {
        return res.status(401).json({ error: 'Lütfen önce giriş yapın.' });
    }

    const { urunId } = req.body;
    const kullaniciId = req.session.kullaniciId;

    try {
        await baglan();
        const db = client.db('firsatDB');
        const kullanicilar = db.collection('kullanicilar');

        const kullanici = await kullanicilar.findOne({ _id: new ObjectId(kullaniciId) });
        let favoriler = kullanici.favoriler || [];

        if (favoriler.includes(urunId)) {
            favoriler = favoriler.filter(id => id !== urunId);
        } else {
            favoriler.push(urunId);
        }

        await kullanicilar.updateOne(
            { _id: new ObjectId(kullaniciId) },
            { $set: { favoriler: favoriler } }
        );

        res.json({ success: true, favoriler });
    } catch (err) {
        res.status(500).json({ error: 'Favori işlemi başarısız.' });
    }
});

app.listen(PORT, () => {
    console.log(`🌐 Sunucu çalışıyor: http://localhost:${PORT}`);
});