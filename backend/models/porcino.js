const mongoose = require('mongoose');


const PorcinoSchema = new mongoose.Schema({
identificacion: { type: String, required: true, unique: true },
raza: { type: Number, required: true, enum: [1, 2, 3] }, // 1=York, 2=Hamp, 3=Duroc
edad: { type: Number, required: true, min: 0 }, // meses
peso: { type: Number, required: true, min: 0 }, // kg
clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
alimentacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alimentacion', required: true }
}, { timestamps: true });


module.exports = mongoose.model('Porcino', PorcinoSchema);