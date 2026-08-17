const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://mehmetpehlivanoglu0728_db_user:Kartal2652@cluster0.tvkww1d.mongodb.net/?appName=Cluster0';

async function urunleriCekVeKaydet() {
    const client = new MongoClient(MONGODB_URI);
    
    const ornekUrunler = [
        {
            baslik: 'Xiaomi Mi Band 7 Akıllı Bileklik - İndirimli Fırsat',
            fiyat: '799 TL',
            resim: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.hepsiburada.com/xiaomi-mi-band-7-p-HBCV000022XZVO', // Örnek gerçek ürün linki
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'JBL Tune 510BT Kablosuz Kulaküstü Kulaklık',
            fiyat: '1.249 TL',
            resim: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.trendyol.com/jbl/tune-510bt-kablosuz-kulakustu-kulaklik-siyah-p-78101314', // Örnek gerçek ürün linki
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Samsung Galaxy A54 5G 128 GB',
            fiyat: '16.999 TL',
            resim: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.amazon.com.tr/Samsung-Galaxy-Ak%C4%B1ll%C4%B1-Telefon-Garanti/dp/B0BYZ28Z8H', // Örnek gerçek ürün linki
            eklenmeTarihi: new Date()
        }
    ];

    try {
        await client.connect();
        const db = client.db('firsatDB');
        const koleksiyon = db.collection('urunler');

        await koleksiyon.deleteMany({});
        const sonuc = await koleksiyon.insertMany(ornekUrunler);
        console.log(`✅ Doğru ürün linkleriyle ${sonuc.insertedCount} adet ürün güncellendi!`);
    } catch (err) {
        console.error('❌ Hata oluştu:', err);
    } finally {
        await client.close();
    }
}

urunleriCekVeKaydet();