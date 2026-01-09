const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
    colleges: [{ type: String }],
    categories: [{ type: String }],
});

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
