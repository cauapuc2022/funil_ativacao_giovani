const mongoose = require("mongoose");

// ------------------ CLIENTE ------------------
const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: String,
  matrix: String,
  phone: String,
  email: String,
  address: {
    postalCode: String,
    street: String,
    streetNumber: String,
    neighborhood: String,
    city: String,
    state: String,
  },
  seller: String,
  buyer: String,
  salesType: String,
  purchaseModel: String,
  monthlyTicket: Number,
  notes: String
}, { timestamps: true });

CustomerSchema.index({ name: 1 });

const Customer = mongoose.model("Customer", CustomerSchema);

// ------------------ ETAPA ------------------
const StepSchema = new mongoose.Schema({
  name: { type: String, required: true },
  responsible: String,
  order: { type: Number, required: true }
}, { timestamps: true });

const Step = mongoose.model("Step", StepSchema);

// ------------------ FUNIL ------------------
const FunnelSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  stepId: { type: mongoose.Schema.Types.ObjectId, ref: "Step", required: true },
  funnel_entry_at: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

const Funnel = mongoose.model("Funnel", FunnelSchema);

module.exports = { Customer, Step, Funnel };