require("dotenv").config();
const cors = require("cors");

const express = require("express");
const sequelize = require("./util/database");
const app = express();

app.use(cors());

const languageMiddleware = require("./middleware/language");
app.use(languageMiddleware);

const dataRouter = require("./routes/agriData");
const textRouter = require("./routes/agriText");
const oldRouter = require("./routes/oldrouter");

// language middleware

app.use("/api/v1.1/agri/data", dataRouter);
app.use("/api/v1.1/agri/text", textRouter);
app.use("/api/v1/agri", oldRouter);

const port = process.env.PORT || 3001;

sequelize
  .sync()
  .then((result) => {
    app.listen(port);
    console.log(`=========== Server Is Running On Port ${port} =============`);
  })
  .catch((err) => {
    console.log(err);
  });
