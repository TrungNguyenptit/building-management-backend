const express = require('express');
const router = express.Router();

const Employee = require('../models/employees');

// Lấy danh sách tất cả các item
router.get('/', async (req, res) => {
    try {
        const employee = await Employee.find();
        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/in-out-frequency', async (req, res) => {
    try {
        const employees = await Employee.aggregate([
            {
                $lookup: {
                    from: "companies",
                    localField: "company_id",
                    foreignField: "_id",
                    as: "company_info"
                }
            },
            {
                $unwind: {
                    path: "$company_info",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$access_card.access_logs",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $and: [
                        {
                            "access_card.access_logs.entry_time": {
                                $gte: req.query.startDay,
                                $lt: req.query.endDay
                            }
                        },
                        {
                            "access_card.access_logs.exit_time": {
                                $gte: req.query.startDay,
                                $lt: req.query.endDay
                            }
                        }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        employee_id: "$_id",
                        employee_name: "$full_name",
                        company_name: "$company_info.company_name",
                        company_id: "$company_info._id",
                        access_card: "$access_card.card_number"
                    },
                    entry_count: { $sum: { $cond: [{ $ne: ["$access_card.access_logs.entry_time", null] }, 1, 0] } },
                    exit_count: { $sum: { $cond: [{ $ne: ["$access_card.access_logs.exit_time", null] }, 1, 0] } },
                    access_logs: { $push: {
                            entry_time: "$access_card.access_logs.entry_time",
                            exit_time: "$access_card.access_logs.exit_time",
                            location: "$access_card.access_logs.location"
                        }}
                }
            },
            {
                $group: {
                    _id: {
                        company_id: "$_id.company_id",
                        company_name: "$_id.company_name",
                    },
                    employess: { $push: {
                            employee_id: "$_id.employee_id",
                            employee_name: "$_id.employee_name",
                            company_name: "$_id.company_name",
                            access_card: "$_id.access_card",
                            entry_count: "$entry_count",
                            exit_count: "$exit_count",
                            access_logs: "$access_logs"
                        }}
                }
            },
            {
                $project: {
                    _id: 0,
                    company_id: "$_id.company_id",
                    company_name: "$_id.company_name",
                    employess: 1,
                }
            }
        ]);
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;