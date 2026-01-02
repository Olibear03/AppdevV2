const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const complaintsRoute = require('./routes/complaints');
const authRoute = require('./routes/auth');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/cvsu_reports', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/complaints', complaintsRoute);
app.use('/auth', authRoute);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
