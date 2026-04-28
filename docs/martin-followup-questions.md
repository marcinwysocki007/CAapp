# Pytania uzupełniające do Martina (oprócz service key)

Po service role key (zob. [martin-service-role-key-instructions.md](./martin-service-role-key-instructions.md)) zostały 2 drobne technicznie rzeczy:

## 1. Czy istnieje mutacja odwracająca `RejectApplication`?

Nasz portal ma UX „Ablehnung rückgängig machen" — klient odrzuca aplikację opiekunki i chce mieć możliwość cofnąć tę decyzję (mentalny „undo", scenariusz: przypadkowy klik).

W introspekcji schematu na becie znaleźliśmy tylko `RejectApplication(id, reject_message)`. Nie ma jawnej `RestoreApplication`, `UndoRejectApplication`, `UnrejectApplication`.

**Pytanie**: czy jest sposób na cofnięcie `rejected_at`? Opcje które widzę:
- (a) `UpdateApplication(id, ...)` — czy można wysłać `rejected_at: null`? (W argumentach mutacji nie widzę `rejected_at`, ale może backend jakoś obsługuje.)
- (b) Osobna mutacja niewidoczna w introspection (wewnętrzna / admin-only).
- (c) Nie, decline to decyzja finalna — wtedy usuniemy przycisk z UI i polegamy na modal confirm przed decline'em.

**Preferowana odpowiedź**: (c) jest najprostsze jeśli product OK. (b) było mile widziane jeśli opcja istnieje.

## 2. CORS whitelist dla produkcji portalu

Pracujemy z założeniem że produkcyjny portal klienta stanie pod **`portal.primundus.de`**. Potrzebujemy:

- **Whitelist w Mamamii**: żeby browser mógł bezpośrednio wywoływać GraphQL Mamamii, gdyby zaszła taka potrzeba. *(Uwaga: w naszej architekturze Pełny BFF — browser nie łączy się direct z Mamamii, tylko przez Supabase Edge Function. Więc Mamamia CORS nie jest strict blocker, ale warto mieć w backlogu na wypadek zmian architektonicznych.)*
- **Whitelist w Supabase Edge Function**: tutaj robimy sami w kodzie Edge Function (Allow-Origin = `https://portal.primundus.de`). Nie jest potrzebna akcja po Twojej stronie.

**Pytanie**: czy możesz dodać `https://portal.primundus.de` (+ `https://localhost:5173` dla dev) do whitelisty CORS Mamamia beta i prod?

---

## Kontekst

Większość wcześniejszych niewiadomych odkryliśmy introspekcją + live testem na becie. Rozwiązane samodzielnie:
- Auth + token (StoreServiceAgency + Employee + LoginAgency → wł. konto Primundus na becie)
- Shape wszystkich kluczowych typów (PatientInputType, ContractPatientInputType, ContractContactInputType)
- Mutacje invite (SendInvitationCaregiver / StoreRequest / StoreInterest)
- Accept flow (StoreConfirmation, nie UpdateApplication)
- Matching timing (natychmiastowy po StoreJobOffer, żaden trigger)
- Location lookup (Locations(search) natywnie w GraphQL)

Dzięki za pomoc!
