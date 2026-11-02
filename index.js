
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const P = require('pino');
const QRCode = require('qrcode');

const app = express();
app.use(cors());
app.use(express.json());

let sock;
let isConnected = false;
let lastQR = null;
let qrImage = null;

async function connectWA() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_session');
  sock = makeWASocket({ auth: state, logger: P({ level: 'silent' }) });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if(qr){
      lastQR = qr;
      qrImage = await QRCode.toDataURL(qr);
      console.log('QR BARU TERBUAT - Buka https://<domain-kamu>/qr untuk scan');
    }
    if(connection === 'close'){
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if(shouldReconnect) connectWA();
      isConnected = false;
      lastQR = null;
      qrImage = null;
    } else if(connection === 'open'){
      console.log('WA TERHUBUNG! API SIAP');
      isConnected = true;
      lastQR = null;
      qrImage = null;
    }
  });
}
connectWA();

app.get('/', (req,res)=>{
  res.send(`
    <html><head><meta name="viewport" content="width=device-width,initial-scale=1">
    <style>body{font-family:sans-serif;background:#0f172a;color:white;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
    .card{background:white;color:#0f172a;padding:24px;border-radius:20px;max-width:360px;width:90%}</style></head>
    <body><div class="card">
    <h2>KONTER A YUDI THEA<br>API WA</h2>
    <p>Status: ${isConnected ? '<b style=color:green>TERHUBUNG ✅</b>' : '<b style=color:red>Belum Scan QR</b>'}</p>
    ${isConnected ? '<p>Bot siap kirim WA</p>' : '<a href="/qr" style="display:block;background:#0f172a;color:white;padding:12px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:12px">Buka QR CODE</a>'}
    <p style="font-size:12px;color:#64748b;margin-top:16px">Endpoint: POST /kirim-wa { nomor, pesan }</p>
    </div></body></html>
  `);
});

app.get('/qr', (req,res)=>{
  if(isConnected) return res.send('<h1>SUDAH TERHUBUNG ✅</h1><p><a href="/">Kembali</a></p>');
  if(!qrImage) return res.send('<html><meta http-equiv="refresh" content="2"><body style="background:#0f172a;color:white;display:grid;place-items:center;min-height:100vh;font-family:sans-serif"><div style="text-align:center"><h2>Menunggu QR...</h2><p>Refresh otomatis 2 detik</p></div></body></html>');
  res.send(`
    <html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="30"></head>
    <body style="background:#0f172a;color:white;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center">
    <div style="background:white;color:#0f172a;padding:20px;border-radius:20px;max-width:380px;width:92%">
    <h3 style="margin:0 0 12px">SCAN QR DI WA KONTER</h3>
    <img src="${qrImage}" style="width:100%;border-radius:12px;border:2px solid #e2e8f0">
    <p style="font-size:12px;color:#64748b;margin-top:12px">Buka WA > Perangkat Tertaut > Tautkan Perangkat > Scan<br>QR refresh tiap 30 detik</p>
    <a href="/qr" style="display:block;background:#0f172a;color:white;padding:10px;border-radius:10px;text-decoration:none;margin-top:12px">Refresh QR</a>
    </div></body></html>
  `);
});

app.post('/kirim-wa', async (req,res)=>{
  try{
    if(!isConnected) return res.status(400).json({ error: 'WA belum terhubung, buka /qr dulu' });
    let { nomor, pesan } = req.body;
    if(!nomor || !pesan) return res.status(400).json({ error: 'nomor & pesan wajib' });
    nomor = nomor.toString().replace(/[^0-9]/g,'');
    if(nomor.startsWith('0')) nomor = '62' + nomor.slice(1);
    await new Promise(r=>setTimeout(r, Math.floor(Math.random()*1200)+500));
    const jid = nomor + '@s.whatsapp.net';
    await sock.sendMessage(jid, { text: pesan });
    console.log(`Terkirim ke ${nomor}`);
    res.json({ success: true, to: nomor });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`API jalan di port ${PORT}`));
