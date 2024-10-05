const express = require('express');
const router = express.Router();

const BuildingStaff = require('../models/building-staffs');
const Service = require('../models/services');

// Lấy danh sách tất cả các item
router.get('/', async (req, res) => {
    try {
        const staffs = await BuildingStaff.find();
        res.json(staffs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/salary', async (req, res) => {
    try {
        const staffSalaries = await Service.aggregate([
            {
                $unwind: {
                    path: "$staff_in_charge",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "months",
                    localField: "staff_in_charge.month",
                    foreignField: "month",
                    as: "months"
                }},
            {
                $unwind: {
                    path: "$months",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "building_staffs",
                    localField: "staff_in_charge.staff_id",
                    foreignField: "_id",
                    as: "staff_info"
                }
            },
            {
                $unwind: {
                    path: "$staff_info",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    "staff_in_charge.month": req.query.month
                }
            },
            {
                $lookup: {
                    from: "company_services",
                    localField: "_id",
                    foreignField: "services.service_id",
                    as: "company_services"
                }
            },
            {
                $unwind: {
                    path: "$company_services",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$company_services.services",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $expr: {
                        $eq: ["$company_services.services.service_id", "$_id"]
                    }
                }
            },
            {
                $match: {
                    "company_services.services.month": req.query.month
                }
            },
            {
                $lookup: {
                    from: "companies",
                    localField: "company_services.company_id",
                    foreignField: "_id",
                    as: "company"
                }
            },
            {
                $addFields: {
                    service_revenue: {
                        $multiply: [
                            "$base_price",
                            {
                                $add: [
                                    1,
                                    {
                                        $multiply: [
                                            0.05,
                                            {
                                                $add: [
                                                    { $divide: ["$company_services.services.extra_people", 5] },
                                                    { $divide: ["$company_services.services.extra_area", 10] }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            "$company_services.services.days_used_in_month"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        staff_id: "$_id",
                        staff_info: "$staff_info" ,
                        staff_in_charge: "$staff_in_charge",
                        months: "$months"
                    },
                    expected_revenue: { $first: "$expected_revenue" },
                    service_code: { $first: "$service_code" },
                    service_name: { $first: "$service_name" },
                    service_type: { $first: "$service_type" },
                    total_service_revenue: { $sum: "$service_revenue" }
                }
            },
            {
                $addFields: {
                    staff_month_salary: {
                        $multiply: [
                            "$_id.staff_info.fix_salary",
                            {
                                $add: [
                                    1,
                                    {
                                        $divide: [
                                            { $subtract: ["$total_service_revenue", "$expected_revenue"] },
                                            "$expected_revenue"
                                        ]
                                    }
                                ]
                            },
                            "$_id.staff_info.salary_factor",
                            {
                                $divide: [
                                    "$_id.staff_in_charge.month_working_days",
                                    "$_id.months.working_day"
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    staff_id: "$_id.staff_id",
                    staff_code: "$_id.staff_info.staff_code",
                    full_name: "$_id.staff_info.full_name",
                    rank: "$_id.staff_info.rank",
                    actual_month_salary: { $round: ["$staff_month_salary", 0] }
                }
            }
        ]);
        res.json(staffSalaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;