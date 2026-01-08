const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public', 'data', 'plants.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const plants = JSON.parse(data);
    const categories = [...new Set(plants.map(p => p.category))].sort();
    console.log('Categories found in JSON:');
    categories.forEach(c => console.log(`- "${c}"`));
} catch (err) {
    console.error('Error:', err.message);
}
