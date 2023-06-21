require("dotenv").config();

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.AGRIDB_NAME,
  process.env.AGRIDB_USER,
  process.env.AGRIDB_PASW,
  {
    host: process.env.AGRIDB_HOST,
    dialect: process.env.AGRIDB_DIALECT,
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
      `=====${process.env.AGRIDB_NAME} Database connection has been established successfully...=====`
    );
  })
  .catch((error) => {
    console.error(
      `=====Unable to connect to the${process.env.AGRIDB_NAME} Database=====`,
      error
    );
  });

module.exports = sequelize;
