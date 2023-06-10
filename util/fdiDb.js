require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize("fdi_new", "fdi", "Asd123$%", {
  host: "192.168.1.29",
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
    console.log("Fdi Database connection has been established successfully..");
  })
  .catch((error) => {
    console.error("Unable to connect to the Fdi Database", error);
  });

module.exports = sequelize;
