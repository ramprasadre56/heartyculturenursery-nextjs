
const fs = require('fs');
const path = require('path');

const plantsPath = path.join(__dirname, 'public', 'data', 'plants.json');
const outputPath = path.join(__dirname, 'samples', 'a2a', 'business_agent', 'src', 'business_agent', 'data', 'products.json');

const plants = JSON.parse(fs.readFileSync(plantsPath, 'utf8'));

const getPrice = (item) => {
    if (!item.id) return 250;
    const idStr = item.id.toString() + item.category;
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
        hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash) % 400) + 150;
};

const products = plants.map(plant => {
    return {
        "@type": "Product",
        "productID": plant.global_id ? plant.global_id.toString() : plant.id.toString(),
        "name": plant.common_name,
        "sku": plant.scientific_name,
        "image": [
            plant.image.startsWith('http') ? plant.image : `http://localhost:3000${plant.image}`
        ],
        "brand": {
            "@type": "Brand",
            "name": "Horticulture Nursery"
        },
        "offers": {
            "price": getPrice(plant).toString(),
            "priceCurrency": "INR",
            "priceSpecification": null,
            "@type": "Offer",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
        },
        "aggregateRating": null,
        "url": `http://localhost:3000/plants/${plant.category}/${plant.id}`,
        "description": `${plant.common_name} (${plant.scientific_name}). A beautiful plant from our ${plant.category} collection.`,
        "gtin": "",
        "mpn": "",
        "category": plant.category
    };
});

// Write to file
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
console.log(`Successfully wrote ${products.length} products to ${outputPath}`);
