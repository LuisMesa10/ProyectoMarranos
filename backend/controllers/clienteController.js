// controllers/clienteController.js
const Cliente = require("../models/Cliente");
const Porcino = require("../models/Porcino");
const { generarPDFReporte} = require("../utils/pdfGenerator.js");

// Crear nuevo cliente
exports.crearCliente = async (req, res) => {
  try {
    const { cedula, nombres, apellidos, direccion, telefono } = req.body;

    // Validaciones
    if (!cedula || !nombres || !apellidos) {
      return res.status(400).json({ mensaje: "Cédula, nombres y apellidos son obligatorios." });
    }

    // Verificar cédula duplicada
    const existe = await Cliente.findOne({ cedula });
    if (existe) {
      return res.status(400).json({ mensaje: "La cédula ya está registrada" });
    }

    const cliente = new Cliente({ cedula, nombres, apellidos, direccion, telefono });
    await cliente.save();

    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Obtener todos los clientes con sus porcinos
exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();

    // Para cada cliente, buscar sus porcinos
    const clientesConPorcinos = await Promise.all(
      clientes.map(async (cliente) => {
        const porcinos = await Porcino.find({ clienteId: cliente._id });
        return { ...cliente.toObject(), porcinos };
      })
    );

    res.json(clientesConPorcinos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener un cliente por ID con sus porcinos
exports.obtenerClientePorId = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

    const porcinos = await Porcino.find({ clienteId: cliente._id });

    res.json({ ...cliente.toObject(), porcinos });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar un cliente
exports.actualizarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });
    res.json(cliente);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

// Eliminar un cliente
exports.eliminarCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

    // Eliminar también los porcinos asociados (cascada manual)
    await Porcino.deleteMany({ clienteId: cliente._id });

    res.json({ mensaje: "Cliente y sus porcinos eliminados correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// ====================  REPORTES ====================

// Reporte por cédula de cliente
exports.reportePorCedula = async (req, res) => {
  try {
    const { cedula } = req.params;

    const cliente = await Cliente.findOne({ cedula });
    if (!cliente) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    const porcinos = await Porcino.find({ clienteId: cliente._id })
      .populate('alimentacionId');

    res.json({
      cliente,
      porcinos
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Reporte general (todos los clientes con sus porcinos)
exports.reporteGeneral = async (req, res) => {
  try {
    const clientes = await Cliente.find();

    const reportes = await Promise.all(
      clientes.map(async (cliente) => {
        const porcinos = await Porcino.find({ clienteId: cliente._id })
          .populate('alimentacionId');
        return { cliente, porcinos };
      })
    );

    res.json(reportes);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

//REPORTE POR CEDULA EN PDF
exports.reporteClientePDF = async (req, res) => {
  try {
    const { cedula } = req.params;
    const cliente = await Cliente.findOne({ cedula });
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

    const porcinos = await Porcino.find({ clienteId: cliente._id })
      .populate("alimentacionId");

    const datos = { cliente, porcinos };
    generarPDFReporte(datos, res);

  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};