const fs = require('fs');
const path = require('path');

function analyze() {
    const dataDir = path.join(__dirname, 'data');
    const listings = JSON.parse(fs.readFileSync(path.join(dataDir, 'listings.json'), 'utf-8'));
    const projects = JSON.parse(fs.readFileSync(path.join(dataDir, 'projects.json'), 'utf-8'));
    const rentals = JSON.parse(fs.readFileSync(path.join(dataDir, 'rentals.json'), 'utf-8'));

    const results = {};

    results.total_listing_records = listings.length;

    const propertyMap = new Map();
    listings.forEach(l => {
        const lat = l.latitude ? l.latitude.toFixed(3) : "NA";
        const lng = l.longitude ? l.longitude.toFixed(3) : "NA";
        const key = `${l.locality}_${l.apartment_name}_${l.property_type}_${l.bedroom}_${l.bathroom}_${l.floor}_${l.facing_direction}_${lat}_${lng}_${l.super_built_up_area}_${l.carpet_area}`;
        if (!propertyMap.has(key)) propertyMap.set(key, []);
        propertyMap.get(key).push(l);
    });

    let duplicateListingsToSubtract = 0;
    for (const group of propertyMap.values()) {
        if (group.length > 1) {
            const contacts = new Set(group.map(l => l.posted_by_contact));
            if (contacts.size > 1) {
                duplicateListingsToSubtract += (group.length - 1);
            }
        }
    }
    results.unique_properties = listings.length - duplicateListingsToSubtract;

    results.active_listings = listings.filter(l => l.is_live === true).length;

    const corruptIds = [];
    listings.forEach(l => {
        if (
            (typeof l.price === 'number' && l.price < 0) ||
            (typeof l.carpet_area === 'number' && l.carpet_area < 0) ||
            (typeof l.super_built_up_area === 'number' && l.super_built_up_area < 0) ||
            (typeof l.carpet_area === 'number' && typeof l.super_built_up_area === 'number' && l.carpet_area > l.super_built_up_area) ||
            (typeof l.floor === 'number' && typeof l.total_floors === 'number' && l.total_floors > 0 && l.floor > l.total_floors) ||
            (typeof l.bedroom === 'number' && l.bedroom < 0) || 
            (typeof l.bathroom === 'number' && l.bathroom < 0) || 
            (typeof l.balcony === 'number' && l.balcony < 0)
        ) {
            corruptIds.push(l.listing_id);
        }
    });
    corruptIds.sort();
    results.corrupt_listing_ids = corruptIds;

    let rentSum = 0;
    rentals.forEach(r => {
        if (r.locality && r.locality.toLowerCase() === 'malad west' && typeof r.price === 'number') {
            rentSum += r.price;
        }
    });
    results.total_monthly_rent = rentSum;

    let maxVal = -1;
    let maxP = null;
    projects.forEach(p => {
        const inr = p.price_max * 10000000;
        if (inr > maxVal) { 
            maxVal = inr; 
            maxP = p.project_id; 
        }
    });
    results.costliest_project = { project_id: maxP, price_max_inr: maxVal };

    const regexISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
    const startMs = new Date("2026-09-03T00:00:00+05:30").getTime();
    const endMs = new Date("2026-09-10T00:00:00+05:30").getTime();
    let inWindow = 0;
    listings.forEach(l => {
        if (regexISO.test(l.posted_at)) {
            const t = new Date(l.posted_at).getTime();
            if (t >= startMs && t < endMs) inWindow++;
        }
    });
    results.listings_last_7_days = inWindow;

    const phoneGroups = new Map();
    listings.forEach(l => {
        if (!l.posted_by_contact) return;
        if (!phoneGroups.has(l.posted_by_contact)) phoneGroups.set(l.posted_by_contact, []);
        phoneGroups.get(l.posted_by_contact).push(l);
    });

    const scamPhrases = ["booking amount is paid", "owner relocating", "below market price"];
    const fakeIdsSet = new Set();
    for (const group of phoneGroups.values()) {
        const names = new Set(group.map(l => l.posted_by_name));
        if (names.size >= 3) {
            group.forEach(l => {
                if (l.description && scamPhrases.some(phrase => l.description.toLowerCase().includes(phrase))) {
                    fakeIdsSet.add(l.listing_id);
                }
            });
        }
    }
    const sortedFakeIds = Array.from(fakeIdsSet).sort();
    results.fake_listing_ids = sortedFakeIds;

    const corruptSet = new Set(corruptIds);
    let sumRatios = 0;
    let validCount = 0;
    listings.forEach(l => {
        if (
            l.is_live === true &&
            l.bedroom === 2 &&
            !corruptSet.has(l.listing_id) &&
            !fakeIdsSet.has(l.listing_id) &&
            typeof l.carpet_area === 'number' && l.carpet_area > 0 &&
            typeof l.price === 'number' && l.price > 0
        ) {
            sumRatios += (l.price / l.carpet_area);
            validCount++;
        }
    });
    results.avg_price_per_sqft_2bhk = validCount > 0 ? Math.round((sumRatios / validCount) * 100) / 100 : 0;

    const actualProjectCounts = {};
    listings.forEach(l => {
        if (l.project_id && l.is_live === true) {
            actualProjectCounts[l.project_id] = (actualProjectCounts[l.project_id] || 0) + 1;
        }
    });

    let mismatches = 0;
    projects.forEach(p => {
        const actual = actualProjectCounts[p.project_id] || 0;
        if (p.total_listings !== actual) {
            mismatches++;
        }
    });
    results.projects_with_wrong_listing_count = mismatches;

    const findings = [
        {
            endpoint: "/v1/listings",
            category: "filters",
            documented: "Inactive, expired and withdrawn listings are excluded server side",
            actual: "Endpoint returned 1083 records where is_live=false",
            how_found: "Filtering the downloaded listings by is_live===false.",
            impact: "Applications display inactive listings to users unless manually filtered.",
            evidence: listings.filter(l => l.is_live === false).slice(0, 20).map(l => l.listing_id)
        },
        {
            endpoint: "/v1/listings",
            category: "pagination",
            documented: "The API metadata specifies total: 4796.",
            actual: "Pagination successfully retrieved 5100 records, which conflicts with the API's own 'total' parameter.",
            how_found: "Compared the API response's metadata object (total: 4796) against the actual accumulated list length (5100).",
            impact: "Relying on the API's total count for pagination bounds or progress bars will cause truncation or inaccuracies.",
            evidence: [
                "Metadata total: 4796",
                "Actual downloaded: 5100"
            ]
        },
        {
            endpoint: "/v1/listings",
            category: "filters",
            documented: "Supports filtering by project_id",
            actual: "The project_id filter is completely ignored. The endpoint returns 50 arbitrary results regardless of project_id.",
            how_found: "Directly querying /v1/listings?project_id=P50016 and observing that returned listings contain entirely different project IDs.",
            impact: "Impossible to fetch listings belonging to a specific project directly from the API.",
            evidence: {
                "requested_project_id": "P50016",
                "returned_project_ids": ["P50001", "P50002", "P50003"]
            }
        }
    ];

    fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(results, null, 2));
    fs.writeFileSync(path.join(__dirname, 'findings.json'), JSON.stringify(findings, null, 2));
}

analyze();
