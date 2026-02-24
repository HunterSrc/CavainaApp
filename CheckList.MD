# Checklist Deploy Backend + PostgreSQL su Render

Checklist operativa dettagliata per pubblicare il backend Node.js/TypeScript (`server/`) e il database PostgreSQL gestito su Render, mantenendo la sicurezza delle credenziali (SuperSaaS API key solo backend) e la compatibilita con Prisma.

## 1. Pre-requisiti locali (prima del deploy)

- [ ] Il backend compila senza errori:
  - [ ] `cd server`
  - [ ] `npm run build`
- [ ] I test passano:
  - [ ] `npm test`
- [ ] Hai il file `server/.env` locale funzionante (solo per sviluppo)
- [ ] Il progetto usa `SUPERSAAS_SCHEDULE_ID=584424` (verificato)
- [ ] Hai accesso a Render.com
- [ ] Hai accesso al repository Git (GitHub/GitLab) collegabile a Render
- [ ] Hai le credenziali SuperSaaS corrette:
  - [ ] `SUPERSAAS_ACCOUNT`
  - [ ] `SUPERSAAS_API_KEY`
- [ ] Hai generato due secret sicuri per JWT:
  - [ ] `JWT_ACCESS_SECRET`
  - [ ] `JWT_REFRESH_SECRET`

### Comando consigliato per generare JWT secrets

Esegui due volte:

```bash
openssl rand -base64 32
```

Usa i due output per:
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## 2. Preparazione repository (Git)

- [ ] Verifica che file sensibili non siano versionati:
  - [ ] `server/.env` NON committato
  - [ ] chiavi/token NON presenti in `README`, `CheckList.MD`, codice, commit message
- [ ] Verifica `.gitignore`:
  - [ ] `server/.env` ignorato
  - [ ] `node_modules/`, `dist/`, `coverage/` ignorati
- [ ] Commit e push del backend su branch deployabile

### Controlli rapidi

```bash
git status
git ls-files | rg '(^|/)\\.env$'
```

`git ls-files` non deve restituire `server/.env`.

## 3. Creazione Database PostgreSQL su Render

### 3.1 Creazione servizio DB

- [ ] Apri Render Dashboard
- [ ] `New` -> `PostgreSQL`
- [ ] Scegli nome servizio (es. `cavaina-postgres`)
- [ ] Scegli regione
  - [ ] Idealmente la stessa regione che userai per il backend (es. Frankfurt/Ohio ecc.)
- [ ] Scegli piano (dev/starter per iniziare, poi upgrade)
- [ ] Crea il database

### 3.2 Recupero credenziali DB

Nel database Render, sezione `Connect` / `Info`:

- [ ] Copia `Internal Database URL` (preferita se backend e DB sono entrambi su Render)
- [ ] Copia `External Database URL` (utile per restore da locale o strumenti esterni)
- [ ] Verifica host, porta, db name, username, password

### 3.3 Scelta URL da usare

- [ ] `DATABASE_URL` backend su Render = **Internal Database URL** (consigliato)
- [ ] `External Database URL` usata solo per:
  - [ ] restore dump da locale
  - [ ] connessione da client locale (`psql`, GUI)

## 4. Creazione servizio Backend su Render

### 4.1 Tipo di servizio

- [ ] `New` -> `Web Service`
- [ ] Collega il repository Git corretto
- [ ] Seleziona branch da deployare (es. `main`)

### 4.2 Configurazione base servizio

- [ ] Name: es. `cavaina-backend`
- [ ] Runtime: `Node`
- [ ] Root Directory: `server`
- [ ] Region: stessa del DB Render
- [ ] Auto Deploy: attiva (opzionale ma consigliata)

### 4.3 Comandi build/start (consigliati)

#### Build Command (opzione A: build + prisma generate)

```bash
npm install && npm run build
```

Nota: `postinstall` nel progetto esegue gia `prisma generate`.

#### Start Command

```bash
npm start
```

Se `npm start` usa `dist/server.js`, assicurati che `npm run build` venga eseguito ad ogni deploy.

## 5. Variabili ambiente Render (backend)

Configura tutte le env nel servizio backend Render (`Environment`).

### 5.1 Variabili obbligatorie

