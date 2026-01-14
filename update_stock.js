
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public/data/plants.json');

try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const plants = JSON.parse(rawData);

    const updatedPlants = plants.map(plant => ({
        ...plant,
        available_quantity: 10
    }));

    fs.writeFileSync(filePath, JSON.stringify(updatedPlants, null, 2));
    console.log(`Successfully updated ${updatedPlants.length} plants with available_quantity: 10`);
} catch (error) {
    console.error('Error updating plants.json:', error);
}
