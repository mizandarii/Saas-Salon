# 💇‍♀️ Broneerimisplatvorm (SaaS)
## 📌 Projekti kirjeldus

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
🌐 Frontend: [[FRONTEND URL] ](http://atofmuqtfmzt2h7xztux0a5n.176.112.158.15.sslip.io/login)     
🛠️ PocketBase Admin: [Open Admin Panel](http://pocketbase-qsbygtgljx5vtgnpouj0w2g7.176.112.158.15.sslip.io/_/#/collections?collection=pbc_1747969721&filter=&sort=-%40rowid)   
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
4. Keskkonnamuutujad

VITE_POCKETBASE_URL — PocketBase'i avalik URL

STRIPE_PUBLIC_KEY — Stripe avalik võti

STRIPE_WEBHOOK_SECRET — Webhook'i saladus

5. Käivita arendusserver
```bash
npm run dev
```
6. Build production jaoks
```bash
npm run build

npm run preview
```
  
## 👥 Meeskond
Darina – API loogika, frontend arendus, Stripe integratsioon    
Kristiina – andmebaasi disain, frontend arendus
