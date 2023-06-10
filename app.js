require("dotenv").config();
const cors = require("cors");

const express = require("express");
const agriDb = require("./util/agriDb");
const tradeDb = require("./util/tradeDb");
const fdiDb = require("./util/fdiDb");

const app = express();

app.use(cors());

const languageMiddleware = require("./middleware/language");
app.use(languageMiddleware);

const dataRouter = require("./routes/agriData");
const textRouter = require("./routes/agriText");
const tradeDataRouter = require("./routes/tradeRouter");
const dataRouterV1_1 = require("./routes/dataRouterV1_1");

// language middleware

app.use("/api/v1/agri/data", dataRouter);
app.use("/api/v1/agri/text", textRouter);
app.use("/api/v1/agri/trade", tradeDataRouter);
app.use("/api/v1.1/agri/data", dataRouterV1_1);

const port = process.env.PORT || 3001;

Promise.all([agriDb.sync(), 
  // tradeDb.sync(), 
  // fdiDb.sync()
])
  .then((results) => {
    app.listen(port);
    console.log(`=========== Server Is Running On Port ${port} =============`);
  })
  .catch((err) => {
    console.log(err);
  });
