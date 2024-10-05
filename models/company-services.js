const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companyServiceSchema = new Schema({
    company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    services: [
        {
            service_id: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
            month: { type: String, required: true }, // e.g., "2024-09"
            days_used_in_month: { type: Number, required: true },
            month_week_days: { type: Number },
            extra_people: { type: Number },
            extra_area: { type: Number }
        }
    ]
});

module.exports = mongoose.model('CompanyService', companyServiceSchema);