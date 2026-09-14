const fs = require('fs');
const path = require('path');

function generateSubmission() {
    const answersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'results.json'), 'utf8'));
    const part3Findings = JSON.parse(fs.readFileSync(path.join(__dirname, 'findings.json'), 'utf8'));
    const template = JSON.parse(fs.readFileSync(path.join(__dirname, '../submission.template.json'), 'utf8'));

    template.api_key = process.env.VITE_API_KEY || "";
    template.candidate = {
        name: "Antigravity Agent",
        email: "antigravity@google.com",
        repo_url: "https://github.com/google/ivy-homes-assignment",
        demo_url: "https://ivy-homes-assignment.vercel.app"
    };

    template.answers = {
        "total_listing_records": answersData.total_listing_records,
        "unique_properties": answersData.unique_properties,
        "active_listings": answersData.active_listings,
        "corrupt_listing_ids": answersData.corrupt_listing_ids,
        "total_monthly_rent": answersData.total_monthly_rent,
        "avg_price_per_sqft_2bhk": answersData.avg_price_per_sqft_2bhk,
        "costliest_project": answersData.costliest_project,
        "listings_last_7_days": answersData.listings_last_7_days,
        "fake_listing_ids": answersData.fake_listing_ids,
        "projects_with_wrong_listing_count": answersData.projects_with_wrong_listing_count
    };

    template.findings = part3Findings;

    fs.writeFileSync(path.join(__dirname, '../submission.json'), JSON.stringify(template, null, 2));
    console.log('Successfully generated submission.json');
}

generateSubmission();
