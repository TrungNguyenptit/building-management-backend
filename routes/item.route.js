const express = require('express');
const router = express.Router();

const Item = require('../models/item.model');
const Company = require('../models/companies');

// Lấy danh sách tất cả các item
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Tạo một item mới
router.post('/', async (req, res) => {
  const item = new Item({
    name: req.body.name,
    price: req.body.price
  });
  try {
    const newItem = await item.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Lấy chi tiết một item
router.get('/:id', getItem, (req, res) => {
  res.json(res.item);
});

// Cập nhật một item
router.put('/:id', getItem, async (req, res) => {
  if (req.body.name != null) {
    res.item.name = req.body.name;
  }
  if (req.body.price != null) {
    res.item.price = req.body.price;
  }
  try {
    const updatedItem = await res.item.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Xóa một item
router.delete('/:id', getItem, async (req, res) => {
  try {
    await res.item.remove();
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware để lấy item theo ID
async function getItem(req, res, next) {
  let item;
  try {
    item = await Item.findById(req.params.id);
    if (item == null) {
      return res.status(404).json({ message: 'Cannot find item' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  res.item = item;
  next();
}

router.get('/company/bill', async (req, res) => {
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
      // {
      //   $match: {
      //     "companyServices.services.month": "2024-09"
      //   }
      // },
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
          _id: "$_id",
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
          _id: 1,
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