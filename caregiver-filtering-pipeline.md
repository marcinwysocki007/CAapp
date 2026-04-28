# Pipeline filtrowania opiekunek w Salead

## Przebieg

```
mamamia GraphQL API (PROD)
    |
    v
Supabase Edge Function: get-caregivers
    |
    v
DB cache (edge_cache table, TTL 30 min)
    |
    v
Frontend (React SPA)
```

---

## Krok 1: Zapytanie GraphQL

Jedno zapytanie do `backend.prod.mamamia.app/graphql` z trzema filtrami server-side:

```graphql
query($cutoff: String!) {
  CaregiversWithPagination(
    limit: 100,
    page: 1,
    filters: {
      last_contact: $cutoff,
      has_retouched_avatar: true,
      min_hp_jobs: 1
    }
  ) {
    total
    data {
      id first_name last_name gender birth_date year_of_birth
      care_experience available_from
      last_contact_at last_login_at is_active_user
      germany_skill hp_caregiver_id
      hp_total_jobs hp_total_days hp_avg_mission_days
      avatar_retouched { aws_url }
      hp_recent_assignments(limit: 5) {
        arrival_date departure_date postal_code city status
      }
    }
  }
}
```

### Zmienna

| Zmienna | Wartosc | Opis |
|---------|---------|------|
| `$cutoff` | data sprzed 30 dni (np. `2026-02-27`) | obliczana dynamicznie: `new Date() - 30 dni` |

### Filtry server-side (w WHERE clause bazy mamamia)

| Filtr | Wartosc | Co robi | Wplyw |
|-------|---------|---------|-------|
| `last_contact` | `$cutoff` | Tylko opiekunki, z ktorymi byl kontakt w ostatnich 30 dniach (WhatsApp, notatka rekrutera, aplikacja, telefon) | ~28000 -> ~1300 |
| `has_retouched_avatar` | `true` | Tylko opiekunki z profesjonalnie retuszowanym zdjeciem (gotowe do prezentacji) | ~1300 -> ~250 |
| `min_hp_jobs` | `1` | Tylko opiekunki z co najmniej 1 misja w historii HP (Helden Pflege) | ~250 -> ~150 |

### Pobierane pola (inline, bez dodatkowych requestow)

| Pole | Zrodlo | Do czego sluzy |
|------|--------|----------------|
| `id` | Caregiver | Wewnetrzny identyfikator MM |
| `first_name`, `last_name` | Caregiver | Wyswietlane jako "Imie N." (inicjal nazwiska) |
| `gender` | Caregiver | Ikona/avatar fallback |
| `birth_date` / `year_of_birth` | Caregiver | Wyliczenie wieku (birth_date priorytetowe, year_of_birth fallback) |
| `care_experience` | Caregiver | Lata doswiadczenia (surowa liczba, formatowana do "X J. Erfahrung") |
| `available_from` | Caregiver | Data dostepnosci (formatowana do "Sofort" / "ab 15. April") |
| `last_contact_at` | Caregiver | Kiedy ostatni kontakt ("gerade eben", "gestern", "vor 3 Tagen") |
| `last_login_at` | Caregiver | Czy jest "Live" (zalogowana w ciagu 30 min) |
| `is_active_user` | Caregiver | Czy konto aktywne (warunek dla Live badge) |
| `germany_skill` | Caregiver | Poziom niemieckiego: level_0..level_4 -> A1..B2-C1 |
| `hp_caregiver_id` | Caregiver | ID w systemie Helden Pflege |
| `hp_total_jobs` | HP Stats (inline) | Liczba zrealizowanych misji |
| `hp_total_days` | HP Stats (inline) | Laczna liczba dni na misjach |
| `hp_avg_mission_days` | HP Stats (inline) | Srednia dlugosc misji w dniach |
| `avatar_retouched.aws_url` | File (inline) | URL retuszowanego zdjecia |
| `hp_recent_assignments` | HP History (inline, limit 5) | Ostatnie 5 misji ze szczegolami |

---

## Krok 2: Filtr client-side w Edge Function

Po otrzymaniu wynikow z GraphQL, edge function stosuje dodatkowy filtr:

### Filtr: srednia dlugosc misji >= 15 dni

```typescript
const qualified = page.data.filter(
  (cg) => Math.abs(cg.hp_avg_mission_days || 0) >= 15
);
```

| Warunek | Opis |
|---------|------|
| `hp_avg_mission_days >= 15` | Odrzuca opiekunki z bardzo krotkimi misjami (np. jednorazowe zastepstwa) |

Wplyw: ~150 -> ~100-120 opiekunek.

---

## Krok 3: Sortowanie

```typescript
qualified.sort((a, b) => {
  const dateA = a.last_contact_at ? new Date(a.last_contact_at).getTime() : 0;
  const dateB = b.last_contact_at ? new Date(b.last_contact_at).getTime() : 0;
  return dateB - dateA;
});
```

