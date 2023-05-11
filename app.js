require("dotenv").config();
const cors = require("cors");

const express = require("express");
const sequelize = require("./util/database");
const app = express();


app.use(cors());

const agroRouter = require('./routes/agriculture')
const agroRouterV1_1 = require('./routes/agricultureV1_1')


app.use("/api/v1/", agroRouter);
app.use("/api/v1.1/", agroRouterV1_1);


const port = process.env.PORT || 3001;

sequelize
  .sync()
  .then((result) => {
    app.listen(port);
    console.log(`=========== Server Is Running On Port ${port} =============`)
  })
  .catch((err) => {
    console.log(err);
  });

