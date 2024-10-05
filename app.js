const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/building_management', { useNewUrlParser: false, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Sử dụng các route
const itemRouter = require('./routes/item.route');
const companyRouter = require('./routes/company.route');
const employeeRouter = require('./routes/employee.route');
const serviceRouter = require('./routes/service.route');
const buildingStaffRouter = require('./routes/building-staff.route');
app.use('/items', itemRouter);
app.use('/companies', companyRouter);
app.use('/employees', employeeRouter);
app.use('/services', serviceRouter);
app.use('/building-staffs', buildingStaffRouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
