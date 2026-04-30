# 10-customer end-to-end matrix — via product flow

Generated: 2026-04-29

Path: `Supabase leads (insert) → onboard-to-mamamia → mamamia-proxy (updateCustomer + getCustomer)`

Result: **10/10** fixtures fully passed, **274/274** field assertions green, **0 failures**.

## What was tested

Full product flow per fixture:

1. **INSERT** lead into `leads` table with `status='vertrag_abgeschlossen'`,
   `kalkulation.formularDaten` (Stage-A calculator answers), `patient_*`
   identity columns (Stage-B contract data), and a fresh `token`.
2. **POST** `/functions/v1/onboard-to-mamamia` `{ token }` → triggers
   the deployed Edge Function which: looks up lead via service-role,
   `LoginAgency`, `StoreCustomer` + `StoreJobOffer`, writes
   `mamamia_customer_id` back to lead, returns session JWT cookie.
3. **POST** `/functions/v1/mamamia-proxy` `{ action: "getCustomer" }`
   to read the existing `patients[].id` array (needed so UpdateCustomer
   doesn't silently drop fields like `night_operations`/`incontinence`).
4. **POST** `/functions/v1/mamamia-proxy` `{ action: "updateCustomer", variables: <patientFormMapper output> }`
   — simulates the in-portal patient form save.
5. **POST** `/functions/v1/mamamia-proxy` `{ action: "getCustomer" }`
   again → diff Mamamia state against expectations (~25 columns per fixture).

This is the **same code path a real customer hits** when they open the
contract link, except we automate it and skip browser. No direct
Mamamia GraphQL credentials touched the script — all the privileged
`MAMAMIA_*` secrets stay in deployed Edge Function env.

## Summary

| # | Fixture | Lead | Customer | Result |
|---|---|---|---|---|
| 1 | F1: Pg1 mobil single Berlin, no dementia, dog | `9c4f6725` | [7613](https://beta.mamamia.app/customer/7613) | ✅ |
| 2 | F2: Pg5 bettlaegerig couple München, severe dementia, both inc | `988b6669` | [7614](https://beta.mamamia.app/customer/7614) | ✅ |
| 3 | F3: Pg3 rollstuhl single female Hamburg, mild dementia, urine inc | `a097acf3` | [7615](https://beta.mamamia.app/customer/7615) | ✅ |
| 4 | F4: Pg2 rollator couple Köln, no dementia, smoking allowed | `e56222c3` | [7616](https://beta.mamamia.app/customer/7616) | ✅ |
| 5 | F5: Pg4 gehstock single male Frankfurt, moderate dementia | `e54313ee` | [7617](https://beta.mamamia.app/customer/7617) | ✅ |
| 6 | F6: Pg2 rollator single female Stuttgart Dorf/Land, andere pets | `4409d5a2` | [7618](https://beta.mamamia.app/customer/7618) | ✅ |
| 7 | F7: Pg3 mobil couple Düsseldorf, no extras | `53a6dafb` | [7619](https://beta.mamamia.app/customer/7619) | ✅ |
| 8 | F8: Pg5 bettlaegerig single female Dresden, severe dementia, both inc | `a3da6e77` | [7620](https://beta.mamamia.app/customer/7620) | ✅ |
| 9 | F9: Pg1 mobil single Hannover Kleinstadt, smoking allowed | `d31906c8` | [7621](https://beta.mamamia.app/customer/7621) | ✅ |
| 10 | F10: Pg4 rollstuhl couple Leipzig, mixed mobility/dementia | `32872377` | [7622](https://beta.mamamia.app/customer/7622) | ✅ |

## Coverage matrix

| Axis | Values exercised |
|---|---|
| Pflegegrad | 1 (×2), 2 (×2), 3 (×2), 4 (×2), 5 (×2) — **all 5 levels twice** |
| Patient count | 1 (×6), 2 (×4) |
| Mobility (P1) | mobil (×3), rollator (×2), gehstock, rollstuhl (×2), bettlägerig (×2) |
| Mobility (P2 in couples) | mobil, rollstuhl, mobil, rollator |
| Dementia | nein (×4), leichtgradig, mittelgradig (×2), schwer (×2), couple-mixed |
| Incontinence | nein (×6), harn, stuhl, beides (×2) |
| Night ops | no (×6), up_to_1_time, 1_2_times (×2), more_than_2 (×2) |
| Lift | Ja (×4), Nein (×6) |
| Wohnungstyp | Einfamilienhaus (×6), Mehrfamilienhaus (×4) |
| Urbanisierung | Großstadt (×6), Kleinstadt (×2), Dorf/Land |
| Cities | Berlin, München, Hamburg, Köln, Frankfurt, Stuttgart, Düsseldorf, Dresden (leading-zero PLZ), Hannover, Leipzig |
| Pets | Hund (×3), Katze (×2), Andere, Keine (×4) |
| Caregiver accommodated | room_premises (×5), area_premises (×2), room_other_premises, area_other_premises (×2) |
| Wish gender | not_important (×3), male (×2), female (×5) |
| Smoking allowed | yes_outside (×2), no (×8) |
| Internet | Ja (×9), Nein (×1) |
| Day care facility | yes (×4), no (×4), Geplant→yes (×2) |
| Family near by | Ja (×7), Nein (×3) |

## Per-fixture detail

Each row is one of ~25–30 column assertions verified against Mamamia's
`Customer` query response. All boxes green; if any had failed they'd
appear here with the diff.

### 1. F1 — Pg1 mobil single Berlin, no dementia, dog → Customer #7613

| Check | Got | Expected |
|---|---|---|
| status | `"active"` | `"active"` |
| patients.length | `1` | `1` |
| p[0].gender / year_of_birth / care_level | `female / 1955 / 1` | match |
| p[0].mobility_id / lift_id | `1 / 2` | match |
| p[0].dementia / incontinence | `no / false` | match |
| p[0].night_operations | `"no"` | match |
| accommodation / urbanization_id | `single_family_house / 3` | match |
| has_family_near_by / internet / day_care_facility | `yes / yes / no` | match |
| pets / is_pet_dog / is_pet_cat / is_pet_other | `yes / true / false / false` | match |
| caregiver_accommodated / other_people_in_house | `room_premises / no` | match |
| location_id | `1148` | resolved (Berlin) |
| wish.gender / smoking | `not_important / no` | match |
| wish.tasks contains "Spaziergänge" | yes | yes |
| job_description contains "Bluthochdruck" | yes | yes |

### 2. F2 — Pg5 bettlaegerig couple München → Customer #7614

| Check | Got | Expected |
|---|---|---|
| patients.length | `2` | `2` |
| p[0] (older male, Pg5, bettlägerig) | `male / 1938 / 5 / 5 / 1` | match |
| p[0].dementia / incontinence triplet | `yes / true·true·true` | match (Beides) |
| p[0].night_operations | `"more_than_2"` | match |
| p[1] (Pg4, rollstuhl) | `female / 1942 / 4 / 4 / 1` | match |
| p[1].incontinence triplet | `true·false·true` | match (Harninkontinenz) |
| p[1].night_operations | `"1_2_times"` | match |
| dementia_description | `"Demenzdiagnose: schwer."` + `"Demenzdiagnose: mittelgradig."` | gradation preserved |
| accommodation / urbanization_id | `apartment / 3` | match |
| pets / caregiver_accommodated | `no / area_premises` | match |
| other_people_in_house | `yes` | match (anzahl=2) |
| job_description contains "Alzheimer" | yes | yes |
| wish.gender / smoking | `female / no` | match |

### 3. F3 — Pg3 rollstuhl single female Hamburg → Customer #7615

| Check | Got | Expected |
|---|---|---|
| p[0] (rollstuhl Pg3, lift Ja) | `female / 1948 / 3 / 4 / 1` | match |
| p[0].dementia + description | `yes` + `leichtgradig` | gradation preserved |
| p[0].incontinence triplet | `true·false·true` | match (Harninkontinenz) |
| p[0].night_operations | `"up_to_1_time"` | match |
| accommodation / urbanization_id | `apartment / 3` | match |
| has_family_near_by | `yes` | match |
| day_care_facility | `yes` | "Geplant" → yes |
| pets / is_pet_cat | `yes / true` (others false) | match |
| caregiver_accommodated | `room_premises` | match |
| wish.gender / smoking | `female / no` | match |

### 4. F4 — Pg2 rollator couple Köln → Customer #7616

| Check | Got | Expected |
|---|---|---|
| p[0] / p[1] (Pg2 male rollator + Pg2 female mobil) | match | match |
| Both dementia=no, incontinence=false | ✓ | ✓ |
| accommodation / urbanization_id | `single_family_house / 2` | Kleinstadt |
| caregiver_accommodated | `area_other_premises` | match (Bereich extern) |
| pets / is_pet_dog | `yes / true` | match |
| wish.gender / smoking | `male / yes_outside` | smoking allowed correctly |

### 5. F5 — Pg4 gehstock single male Frankfurt → Customer #7617

| Check | Got | Expected |
|---|---|---|
| p[0] (Pg4 gehstock, lift Nein) | `male / 1942 / 4 / 2 / 2` | match |
| p[0].dementia + description | `yes` + `mittelgradig` | gradation preserved |
| p[0].incontinence triplet | `true·true·false` | match (Stuhl) |
| p[0].night_operations | `"1_2_times"` | match |
| accommodation / urbanization_id | `apartment / 3` | match |
| internet | `no` | match |
| day_care_facility | `yes` | match |
| caregiver_accommodated | `room_other_premises` | match |
| wish.gender / smoking | `not_important / no` | match |

### 6. F6 — Pg2 rollator single female Stuttgart Dorf/Land → Customer #7618

| Check | Got | Expected |
|---|---|---|
| p[0] | `female / 1940 / 2 / 3 / 2` | match |
| accommodation / urbanization_id | `single_family_house / 1` | Dorf/Land=1 |
| pets / is_pet_other | `yes / true` (dog/cat false) | match (Andere) |
| wish.gender / smoking | `female / no` | match |

### 7. F7 — Pg3 mobil couple Düsseldorf → Customer #7619

| Check | Got | Expected |
|---|---|---|
| p[0] / p[1] both Pg3, mobility_id=1 | match | match |
| Both dementia=no, incontinence=false, night=no | ✓ | ✓ |
| accommodation / urbanization_id | `single_family_house / 3` | match |
| pets | `no` | match |
| caregiver_accommodated | `room_premises` | match |
| other_people_in_house | `yes` | match (couple) |

### 8. F8 — Pg5 bettlaegerig single female Dresden → Customer #7620

Notable: leading-zero PLZ "01067" resolved to location_id `1001` ✓.

| Check | Got | Expected |
|---|---|---|
| p[0] (Pg5 bettlägerig, lift Ja) | `female / 1935 / 5 / 5 / 1` | match |
| p[0].dementia + description | `yes` + `schwer` | gradation preserved |
| p[0].incontinence triplet | `true·true·true` | match (Beides) |
| p[0].night_operations | `"more_than_2"` | match |
| accommodation / urbanization_id | `apartment / 3` | match |
| caregiver_accommodated | `area_premises` | match (Gesamter Bereich) |
| location_id | `1001` | leading-zero PLZ resolved |

### 9. F9 — Pg1 mobil single Hannover Kleinstadt → Customer #7621

| Check | Got | Expected |
|---|---|---|
| p[0] | `male / 1960 / 1 / 1 / 2` | match |
| accommodation / urbanization_id | `single_family_house / 2` | Kleinstadt |
| has_family_near_by | `no` | match |
| pets / is_pet_dog | `yes / true` | match |
| wish.gender / smoking | `male / yes_outside` | smoking allowed |

### 10. F10 — Pg4 rollstuhl couple Leipzig (mixed) → Customer #7622

| Check | Got | Expected |
|---|---|---|
| p[0] (female Pg4 rollstuhl, lift Ja) | `female / 1944 / 4 / 4 / 1` | match |
| p[0].dementia + description | `yes` + `mittelgradig` | gradation preserved |
| p[0].incontinence triplet | `true·false·true` | Harn-only |
| p[0].night_operations | `"1_2_times"` | match |
| p[1] (male Pg3 rollator, no lift) | `male / 1940 / 3 / 3 / 2` | match |
| p[1].dementia + description | `yes` + `leichtgradig` | second-patient gradation preserved |
| p[1].incontinence | `false` | match |
| p[1].night_operations | `"up_to_1_time"` | match |
| accommodation / urbanization_id | `single_family_house / 3` | match |
| pets / is_pet_cat | `yes / true` | match |
| caregiver_accommodated | `area_other_premises` | match |
| wish.gender / smoking | `female / no` | match |

## Conclusion

The full lead → onboard → patient-form-save pipeline lands every audited
column in Mamamia correctly across all 10 permutations:

- **Onboard mapper** (`supabase/functions/onboard-to-mamamia/mappers.ts`) —
  formularDaten + Stage-B identity → StoreCustomer / StoreJobOffer.
- **Patient form mapper** (`src/lib/mamamia/patientFormMapper.ts`) —
  PatientFormShape → UpdateCustomer.
- **Proxy whitelist** (`supabase/functions/mamamia-proxy/actions.ts`) —
  enforces allowed fields on UpdateCustomer + nested `customer_caregiver_wish`.

Edge cases verified live:

- Leading-zero PLZ "01067" resolved (Dresden → 1001)
- Couple where lead-orderer ≠ patient-1 identity (Frau Helga Brenner orders for
  Herr Klaus Brenner; Frau Inge Fischer orders for Herr Hans Fischer; Herr
  Manfred Schulz orders for Frau Brigitte Schulz) — all kept distinct in
  `customer_contracts`.
- Per-patient dementia gradation preserved through `dementia_description` even
  when both spouses have different severity (F10: mittelgradig + leichtgradig).
- "Geplant" for `pflegedienst` correctly maps to `day_care_facility=yes` (no
  third option in Mamamia).
- All 4 `caregiver_accommodated` enum values exercised.
- All 3 `urbanization_id` values exercised (Großstadt=3, Kleinstadt=2, Dorf=1).

## Reproduction

```sh
deno run --allow-net --allow-env --allow-read --allow-write \
  /tmp/matrix-10-via-product-flow.mjs
```

Script lives at `/tmp/matrix-10-via-product-flow.mjs`. Uses only Supabase
anon key — all Mamamia credentials remain in deployed Edge Function env.
