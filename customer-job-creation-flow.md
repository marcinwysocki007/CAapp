# Tworzenie klientów i zleceń (Job Offers) w SADASH

## Architektura tokenów

Trzy oddzielne klienty GraphQL, każdy z innym tokenem i endpointem:

| Klient | Kiedy używany | Token | Endpoint |
|--------|--------------|-------|----------|
| **Default** (per-request) | Wszystkie operacje zalogowanego usera | `session('graphql_token')` — JWT z sesji | `/graphql` |
| **Admin** (singleton) | Tylko rejestracja nowej SA | `env(MAMAMIA_API_TOKEN)` — token sadash z .env | `/graphql` |
| **Auth** (singleton) | Login, reset hasła | brak tokena | `/graphql/auth` |

**Zasada bezpieczeństwa:** Żaden token nigdy nie trafia do JS. Wszystkie wywołania GraphQL idą przez Laravel controller → server-side HTTP client → API.

---

## 1. Rejestracja nowej Service Agency

**Route:** `POST /register` (middleware: `guest.graphql`)

### Krok 1: Utworzenie agencji (admin token)

```graphql
mutation StoreServiceAgency($name: String!) {
  StoreServiceAgency(name: $name) {
    id code name
  }
}
```
- **Token:** `graphql.admin` (env MAMAMIA_API_TOKEN — token oznaczony w systemie jako 'sadash')
- **Input:** `name` = nazwa agencji z formularza
- **Output:** `agency.id` — potrzebne w kroku 2

### Krok 2: Utworzenie pracownika/właściciela (admin token)

```graphql
mutation StoreServiceAgencyEmployee(
  $email: String!, $first_name: String!, $last_name: String!,
  $phone_country_id: Int!, $phone: String!,
  $service_agency_id: Int, $password: String
) {
  StoreServiceAgencyEmployee(
    email: $email, first_name: $first_name, last_name: $last_name,
    phone_country_id: $phone_country_id, phone: $phone,
    service_agency_id: $service_agency_id, password: $password
  ) { id email }
}
```
- **Token:** `graphql.admin` (ten sam)
- **Input:** dane z formularza + `service_agency_id` z kroku 1
- **phone_country_id:** 18 (DE +49) lub 37 (PL +48)

### Krok 3: Auto-login (bez tokena)

```graphql
mutation LoginAgency($email: String!, $password: String!, $remember: Boolean!) {
  LoginAgency(email: $email, password: $password, remember: $remember) {
    id name email token
  }
}
```
- **Token:** brak (endpoint `/graphql/auth` nie wymaga autoryzacji)
- **Output:** `token` — JWT tokena użytkownika
- **Po sukcesie:** `session('graphql_token') = token`, redirect na `/`

---

## 2. Tworzenie klienta (Customer)

**Route:** `POST /api/customers` (middleware: `auth.graphql`)  
**Token:** `session('graphql_token')` — JWT zalogowanego usera

### Mutacja GraphQL

```graphql
mutation StoreCustomer(
  $first_name: String, $last_name: String,
  $location_id: Int, $care_budget: Float,
  $commission_agent_salary: Float,
  $patients: [PatientInputType],
  $job_description: String, $accommodation: String,
  $internet: String, $other_people_in_house: String,
  $has_family_near_by: String, $smoking_household: String,
  $day_care_facility: String, $caregiver_time_off: String
) {
  StoreCustomer(
    first_name: $first_name, last_name: $last_name,
    location_id: $location_id, care_budget: $care_budget,
    commission_agent_salary: $commission_agent_salary,
    patients: $patients,
    job_description: $job_description,
    accommodation: $accommodation,
    internet: $internet,
    other_people_in_house: $other_people_in_house,
    has_family_near_by: $has_family_near_by,
    smoking_household: $smoking_household,
    day_care_facility: $day_care_facility,
    caregiver_time_off: $caregiver_time_off
  ) { id customer_id status }
}
```