Opiekunki sortowane od **najswiezszego kontaktu** do najstarszego. Najnowszy kontakt = na gorze listy.

---

## Krok 4: Filtrowanie zleceń w szczegolach

Dla `hp_recent_assignments` (wyswietlane w modalu profilu) stosujemy dodatkowe filtry:

```typescript
assignments
  .filter((a) =>
    a.arrival_date &&
    a.departure_date &&
    a.status === "finish" &&           // tylko zakonczone
    a.departure_date.slice(0, 10) < today  // tylko przeszle
  )
  .slice(0, 3)  // max 3 ostatnie
```

| Warunek | Dlaczego |
|---------|----------|
| `status === "finish"` | Wyklucza anulowane (`rejected`) i trwajace (`in_progress`, `accepted`) |
| `departure_date < today` | Wyklucza przyszle i aktualnie trwajace misje |
| `.slice(0, 3)` | Pokazujemy max 3 ostatnie misje w szczegolach profilu |

---

## Krok 5: Transformacja

Kazda opiekunka jest transformowana do formatu frontendowego:

| Pole frontendowe | Zrodlo | Transformacja |
|-----------------|--------|---------------|
| `name` | `first_name` + `last_name` | "Imie N." (inicjal nazwiska z kropka) |
| `age` | `birth_date` lub `year_of_birth` | Dokladny wiek z birth_date, przyblizona z year_of_birth. 0 jesli brak danych (frontend ukrywa) |
| `experience` | `care_experience` lub `hp_total_days` | Priorytet: care_experience (np. "5" -> "5 J. Erfahrung"), fallback: hp_total_days / 365 |
| `availability` | `available_from` | "Sofort" / "ab 15. April" |
| `availableSoon` | `available_from` | `true` jesli <= 14 dni lub brak daty |
| `language.level` | `germany_skill` | level_0="A1", level_1="A1-A2", level_2="A2-B1", level_3="B1-B2", level_4="B2-C1" |
| `language.bars` | `germany_skill` | level_0=1, level_1=2, level_2=3, level_3=4, level_4=5 |
| `color` | `id` | Deterministyczny kolor z palety 20 kolorow: `COLORS[id % 20]` |
| `addedTime` | `last_contact_at` | "gerade eben" / "vor 3 Std." / "gestern" / "vor 4 Tagen" / "vor 2 Wo." |
| `isLive` | `is_active_user` + `last_login_at` | `true` jesli aktywny i zalogowany w ciagu 30 minut |
| `image` | `avatar_retouched.aws_url` | URL retuszowanego zdjecia (podpisany, wygasa po 30 min) |
| `history.assignments` | `hp_total_jobs` | Liczba misji |
| `history.avgDurationWeeks` | `hp_avg_mission_days` | Srednia dlugosc w tygodniach (dni / 7, zaokraglone do 1 miejsca) |
| `detailedAssignments` | `hp_recent_assignments` | Max 3 zakonczone, przeszle misje z lokalizacja |

---

## Krok 6: Cache

Wynik jest zapisywany w tabeli `edge_cache` w Supabase:

```
key: "caregivers_v1"
data: [array of NurseResponse]
expires_at: now + 30 minutes
```

Nastepne requesty (w ciagu 30 min) zwracaja dane z cache bez odpytywania GraphQL.

---

## Podsumowanie pipeline

```
28 000 opiekunek w bazie mamamia
    |  filtr: last_contact >= 30 dni temu
    v
~1 300 opiekunek
    |  filtr: has_retouched_avatar = true
    v
~250 opiekunek
    |  filtr: min_hp_jobs >= 1
    v
~150 opiekunek
    |  filtr: hp_avg_mission_days >= 15 (client-side)
    v
~100-120 opiekunek
    |  sort: last_contact_at DESC
    |  limit: 100
    v
max 100 opiekunek na liscie

    W szczegolach profilu:
    hp_recent_assignments
        |  filtr: status == "finish"
        |  filtr: departure_date < today
        |  limit: 3
        v
    max 3 zakonczone misje
```

## Autentykacja

| Element | Mechanizm |
|---------|-----------|
| Frontend -> Edge Function | Supabase Anon Key (publiczny, w headerze `Authorization: Bearer ...`) |
| Edge Function -> GraphQL API | Mamamia API Token (prywatny, w `Deno.env.get("MAMAMIA_API_TOKEN")`) |
| Konto API | `mm+salead@vitanas.pl` — LoginAgency na `backend.prod.mamamia.app/graphql/auth` |

## Timing

| Scenariusz | Czas |
|------------|------|
| Cold start (cache miss) | ~7s |
| Cache hit | ~1.5s |
| Cache TTL | 30 minut |