- [ ] `NODE_ENV=production`
- [ ] `PORT` (Render di solito lo assegna automaticamente; lasciare solo se necessario)
- [ ] `HOST=0.0.0.0`
- [ ] `DATABASE_URL=<Internal Database URL di Render Postgres>`
- [ ] `JWT_ACCESS_SECRET=<secret sicuro>`
- [ ] `JWT_REFRESH_SECRET=<secret sicuro>`
- [ ] `JWT_ACCESS_TTL=15m` (o il valore desiderato)
- [ ] `JWT_REFRESH_TTL=30d` (o il valore desiderato)
- [ ] `APP_TIMEZONE=Europe/Rome`
- [ ] `SUPERSAAS_TIMEZONE=Europe/Rome`
- [ ] `SUPERSAAS_ACCOUNT=<tuo account>`
- [ ] `SUPERSAAS_API_KEY=<tua api key>`
- [ ] `SUPERSAAS_SCHEDULE_ID=584424`

### 5.2 Variabili consigliate

- [ ] `LOG_LEVEL=info`
- [ ] `CORS_ORIGIN=<domini consentiti separati da virgola>`
  - [ ] esempio dev web: `http://localhost:3000,http://localhost:8080`
  - [ ] esempio prod app web: `https://app.tuodominio.it`
- [ ] `RATE_LIMIT_MAX=100` (o calibrare)
- [ ] `RATE_LIMIT_WINDOW=1 minute` (o calibrare)
- [ ] `SUPERSAAS_BASE_URL=https://www.supersaas.com/api`
- [ ] `SUPERSAAS_TIMEOUT_MS=10000`
- [ ] `SUPERSAAS_RETRY_COUNT=2`
- [ ] `SUPERSAAS_ENABLE_PASSWORD_SYNC=false`
- [ ] `ADMIN_IMPERSONATION_HEADER=x-impersonate-user-id`

### 5.3 Sicurezza env

- [ ] Verifica che `SUPERSAAS_API_KEY` sia impostata solo nel backend
- [ ] Non inserire env sensibili nel codice Flutter
- [ ] Non committare screenshot/backup con le credenziali visibili

## 6. Migrazioni Prisma sul DB Render (fondamentale)

Il database Render viene creato vuoto. Devi applicare le migration Prisma.

### Opzione A (consigliata inizialmente): migrazione manuale dopo deploy

- [ ] Deploy backend completato
- [ ] Apri Shell del servizio backend su Render (se disponibile)
- [ ] Esegui:

```bash
npm run prisma:migrate
```

- [ ] Verifica che le tabelle siano create (`User`, `RefreshToken`, `PasswordResetToken`, `AuditLog`)

### Opzione B (automatica): pre-deploy/build step

Se vuoi automatizzare in futuro:

- [ ] Aggiungi un `Pre-Deploy Command` su Render (se il piano/supporto lo consente):

```bash
npm run prisma:migrate
```

- [ ] Verifica che il comando usi `DATABASE_URL` del servizio in produzione

Nota: automatizzare è comodo, ma in ambienti sensibili conviene controllare manualmente le migration.

## 7. Seed admin iniziale (raccomandato)

Per usare gli endpoint admin ti serve almeno un utente con ruolo `ADMIN`.

### Opzione semplice (manuale via API + DB)

- [ ] Registra un utente con `POST /auth/register`
- [ ] Aggiorna il ruolo a `ADMIN` direttamente su DB (temporaneo) oppure usa uno script seed

### Opzione migliore (script seed)

- [ ] Creare script `prisma/seed.ts` (TODO)
- [ ] Eseguire seed su Render una sola volta

Checklist admin:
- [ ] Esiste un utente `ADMIN`
- [ ] Password sicura
- [ ] Test login admin completato

## 8. Test post-deploy (smoke test minimo)

Esegui test rapidi appena il servizio e online.

### 8.1 Health endpoint

- [ ] `GET /health` risponde `200`
- [ ] Response include `ok: true`

Esempio:
```bash
curl https://<tuo-backend-render>.onrender.com/health
```

### 8.2 Auth flow

- [ ] `POST /auth/register` crea utente
- [ ] `POST /auth/login` restituisce `accessToken` + `refreshToken`
- [ ] `GET /auth/me` con bearer token funziona
- [ ] `POST /auth/refresh` ruota refresh token
- [ ] `POST /auth/logout` revoca sessione

### 8.3 Endpoint business user

- [ ] `GET /me/profile`
- [ ] `PATCH /me/profile`
- [ ] `GET /me/bootstrap?from=YYYY-MM-DD`
- [ ] `GET /me/free-slots?from=...`
- [ ] `GET /me/busy-slots?from=...`
  - [ ] Verifica che NON esponga dati sensibili (nome/email/telefono/note)
- [ ] `POST /me/bookings` (slot valido)
- [ ] `PUT /me/bookings/:bookingId` (entro regola 48h, se applicabile)
- [ ] `DELETE /me/bookings/:bookingId`

### 8.4 Endpoint admin

