const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buildingStaffSchema = new Schema({
    staff_code: { type: String, required: true },     // Unique code for each staff member
    full_name: { type: String, required: true },      // Staff name
    birth_date: { type: Date, required: true },       // Birth date of the staff
    address: { type: String },                        // Address of the staff
    phone_number: { type: String, required: true },   // Phone number
    rank: { type: String, required: true },           // Rank or level of the staff member
    position: { type: String, required: true },       // Position or job title
    salary_factor: { type: Number, required: true },         // Salary for the staff
    fix_salary: { type: Number, required: true },         // Salary for the staff
});

module.exports = mongoose.model('BuildingStaff', buildingStaffSchema);