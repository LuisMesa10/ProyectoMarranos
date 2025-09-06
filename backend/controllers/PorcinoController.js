const Porcino = require("../models/Porcino");
const Cliente = require("../models/Cliente");
const Alimentacion = require("../models/alimentacion");

const RAZAS = {
  1: "York",
  2: "Hamp",
  3: "Duroc"
};

// Crear un porcino
exports.createPorcino = async (req, res) => {
  try {
    const { identificacion, raza, edad, peso, clienteId, alimentacionId } = req.body;

    // Validaciones manuales
    if (!identificacion || !raza || !edad || !peso || !clienteId || !alimentacionId) {
      return res.status(400).json({ mensaje: "Todos los campos son obligatorios." });
    }

    if (![1, 2, 3].includes(raza)) {
      return res.status(400).json({ mensaje: "La raza debe ser 1 (York), 2 (Hamp) o 3 (Duroc)." });
    }

    // Verificar que la identificación sea única
    const existe = await Porcino.findOne({ identificacion });
    if (existe) {
      return res.status(400).json({ mensaje: "La identificación ya está registrada." });
    }

    // Verificar cliente y alimentación
    const cliente = await Cliente.findById(clienteId);
    if (!cliente) {
      return res.status(400).json({ mensaje: "El cliente no existe." });
    }

    const alimentacion = await Alimentacion.findById(alimentacionId);
    if (!alimentacion) {
      return res.status(400).json({ mensaje: "La alimentación no existe." });
    }

    const nuevoPorcino = new Porcino({ identificacion, raza, edad, peso, clienteId, alimentacionId });
    const porcinoGuardado = await nuevoPorcino.save();

    // Convertir a objeto plano y mapear la raza
    const respuesta = porcinoGuardado.toObject();
    respuesta.razaNombre = RAZAS[respuesta.raza];

    res.status(201).json(respuesta);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener todos los porcinos
exports.obtenerPorcinos = async (req, res) => {
  try {
    const porcinos = await Porcino.find()
      .populate("clienteId", "cedula nombres apellidos telefono")
      .populate("alimentacionId", "descripcion dosis");

    const respuesta = porcinos.map(p => {
      const obj = p.toObject();
      obj.razaNombre = RAZAS[obj.raza];
      return obj;
    });

    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener un porcino por ID
exports.obtenerPorcinoPorId = async (req, res) => {
  try {
    const porcino = await Porcino.findById(req.params.id)
      .populate("clienteId", "cedula nombres apellidos telefono")
      .populate("alimentacionId", "descripcion dosis");

    if (!porcino) {
      return res.status(404).json({ mensaje: "Porcino no encontrado" });
    }

    const respuesta = porcino.toObject();
    respuesta.razaNombre = RAZAS[respuesta.raza];

    res.json(respuesta);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un porcino
exports.actualizarPorcino = async (req, res) => {
  try {
    const { raza, clienteId, alimentacionId } = req.body;

    // Validaciones si vienen en el body
    if (raza && ![1, 2, 3].includes(raza)) {
      return res.status(400).json({ mensaje: "La raza debe ser 1 (York), 2 (Hamp) o 3 (Duroc)." });
    }

    if (clienteId) {
      const cliente = await Cliente.findById(clienteId);
      if (!cliente) {
        return res.status(400).json({ mensaje: "El cliente no existe." });
      }
    }

    if (alimentacionId) {
      const alimentacion = await Alimentacion.findById(alimentacionId);
      if (!alimentacion) {
        return res.status(400).json({ mensaje: "La alimentación no existe." });
      }
    }

    const porcinoActualizado = await Porcino.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!porcinoActualizado) {
      return res.status(404).json({ mensaje: "Porcino no encontrado" });
    }

    const respuesta = porcinoActualizado.toObject();
    respuesta.razaNombre = RAZAS[respuesta.raza];

    res.json(respuesta);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Eliminar un porcino
exports.eliminarPorcino = async (req, res) => {
  try {
    const porcinoEliminado = await Porcino.findByIdAndDelete(req.params.id);

    if (!porcinoEliminado) {
      return res.status(404).json({ mensaje: "Porcino no encontrado" });
    }

    res.json({ mensaje: "Porcino eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};
