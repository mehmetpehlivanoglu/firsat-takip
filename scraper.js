const { MongoClient } = require('mongodb');
const axios = require('axios');
const cheerio = require('cheerio');

const MONGODB_URI = 'mongodb+srv://mehmetpehlivanoglu0728_db_user:Kartal2652@cluster0.tvkww1d.mongodb.net/?appName=Cluster0';

async function urunleriCekVeKaydet() {
    const client = new MongoClient(MONGODB_URI);
    
    // Test ve örnek gerçek fırsat verileri (veya scraper mantığı)
    const ornekUrunler = [
        {
            baslik: 'Xiaomi Mi Band 7 Akıllı Bileklik - İndirimli Fırsat',
            fiyat: '799 TL',
            resim: 'https://cdn.akakce.com/z/xiaomi/xiaomi-mi-band-7-akilli-bileklik.jpg',
            link: 'https://www.hepsiburada.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'JBL Tune 510BT Kablosuz Kulaküstü Kulaklık',
            fiyat: '1.249 TL',
            resim: 'https://cdn.akakce.com/z/jbl/jbl-tune-510bt-kablolu-kablosuz-kulaklik.jpg',
            link: 'https://www.trendyol.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Samsung Galaxy A54 5G 128 GB',
            fiyat: '16.999 TL',
            resim: 'https://cdn.akakce.com/z/samsung/samsung-galaxy-a54-5g-128-gb.jpg',
            link: 'https://www.amazon.com.tr',
            eklenmeTarihi: new Date()
        }
    ];

    try {
        await client.connect();
        const db = client.db('firsatDB');
        const koleksiyon = db.collection('urunler');

        // Eskileri temizle veya direkt ekle (isteğe bağlı olarak güncelleyebilirsiniz)
        await koleksiyon.deleteMany({});
        
        const sonuc = await koleksiyon.insertMany(ornekUrunler);
        console.log(`✅ Başarıyla ${sonuc.insertedCount} adet fırsat ürünü veritabanına eklendi!`);
    } catch (err) {
        console.error('❌ Hata oluştu:', err);
    } finally {
        await client.close();
    }
}

urunleriCekVeKaydet();