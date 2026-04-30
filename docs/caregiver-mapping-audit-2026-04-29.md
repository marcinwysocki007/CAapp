# Caregiver mapping & display audit

Generated: 2026-04-29

Probed three live caregivers (#9913 Filip K., #946 Jasper B., #9850 heniek t.)
from #7621's `JobOfferMatchingsWithPagination`, ran them through
`mapCaregiverToNurse`, and compared field-by-field.

## What we fix in this commit

| Issue | Before | After |
|---|---|---|
| **Slow modal open** — `GET_CAREGIVER` takes 1.7-3.1s on Mamamia beta | Every click pays full latency | Module-level cache in `caregiverCache.ts`; prefetch all visible matchings + applications in background after listing resolves; modal opens instantly on cache hit |
| **No loading state** — modal opened with empty "—" rows | User can't tell loading vs no-data | New `profileLoading` prop on `CustomerNurseModal`; renders shimmer skeleton over the 3 deep sections + the prose card while fetch in flight |
| **`nationality: "Polish"` (English label leaking to German UI)** | "Polish" / "Bulgarian" / "Romanian" | "Polnisch" / "Bulgarisch" / "Rumänisch" (20-entry lookup, unknown values pass through unchanged) |
| **`personalities: ["independent", "friendly"]`** | English in German UI | "selbstständig", "freundlich" (20-entry lookup) |
| **`hobbies: ["cooking", "crossword"]`** | English in German UI | "Kochen", "Kreuzworträtsel" (20-entry lookup) |
| **`mobilities: ["Mobile", "Wheelchair", "Bedridden"]`** | English in German UI | "Mobil", "Rollstuhl", "Bettlägerig" |
| **`education: "high_school"`** (raw enum key) | "high_school" / "studies" | "Gymnasium / Abitur" / "Studium" |
| **`marital_status`** mapped but never displayed | hidden from user | now shown as "Familienstand" row (translated to German) |
| **`weight: "81-90"` / `height: "171-180"`** — bare numbers | unclear if kg/lbs, cm/inches | "81-90 kg" / "171-180 cm" |
| **`driving_license`** collapsed to `Ja`/`Nein` | gearbox info lost | "Ja (Automatik / Schaltung / Automatik & Schaltung)" — gearbox surfaced from same enum |
| **`further_hobbies`** mapped but hidden | dead field | now shown as "Weitere Interessen" row when populated |

## Cache + prefetch design

`src/lib/mamamia/caregiverCache.ts`:
- `fetchCaregiver(id)` returns Promise; **dedupes in-flight** so two parallel callers (e.g. modal-open + prefetch) hit Mamamia once
- `getCached(id)` sync read
- `prefetchCaregivers(ids, concurrency=4)` — fire-and-forget background pump
- `subscribe(id, listener)` for hooks to react when value lands
- Pending → resolved/rejected state, errors retry on next fetch

`useCaregiver(id)` rewired to read cache first; if cached, modal opens
with **zero loading state** (instant render). On miss, subscribes to cache
notifications and shows skeleton until landed.

`CustomerPortalPage` now calls `prefetchCaregivers([...visible matchings,
...visible applications])` in a `useEffect` keyed on `mmReady + mmMatchings
+ mmApplications`. By the time the user clicks any caregiver card, GET_CAREGIVER
is either already done or in-flight (which the modal then awaits).

## Coverage of caregiver fields

Confirmed live (probed against beta):

| Mamamia field | Mapped | Rendered | Notes |
|---|---|---|---|
| `id` | ✓ | header avatar color seed | deterministic 20-color palette |
| `first_name` / `last_name` | ✓ | header name | "First L." pattern |
| `gender` | ✓ | "Über mich" | male/female only |
| `year_of_birth` | ✓ | "Über mich" + age compute | |
| `birth_date` | ✓ | age (preferred over year) | |
| `germany_skill` | ✓ | header bars | level_0..4 → A1..B2-C1 |
| `care_experience` | ✓ | "Erfahrung" pill | "X J. Erfahrung" |
| `available_from` | ✓ | availability badge | "Sofort" / "ab DD. Mon" |
| `last_contact_at` | ✓ | not shown directly | feeds `addedTime` (used elsewhere) |
| `last_login_at` | ✓ | `isLive` flag (currently not rendered visibly) | within 30min |
| `is_active_user` | ✓ | feeds `isLive` | |
| `hp_total_jobs` | ✓ | history chip | beta data has all 0s |
| `hp_total_days` | ✓ | experience fallback | |
| `hp_avg_mission_days` | ✓ | history chip | converted to months |
| `hp_recent_assignments` | ✓ | "Letzte Einsätze" cards | filtered status='finish' & past today |
| `weight` / `height` | ✓ | "Über mich" | now with kg/cm units |
| `marital_status` | ✓ | **NEW** "Familienstand" row | translated EN→DE |
| `smoking` | ✓ | "Besondere Merkmale" | no/yes/yes_outside |
| `driving_license` | ✓ | "Besondere Merkmale" | gearbox info now surfaced |
| `is_nurse` | ✓ | "Pflegeberuf erlernt" | Ja/Nein |
| `education` | ✓ | "Ausbildung" | translated EN→DE |
| `qualifications` | ✓ | "Qualifikationen" | shown when non-empty |
| `further_hobbies` | ✓ | **NEW** "Weitere Interessen" row | shown when non-empty |
| `motivation` / `about_de` | ✓ | "Über die Pflegekraft" prose | preference: about_de → motivation → fallback |
| `nationality.nationality` | ✓ | "Nationalität" | translated EN→DE |
| `hobbies[].hobby` | ✓ | "Hobbys" chips | translated EN→DE |
| `personalities[].personality` | ✓ | "Persönlichkeit" chips | translated EN→DE |
| `mobilities[].mobility` | ✓ | "Akzeptierte Mobilität" chips | translated EN→DE |
| `languagables[]` | ✓ | "Andere Sprachkenntnisse" chips | German filtered out |
| `avatar_retouched.aws_url` | ✓ | header img | falls back to initials |

Probed but **not exposed by Mamamia for these caregivers** (deliberately
not asked for in `GET_CAREGIVER` since beta data is sparse):
`pet_dog/cat/other`, `drinking_alcohol`, `fitness_level`,
`caregiver_skill_level`, `caregiver_experience_level`, `illnesses[]`,
`certifications[]`, `experiences[]`, `references[]`, `passport_country_code`,
`primary_language`, `*_description` text fields.

We can add these later if customers ask — they're all passthrough strings,
no mapping logic needed.

## Test coverage

`src/__tests__/mamamia/mappers.test.ts` adds 8 new tests covering
translations + units. `src/__tests__/mamamia/caregiverCache.test.ts`
adds 6 cache tests (dedup, getCached, isPending, prefetch idempotence,
subscribe/unsubscribe, rejection retry).

`npx vitest run src/__tests__/mamamia` → **65 passed, 0 failed**.
