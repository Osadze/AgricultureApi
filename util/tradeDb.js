require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.TRADEDB_NAME,
  process.env.TRADEDB_USER,
  process.env.TRADEDB_PASW,
  {
    host: process.env.TRADEDB_HOST,
    dialect: process.env.TRADEDB_DIALECT,
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log(
      `=====${process.env.TRADEDB_NAME} Database connection has been established successfully...=====`
    );
  })
  .catch((error) => {
    console.error(
      `=====Unable to connect to the${process.env.TRADEDB_NAME} Database=====`,
      error
    );
  });

module.exports = sequelize;
