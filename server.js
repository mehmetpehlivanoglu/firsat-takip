const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const MONGODB_URI = 'mongodb+srv://mehmetpehlivanoglu0728_db_user:Kartal2652@cluster0.tvkww1d.mongodb.net/?appName=Cluster0';

app.use(express.static('public'));

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
    console.log(`🌐 Web sitesi yerelde çalışıyor: http://localhost:${PORT}`);
});