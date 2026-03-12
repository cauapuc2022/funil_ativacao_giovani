const express = require("express");
const mongoose = require("mongoose");
const { Customer, Funnel } = require("../models");

const router = express.Router();

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  next();
};

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { name } = req.query;
    const filter = name ? { name: { $regex: name, $options: "i" } } : {};

    const customers = await Customer.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments(filter);

    res.json({
      customers,
      total,
    });
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de cliente inválido" });
  }

  try {
    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar cliente" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newCustomers = await Customer.create(req.body);
    res.status(201).json(newCustomers);
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar cliente", details: err.message });
  }
});

router.patch("/:id", validateId, async (req, res) => {
  try {
    const updateCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updateCustomer);
  } catch (err) {
    res.status(400).json({ error: "Erro ao atualizar registro", details: err.message });
  }
});

router.patch("/:customerId/step", async (req, res) => {
  const { customerId } = req.params;
  const { stepId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    return res.status(400).json({ error: "ID de cliente inválido" });
  }

  if (!mongoose.Types.ObjectId.isValid(stepId)) {
    return res.status(400).json({ error: "ID de etapa inválido" });
  }

  try {

    const funnel = await Funnel.findOne({ customerId });

    if (!funnel) {
      return res.status(404).json({ error: "Registro do funil não encontrado para este cliente" });
    }

    funnel.stepId = stepId;

    await funnel.save();

    res.json({
      message: "Etapa do funil atualizada com sucesso",
      funnel
    });

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err });
  }
});

router.delete("/:id", validateId, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    await Funnel.deleteMany({ customerId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar cliente" });
  }
});

module.exports = router;