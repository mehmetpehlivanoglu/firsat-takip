const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://mehmetpehlivanoglu0728_db_user:Kartal2652@cluster0.tvkww1d.mongodb.net/?appName=Cluster0';

async function urunleriCekVeKaydet() {
    const client = new MongoClient(MONGODB_URI);
    
    // Zengin ve çoklu ürün listesi
    const ornekUrunler = [
        // --- ELEKTRONİK ---
        {
            baslik: 'Xiaomi Mi Band 7 Akıllı Bileklik - Siyah',
            fiyat: '799 TL',
            kategori: 'elektronik',
            magaza: 'Hepsiburada',
            resim: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.hepsiburada.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'JBL Tune 510BT Kablosuz Kulaküstü Kulaklık',
            fiyat: '1.249 TL',
            kategori: 'elektronik',
            magaza: 'Trendyol',
            resim: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.trendyol.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Samsung Galaxy A54 5G 128 GB Akıllı Telefon',
            fiyat: '16.999 TL',
            kategori: 'elektronik',
            magaza: 'Amazon TR',
            resim: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.amazon.com.tr',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Anker Soundcore Life Q30 Bluetooth Kulaklık',
            fiyat: '2.499 TL',
            kategori: 'elektronik',
            magaza: 'Teknosa',
            resim: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.teknosa.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Logitech G G209 Oyuncu Mouse ve Mousepad',
            fiyat: '899 TL',
            kategori: 'elektronik',
            magaza: 'Hepsiburada',
            resim: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.hepsiburada.com',
            eklenmeTarihi: new Date()
        },

        // --- MODA ---
        {
            baslik: 'Nike Air Monarch IV Erkek Spor Ayakkabı',
            fiyat: '2.499 TL',
            kategori: 'moda',
            magaza: 'Trendyol',
            resim: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.trendyol.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Adidas Essentials Kapüşonlu Sweatshirt',
            fiyat: '1.299 TL',
            kategori: 'moda',
            magaza: 'Boyner',
            resim: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.boyner.com.tr',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Levi’s 501 Original Fit Erkek Kot Pantolon',
            fiyat: '1.899 TL',
            kategori: 'moda',
            magaza: 'Trendyol',
            resim: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.trendyol.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Puma Carina Kadın Beyaz Sneaker',
            fiyat: '1.699 TL',
            kategori: 'moda',
            magaza: 'Hepsiburada',
            resim: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.hepsiburada.com',
            eklenmeTarihi: new Date()
        },

        // --- EV & YAŞAM ---
        {
            baslik: 'Tefal Filtre Kahve Makinesi ve Öğütücü',
            fiyat: '2.299 TL',
            kategori: 'ev',
            magaza: 'Amazon TR',
            resim: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.amazon.com.tr',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Karaca 6 Kişilik Kahve Fincan Takımı',
            fiyat: '599 TL',
            kategori: 'ev',
            magaza: 'Hepsiburada',
            resim: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.hepsiburada.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Philips Airfryer XXL Hava Fritözü',
            fiyat: '6.499 TL',
            kategori: 'ev',
            magaza: 'Trendyol',
            resim: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.trendyol.com',
            eklenmeTarihi: new Date()
        },
        {
            baslik: 'Arzum Okka Minio Türk Kahvesi Makinesi',
            fiyat: '1.199 TL',
            kategori: 'ev',
            magaza: 'Teknosa',
            resim: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=500&auto=format&fit=crop&q=60',
            link: 'https://www.teknosa.com',
            eklenmeTarihi: new Date()
        }
    ];

    try {
        await client.connect();
        const db = client.db('firsatDB');
        const koleksiyon = db.collection('urunler');

        // Eski ürünleri temizleyip yeni zengin listeyi basalım
        await koleksiyon.deleteMany({});
        const sonuc = await koleksiyon.insertMany(ornekUrunler);
        console.log(`✅ Başarıyla ${sonuc.insertedCount} adet ürün veritabanına yüklendi!`);
    } catch (err) {
        console.error('❌ Hata oluştu:', err);
    } finally {
        await client.close();
    }
}

urunleriCekVeKaydet();