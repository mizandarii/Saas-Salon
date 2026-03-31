# 💇‍♀️ Broneerimisplatvorm (SaaS)
##📌 Projekti kirjeldus

See veebirakendus on broneerimisplatvorm juuksuritöökodadele ja teenindusettevõtetele.

# Rakendus võimaldab:

- klientidel vaadata teenuseid ja broneerida aegu
- töötajatel hallata oma saadavust ja broneeringuid
- administraatoritel hallata teenuseid, töötajaid ja süsteemi andmeid

Eesmärk on lihtsustada ajaplaneerimist ja vähendada käsitsi broneerimist.

## 🏗️ Arhitektuuri põhjendus

# Projekt kasutab kaasaegset arhitektuuri:

# Frontend: React (Vite)
- Kiire ja modulaarne kasutajaliides
- Sobib hästi dünaamiliste broneerimisvoogude jaoks
- Lihtne hallata komponentidepõhist loogikat
# Backend: PocketBase (hostitud Coolify keskkonnas)
- Pakub andmebaasi, autentimist ja REST API-t ühes lahenduses
- Ei vaja eraldi backend serverit
- Kiire arendus ja lihtne haldus
# Miks see arhitektuur:
- Kiirem arendus kui eraldi backendiga lahendus
- Vähem infrastruktuuri keerukust
- Keskendub äriloogikale, mitte serverihaldusele
## 🔗 Lingid töötavatele teenustele  
🌐 Frontend: [SIIA FRONTEND URL]  
🛠️ PocketBase Admin: [SIIA POCKETBASE ADMIN URL]

⚙️ Paigaldusjuhend
1. Klooni repository
```bash
git clone <repo-url>
cd <project-folder>
```
3. Paigalda sõltuvused
```bash
npm install
```
5. Keskkonnamuutujad

VITE_POCKETBASE_URL — PocketBase'i avalik URL

STRIPE_PUBLIC_KEY — Stripe avalik võti

STRIPE_WEBHOOK_SECRET — Webhook'i saladus

4. Käivita arendusserver
```bash
npm run dev
```
6. Build production jaoks
```bash
npm run build

npm run preview
```

🔐 Keskkonnamuutujad

Loo .env fail järgmiste muutujatega:
VITE_POCKETBASE_URL — PocketBase'i avalik URL

STRIPE_PUBLIC_KEY — Stripe avalik võti

STRIPE_WEBHOOK_SECRET — Webhook'i saladus
👥 Meeskond
Darina – API loogika, frontend arendus, Stripe integratsioon
Kristiina – andmebaasi disain, frontend arendus