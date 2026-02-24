# Cavaina Backend (Node.js + TypeScript + Fastify)

Backend proxy sicuro per app Flutter, con autenticazione locale, RBAC, audit log e integrazione SuperSaaS (account-level API) per disponibilita e prenotazioni.

## Scelte architetturali (default)
- **Fastify**: migliore performance e plugin system pulito, ottimo per API usate da UI native con animazioni (riduce latenza/overhead).
- **Prisma + PostgreSQL**: schema tipizzato, migrations, DX veloce per MVP/produzione.
- **Zod**: validazione input/output prevedibile e machine-readable.
- **JWT access + refresh token (locale)**: login dell'app separato da SuperSaaS.

## Importante (SuperSaaS)
- La `SUPERSAAS_API_KEY` resta **solo backend**.
- Il client Flutter **non chiama mai** SuperSaaS direttamente.
- Le password **non** si importano da SuperSaaS (non affidabile / non esportabili).
- Reset password = **solo auth locale** (eventuale sync verso SuperSaaS solo se abilitato via flag e motivato).

## Struttura progetto
```txt
server/
  prisma/
    schema.prisma
    migrations/
  src/
    app.ts
    server.ts
    config/
    modules/
      auth/
      users/
      bookings/
      availability/
      admin/
      supersaas/
    middleware/
    plugins/
    lib/
    types/
    utils/
  tests/
    unit/
    integration/
```

## Setup
```bash
cd server
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## Variabili env principali
Vedi `server/.env.example`.

Minime obbligatorie:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `SUPERSAAS_ACCOUNT`
- `SUPERSAAS_API_KEY`
- `SUPERSAAS_SCHEDULE_ID=584424`

## Comportamento business implementato
- slot fissi **2 ore**
- start ammessi solo **17:00 / 19:00 / 21:00** (`Europe/Rome`)
- modifica/cancellazione bloccate per USER a meno di **48h**
- ADMIN bypassa 48h (con audit sulle azioni sensibili)
- busy slots USER **anonimizzati** (`start`, `end`, `status=occupied`)

## Standard risposte
Successo:
```json
{ "ok": true, "data": { "...": "..." }, "meta": { "...": "..." } }
```

Errore:
```json
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {} } }
```

## Flow auth (locale)
1. `POST /auth/register` crea utente locale (password hashata), genera `supersaasUserKey`, tenta upsert utente su SuperSaaS.
2. `POST /auth/login` valida password locale, upsert user su SuperSaaS, emette `accessToken` + `refreshToken`.
3. `POST /auth/refresh` ruota refresh token (revoca vecchio, persiste nuovo).
4. `POST /auth/logout` revoca refresh token (o tutte le sessioni del profilo se `allSessions=true`).

## Esempi request/response (rotte principali)

### Auth
#### POST /auth/register
```bash
curl -X POST http://localhost:3001/auth/register \
  -H 'content-type: application/json' \
  -d '{"firstName":"Mario","lastName":"Rossi","email":"mario@example.com","phone":"+393331234567","password":"Password123!"}'
```

#### POST /auth/login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"mario@example.com","password":"Password123!"}'
```
Response (estratto):
```json
{
  "ok": true,
  "data": {
    "user": { "id": "...", "role": "USER", "email": "mario@example.com" },
    "tokens": { "accessToken": "...", "refreshToken": "..." },
    "serverTime": "2026-02-24T...Z"
  }
}
```

#### POST /auth/refresh
```bash
curl -X POST http://localhost:3001/auth/refresh -H 'content-type: application/json' -d '{"refreshToken":"..."}'
```

#### POST /auth/logout
```bash
curl -X POST http://localhost:3001/auth/logout \
  -H 'authorization: Bearer <access>' \
  -H 'content-type: application/json' \
  -d '{"refreshToken":"..."}'
```

#### POST /auth/forgot-password
```bash
curl -X POST http://localhost:3001/auth/forgot-password -H 'content-type: application/json' -d '{"email":"mario@example.com"}'
```
Note: in `NODE_ENV!=production` ritorna `tokenPreview` per test locale.

#### POST /auth/reset-password
```bash
curl -X POST http://localhost:3001/auth/reset-password -H 'content-type: application/json' -d '{"token":"...","newPassword":"NewPass123!"}'
```

#### GET /auth/me
```bash
curl http://localhost:3001/auth/me -H 'authorization: Bearer <access>'
```

### User / Me
#### GET /me/profile
```bash
curl http://localhost:3001/me/profile -H 'authorization: Bearer <access>'
```

#### PATCH /me/profile
```bash
curl -X PATCH http://localhost:3001/me/profile \
  -H 'authorization: Bearer <access>' \
  -H 'content-type: application/json' \
  -d '{"firstName":"Mario","phone":"+393331234567"}'
```

#### GET /me/bootstrap?from=YYYY-MM-DD
```bash
curl 'http://localhost:3001/me/bootstrap?from=2026-02-24' -H 'authorization: Bearer <access>'
```
Response include:
- `profile`
- `bookings`
- `freeSlots`
- `busySlots` (anonimizzati)
- `serverTime`

#### GET /me/bookings
```bash
curl 'http://localhost:3001/me/bookings?from=2026-02-24' -H 'authorization: Bearer <access>'
```

#### POST /me/bookings
```bash
curl -X POST http://localhost:3001/me/bookings \
  -H 'authorization: Bearer <access>' \
  -H 'Idempotency-Key: booking-create-001' \
  -H 'content-type: application/json' \
  -d '{"start":"2026-03-05T19:00:00+01:00"}'
```

