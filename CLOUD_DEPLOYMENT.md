# ☁️ TeacherOS — Cloud & 24/7 Serverga Joylash Bo'yicha To'liq Qo'llanma

TeacherOS endi to'liq portativ qilingan. Uni dunyoning istalgan bulutli platformasiga (Cloud) yoki shaxsiy Linux VPS serveriga joylab, **24/7 uzluksiz** ishlatish mumkin.

---

## 🌟 Variant 1: Bepul / Arzon Cloud Platformalar (Render.com yoki Railway.app)
*(Eng oson va tezkor usul — SSL/HTTPS sertifikati avtomatik beriladi)*

### 1. Render.com orqali:
1. [Render.com](https://render.com) ga kiring va bepul ro'yxatdan o'ting.
2. **New +** tugmasini bosing va **Web Service** ni tanlang.
3. Loyihani GitHub orqali ulang (yoki Docker deploy tanlang).
4. Muhit o'zgaruvchilari (Environment Variables) bo'limida kiriting:
   - `PORT`: `8080`
   - `PUBLIC_URL`: `https://sizning-domen.onrender.com` (Render bergan manzil)
   - `GEMINI_API_KEY`: `AIzaSyBmXda2F3ehCvoOaETwNV25YrFeMoKDEiE`
   - `BOT_TOKEN`: `8979510433:AAGd4TEZb_rx4b8lZrFFfJfAz-dAI2ZRzMw`
5. **Create Web Service** tugmasini bosing.
   - Render avtomatik ravishda `Dockerfile` ni yig'adi, `server.pl` va Telegram botni birgalikda 24/7 ishga tushiradi!

---

## 🚀 Variant 2: Shaxsiy Linux VPS Server (Ubuntu / Debian)
*(DigitalOcean, Hetzner, Timeweb Cloud, Beget, Vultr va h.k.)*

Agar sizda Linux VPS server bo'lsa (yoki yangi ochsangiz):

1. **Fayllarni serverga nusxalang:**
   ```bash
   scp -r /Users/macpro/.gemini/antigravity/scratch/teacheros root@<SIZNING_SERVER_IP>:/root/
   ```

2. **Serverga kiring va 1 ta buyruq bilan o'rnating:**
   ```bash
   ssh root@<SIZNING_SERVER_IP>
   cd /root/teacheros
   chmod +x deploy-vps.sh
   ./deploy-vps.sh
   ```

3. **Natija:**
   - `teacheros-server` va `teacheros-bot` systemd xizmatlariga aylanadi.
   - Server o'chib-yonsa ham, yoki xatolik bo'lsa ham avtomatik qayta ishga tushadi (`Restart=always`).
   - Veb-sahifaga kirish: `http://<SERVER_IP>:8080`

---

## 🐳 Variant 3: Docker Compose Orqali
Agar serveringizda Docker o'rnatilgan bo'lsa:

```bash
docker compose up -d
```
Bir zumda `teacheros_app` konteyneri orqa fonda 24/7 ishlay boshlaydi.

---

## ⚙️ Sozlamalar va Muhit O'zgaruvchilari (Environment Variables)

| O'zgaruvchi | Standart qiymat | Tavsif |
|---|---|---|
| `PORT` | `8080` | Veb-server porti |
| `PUBLIC_URL` | `http://127.0.0.1:8080` | O'quvchilar va Telegram botga beriladigan rasmiy veb-manzil |
| `BOT_TOKEN` | `8979510433:...` | Telegram Bot API tokeni |
| `GEMINI_API_KEY` | `AIzaSyBmX...` | Google Gemini AI kaliti |
