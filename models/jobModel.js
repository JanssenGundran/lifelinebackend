const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now }
});

const hiredApplicantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  hiredAt: { type: Date, default: Date.now }
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  maxHires: { type: Number, required: true, default: 1 },
  waitingList: { type: [applicantSchema], default: [] },
  hiredList: { type: [hiredApplicantSchema], default: [] }
});

module.exports = mongoose.model('Job', jobSchema);
