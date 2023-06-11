require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize("agriculture", "agri", "Admin112358", {
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
    console.log("=====Agriculture Database connection has been established successfully..=====");
  })
  .catch((error) => {
    console.error("=====Unable to connect to the Agriculture Database=====", error);
  });

module.exports = sequelize;
