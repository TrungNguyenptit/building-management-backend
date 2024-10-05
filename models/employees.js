const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
    company_id: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    employee_code: { type: String, required: true },
    full_name: { type: String, required: true },
    birth_date: { type: Date, required: true },
    phone_number: { type: String, required: true },
    identity_card: { type: String, required: true },
    access_card: {
        card_number: { type: String, required: true },
        access_logs: [
            {
                entry_time: { type: Date },
                exit_time: { type: Date },
                location: { type: String }
            }
        ]
    }
});

module.exports = mongoose.model('Employee', employeeSchema);