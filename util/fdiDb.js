require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize(process.env.FDIDB_NAME, process.env.FDIDB_USER, process.env.FDIDB_PASW, {
  host: process.env.FDIDB_HOST,
  dialect: process.env.FDIDB_DIALECT,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("=====Fdi Database connection has been established successfully...=====");
  })
  .catch((error) => {
    console.error("=====Unable to connect to the Fdi Database=====", error);
  });

module.exports = sequelize;
