const mongoose = require("mongoose");

const responsavelSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true, unique: true },
  papel: { type: String, trim: true },
  departamento: { type: String, trim: true },
  anos_empresa: { type: Number },
  formacao_acessibilidade: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model("Responsavel", responsavelSchema);
