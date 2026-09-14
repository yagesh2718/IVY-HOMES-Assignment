# Analytics Pipeline

This folder contains the data analysis pipeline for the Ivy Homes assignment. The methodology is empirical and evidence-based, using the collected API data as the basis for analysis and treating the API as a black-box system to investigate.

## Files

* **`analyze.js`** — Core analysis logic. Reads the JSON datasets from `data/`, performs deterministic checks for all 10 questions, and identifies confirmed API/documentation discrepancies.
* **`write_submission.js`** — Takes the analysis output and generates the final `submission.json` in the required schema.
* **`findings.json`** — Records the confirmed API bugs and documentation discrepancies identified during the investigation (Part 3).
* **`data/`** — Offline JSON snapshots collected from the API for reproducible analysis.

## Methodology

The analysis follows a strict, evidence-based approach:

* Data was collected by paginating the relevant API endpoints, resulting in 5,100 listing records along with project data.
* Unique properties (Q2) are identified using an exact match across 11 property attributes, together with an ownership/contact differential constraint.
* Fake listings (Q9) are identified by cross-referencing strongly grouped phone numbers (3+ distinct broker names) with explicit suspicious phrases found in listing descriptions.
* Project price constraints (Q7) were investigated by comparing `price_max` with the price range of associated property listings to determine the applicable unit scale.
* Calculations that require clean data exclude the identified fake and physically impossible listings where specified by the analysis.

## Running the Pipeline

Ensure Node.js is installed. From the `analytics` directory:

```bash
node analyze.js
node write_submission.js
```

This generates the final `submission.json` in the project root.
