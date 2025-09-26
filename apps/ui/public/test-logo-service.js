// Test script to debug logo service
console.log("Testing logo service...");

// Test data that matches our portfolio
const testCompanies = [
    { uei: "TFL123456789", companyName: "Trio Fabrication LLC" },
    { uei: "RTX987654321", companyName: "Raytheon Technologies Corporation" },
    { uei: "BAE456789123", companyName: "BAE Systems Inc" },
    { uei: "ACI789123456", companyName: "Applied Composites Inc" },
    { uei: "MSF456789012", companyName: "MedStar Federal" },
];

// Test direct file access
testCompanies.forEach(company => {
    console.log(`\n=== Testing ${company.companyName} (${company.uei}) ===`);

    // Check if we can access the logo service
    if (window.contractorLogoService) {
        window.contractorLogoService.getContractorLogo(company.uei, company.companyName)
            .then(response => {
                console.log(`Logo response for ${company.companyName}:`, response);
            })
            .catch(error => {
                console.error(`Logo error for ${company.companyName}:`, error);
            });
    } else {
        console.warn("Logo service not available in window object");
    }
});

// Test direct image loading
const testImageLoad = (src, name) => {
    const img = new Image();
    img.onload = () => console.log(`✅ ${name} image loaded successfully: ${src}`);
    img.onerror = () => console.error(`❌ ${name} image failed to load: ${src}`);
    img.src = src;
};

// Test our logo files
console.log("\n=== Testing direct logo file access ===");
testImageLoad("/contractor-logos/trio-fabrication.svg", "Trio Fabrication");
testImageLoad("/contractor-logos/raytheon.svg", "Raytheon");
testImageLoad("/contractor-logos/bae-systems.svg", "BAE Systems");
testImageLoad("/contractor-logos/boeing.svg", "Boeing");
testImageLoad("/contractor-logos/lockheed-martin.svg", "Lockheed Martin");