# Ivy Homes - Software Engineering Internship Assignment

This repository contains my complete submission for the Ivy Homes SWE Internship assignment. It includes a fully functional React frontend dashboard, the required `submission.json` root file, and a suite of data analysis scripts used to rigorously audit the provided API and dataset.

## Repository Structure

* `submission.json` - The final requested output containing the 10 computed metrics and documented API discrepancies.
* `frontend/` - A React Single Page Application (SPA) built with Vite and Tailwind CSS. Provides an intuitive dashboard with client-side filtering and pagination.
* `analysis/` - The Node.js scripts used to bulk download, audit, and analyze the data to deterministically find corrupt, duplicate, and fake listings without relying on assumptions.

## Running the Application

**Prerequisites:** Node.js (v18+)

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
*Note: The frontend runs on `http://localhost:5173` and proxies API requests via `vite.config.js` to bypass CORS issues.*

## The Investigation & Empirical Proof

During the assignment, I evaluated the provided APIs and offline datasets mathematically. I adopted a strict rule: **No hypothesis is treated as a confirmed fact without empirical evidence.**

- **Pagination:** The documentation claimed a `page` parameter, but passing it had no effect. The API uses an `offset` parameter instead. I verified that using `offset` correctly yields all 5,100 records without skipping or duplicating any listings.
- **Unit Conversions:** The `price_max` on projects appeared extremely low (e.g., 4 or 12.44). Instead of arbitrarily guessing, I tested multiple conversion rates against the average listing prices attached to those projects, definitively proving the unit is Crores.
- **Fake Listings:** I did not rely on single signals like "suspicious descriptions". Instead, I identified an identity generation pattern (a single phone number attached to 3 or more distinct broker names) and intersected it with injected text patterns ("booking amount is paid", "owner relocating", "below market price") to isolate 95 definitively synthesized fake listings.
- **Duplicate Properties:** I designed a 10-point composite key (`locality`, `apartment_name`, `property_type`, `bedroom`, `bathroom`, `floor`, `facing_direction`, `super_built_up`, `carpet_area`, and `coordinates`) to find exact physical duplicates posted by different brokers.

## Final Calculated Answers (Q1-Q10)

As computed by the V3 Empirical Investigation Pipeline and submitted in `submission.json`:

1. **How many listing records are retrievable from `/v1/listings`?**
   - **Answer:** `5100`
2. **Among those records, genuine or not, how many distinct properties do they describe?**
   - **Answer:** `5099` (Exactly one pair of listings describes the exact same physical property).
3. **How many retrievable listing records have `is_live` true?**
   - **Answer:** `4017`
4. **List corrupt `listing_id`s, sorted.**
   - **Answer:** `33` records were found containing impossible physical geometries (e.g. carpet > super built-up) or negative values.
5. **Sum of monthly rent across all retrievable rental records in your assigned locality (Malad West)?**
   - **Answer:** `6730400`
6. **Mean price per sqft for live 2BHK listings (excluding corrupt/fake)?**
   - **Answer:** `63104.69`
7. **The project with the highest maximum price?**
   - **Answer:** `P50016` at `124400000` INR (12.44 Crores).
8. **How many retrievable listing records were posted in the seven days before REFERENCE?**
   - **Answer:** `167`
9. **List fake `listing_id`s, sorted.**
   - **Answer:** `95` definitively synthesized fake records found via intersected generation patterns.
10. **For how many projects is the listing count wrong?**
    - **Answer:** `166` projects had a `total_listings` cache value that did not match the actual number of live listings associated with them.

## Failed Hypotheses (What turned out to be fine)

- **Duplicate Detection:** Initially, I hypothesized there would be hundreds of duplicates, assuming agents just copy-pasted listings. However, when I applied a strict 10-point composite key (locality + apartment + beds + baths + floor + facing + super_built_up + carpet_area + coordinates) to avoid false positives in identical apartment blocks, it turned out the data is surprisingly clean. There was exactly 1 physical duplicate out of 5,100 listings.
- **Corrupt Data Correlation:** I hypothesized that the 1,083 `is_live=false` listings (which shouldn't have been returned by the API) were where all the corrupt or fake data lived. This turned out to be false; corrupt data (impossible geometry) and fake data (synthesized phone/broker networks) were distributed across both live and inactive listings. 

## Future Work (With another two days)

1. **Automated Anomaly Detection:** Instead of hardcoded rules, build a pipeline that automatically flags statistically significant outliers (e.g., standard deviation from mean `price_per_sqft` for a specific project) to catch new variants of corrupt data without manual rule creation.
2. **Mapping Integration:** Utilize the `coordinates` array attached to the listings to build an interactive map view on the frontend.
3. **Interactive Dashboard:** Make the insights dashboard interactive—clicking on the "95 Fake Listings" stat would open a modal displaying the exact records and the intersecting patterns that flagged them.
4. **Type Safety:** Migrate the analytics pipeline and frontend to TypeScript to strictly type the API responses.

---

## AI/LLM Usage Disclosure

This project was developed with the assistance of an AI coding agent (Google DeepMind's Antigravity). The AI assisted with:
- Automating the bulk downloading of the API dataset via rate-limited scripts.
- Writing the data extraction and processing logic in Node.js to rigorously compute the 10 required questions based on the V3 empirical ruleset.
- Bootstrapping the React/Vite frontend application and styling the UI using Tailwind CSS.
- Formatting the final `submission.json`.

All architecture decisions and strict evidence requirements were prompted and verified according to the assignment rules.