- [ ] `GET /admin/users`
- [ ] `PATCH /admin/users/:id`
- [ ] `POST /admin/users/:id/reset-password`
- [ ] `POST /admin/bookings`
- [ ] `GET /admin/bookings`
- [ ] (opzionale) impersonazione start/stop

## 9. Test integrazione SuperSaaS in produzione

### 9.1 Verifiche base

- [ ] `SUPERSAAS_ACCOUNT` corretto
- [ ] `SUPERSAAS_API_KEY` corretta
- [ ] `SUPERSAAS_SCHEDULE_ID=584424`
- [ ] Lo schedule su SuperSaaS e del tipo `Resource`

### 9.2 Test operativi

- [ ] Registrazione/login backend fa upsert utente su SuperSaaS (senza errori bloccanti)
- [ ] `GET /me/free-slots` ritorna disponibilita coerente
- [ ] `POST /me/bookings` crea prenotazione su SuperSaaS
- [ ] `PUT /me/bookings/:bookingId` aggiorna prenotazione
- [ ] `DELETE /me/bookings/:bookingId` cancella prenotazione

### 9.3 Validazioni business da confermare

- [ ] Start ammessi solo `17:00`, `19:00`, `21:00`
- [ ] Durata fissa `2h`
- [ ] Timezone `Europe/Rome`
- [ ] Regola `48h` su modify/delete per USER
- [ ] ADMIN bypass con audit

## 10. Migrazione dati da locale a Render (opzionale)

Se hai gia dati utili in locale e vuoi portarli su Render.

### 10.1 Dump locale

- [ ] Assicurati che il DB locale sia coerente e aggiornato
- [ ] Esegui dump:

```bash
pg_dump -h localhost -U postgres -d cavaina_app > dump.sql
```

### 10.2 Restore su Render (External Database URL)

- [ ] Recupera `External Database URL` dal DB Render
- [ ] Esegui restore:

```bash
psql "<EXTERNAL_DATABASE_URL>" < dump.sql
```

### 10.3 Verifica post-restore

- [ ] Tabelle presenti
- [ ] Utenti presenti
- [ ] Indici presenti
- [ ] API `/auth/login` e `/me/...` funzionanti

Nota: se usi dump con schema completo, evita conflitti con migration gia applicate.

## 11. Hardening minimo produzione (consigliato)

### 11.1 Sicurezza applicativa

- [ ] JWT secrets lunghi e unici
- [ ] CORS limitato ai soli domini necessari
- [ ] Rate limit calibrato
- [ ] Nessun log con dati sensibili (password, api keys, token)
- [ ] `SUPERSAAS_API_KEY` ruotata se mai esposta accidentalmente

### 11.2 Operativita

- [ ] Healthcheck monitorato
- [ ] Alerting/monitoring base attivo (Render logs + alert)
- [ ] Backup DB Render attivi/verificati (in base al piano)
- [ ] Procedura rollback definita (almeno ripristino env + redeploy precedente)

### 11.3 Performance / UX Flutter

- [ ] Endpoint `/me/bootstrap` testato con payload realistici
- [ ] Latenza accettabile per UI animata
- [ ] Errori machine-readable confermati (`{ ok:false, error:{ code, message, details? } }`)

## 12. Comandi rapidi utili (locale)

### Avvia DB Docker locale

```bash
cd server
docker compose -f docker-compose.postgres.yml up -d
```

### Reset DB Docker locale (attenzione: cancella dati)

```bash
cd server
docker compose -f docker-compose.postgres.yml down -v
docker compose -f docker-compose.postgres.yml up -d
```

### Migrazioni e avvio backend locale

```bash
cd server
npx prisma migrate dev
npm run dev
```

## 13. Checklist finale go-live

- [ ] DB Render creato e raggiungibile
- [ ] Backend Render deployato
- [ ] `DATABASE_URL` (internal) configurato
- [ ] Migrazioni Prisma applicate
- [ ] Env SuperSaaS configurate correttamente
- [ ] `SUPERSAAS_SCHEDULE_ID=584424`
- [ ] Test login/register ok
- [ ] Test booking ok
- [ ] Test privacy busy-slots ok
- [ ] Almeno un admin creato
- [ ] Nessun segreto nel repository

## 14. TODO futuri (raccomandati)

- [ ] Aggiungere `prisma/seed.ts` per seed admin iniziale
- [ ] Aggiungere pipeline CI/CD (build + test + lint)
- [ ] Aggiungere `preDeployCommand` per migrazioni Prisma (valutando rischio)
- [ ] Aggiungere email provider reale per `forgot-password`
- [ ] Aggiungere monitoraggio strutturato (Sentry / Log drain / APM)
- [ ] Definire strategia backup/restore documentata

