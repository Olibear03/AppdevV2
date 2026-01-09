const SystemSettings = require('../models/SystemSettings');

const DEFAULT_COLLEGES = [
    'College of Criminal Justice',
    'College of Engineering and Information Technology',
    'College of Economics, Management, and Development Studies',
    'College of Nursing',
    'College of Agriculture, Food, Environment and Natural Resources',
    'College of Education',
    'College of Management',
    'College of Sports, Physical Education and Athletics',
    'College of Tourism and Hospitality Management',
    'College of Veterinary Medicine and Biomedical Sciences'
];

const DEFAULT_CATEGORIES = [
    'Electrical',
    'Plumbing',
    'Structural',
    'HVAC/Ventilation',
    'Furniture',
    'IT Equipment',
    'Safety Hazard',
    'Cleanliness',
    'Other'
];

async function getSettings() {
    let settings = await SystemSettings.findOne();
    if (!settings) {
        settings = new SystemSettings({
            colleges: DEFAULT_COLLEGES,
            categories: DEFAULT_CATEGORIES
        });
        await settings.save();
    } else {
        // Migration/Safety: Ensure fields exist if they were added later
        let changed = false;
        if (!settings.colleges || settings.colleges.length === 0) {
            settings.colleges = DEFAULT_COLLEGES;
            changed = true;
        }
        if (!settings.categories || settings.categories.length === 0) {
            settings.categories = DEFAULT_CATEGORIES;
            changed = true;
        }
        if (changed) {
            console.log("♻️  Updating incomplete SystemSettings with defaults...");
            await settings.save();
        }
    }
    return settings;
}

module.exports = { getSettings, DEFAULT_COLLEGES, DEFAULT_CATEGORIES };
