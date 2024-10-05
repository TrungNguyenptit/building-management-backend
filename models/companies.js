const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    company_name: { type: String, required: true },
    tax_code: { type: String, required: true },
    charter_capital: { type: Number },
    business_field: { type: String },
    employee_count: { type: Number },
    office_location: {
        office_area: { type: Number },
        base_price: { type: Number },
        room: { type: String },
        floor: { type: Number }
    },
    phone_number: { type: String }
});

module.exports = mongoose.model('Company', companySchema);