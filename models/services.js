const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
    service_code: { type: String, required: true },
    service_name: { type: String, required: true },
    service_type: { type: String, required: true },
    base_price: { type: Number, required: true },
    expected_revenue: { type: Number, required: true },
    staff_in_charge: [
        {
            staff_id: { type: Schema.Types.ObjectId, ref: 'BuildingStaff', required: true },
            month: { type: String, required: true }, // e.g., "2024-09"
            role: { type: String, required: true },
            month_working_days: { type: Number }
        }
    ]
});

module.exports = mongoose.model('Service', serviceSchema);