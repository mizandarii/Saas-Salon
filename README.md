# 💇‍♀️ Broneerimisplatvorm (SaaS)

## 📌 Projekti kirjeldus

See rakendus on veebipõhine broneerimisplatvorm juuksuritöökodadele ja teenindusettevõtetele.  
Kasutajad saavad luua konto, sisse logida, valida sobiva teenuse ja broneerida aja konkreetse töötaja juurde.  

Rakendus on mõeldud:
- klientidele (aja broneerimine)
- töötajatele (oma broneeringute haldamine)
- administraatoritele (andmete haldus)

---

## 🏗️ Arhitektuuri põhjendus

Projekt kasutab järgmisi tehnoloogiaid:

- **React** — frontend raamistik kasutajaliidese loomiseks  
- **PocketBase** — backend-as-a-service (andmebaas + API + autentimine)  

Valiku põhjendus:
- PocketBase võimaldab kiiresti luua API ja autentimise ilma eraldi backendita  
- React võimaldab luua dünaamilise ja modulaarse kasutajaliidese  
- Selline arhitektuur vähendab arendusaega ja lihtsustab projekti  

---

## 🔗 Lingid töötavatele teenustele

- Frontend:  
- PocketBase Admin:  http://pocketbase-qsbygtgljx5vtgnpouj0w2g7.176.112.158.15.sslip.io/_/#/collections?collection=pbc_1736455494&filter=&sort=-%40rowid

---

## ⚙️ Paigaldusjuhend

### 1. Klooni repository

```bash
git clone <repo-url>
cd <project-folder>
```
### 2. Paigalda sõltuvused
```bash
npm install
```
### 3. käivita PocketBase
```bash
./pocketbase serve
```
### 4. Käivita frontend
```bash
npm
```

## Keskkonnamuutujad
Loo .env fail ja lise järgmised muutujad:
```bash
VITE_PB_URL=
```

## Meeskond
- Darina - API seadistamine, STRIPE-i integratsioon
- Kristiina - andmebaasi disain, frontend
