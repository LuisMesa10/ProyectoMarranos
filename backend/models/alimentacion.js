const mongoose = require('mongoose');


const AlimentacionSchema = new mongoose.Schema({
descripcion: { type: String, required: true },
dosis: { type: String, default: '' }
}, { timestamps: true });


module.exports = mongoose.model('alimentacion', AlimentacionSchema);