const express = require("express");
const mongoose = require("mongoose");
const { Funnel, Step } = require("../models");

const router = express.Router();

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  next();
};

router.get("/", async (req, res) => {
  try {
    const funnels = await Funnel.find();
    res.json(funnels);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar funis" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newFunnel = await Funnel.create(req.body);
    res.status(201).json(newFunnel);
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar registro", details: err.message });
  }
});

router.patch("/:id", validateId, async (req, res) => {
  try {
    const updateFunnel = await Funnel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updateFunnel);
  } catch (err) {
    res.status(400).json({ error: "Erro ao atualizar registro", details: err.message });
  }
});

router.delete("/", async (req, res) => {
  const { customerId, stepId } = req.body;

  if (!customerId || !stepId) {
    return res.status(400).json({ error: "customerId e stepId são obrigatórios" });
  }

  try {
    const deleted = await Funnel.findOneAndDelete({ customerId, stepId });

    if (!deleted) {
      return res.status(404).json({ error: "Funil não encontrado" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar funil" });
  }
});

module.exports = router;