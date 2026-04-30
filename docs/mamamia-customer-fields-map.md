# Mamamia customer fields map

> Generated 2026-04-28 from prod DB read-only sweep + GraphQL introspection.
> Source-of-truth for what `UpdateCustomer` / `StoreCustomerContract` /
> `UpdateCustomerOnboarding` actually need to land a customer in
> `status='active'` so `SendInvitationCaregiver` can fire.

## How to read this

- Column lists below are the **DB schema** as of the snapshot. GraphQL
  arguments mirror most but not all of these — anything in
  `UpdateCustomer` / `StoreCustomer` mutation arglist is settable
  agency-side.
- Enum permutations come from a `GROUP BY value` over the **whole
  prod table** (filtering NULLs). Counts indicate how often each value
  appears in the wild — pick the most-common when in doubt.
- Fill-rate diff (active vs draft) is over a 200-row random sample for
  each status. `active` is the goal state; columns at 100% in active
  and ~0% in draft are the must-fill set.

---

## 1. Schema — every column in every customer-related table

### `customers` (99 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `uuid` | varchar(191) | YES | — |  |
| `service_agency_id` | bigint unsigned | YES | — | MUL |
| `location_id` | bigint unsigned | YES | — | MUL |
| `location_custom_text` | varchar(191) | YES | — |  |
| `urbanization_id` | bigint unsigned | YES | — | MUL |
| `language_id` | bigint unsigned | YES | — | MUL |
| `customer_id` | varchar(191) | YES | — |  |
| `hp_customer_id` | varchar(191) | YES | — | MUL |
| `hp_customer_group_id` | bigint unsigned | YES | — | MUL |
| `is_from_hp` | tinyint(1) | NO | 0 |  |
| `status` | varchar(191) | YES | — |  |
| `accommodation` | varchar(191) | YES | — | MUL |
| `accommodation_comment` | text | YES | — |  |
| `accommodation_comment_pl` | text | YES | — |  |
| `accommodation_comment_en` | text | YES | — |  |
| `accommodation_comment_de` | text | YES | — |  |
| `accommodation_description` | text | YES | — |  |
| `accommodation_description_pl` | text | YES | — |  |
| `accommodation_description_en` | text | YES | — |  |
| `accommodation_description_de` | text | YES | — |  |
| `caregiver_accommodated` | varchar(191) | YES | — |  |
| `caregiver_accommodated_description` | text | YES | — |  |
| `internet` | varchar(191) | YES | — |  |
| `smoking_household` | varchar(191) | YES | — |  |
| `tasks_taken_over` | text | YES | — |  |
| `tasks_taken_over_pl` | text | YES | — |  |
| `tasks_taken_over_en` | text | YES | — |  |
| `tasks_taken_over_de` | text | YES | — |  |
| `day_care_facility` | text | YES | — |  |
| `day_care_facility_description` | text | YES | — |  |
| `day_care_facility_description_de` | text | YES | — |  |
| `day_care_facility_description_en` | text | YES | — |  |
| `day_care_facility_description_pl` | text | YES | — |  |
| `caregiver_time_off` | text | YES | — |  |
| `caregiver_time_off_de` | text | YES | — |  |
| `caregiver_time_off_en` | text | YES | — |  |
| `caregiver_time_off_pl` | text | YES | — |  |
| `night_operations` | text | YES | — |  |
| `first_name` | varchar(191) | YES | — |  |
| `last_name` | varchar(191) | YES | — |  |
| `pesel` | varchar(191) | YES | — |  |
| `arrival_at` | date | YES | — |  |
| `departure_at` | date | YES | — |  |
| `vat` | varchar(191) | YES | — |  |
| `monthly_salary` | double(8,2) | YES | — |  |
| `commission_agent_salary` | double(8,2) | YES | — |  |
| `care_budget` | double(8,2) | YES | — |  |
| `job_description` | text | YES | — |  |
| `job_description_de` | text | YES | — |  |
| `job_description_en` | text | YES | — |  |
| `job_description_pl` | text | YES | — |  |
| `responsibility` | varchar(191) | YES | — |  |
| `other_people_in_house` | varchar(191) | YES | — |  |
| `other_people_in_house_description` | text | YES | — |  |
| `other_people_in_house_description_pl` | text | YES | — |  |
| `other_people_in_house_description_en` | text | YES | — |  |
| `other_people_in_house_description_de` | text | YES | — |  |
| `has_family_near_by` | varchar(191) | YES | — |  |
| `description` | text | YES | — |  |
| `email` | varchar(191) | YES | — |  |
| `phone` | varchar(191) | YES | — |  |
| `gender` | varchar(191) | YES | — |  |
| `year_of_birth` | int | YES | — |  |
| `weight` | int | YES | — |  |
| `visibility` | varchar(191) | YES | — |  |
| `invoice_party` | varchar(191) | YES | — |  |
| `rating_avg` | double(8,2) | YES | — |  |
| `can_caregiver_review` | tinyint(1) | YES | — |  |
| `can_request_caregiver` | tinyint(1) | YES | — |  |
| `image_filename` | varchar(191) | YES | — |  |
| `was_import_pdf` | tinyint(1) | NO | 0 |  |
| `was_translate` | tinyint(1) | NO | 0 |  |
| `sent_to_sa_at` | timestamp | YES | — |  |
| `pets` | varchar(191) | YES | — |  |
| `is_pet_dog` | tinyint(1) | YES | — |  |
| `is_pet_cat` | tinyint(1) | YES | — |  |
| `is_pet_other` | tinyint(1) | YES | — |  |
| `pets_other` | text | YES | — |  |
| `description_of_pets` | text | YES | — |  |
| `other_equipments` | text | YES | — |  |
| `other_equipments_pl` | text | YES | — |  |
| `other_equipments_en` | text | YES | — |  |
| `other_equipments_de` | text | YES | — |  |
| `locale` | varchar(191) | YES | — |  |
| `last_automatic_update_at` | timestamp | YES | — |  |
| `is_data_refresh_required` | tinyint(1) | NO | 0 |  |
| `is_disabled` | tinyint(1) | NO | 0 | MUL |
| `is_premium` | tinyint(1) | YES | — | MUL |
| `is_special_surcharge` | tinyint(1) | YES | — | MUL |
| `is_scandicare` | tinyint(1) | NO | 0 | MUL |
| `is_exclusive` | tinyint(1) | NO | 0 | MUL |
| `exclusivity_updated_at` | timestamp | YES | — |  |
| `dedicated_hp_caregiver_ids` | json | YES | — |  |
| `dedicated_updated_at` | timestamp | YES | — |  |
| `caregiver_remarks` | text | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `patients` (45 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `job_offer_id` | bigint unsigned | YES | — |  |
| `customer_id` | bigint unsigned | YES | — | MUL |
| `lift_id` | bigint unsigned | YES | — | MUL |
| `mobility_id` | bigint unsigned | YES | — | MUL |
| `gender` | varchar(191) | YES | — |  |
| `weight` | varchar(191) | YES | — |  |
| `height` | varchar(191) | YES | — |  |
| `night_operations` | varchar(191) | YES | — |  |
| `night_operations_description` | text | YES | — |  |
| `night_operations_description_de` | text | YES | — |  |
| `night_operations_description_en` | text | YES | — |  |
| `night_operations_description_pl` | text | YES | — |  |
| `year_of_birth` | int | YES | — |  |
| `care_level` | int | YES | — |  |
| `dementia` | varchar(191) | YES | — |  |
| `dementia_description` | text | YES | — |  |
| `dementia_description_de` | text | YES | — |  |
| `dementia_description_en` | text | YES | — |  |
| `dementia_description_pl` | text | YES | — |  |
| `incontinence` | tinyint(1) | YES | — |  |
| `incontinence_feces` | tinyint(1) | YES | — |  |
| `incontinence_urine` | tinyint(1) | YES | — |  |
| `smoking` | tinyint(1) | YES | — |  |
| `physical_condition` | text | YES | — |  |
| `mental_condition` | text | YES | — |  |
| `features_condition` | text | YES | — |  |
| `features_condition_de` | text | YES | — |  |
| `features_condition_en` | text | YES | — |  |
| `features_condition_pl` | text | YES | — |  |
| `other_tools` | text | YES | — |  |
| `other_tools_pl` | text | YES | — |  |
| `other_tools_en` | text | YES | — |  |
| `other_tools_de` | text | YES | — |  |
| `lift_description` | text | YES | — |  |
| `lift_description_de` | text | YES | — |  |
| `lift_description_en` | text | YES | — |  |
| `lift_description_pl` | text | YES | — |  |
| `lift_mobility_description` | text | YES | — |  |
| `lift_mobility_description_pl` | text | YES | — |  |
| `lift_mobility_description_en` | text | YES | — |  |
| `lift_mobility_description_de` | text | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `customer_caregiver_wishes` (29 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `customer_id` | bigint unsigned | YES | — | MUL |
| `is_open_for_all` | tinyint(1) | YES | — |  |
| `gender` | varchar(191) | YES | — |  |
| `germany_skill` | varchar(191) | YES | — |  |
| `alternative_germany_skill` | varchar(191) | YES | — | MUL |
| `driving_license` | varchar(191) | YES | — |  |
| `driving_license_gearbox` | varchar(191) | YES | — |  |
| `smoking` | varchar(191) | YES | — |  |
| `other_wishes` | text | YES | — |  |
| `other_wishes_pl` | text | YES | — |  |
| `other_wishes_en` | text | YES | — |  |
| `other_wishes_de` | text | YES | — |  |
| `night_operations` | text | YES | — |  |
| `night_operations_pl` | text | YES | — |  |
| `night_operations_en` | text | YES | — |  |
| `night_operations_de` | text | YES | — |  |
| `shopping` | varchar(191) | YES | — |  |
| `shopping_be_done` | varchar(191) | YES | — |  |
| `shopping_be_done_pl` | text | YES | — |  |
| `shopping_be_done_en` | text | YES | — |  |
| `shopping_be_done_de` | text | YES | — |  |
| `tasks` | text | YES | — |  |
| `tasks_de` | text | YES | — |  |
| `tasks_en` | text | YES | — |  |
| `tasks_pl` | text | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `customer_contracts` (16 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `customer_id` | bigint unsigned | YES | — | MUL |
| `location_id` | bigint unsigned | YES | — | MUL |
| `location_custom_text` | varchar(191) | YES | — |  |
| `salutation` | varchar(191) | YES | — |  |
| `title` | varchar(191) | YES | — |  |
| `first_name` | varchar(191) | YES | — |  |
| `last_name` | varchar(191) | YES | — |  |
| `phone` | varchar(191) | YES | — |  |
| `email` | varchar(191) | YES | — |  |
| `street_number` | varchar(191) | YES | — |  |
| `zip_code` | varchar(191) | YES | — |  |
| `city` | varchar(191) | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `customer_contacts` (11 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `customer_id` | bigint unsigned | YES | — | MUL |
| `salutation` | varchar(191) | YES | — |  |
| `title` | varchar(191) | YES | — |  |
| `first_name` | varchar(191) | YES | — |  |
| `last_name` | varchar(191) | YES | — |  |
| `phone` | varchar(191) | YES | — |  |
| `email` | varchar(191) | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `customer_onboardings` (9 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `customer_id` | bigint unsigned | YES | — | MUL |
| `first_step_finished_at` | timestamp | YES | — |  |
| `second_step_finished_at` | timestamp | YES | — |  |
| `third_step_finished_at` | timestamp | YES | — |  |
| `is_auto` | tinyint(1) | NO | 0 | MUL |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `job_offers` (67 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `job_offer_id` | varchar(191) | YES | — |  |
| `title` | varchar(255) | YES | — |  |
| `title_pl` | text | YES | — |  |
| `title_en` | text | YES | — |  |
| `title_de` | text | YES | — |  |
| `customer_id` | bigint unsigned | YES | — | MUL |
| `service_agency_id` | bigint unsigned | YES | — | MUL |
| `location_id` | bigint unsigned | YES | — | MUL |
| `visibility` | varchar(191) | YES | — | MUL |
| `hide_reason` | varchar(191) | YES | — |  |
| `temp_visibility` | json | YES | — |  |
| `is_from_reservation` | tinyint(1) | NO | 0 | MUL |
| `is_dummy` | tinyint(1) | NO | 0 | MUL |
| `is_exclusive` | tinyint(1) | NO | 0 | MUL |
| `exclusivity_updated_at` | timestamp | YES | — |  |
| `description` | text | YES | — |  |
| `condition` | text | YES | — |  |
| `accommodation` | text | YES | — |  |
| `accommodation_comment` | text | YES | — |  |
| `urbanization` | varchar(191) | YES | — |  |
| `salary_offered` | double(8,2) | YES | — |  |
| `salary_bonus` | double(8,2) | YES | — |  |
| `salary_commission` | double(8,2) | YES | — |  |
| `agent_commission` | double(8,2) | YES | — |  |
| `gender` | varchar(191) | YES | — |  |
| `smoking` | varchar(191) | YES | — |  |
| `min_age` | int | YES | — |  |
| `max_age` | int | YES | — |  |
| `driving_license` | varchar(191) | YES | — |  |
| `other_people_in_house` | varchar(191) | YES | — |  |
| `night_operations` | varchar(191) | YES | — |  |
| `shopping` | varchar(191) | YES | — |  |
| `has_family_near_by` | tinyint(1) | NO | 0 |  |
| `pets` | varchar(191) | YES | — |  |
| `residential_area` | varchar(191) | YES | — |  |
| `house_condition` | varchar(191) | YES | — |  |
| `distance_shop` | varchar(191) | YES | — |  |
| `when_support_required` | varchar(191) | YES | — |  |
| `wishes` | text | YES | — |  |
| `tasks_taken_by_family` | text | YES | — |  |
| `tasks_taken_by_care_service` | text | YES | — |  |
| `tasks_taken_by_home_help` | text | YES | — |  |
| `internet` | varchar(191) | YES | — |  |
| `day_care_facility` | text | YES | — |  |
| `arrival_at` | date | YES | — | MUL |
| `departure_at` | date | YES | — | MUL |
| `is_sending_automatically_completed` | tinyint(1) | NO | 0 |  |
| `last_sending_automatically_at` | timestamp | YES | — |  |
| `is_verified` | tinyint(1) | NO | 0 |  |
| `is_known` | tinyint(1) | NO | 0 |  |
| `is_expired` | tinyint(1) | YES | — |  |
| `public_at` | timestamp | YES | — |  |
| `hp_status_id` | bigint unsigned | YES | — | MUL |
| `hp_mission_id` | varchar(191) | YES | — | MUL |
| `christmas` | varchar(191) | YES | — | MUL |
| `christmas_description` | text | YES | — |  |
| `activate_after_customer_translate` | tinyint(1) | NO | 0 |  |
| `is_ak_performed` | tinyint(1) | NO | 0 | MUL |
| `is_outreach_performed` | tinyint(1) | NO | 0 | MUL |
| `is_ping_process_performed` | tinyint(1) | NO | 0 | MUL |
| `is_dedicated` | tinyint(1) | NO | 0 | MUL |
| `dedicated_updated_at` | timestamp | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |
| `last_cleaned_at` | timestamp | YES | — |  |

### `patient_tools` (6 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `patient_id` | bigint unsigned | YES | — | MUL |
| `tool_id` | bigint unsigned | YES | — | MUL |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `tools` (5 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `tool` | varchar(191) | NO | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `lifts` (7 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `name` | varchar(191) | NO | — |  |
| `order` | int | NO | — |  |
| `is_cga` | tinyint(1) | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `mobilities` (6 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `mobility` | varchar(191) | NO | — | MUL |
| `order` | int | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `urbanizations` (5 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `name` | varchar(191) | NO | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `roleables` (10 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `user_id` | bigint unsigned | YES | — | MUL |
| `role_id` | bigint unsigned | YES | — | MUL |
| `roleable_type` | varchar(191) | YES | — | MUL |
| `roleable_id` | bigint unsigned | YES | — | MUL |
| `is_synchronizer` | tinyint(1) | NO | 0 | MUL |
| `is_seller` | tinyint(1) | NO | 0 | MUL |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |

### `roles` (8 cols)

| Column | Type | Null | Default | Key |
|---|---|---|---|---|
| `id` | bigint unsigned | NO | — | PRI |
| `name` | varchar(191) | NO | — |  |
| `description` | text | YES | — |  |
| `slug` | varchar(191) | YES | — |  |
| `morph_name` | varchar(191) | YES | — |  |
| `created_at` | timestamp | YES | — |  |
| `updated_at` | timestamp | YES | — |  |
| `deleted_at` | timestamp | YES | — |  |


---

## 2. Enum permutations (varchar/tinyint columns with ≤30 distinct values)

Use the most-common value as your default; fall back to `not_important` where the column accepts it.

### `customer_caregiver_wishes.alternative_germany_skill` (varchar(191), 4 distinct values)

| Value | Count |
|---|---|
| `level_2` | 996 |
| `level_4` | 650 |
| `level_3` | 620 |
| `level_1` | 158 |

### `customer_caregiver_wishes.driving_license` (varchar(191), 2 distinct values)

| Value | Count |
|---|---|
| `not_important` | 6695 |
| `yes` | 1410 |

### `customer_caregiver_wishes.driving_license_gearbox` (varchar(191), 2 distinct values)

| Value | Count |
|---|---|
| `automatic` | 712 |
| `manual` | 547 |

### `customer_caregiver_wishes.gender` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `female` | 6593 |
| `not_important` | 1191 |
| `male` | 321 |

### `customer_caregiver_wishes.germany_skill` (varchar(191), 6 distinct values)

| Value | Count |
|---|---|
| `level_3` | 5018 |
| `level_2` | 2240 |
| `level_4` | 761 |
| `level_1` | 75 |
| `not_important` | 10 |
| `level_0` | 1 |

### `customer_caregiver_wishes.is_open_for_all` (tinyint(1), 1 distinct values)

| Value | Count |
|---|---|
| `0` | 7932 |

### `customer_caregiver_wishes.shopping` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `no` | 4314 |
| `yes` | 3063 |
| `occasionally` | 728 |

### `customer_caregiver_wishes.smoking` (varchar(191), 4 distinct values)

| Value | Count |
|---|---|
| `yes_outside` | 5169 |
| `no` | 1670 |
| `not_important` | 1124 |
| `yes` | 142 |

### `customer_contracts.location_custom_text` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `customer_onboardings.is_auto` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 3885 |
| `0` | 98 |

### `customers.accommodation` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `single_family_house` | 6011 |
| `apartment` | 1694 |
| `other` | 48 |

### `customers.can_caregiver_review` (tinyint(1), 0 distinct values)

| Value | Count |
|---|---|

### `customers.can_request_caregiver` (tinyint(1), 0 distinct values)

| Value | Count |
|---|---|

### `customers.caregiver_accommodated` (varchar(191), 4 distinct values)

| Value | Count |
|---|---|
| `room_premises` | 8105 |
| `area_premises` | 15 |
| `room_other_premises` | 7 |
| `area_other_premises` | 3 |

### `customers.gender` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `not_important` | 2871 |
| `female` | 955 |
| `male` | 532 |

### `customers.has_family_near_by` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `no` | 4069 |
| `yes` | 3523 |
| `not_important` | 198 |

### `customers.image_filename` (varchar(191), 7 distinct values)

| Value | Count |
|---|---|
| `SW1376_3KNsoL8` | 1 |
| `GT1501_S2QCswQ` | 1 |
| `IN10163_wQspaXQ` | 1 |
| `KA5781_IMqktGr` | 1 |
| `SH2559_Yo5RTHA` | 1 |
| `KZ1944` | 1 |
| `OL9298_WJrWpqY` | 1 |

### `customers.internet` (varchar(191), 2 distinct values)

| Value | Count |
|---|---|
| `yes` | 7619 |
| `no` | 325 |

### `customers.invoice_party` (varchar(191), 1 distinct values)

| Value | Count |
|---|---|
| `patient` | 4358 |

### `customers.is_data_refresh_required` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 7784 |
| `1` | 465 |

### `customers.is_disabled` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 8243 |
| `1` | 6 |

### `customers.is_exclusive` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 7437 |
| `1` | 812 |

### `customers.is_from_hp` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 7933 |
| `0` | 316 |

### `customers.is_pet_cat` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 4182 |
| `1` | 290 |

### `customers.is_pet_dog` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 4169 |
| `1` | 303 |

### `customers.is_pet_other` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 4385 |
| `1` | 77 |

### `customers.is_premium` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 2313 |
| `1` | 7 |

### `customers.is_scandicare` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 8247 |
| `1` | 2 |

### `customers.is_special_surcharge` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 2976 |
| `1` | 56 |

### `customers.location_custom_text` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `customers.other_people_in_house` (varchar(191), 2 distinct values)

| Value | Count |
|---|---|
| `no` | 6521 |
| `yes` | 1596 |

### `customers.pets` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `no` | 3895 |
| `no_information` | 3630 |
| `yes` | 606 |

### `customers.smoking_household` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `yes_outside` | 2827 |
| `no` | 1457 |
| `yes` | 74 |

### `customers.status` (varchar(191), 2 distinct values)

| Value | Count |
|---|---|
| `active` | 7629 |
| `draft` | 595 |

### `customers.visibility` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `public` | 8089 |
| `public_limited` | 8 |
| `hide` | 5 |

### `customers.was_import_pdf` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 5357 |
| `0` | 2892 |

### `customers.was_translate` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 7813 |
| `0` | 436 |

### `job_offers.activate_after_customer_translate` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 26761 |
| `1` | 31 |

### `job_offers.christmas` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `yes` | 983 |
| `no` | 113 |
| `no_info` | 70 |

### `job_offers.distance_shop` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.driving_license` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.gender` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.has_family_near_by` (tinyint(1), 1 distinct values)

| Value | Count |
|---|---|
| `0` | 26792 |

### `job_offers.hide_reason` (varchar(191), 9 distinct values)

| Value | Count |
|---|---|
| `no_hp_data` | 10333 |
| `` | 2972 |
| `hp_status` | 958 |
| `reservation` | 371 |
| `another_open_job` | 319 |
| `no_hp_customer_group` | 12 |
| `application` | 9 |
| `scandicare` | 3 |
| `manual` | 2 |

### `job_offers.house_condition` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.internet` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.is_ak_performed` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 25841 |
| `0` | 951 |

### `job_offers.is_dedicated` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 26692 |
| `1` | 100 |

### `job_offers.is_dummy` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 26669 |
| `1` | 123 |

### `job_offers.is_exclusive` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 25052 |
| `1` | 1740 |

### `job_offers.is_expired` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 23815 |
| `0` | 2660 |

### `job_offers.is_from_reservation` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 26541 |
| `1` | 251 |

### `job_offers.is_known` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 26669 |
| `1` | 123 |

### `job_offers.is_outreach_performed` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 25756 |
| `0` | 1036 |

### `job_offers.is_ping_process_performed` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 25187 |
| `0` | 1605 |

### `job_offers.is_sending_automatically_completed` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 18140 |
| `1` | 8652 |

### `job_offers.is_verified` (tinyint(1), 1 distinct values)

| Value | Count |
|---|---|
| `0` | 26792 |

### `job_offers.night_operations` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.other_people_in_house` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.pets` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.residential_area` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.shopping` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.smoking` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.urbanization` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `job_offers.visibility` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `hide` | 26231 |
| `public_limited` | 523 |
| `public` | 38 |

### `job_offers.when_support_required` (varchar(191), 0 distinct values)

| Value | Count |
|---|---|

### `lifts.is_cga` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 2 |
| `1` | 2 |

### `lifts.name` (varchar(191), 4 distinct values)

| Value | Count |
|---|---|
| `Yes` | 1 |
| `No` | 1 |
| `Yes, with patient help` | 1 |
| `not_important` | 1 |

### `mobilities.mobility` (varchar(191), 5 distinct values)

| Value | Count |
|---|---|
| `Bedridden` | 1 |
| `Mobile` | 1 |
| `Walker` | 1 |
| `Walking stick` | 1 |
| `Wheelchair` | 1 |

### `patients.dementia` (varchar(191), 2 distinct values)

| Value | Count |
|---|---|
| `no` | 27899 |
| `yes` | 25817 |

### `patients.gender` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `female` | 33458 |
| `male` | 21047 |
| `not_important` | 20 |

### `patients.height` (varchar(191), 8 distinct values)

| Value | Count |
|---|---|
| `161-170` | 22519 |
| `171-180` | 13089 |
| `151-160` | 8386 |
| `181-190` | 5293 |
| `140-150` | 1064 |
| `190+` | 685 |
| `191-200` | 18 |
| `>200` | 4 |

### `patients.incontinence` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `1` | 27142 |
| `0` | 23908 |

### `patients.incontinence_feces` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 42878 |
| `1` | 8184 |

### `patients.incontinence_urine` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 25509 |
| `1` | 24726 |

### `patients.night_operations` (varchar(191), 10 distinct values)

| Value | Count |
|---|---|
| `no` | 37747 |
| `up_to_1_time` | 12731 |
| `1_2_times` | 2722 |
| `more_than_2` | 688 |
| `occasionally` | 92 |
| `3` | 6 |
| `4` | 5 |
| `1` | 1 |
| `5` | 1 |
| `2` | 1 |

### `patients.smoking` (tinyint(1), 1 distinct values)

| Value | Count |
|---|---|
| `0` | 47585 |

### `patients.weight` (varchar(191), 8 distinct values)

| Value | Count |
|---|---|
| `61-70` | 14718 |
| `71-80` | 13676 |
| `51-60` | 11577 |
| `81-90` | 6592 |
| `40-50` | 4136 |
| `91-100` | 2416 |
| `> 100` | 1377 |
| `>100` | 12 |

### `roleables.is_seller` (tinyint(1), 1 distinct values)

| Value | Count |
|---|---|
| `0` | 33617 |

### `roleables.is_synchronizer` (tinyint(1), 2 distinct values)

| Value | Count |
|---|---|
| `0` | 33616 |
| `1` | 1 |

### `roleables.roleable_type` (varchar(191), 5 distinct values)

| Value | Count |
|---|---|
| `caregiver` | 33301 |
| `customer` | 207 |
| `caregiverAgency` | 87 |
| `serviceAgency` | 19 |
| `fAdmin` | 2 |

### `roles.name` (varchar(191), 10 distinct values)

| Value | Count |
|---|---|
| `Caregiver Agency` | 2 |
| `employee` | 2 |
| `Service Agency` | 1 |
| `Mamamia Caregiver Agency` | 1 |
| `Refericon Caregiver Agency` | 1 |
| `admin` | 1 |
| `admin-sa-test` | 1 |
| `caregiver` | 1 |
| `customer` | 1 |
| `Filament Admin` | 1 |

### `roles.slug` (varchar(191), 9 distinct values)

| Value | Count |
|---|---|
| `caregiver-agency` | 2 |
| `admin` | 2 |
| `employee` | 2 |
| `service-agency` | 1 |
| `mamamia-caregiver-agency` | 1 |
| `refericon-caregiver-agency` | 1 |
| `caregiver` | 1 |
| `customer` | 1 |
| `fAdmin` | 1 |

### `tools.tool` (varchar(191), 7 distinct values)

| Value | Count |
|---|---|
| `Walking stick` | 1 |
| `Rollator` | 1 |
| `Wheelchair` | 1 |
| `Patient hoist` | 1 |
| `Stair hoist` | 1 |
| `Care bed` | 1 |
| `Others` | 1 |

### `urbanizations.name` (varchar(191), 3 distinct values)

| Value | Count |
|---|---|
| `Village` | 1 |
| `City` | 1 |
| `Big city` | 1 |


---

## 3. Lookup tables (id → label)

### `mobilities` (5 rows)

| id | mobility | order | created_at | updated_at | deleted_at |
|---|---|---|---|---|---|
| 1 | "Mobile" | 1 | "2023-12-09T09:26:07.000Z" | "2023-12-09T09:26:09.000Z" | null |
| 2 | "Walking stick" | 2 | "2023-12-09T09:26:15.000Z" | "2023-12-09T09:26:16.000Z" | null |
| 3 | "Walker" | 2 | "2023-12-09T09:26:24.000Z" | "2023-12-09T09:26:23.000Z" | null |
| 4 | "Wheelchair" | 2 | "2023-12-21T00:53:08.000Z" | "2023-12-21T00:53:11.000Z" | null |
| 5 | "Bedridden" | 3 | "2023-12-21T00:53:28.000Z" | "2023-12-21T00:53:29.000Z" | null |

### `lifts` (3 rows)

| id | name | order | is_cga | created_at | updated_at | deleted_at |
|---|---|---|---|---|---|---|
| 1 | "Yes" | 3 | 0 | "2024-01-05T06:06:32.000Z" | "2024-01-05T06:06:32.000Z" | null |
| 2 | "No" | 1 | 1 | "2024-01-05T06:06:41.000Z" | "2024-01-05T06:06:41.000Z" | null |
| 4 | "not_important" | 0 | 1 | "2024-07-08T03:39:43.000Z" | "2024-07-08T03:39:44.000Z" | null |

### `urbanizations` (3 rows)

| id | name | created_at | updated_at | deleted_at |
|---|---|---|---|---|
| 1 | "Village" | "2023-12-27T05:35:56.000Z" | "2023-12-27T05:35:56.000Z" | null |
| 2 | "City" | "2023-12-27T05:36:08.000Z" | "2023-12-27T05:36:08.000Z" | null |
| 3 | "Big city" | "2023-12-27T05:36:20.000Z" | "2023-12-27T05:36:20.000Z" | null |

### `tools` (7 rows)

| id | tool | created_at | updated_at | deleted_at |
|---|---|---|---|---|
| 1 | "Walking stick" | "2024-02-19T06:25:27.000Z" | "2024-02-19T06:25:27.000Z" | null |
| 2 | "Rollator" | "2024-02-19T06:25:27.000Z" | "2024-02-19T06:25:27.000Z" | null |
| 3 | "Wheelchair" | "2024-02-19T06:25:27.000Z" | "2024-02-19T06:25:27.000Z" | null |
| 4 | "Patient hoist" | "2024-02-19T06:25:27.000Z" | "2024-02-19T06:25:27.000Z" | null |
| 5 | "Stair hoist" | "2024-02-19T06:25:27.000Z" | "2024-02-19T06:25:27.000Z" | null |
| 6 | "Care bed" | "2024-02-19T06:25:27.000Z" | "2024-02-19T06:25:27.000Z" | null |
| 7 | "Others" | "2024-02-19T06:25:27.000Z" | "2024-02-19T06:25:27.000Z" | null |


---

## 4. Fill-rate diff: active vs draft (200-row sample each)

Columns at 100% fill in **active** + ~0% in **draft** are the must-fill set for a customer to clear the SendInvitationCaregiver gate.

### customers

active total: 200, draft total: 200

| Column | active fill | draft fill | diff (a − d) |
|---|---|---|---|
| `sent_to_sa_at` | 196 (98%) | 3 (2%) | +193 |
| `job_description` | 199 (100%) | 37 (19%) | +162 |
| `job_description_de` | 199 (100%) | 38 (19%) | +161 |
| `accommodation` | 200 (100%) | 44 (22%) | +156 |
| `caregiver_time_off_de` | 177 (89%) | 25 (13%) | +152 |
| `job_description_en` | 200 (100%) | 51 (26%) | +149 |
| `job_description_pl` | 200 (100%) | 51 (26%) | +149 |
| `caregiver_time_off_en` | 178 (89%) | 40 (20%) | +138 |
| `caregiver_time_off_pl` | 178 (89%) | 40 (20%) | +138 |
| `day_care_facility` | 187 (94%) | 50 (25%) | +137 |
| `has_family_near_by` | 200 (100%) | 64 (32%) | +136 |
| `caregiver_time_off` | 176 (88%) | 45 (23%) | +131 |
| `accommodation_description_pl` | 103 (52%) | 22 (11%) | +81 |
| `accommodation_description_en` | 103 (52%) | 22 (11%) | +81 |
| `accommodation_description_de` | 102 (51%) | 22 (11%) | +80 |
| `other_equipments_pl` | 101 (51%) | 22 (11%) | +79 |
| `other_equipments_de` | 101 (51%) | 22 (11%) | +79 |
| `other_equipments_en` | 100 (50%) | 22 (11%) | +78 |
| `is_pet_cat` | 105 (53%) | 28 (14%) | +77 |
| `is_pet_other` | 105 (53%) | 28 (14%) | +77 |
| `accommodation_description` | 104 (52%) | 28 (14%) | +76 |
| `smoking_household` | 104 (52%) | 28 (14%) | +76 |
| `night_operations` | 104 (52%) | 28 (14%) | +76 |
| `vat` | 104 (52%) | 28 (14%) | +76 |
| `gender` | 104 (52%) | 28 (14%) | +76 |
| `invoice_party` | 104 (52%) | 28 (14%) | +76 |
| `is_pet_dog` | 105 (53%) | 30 (15%) | +75 |
| `other_equipments` | 102 (51%) | 28 (14%) | +74 |
| `day_care_facility_description_de` | 76 (38%) | 13 (7%) | +63 |
| `day_care_facility_description_en` | 76 (38%) | 18 (9%) | +58 |
| `day_care_facility_description_pl` | 76 (38%) | 18 (9%) | +58 |
| `year_of_birth` | 77 (39%) | 22 (11%) | +55 |
| `day_care_facility_description` | 75 (38%) | 23 (12%) | +52 |
| `exclusivity_updated_at` | 74 (37%) | 23 (12%) | +51 |
| `is_special_surcharge` | 71 (36%) | 21 (11%) | +50 |
| `other_people_in_house_description_pl` | 51 (26%) | 9 (5%) | +42 |
| `other_people_in_house_description_en` | 51 (26%) | 9 (5%) | +42 |
| `other_people_in_house_description_de` | 51 (26%) | 9 (5%) | +42 |
| `other_people_in_house_description` | 50 (25%) | 9 (5%) | +41 |
| `is_premium` | 53 (27%) | 15 (8%) | +38 |
| `dedicated_updated_at` | 56 (28%) | 19 (10%) | +37 |
| `first_name` | 33 (17%) | 4 (2%) | +29 |
| `last_automatic_update_at` | 35 (18%) | 6 (3%) | +29 |
| `urbanization_id` | 200 (100%) | 178 (89%) | +22 |
| `pesel` | 198 (99%) | 176 (88%) | +22 |
| `other_people_in_house` | 200 (100%) | 179 (90%) | +21 |
| `arrival_at` | 200 (100%) | 181 (91%) | +19 |
| `monthly_salary` | 200 (100%) | 181 (91%) | +19 |
| `visibility` | 200 (100%) | 181 (91%) | +19 |
| `internet` | 194 (97%) | 176 (88%) | +18 |
| `care_budget` | 200 (100%) | 182 (91%) | +18 |
| `caregiver_accommodated` | 200 (100%) | 183 (92%) | +17 |
| `phone` | 20 (10%) | 3 (2%) | +17 |
| `location_id` | 200 (100%) | 184 (92%) | +16 |
| `pets` | 200 (100%) | 184 (92%) | +16 |
| `email` | 31 (16%) | 24 (12%) | +7 |
| `description_of_pets` | 6 (3%) | 2 (1%) | +4 |
| `dedicated_hp_caregiver_ids` | 5 (3%) | 2 (1%) | +3 |
| `tasks_taken_over` | 1 (1%) | 0 (0%) | +1 |
| `tasks_taken_over_pl` | 1 (1%) | 0 (0%) | +1 |
| `tasks_taken_over_en` | 1 (1%) | 0 (0%) | +1 |
| `tasks_taken_over_de` | 1 (1%) | 0 (0%) | +1 |
| `pets_other` | 1 (1%) | 0 (0%) | +1 |
| `service_agency_id` | 200 (100%) | 200 (100%) | 0 |
| `location_custom_text` | 0 (0%) | 0 (0%) | 0 |
| `language_id` | 0 (0%) | 0 (0%) | 0 |
| `is_from_hp` | 200 (100%) | 200 (100%) | 0 |
| `status` | 200 (100%) | 200 (100%) | 0 |
| `caregiver_accommodated_description` | 0 (0%) | 0 (0%) | 0 |
| `departure_at` | 0 (0%) | 0 (0%) | 0 |
| `commission_agent_salary` | 200 (100%) | 200 (100%) | 0 |
| `responsibility` | 0 (0%) | 0 (0%) | 0 |
| `description` | 0 (0%) | 0 (0%) | 0 |
| `weight` | 0 (0%) | 0 (0%) | 0 |
| `rating_avg` | 0 (0%) | 0 (0%) | 0 |
| `can_caregiver_review` | 0 (0%) | 0 (0%) | 0 |
| `can_request_caregiver` | 0 (0%) | 0 (0%) | 0 |
| `image_filename` | 0 (0%) | 0 (0%) | 0 |
| `was_import_pdf` | 200 (100%) | 200 (100%) | 0 |
| `was_translate` | 200 (100%) | 200 (100%) | 0 |
| `locale` | 0 (0%) | 0 (0%) | 0 |
| `is_data_refresh_required` | 200 (100%) | 200 (100%) | 0 |
| `is_disabled` | 200 (100%) | 200 (100%) | 0 |
| `is_scandicare` | 200 (100%) | 200 (100%) | 0 |
| `is_exclusive` | 200 (100%) | 200 (100%) | 0 |
| `caregiver_remarks` | 0 (0%) | 0 (0%) | 0 |
| `accommodation_comment` | 0 (0%) | 1 (1%) | -1 |
| `accommodation_comment_pl` | 0 (0%) | 1 (1%) | -1 |
| `accommodation_comment_en` | 0 (0%) | 1 (1%) | -1 |
| `accommodation_comment_de` | 0 (0%) | 1 (1%) | -1 |
| `last_name` | 152 (76%) | 182 (91%) | -30 |

### patients (linked to customer.status=...)

active total: 226, draft total: 221

| Column | active fill | draft fill | diff (a − d) |
|---|---|---|---|
| `features_condition_en` | 210 (93%) | 36 (16%) | +174 |
| `features_condition_pl` | 210 (93%) | 36 (16%) | +174 |
| `features_condition_de` | 212 (94%) | 46 (21%) | +166 |
| `care_level` | 217 (96%) | 58 (26%) | +159 |
| `features_condition` | 212 (94%) | 54 (24%) | +158 |
| `night_operations` | 226 (100%) | 71 (32%) | +155 |
| `dementia` | 225 (100%) | 71 (32%) | +154 |
| `height` | 209 (92%) | 67 (30%) | +142 |
| `incontinence` | 185 (82%) | 52 (24%) | +133 |
| `incontinence_feces` | 185 (82%) | 53 (24%) | +132 |
| `night_operations_description` | 161 (71%) | 31 (14%) | +130 |
| `incontinence_urine` | 173 (77%) | 45 (20%) | +128 |
| `smoking` | 140 (62%) | 22 (10%) | +118 |
| `physical_condition` | 140 (62%) | 22 (10%) | +118 |
| `lift_description_en` | 148 (65%) | 30 (14%) | +118 |
| `lift_description_pl` | 148 (65%) | 30 (14%) | +118 |
| `lift_description_de` | 148 (65%) | 32 (14%) | +116 |
| `lift_description` | 149 (66%) | 39 (18%) | +110 |
| `mental_condition` | 112 (50%) | 18 (8%) | +94 |
| `dementia_description_en` | 99 (44%) | 13 (6%) | +86 |
| `dementia_description_pl` | 99 (44%) | 13 (6%) | +86 |
| `dementia_description_de` | 99 (44%) | 14 (6%) | +85 |
| `other_tools_pl` | 89 (39%) | 4 (2%) | +85 |
| `other_tools_en` | 89 (39%) | 4 (2%) | +85 |
| `other_tools_de` | 89 (39%) | 4 (2%) | +85 |
| `dementia_description` | 99 (44%) | 20 (9%) | +79 |
| `other_tools` | 89 (39%) | 13 (6%) | +76 |
| `night_operations_description_en` | 64 (28%) | 9 (4%) | +55 |
| `night_operations_description_pl` | 64 (28%) | 9 (4%) | +55 |
| `night_operations_description_de` | 64 (28%) | 13 (6%) | +51 |
| `lift_id` | 226 (100%) | 184 (83%) | +42 |
| `year_of_birth` | 226 (100%) | 208 (94%) | +18 |
| `lift_mobility_description` | 35 (15%) | 20 (9%) | +15 |
| `lift_mobility_description_pl` | 31 (14%) | 20 (9%) | +11 |
| `lift_mobility_description_en` | 31 (14%) | 20 (9%) | +11 |
| `lift_mobility_description_de` | 31 (14%) | 20 (9%) | +11 |
| `weight` | 226 (100%) | 220 (100%) | +6 |
| `mobility_id` | 226 (100%) | 221 (100%) | +5 |
| `gender` | 226 (100%) | 221 (100%) | +5 |

### customer_caregiver_wishes (linked to customer.status=...)

active total: 200, draft total: 187

| Column | active fill | draft fill | diff (a − d) |
|---|---|---|---|
| `tasks_pl` | 196 (98%) | 38 (20%) | +158 |
| `night_operations` | 198 (99%) | 52 (28%) | +146 |
| `tasks` | 197 (99%) | 51 (27%) | +146 |
| `tasks_de` | 198 (99%) | 53 (28%) | +145 |
| `shopping_be_done` | 199 (100%) | 55 (29%) | +144 |
| `tasks_en` | 197 (99%) | 53 (28%) | +144 |
| `shopping_be_done_en` | 183 (92%) | 47 (25%) | +136 |
| `shopping_be_done_de` | 183 (92%) | 47 (25%) | +136 |
| `shopping_be_done_pl` | 182 (91%) | 47 (25%) | +135 |
| `night_operations_pl` | 176 (88%) | 45 (24%) | +131 |
| `night_operations_en` | 176 (88%) | 45 (24%) | +131 |
| `night_operations_de` | 176 (88%) | 45 (24%) | +131 |
| `other_wishes_pl` | 106 (53%) | 18 (10%) | +88 |
| `other_wishes_en` | 106 (53%) | 18 (10%) | +88 |
| `other_wishes_de` | 106 (53%) | 18 (10%) | +88 |
| `other_wishes` | 108 (54%) | 26 (14%) | +82 |
| `alternative_germany_skill` | 62 (31%) | 17 (9%) | +45 |
| `is_open_for_all` | 198 (99%) | 175 (94%) | +23 |
| `gender` | 200 (100%) | 179 (96%) | +21 |
| `germany_skill` | 200 (100%) | 179 (96%) | +21 |
| `driving_license` | 200 (100%) | 179 (96%) | +21 |
| `smoking` | 200 (100%) | 179 (96%) | +21 |
| `shopping` | 200 (100%) | 179 (96%) | +21 |
| `driving_license_gearbox` | 26 (13%) | 6 (3%) | +20 |


---

## 5. Other stats

### customer_contacts per active customer

```json
[
  {
    "avg_per_customer": "0.0080",
    "max_per": 1,
    "min_per": 0
  }
]
```

