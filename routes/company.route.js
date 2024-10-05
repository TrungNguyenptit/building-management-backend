const express = require('express');
const router = express.Router();

const Company = require('../models/companies');

// Lấy danh sách tất cả các item
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/bill', async (req, res) => {
    try {
        const companies = await Company.aggregate([
            {
                $lookup: {
                    from: "company_services",
                    localField: "_id",
                    foreignField: "company_id",
                    as: "companyServices"
                }
            },
            {
                $unwind: {
                    path: "$companyServices",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$companyServices.services",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "services",
                    localField: "companyServices.services.service_id",
                    foreignField: "_id",
                    as: "serviceDetails"
                }
            },
            {
                $unwind: {
                    path: "$serviceDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    office_rent_fee: {
                        $multiply: ["$office_location.office_area", "$office_location.base_price"]
                    },
                    service_fee: {
                        $multiply: [
                            "$serviceDetails.base_price",
                            {
                                $add: [
                                    1,
                                    {
                                        $multiply: [
                                            0.05,
                                            {
                                                $add: [
                                                    { $divide: ["$companyServices.services.extra_people", 5] },
                                                    { $divide: ["$companyServices.services.extra_area", 10] }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            "$companyServices.services.days_used_in_month"
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        company_id: "$_id",
                        month: "$companyServices.services.month"
                    },
                    company_name: { $first: "$company_name" },
                    office_rent_fee: { $first: "$office_rent_fee" },
                    total_service_fee: { $sum: "$service_fee" },
                }
            },
            {
                $addFields: {
                    total_monthly_cost: {
                        $add: ["$office_rent_fee", "$total_service_fee"]
                    }
                }
            },
            {
                $project: {
                    _id: "$_id.company_id",
                    month: "$_id.month",
                    company_name: 1,
                    office_rent_fee: 1,
                    total_service_fee: 1,
                    total_monthly_cost: 1
                }
            },
            {
                $sort: { total_monthly_cost: -1 }
            }
        ]);
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;