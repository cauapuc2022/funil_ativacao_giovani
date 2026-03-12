const express = require("express");
const mongoose = require("mongoose");
const { Step, Funnel, Customer } = require("../models");

const router = express.Router();

const validateId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  next();
};

router.get("/", async (req, res) => {
  try {
    const steps = await Step.find();
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar etapas" });
  }
});

router.get("/customers", async (req, res) => {
  try {
    const stepsWithCustomers = await Step.aggregate([
  {
    $lookup: {
      from: "funnels",
      let: { stepId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$stepId", "$$stepId"] } } },
        {
          $lookup: {
            from: "customers",
            let: { customerId: "$customerId" },
            pipeline: [
              { $match: { $expr: { $eq: ["$_id", "$$customerId"] } } },
              {
                $project: {
                  name: 1,
                  phone: 1,
                  brand: 1,
                  seller: 1,
                  buyer: 1,
                  address: 1,
                  updatedAt: 1
                }
              }
            ],
            as: "customer"
          }
        },
        { $unwind: "$customer" },
        {
          $addFields: {
            "customer.funnel_entry_at": "$funnel_entry_at",
            "customer.funnel_updatedAt": "$updatedAt"
          }
        },
        { $replaceRoot: { newRoot: "$customer" } }
      ],
      as: "customers"
    }
  },
  {
    $project: {
      name: 1,
      responsible: 1,
      order: 1,
      createdAt: 1,
      updatedAt: 1,
      customers: 1
    }
  }
]);

    res.json(stepsWithCustomers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar etapas com clientes" });
  }
});

router.get("/available-customers", async (req, res) => {
  try {
    const availableCustomers = await Customer.aggregate([
      {
        $lookup: {
          from: "funnels",
          localField: "_id",
          foreignField: "customerId",
          as: "funnels"
        }
      },
      {
        $match: {
          funnels: { $size: 0 }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          brand: 1,
          "address.city": 1,
          "address.state": 1
        }
      }
    ]);

    res.json(availableCustomers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar clientes disponíveis" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID de etapa inválido" });
  }

  try {
    const step = await Step.findById(id);

    if (!step) {
      return res.status(404).json({ error: "Etapa não encontrada" });
    }

    res.json(step);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar etapa" });
  }
});

router.post("/", async (req, res) => {
  try {
    const newStep = await Step.create(req.body);
    res.status(201).json(newStep);
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar etapa", details: err.message });
  }
});

router.patch("/:id", validateId, async (req, res) => {
  try {
    const updateStep = await Step.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updateStep);
  } catch (err) {
    res.status(400).json({ error: "Erro ao atualizar etapa", details: err.message });
  }
});

router.delete("/:id", validateId, async (req, res) => {
  try {
    await Step.findByIdAndDelete(req.params.id);
    await Funnel.deleteMany({ stepId: req.params.id });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar etapa" });
  }
});

module.exports = router;