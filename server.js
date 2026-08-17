const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'firsat_takip_gizli_anahtar_123!';
const MONGODB_URI = 'mongodb+srv://mehmetpehlivanoglu0728_db_user:Kartal2652@cluster0.tvkww1d.mongodb.net/?appName=Cluster0';
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.post('/api/kayit', async (req, res) => {
    const { eposta, sifre } = req.body;
    if (!eposta || !sifre) return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('firsatDB');
        const kullanicilar = db.collection('kullanicilar');
        const mevcutKullanici = await kullanicilar.findOne({ eposta });
        if (mevcutKullanici) return res.status(400).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });
        const hashliSifre = await bcrypt.hash(sifre, 10);
        await kullanicilar.insertOne({ eposta, sifre: hashliSifre, isVIP: false, kayitTarihi: new Date() });
        res.json({ success: true, message: 'Kayıt başarılı!' });
    } catch (err) { res.status(500).json({ error: err.message }); } finally { await client.close(); }
});
app.post('/api/giris', async (req, res) => {
    const { eposta, sifre } = req.body;
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const kullanici = await client.db('firsatDB').collection('kullanicilar').findOne({ eposta });
        if (!kullanici || !(await bcrypt.compare(sifre, kullanici.sifre))) return res.status(400).json({ error: 'Hatalı giriş.' });
        const token = jwt.sign({ id: kullanici._id, eposta: kullanici.eposta, isVIP: kullanici.isVIP }, JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, maxAge: 604800000 });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); } finally { await client.close(); }
});
app.get('/api/cikis', (req, res) => { res.clearCookie('token'); res.json({ success: true }); });
app.get('/api/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ loggedIn: false });
    try { res.json({ loggedIn: true, ...jwt.verify(token, JWT_SECRET) }); } catch (e) { res.json({ loggedIn: false }); }
});
app.get('/api/firsatlar', async (req, res) => {
    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const data = await client.db('firsatDB').collection('urunler').find({}).sort({ eklenmeTarihi: -1 }).limit(30).toArray();
        res.json(data);
    } finally { await client.close(); }
});
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log('Sunucu calisiyor...'));
