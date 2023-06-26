require("dotenv").config();
const cors = require("cors");

const express = require("express");
const agriDb = require("./util/agriDb");
const tradeDb = require("./util/tradeDb");
const fdiDb = require("./util/fdiDb");
const registerDb = require("./util/registerDb");
const languageMiddleware = require("./middleware/language");

const app = express();

app.use(cors());

app.use(languageMiddleware);
// app.use((req, res, next) => {
//   if (req.path === "/api/v1/agri/data/self-sufficiency-ratio") {
//     // Skip the middleware for the specific request
//     next();
//   } else {
//     // Apply the middleware to all other requests
//     languageMiddleware(req, res, next);
//   }
// });


const dataRouter = require("./routes/agriData");
const textRouter = require("./routes/agriText");
const tradeRouter = require("./routes/tradeRouter");
const fdiRouter = require("./routes/fdiRouter");
const dataRouterV1_1 = require("./routes/dataRouterV1_1");

// language middleware

app.use("/api/v1/agri/data", dataRouter);
app.use("/api/v1/agri/text", textRouter);
app.use("/api/v1/agri/trade", tradeRouter);
app.use("/api/v1/agri/fdi", fdiRouter);
app.use("/api/v1.1/agri/data", dataRouterV1_1);

const port = process.env.PORT || 3001;

Promise.all([agriDb.sync(), 
  tradeDb.sync(), 
  fdiDb.sync(),
  registerDb.sync()
])
  .then((results) => {
    app.listen(port);
    console.log(`=========== Server Is Running On Port ${port} =============`);
  })
  .catch((err) => {
    console.log(err);
  });