### Walidacja Laravel (wymagane pola)

| Pole | Typ | Wymagane | Uwagi |
|------|-----|----------|-------|
| `location_id` | integer | ✅ | Z autocomplete `/api/locations?search=Berlin` |
| `care_budget` | numeric | ✅ | Budżet miesięczny w EUR |
| `patients` | array min:1 | ✅ | Min. 1 pacjent |
| `patients.*.gender` | in:male,female | ✅ | |
| `patients.*.year_of_birth` | integer 1900-2030 | ✅ | |
| `patients.*.care_level` | integer 1-5 | ✅ | Pflegegrad |
| `patients.*.mobility_id` | integer | ❌ | **ALE wymagane dla StoreJobOffer!** (API crash bez tego) |
| `patients.*.weight` | integer | ❌ | |
| `patients.*.night_operations` | string | ❌ | "yes" / "no" |
| `patients.*.dementia` | string | ❌ | "yes" / "no" |
| `first_name`, `last_name` | string | ❌ | Nazwa klienta |
| `job_description` | string | ❌ | Opis stanowiska |
| `accommodation` | string | ❌ | Typ zakwaterowania |
| `internet` | string | ❌ | "yes" / "no" |

### Odpowiedź

```json
{
  "success": true,
  "customer": {
    "id": 7546,
    "customer_id": "ts-12-7546",
    "status": "draft"
  }
}
```

### ⚠️ Ważne: mobility_id

**Pacjent MUSI mieć `mobility_id` jeśli planujemy później dodać JobOffer.** API backend w `JobOfferService::checkSuperJob3()` próbuje odczytać `patient.mobility` i crashuje z `"Attempt to read property 'mobility' on null"` jeśli nie jest ustawione.

Dostępne wartości mobility_id:
- `1` = Mobile (Vollständig mobil)
- `2` = Walking stick (Am Gehstock)
- `3` = Walker (Rollatorfähig)
- `4` = Wheelchair (Rollstuhlfähig)
- `5` = Bedridden (Bettlägerig)

---

## 3. Tworzenie zlecenia (Job Offer)

**Route:** `POST /api/job-offers` (middleware: `auth.graphql`)  
**Token:** `session('graphql_token')` — JWT zalogowanego usera

### Mutacja GraphQL

```graphql
mutation StoreJobOffer(
  $customer_id: Int!, $salary_offered: Float!,
  $salary_commission: Float, $arrival_at: String!,
  $departure_at: String, $title: String!,
  $description: String, $visibility: String
) {
  StoreJobOffer(
    customer_id: $customer_id,
    salary_offered: $salary_offered,
    salary_commission: $salary_commission,
    arrival_at: $arrival_at,
    departure_at: $departure_at,
    title: $title,
    description: $description,
    visibility: $visibility
  ) { id job_offer_id title status }
}
```

### Walidacja Laravel (wymagane pola)

| Pole | Typ | Wymagane | Uwagi |
|------|-----|----------|-------|
| `customer_id` | integer | ✅ | ID klienta z StoreCustomer |
| `salary_offered` | numeric | ✅ | Budżet w EUR/miesiąc |
| `arrival_at` | date | ✅ | Format: YYYY-MM-DD |
| `title` | string max:500 | ✅ | **API wymaga!** "Pole tytuł jest wymagane." |
| `salary_commission` | numeric | ❌ | Prowizja agencji |
| `departure_at` | date after:arrival_at | ❌ | Puste = bezterminowo |
| `description` | string | ❌ | Opis zlecenia |
| `visibility` | string | ❌ | Widoczność oferty |

### Odpowiedź

```json
{
  "success": true,
  "job_offer": {
    "id": 16189,
    "job_offer_id": "ts-12-7546-1",
    "title": "Betreuung Berlin E2E",
    "status": "search"
  }
}
```

### ⚠️ Znane pułapki API

