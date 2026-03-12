require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const customerRouter = require("./routes/customer");
const stepRouter = require("./routes/step");
const funnelRouter = require("./routes/funnel");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rotas
app.use("/", express.static(__dirname + "/public"));
app.use("/funil", express.static(__dirname + "/public/funil.html"));
app.use("/customers", customerRouter);
app.use("/steps", stepRouter);
app.use("/funnels", funnelRouter);

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("🔥 MongoDB conectado"))
.catch(err => console.error("Erro MongoDB:", err));

mongoose.connect(process.env.MONGO_URL)
.then(() => {
  console.log("🔥 MongoDB conectado");

  // Server
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`🔥 Rodando em http://localhost:${PORT}`));
})
.catch(err => {
  console.error("Erro MongoDB:", err);
});