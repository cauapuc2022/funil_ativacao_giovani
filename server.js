require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);
const cors = require("cors");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(async () => {
  console.log("🔥 MongoDB conectado");

  const { Customer, Step, Funnel } = require("./models");

  await Promise.all([
    Customer.createCollection(),
    Step.createCollection(),
    Funnel.createCollection()
  ]);

  // Server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🔥 Rodando em http://localhost:${PORT}`));
})
.catch(err => {
  console.error("Erro MongoDB:", err);
});

const customerRouter = require("./routes/customer");
const stepRouter = require("./routes/step");
const funnelRouter = require("./routes/funnel");

// Rotas
app.use("/", express.static(__dirname + "/public"));
app.use("/funil", express.static(__dirname + "/public/funil.html"));
app.use("/customers", customerRouter);
app.use("/steps", stepRouter);

app.use("/funnels", funnelRouter);
