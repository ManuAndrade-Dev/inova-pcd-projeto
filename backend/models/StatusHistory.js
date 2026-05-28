const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema({
  task_id: { type: Number, required: true },
  status_anterior: { type: String, trim: true },
  status_novo: { type: String, trim: true },
  data_mudanca: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model("StatusHistory", statusHistorySchema);
