const puppeteer = require('puppeteer');
const fs = require('fs');

// --- TELEGRAM BİLGİLERİNİZ ---
const TELEGRAM_TOKEN = '8985561217:AAEz7WWV2hcM1RaYPjXa3dDtMGDU8z7tk_0'; 
const CHAT_ID = '8626326079';

const URUN_LIMITI = 15;
const HAFIZA_DOSYASI = './gonderilenler.json';

function gonderilenleriOku() {
    if (fs.existsSync(HAFIZA_DOSYASI)) {
        try {
            const data = fs.readFileSync(HAFIZA_DOSYASI, 'utf8');
            return new Set(JSON.parse(data));
        } catch (e) {
            return new Set();
        }
    }
    return new Set();
}

function gonderilenleriKaydet(gonderilenSet) {
    const arrayData = Array.from(gonderilenSet);
    fs.writeFileSync(HAFIZA_DOSYASI, JSON.stringify(arrayData, null, 2));
}

async function telegramaGonder(urun) {
    const mesaj = `🔥 *YENİ İNDİRİM FIRSATI!*\n\n` +
                  `📦 *Ürün:* ${urun.baslik}\n` +
                  `💰 *Fiyat:* ${urun.fiyat}\n` +
                  `🏪 *Mağaza:* Trendyol\n\n` +
                  `🔗 [Ürünü İncele / Satın Al](${urun.link})`;

    const endpoint = (urun.resim && urun.resim.startsWith('http')) ? 'sendPhoto' : 'sendMessage';
    const bodyData = endpoint === 'sendPhoto' 
        ? { chat_id: CHAT_ID, photo: urun.resim, caption: mesaj, parse_mode: 'Markdown' }
        : { chat_id: CHAT_ID, text: mesaj, parse_mode: 'Markdown' };

    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();
        if (data.ok) {
            console.log(`📲 Telegram bildirim gönderildi: ${urun.baslik}`);
            return true;
        } else {
            console.error("Telegram Hata Yanıtı:", data.description);
            return false;
        }
    } catch (error) {
        console.error("Telegram İstek Hatası:", error.message);
        return false;
    }
}

async function firsatlariCekVeGonder() {
    console.log(`\n⏰ [${new Date().toLocaleTimeString('tr-TR')}] Tarama başlatılıyor...`);
    
    const gonderilenler = gonderilenleriOku();
    
    const browser = await puppeteer.launch({ 
        headless: "new", 
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    try {
        await page.goto('https://www.trendyol.com/sr?fl=firsat-urunleri', {
            waitUntil: 'networkidle2',
            timeout: 60000
        });

        await page.evaluate(() => window.scrollBy(0, 1000));
        await new Promise(r => setTimeout(r, 2000));

        const urunler = await page.evaluate((limit) => {
            const linkler = Array.from(document.querySelectorAll('a[href*="-p-"]'));
            const liste = [];
            const eklenenLinkler = new Set();

            for (const a of linkler) {
                if (liste.length >= limit) break;

                const relativeLink = a.getAttribute('href');
                if (!relativeLink || eklenenLinkler.has(relativeLink)) continue;

                const tamLink = relativeLink.startsWith('http') 
                    ? relativeLink 
                    : `https://www.trendyol.com${relativeLink}`;

                const kart = a.closest('.p-card-wrppr, .p-card-chldrn, div[data-id]') || a;

                const marka = kart.querySelector('.prdct-desc-cntnr-ttl, .brand-name')?.innerText?.trim() || '';
                const isim = kart.querySelector('.prdct-desc-cntnr-name, .product-name')?.innerText?.trim() || '';
                let baslik = `${marka} ${isim}`.trim();

                if (!baslik) {
                    baslik = kart.innerText?.split('\n')[0] || "Trendyol Fırsat Ürünü";
                }

                const fiyat = kart.querySelector('.prc-box-sllg, .price-value, .prc-box-dscntd, .p-card-price')?.innerText?.trim() || "Fiyat için tıklayın";
                const imgEl = kart.querySelector('img');
                const resim = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src');

                eklenenLinkler.add(relativeLink);
                liste.push({ baslik, fiyat, resim, link: tamLink });
            }
            return liste;
        }, URUN_LIMITI);

        console.log(`🔍 Toplam ${urunler.length} adet fırsat ürünü incelendi.`);

        let yeniUrunSayisi = 0;
        for (const urun of urunler) {
            if (!gonderilenler.has(urun.link)) {
                const basarili = await telegramaGonder(urun);
                if (basarili) {
                    gonderilenler.add(urun.link);
                    yeniUrunSayisi++;
                    await new Promise(r => setTimeout(r, 1500));
                }
            }
        }

        if (yeniUrunSayisi > 0) {
            gonderilenleriKaydet(gonderilenler);
            console.log(`✅ ${yeniUrunSayisi} adet YENİ fırsat ürünü Telegram'a gönderildi.`);
        } else {
            console.log(`ℹ️ Yeni bir fırsat ürünü bulunamadı.`);
        }

    } catch (err) {
        console.error("Tarama sırasında hata oluştu:", err.message);
    } finally {
        await browser.close();
        console.log(`🎉 İşlem tamamlandı.`);
    }
}

firsatlariCekVeGonder();