#### PUT /me/bookings/:bookingId
```bash
curl -X PUT http://localhost:3001/me/bookings/12345 \
  -H 'authorization: Bearer <access>' \
  -H 'content-type: application/json' \
  -d '{"start":"2026-03-07T21:00:00+01:00"}'
```

#### DELETE /me/bookings/:bookingId
```bash
curl -X DELETE http://localhost:3001/me/bookings/12345 -H 'authorization: Bearer <access>'
```

#### GET /me/free-slots
```bash
curl 'http://localhost:3001/me/free-slots?from=2026-02-24' -H 'authorization: Bearer <access>'
```

#### GET /me/busy-slots
```bash
curl 'http://localhost:3001/me/busy-slots?from=2026-02-24' -H 'authorization: Bearer <access>'
```
Response busy slots USER (anonimo):
```json
{
  "ok": true,
  "data": {
    "items": [
      { "start": "2026-02-26T18:00:00Z", "end": "2026-02-26T20:00:00Z", "status": "occupied" }
    ]
  }
}
```

### Admin
#### GET /admin/users
```bash
curl 'http://localhost:3001/admin/users?page=1&pageSize=20' -H 'authorization: Bearer <admin_access>'
```

#### GET /admin/users/:id
```bash
curl http://localhost:3001/admin/users/<userId> -H 'authorization: Bearer <admin_access>'
```

#### PATCH /admin/users/:id
```bash
curl -X PATCH http://localhost:3001/admin/users/<userId> \
  -H 'authorization: Bearer <admin_access>' \
  -H 'content-type: application/json' \
  -d '{"role":"USER","isActive":true}'
```

#### POST /admin/users/:id/reset-password
```bash
curl -X POST http://localhost:3001/admin/users/<userId>/reset-password \
  -H 'authorization: Bearer <admin_access>' \
  -H 'content-type: application/json' \
  -d '{"newPassword":"TempPass123!"}'
```

#### GET /admin/bookings
```bash
curl 'http://localhost:3001/admin/bookings?from=2026-02-24&userId=<userId>' -H 'authorization: Bearer <admin_access>'
```

#### POST /admin/bookings
```bash
curl -X POST http://localhost:3001/admin/bookings \
  -H 'authorization: Bearer <admin_access>' \
  -H 'content-type: application/json' \
  -d '{"userId":"<userId>","start":"2026-03-05T17:00:00+01:00"}'
```

#### PUT /admin/bookings/:bookingId
```bash
curl -X PUT http://localhost:3001/admin/bookings/12345 \
  -H 'authorization: Bearer <admin_access>' \
  -H 'content-type: application/json' \
  -d '{"start":"2026-03-05T19:00:00+01:00"}'
```

#### DELETE /admin/bookings/:bookingId
```bash
curl -X DELETE http://localhost:3001/admin/bookings/12345 -H 'authorization: Bearer <admin_access>'
```

#### POST /admin/impersonation/start (opzionale)
```bash
curl -X POST http://localhost:3001/admin/impersonation/start \
  -H 'authorization: Bearer <admin_access>' \
  -H 'content-type: application/json' \
  -d '{"targetUserId":"<userId>"}'
```
Ritorna un access token scoped impersonato.

#### POST /admin/impersonation/stop (opzionale)
```bash
curl -X POST http://localhost:3001/admin/impersonation/stop -H 'authorization: Bearer <admin_access>'
```

## SuperSaaS integration notes
### Wrapper implementati (server-side only)
- upsert utente SuperSaaS
- list/get utenti SuperSaaS (admin)
- list/get appointment
- create/update/delete appointment (resource schedule)
- availability/free slots

### Mapping / note tecniche
- `supersaasUserKey`: chiave stabile locale proposta = `<localUserId>fk`
- dati user sync: `name`, `email`, `phone`
- campi appointment inviati (mock iniziale): `name`, `email`, `phone`
- errori SuperSaaS mappati a errori applicativi (`404`, `422`, `5xx`)
- retry con backoff su errori transienti (`429`, `5xx`, timeout)

## TODO espliciti (dipendenti da configurazione SuperSaaS)
1. **Verificare endpoint/path esatti SuperSaaS** della tua istanza/account (il client e pronto ma i path possono variare secondo API version/account settings).
2. **Mappare campi Process personalizzati** (se usi custom fields su prenotazione) in `fields` di create/update booking.
3. **Notifiche email/SMS**: decidere se demandare a SuperSaaS o gestirle in backend (webhook/event bus).
4. **Resource mapping**: se `schedule_id=584424` ha risorse multiple con `resource_id`, aggiungere enum locale (`SALA_PICCOLA`, `SALA_GRANDE`, `SALA_REGISTRAZIONE`) -> `resource_id` reale.
5. **Webhooks SuperSaaS**: per sync eventuale verso DB locale (cache/analytics/audit avanzato).
6. **Caching free-slots** breve (30-60s) per alleggerire round-trip in UI con animazioni e retry.
7. **Idempotency persistence**: attualmente in-memory (valido per singola istanza); per produzione multi-instance usare Redis.
8. **Password sync verso SuperSaaS**: lasciare disabilitato salvo requisito reale (`SUPERSAAS_ENABLE_PASSWORD_SYNC`).

## Test
```bash
npm test
```
Copertura minima inclusa:
- validazione slot (17/19/21 + 2h)
- regola 48h
- RBAC/ownership
- privacy busy-slots
- integration rotte auth/me con mock service (nessuna chiamata reale a SuperSaaS)

## Sicurezza
- `@fastify/helmet`
- CORS configurabile da env
- `@fastify/rate-limit`
- JWT access/refresh separati
- refresh token persistiti e revocabili
- audit log azioni admin sensibili
- api key SuperSaaS mai esposta al client
