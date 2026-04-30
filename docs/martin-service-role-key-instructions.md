# Instrukcja dla Martina — eksport service role key z Supabase

Cześć Martin,

Do integracji nowego portalu klienta Primundus z Mamamia potrzebujemy dodać 4 kolumny do tabeli `leads` w projekcie Supabase `ycdwtrklpoqprabtwahi` (przyklej onboardingu Mamamia). Migracja jest idempotentna (`IF NOT EXISTS`), nie dotyka istniejących danych.

Są dwie opcje — wybierz którą wolisz:

---

## Opcja A (preferowana): prześlij service role key

Umożliwi nam zautomatyzowane uruchamianie migracji teraz i w przyszłości (m.in. wdrożenie Edge Function `onboard-to-mamamia`).

### Krok po kroku

1. Zaloguj się na https://supabase.com/dashboard
2. Wybierz projekt **„ycdwtrklpoqprabtwahi"** (URL projektu: `https://ycdwtrklpoqprabtwahi.supabase.co`, może być nazwany inaczej w dashboardzie — np. „primundus-landing" lub podobnie; szukaj po reference ID).
3. W lewym sidebar kliknij ikonę koła zębatego **„Project Settings"** (na dole).
4. W menu projektu wybierz **„API"**.
5. Zjedź do sekcji **„Project API keys"** — są tam dwa klucze:
   - `anon` / `public` — **to NIE ten**, już go mamy, jest publiczny (w `render.yaml` portalu).
   - `service_role` / `secret` — **to jest ten** który potrzebujemy. Będzie opatrzony ostrzeżeniem: *„This key has the ability to bypass Row Level Security. Never share it publicly."*
6. Przy `service_role` kliknij ikonę oka 👁 („Reveal") lub przycisk „Copy".
7. **Prześlij klucz bezpiecznym kanałem** (Signal, 1Password Shared Vault, zaszyfrowany e-mail — **NIE Slack w plain DM i NIE zwykły e-mail**).

### Co z nim zrobimy
- Zapiszemy go w locie do uruchomienia migracji SQL dodającej kolumny `mamamia_customer_id`, `mamamia_job_offer_id`, `mamamia_user_token`, `mamamia_onboarded_at` do tabeli `leads`.
- Użyjemy go w Supabase Edge Function `onboard-to-mamamia` (trzymane jako `SUPABASE_SERVICE_ROLE_KEY` secret w Supabase, NIE w CAapp frontend).
- **Nie wycieknie do przeglądarki** — idzie wyłącznie server-side (Edge Function jest hostowany w Supabase).

### Możesz zamiast tego (lub równolegle) dodać nas jako team member
Settings → Team → Invite → `michal.t.kepinski@gmail.com` z rolą `Developer` lub `Admin`. Wtedy można pracować bez ręcznego wysyłania service key.

---

## Opcja B (jeśli wolisz zachować klucz u siebie): uruchom SQL sam

Poniżej pełny SQL. Wklej w Supabase SQL Editor (`Dashboard → SQL Editor → New query`) i kliknij Run. Migracja jest idempotent — można puścić wielokrotnie bez efektów ubocznych.

```sql
-- Dodaje kolumny dla cache'a onboardingu Mamamia (idempotency flow).
-- Edge Function `onboard-to-mamamia` czyta/zapisuje te wartości żeby
-- drugie otwarcie linku `?token=...` nie duplikowało Customer/JobOffer w Mamamii.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS mamamia_customer_id  integer,
  ADD COLUMN IF NOT EXISTS mamamia_job_offer_id integer,
  ADD COLUMN IF NOT EXISTS mamamia_user_token   text,
  ADD COLUMN IF NOT EXISTS mamamia_onboarded_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_leads_mamamia_customer_id
  ON leads(mamamia_customer_id)
  WHERE mamamia_customer_id IS NOT NULL;

COMMENT ON COLUMN leads.mamamia_customer_id   IS 'Customer.id z Mamamia beta — zapisane przy pierwszym onboardingu (Edge Function onboard-to-mamamia)';
COMMENT ON COLUMN leads.mamamia_job_offer_id  IS 'JobOffer.id z Mamamia beta — auto-created razem z Customer';
COMMENT ON COLUMN leads.mamamia_user_token    IS 'Agency JWT token z LoginAgency — używany przez browser jako Bearer do /graphql queries. Shared per-agency (Primundus), NIE per-user.';
COMMENT ON COLUMN leads.mamamia_onboarded_at  IS 'Timestamp pierwszego udanego onboardingu. null = lead jeszcze nie odwiedzony lub onboarding failed.';
```

Po uruchomieniu potwierdź w SQL Editor:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leads' AND column_name LIKE 'mamamia_%';
```
Powinno zwrócić 4 wiersze.

---

## Oraz — osobne pytanie na przyszłość

Czy możesz nas dodać jako Team member w projekcie `ycdwtrklpoqprabtwahi` (Dashboard → Settings → Team → Invite)? Email: `michal.t.kepinski@gmail.com`. Rola: `Developer` albo `Admin`. Uprości kolejne migracje bez wysyłania kluczy ręcznie.

Dzięki!
