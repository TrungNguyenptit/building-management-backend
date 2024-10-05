const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const monthSchema = new Schema({
    month: { type: String, required: true },
    working_day: { type: Number, required: true }
});

module.exports = mongoose.model('Month', monthSchema);