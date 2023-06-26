require("dotenv").config();
// require("express-async-errors"); // for future

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

const agriDb = require("./util/agriDb");
const tradeDb = require("./util/tradeDb");
const fdiDb = require("./util/fdiDb");
const languageMiddleware = require("./middleware/language");

// app.set("trust proxy", 1);
// app.use(
//   rateLimiter({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, //limit each IP to 100 requests per windowMs
//   })
// );
app.use(express.json());
// app.use(helmet());
// const corsOptions = {
//   origin: "http://192.168.0.20:8096", // Replace with your allowed domain
// };

// app.use(cors(corsOptions));
app.use(cors());
// app.use(xss());

app.use(languageMiddleware);

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

// waits for all dbs to sync and then starts the server

// Promise.all([agriDb.sync(),
//   tradeDb.sync(),
//   fdiDb.sync(),
// ])
//   .then((results) => {
//     app.listen(port);
//     console.log(`=========== Server Is Running On Port ${port} =============`);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// waits for only agridb to sync and then starts the server and other dbs sync on background

agriDb
  .sync()
  .then(() => {
    console.log("Agriculture database synchronized");
    app.listen(port, () => {
      console.log(
        `=========== Server Is Running On Port ${port} =============`
      );
    });
    return Promise.all([tradeDb.sync(), fdiDb.sync()]);
  })
  .then(() => {
    console.log("Trade and FDI databases synchronized");
  })
  .catch((err) => {
    console.error("Database synchronization error:", err);
  });