1. **`title` jest wymagany** — API zwraca "Pole tytuł jest wymagane" bez niego
2. **`arrival_at` musi być unikalne per customer** — API zwraca "Job offer with arrival at exists" przy duplikacie
3. **`mobility_id` na pacjencie** — musi być ustawione PRZED StoreJobOffer, inaczej crash
4. **API "Internal server error"** — najczęściej oznacza brak `mobility` na pacjencie (checkSuperJob3)

---

## 4. Pełny flow z frontend (wizard → API)

### Diagram sekwencyjny

```
[Przeglądarka]                    [Laravel Controller]              [mamamia GraphQL API]
     |                                    |                                  |
     |--- POST /api/customers ----------->|                                  |
     |    {location_id, care_budget,      |--- StoreCustomer mutation ------>|
     |     patients, ...}                 |    (Bearer: session token)       |
     |                                    |<--- {id: 7546, status: draft} --|
     |<--- {success, customer} ----------|                                  |
     |                                    |                                  |
     |--- POST /api/job-offers ---------->|                                  |
     |    {customer_id: 7546,            |--- StoreJobOffer mutation ------->|
     |     title, salary_offered, ...}   |    (Bearer: session token)       |
     |                                    |<--- {id: 16189, status: search}-|
     |<--- {success, job_offer} ---------|                                  |
     |                                    |                                  |
     |--- router.reload() -------------->|                                  |
     |    (odświeżenie dashboardu)       |--- CustomersWithPagination ----->|
     |                                    |<--- dane klienta + job ---------|
     |<--- Dashboard z nowym klientem ---|                                  |
```

### Mapowanie danych (wizard → API)

Frontend (`handleJobCreated` w Dashboard.vue) transformuje dane wizarda:

```javascript
// Płeć: Männlich/Weiblich/male/female → "male"/"female"
mapGenderToApi('Männlich') → 'male'
mapGenderToApi('Weiblich') → 'female'

// Tak/Nie: Ja/Nein/Yes/No/Tak/Nie → "yes"/"no"
mapYesNo('Ja') → 'yes'
mapYesNo('Nein') → 'no'

// Pflegegrad: "Pflegegrad 3" → 3
parseCareLevel('Pflegegrad 3') → 3

// Mobilność: etykieta DE → mobility_id
mapMobilityToApi('Rollator') → 3
mapMobilityToApi('Rollstuhlfähig') → 4

// Palenie: Ja/Nein → "yes"/"no"
mapSmokingToApi('Nein') → 'no'

// Tytuł joba: nazwa klienta + lokalizacja
title = 'Schmidt Berlin – München'
```

### Lokalizacja (autocomplete)

```
GET /api/locations?search=Berlin
→ [{id: 590, location: "Berlin", zip_code: "10247", country_code: "DE"}, ...]
```

Wizard pokazuje dropdown z wynikami. Po wybraniu:
- `form.einsatzort = "Berlin"` (display name)
- `form.einsatzortId = 590` (API id → location_id w StoreCustomer)

---

## 5. CSRF + headers

Każdy POST/PUT/DELETE z frontendu wymaga CSRF tokena:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'X-XSRF-TOKEN': getCsrfToken()
}

function getCsrfToken() {
  return decodeURIComponent(
    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || ''
  )
}
```

---

## 6. Obsługa błędów

| Warstwa | Co się dzieje |
|---------|---------------|
| **GraphQL API error** | Controller łapie `GraphQLException`, loguje z detalami, zwraca 422 z `{success: false, error, details}` |
| **Laravel validation** | Automatyczny 422 z `errors` per pole |
| **Frontend fetch error** | Toast z komunikatem błędu |
| **Job failed, customer OK** | Console warn, reload i tak (klient się utworzył) |

### Przykład error response z details

```json
{
  "success": false,
  "error": "validation",
  "details": [{
    "message": "validation",
    "extensions": {
      "validation": {
        "title": ["Pole tytuł jest wymagane."],
        "arrival_at": ["Job offer with arrival at exists"]
      }
    }
  }]
}
```
