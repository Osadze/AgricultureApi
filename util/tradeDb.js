require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize("trade1", "root", "Ana2013Mari", {
  host: "192.168.0.139",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Trade Database connection has been established successfully..");
  })
  .catch((error) => {
    console.error("Unable to connect to the Trade Database", error);
  });

module.exports = sequelize;
