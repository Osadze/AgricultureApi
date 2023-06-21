require("dotenv").config();
const tedious = require("tedious");
const Sequelize = require("sequelize");

const sequelize = new Sequelize("register", "agriculture", "Asd12-=", {
  host: "192.168.0.139",
  dialect: "mssql",
  dialectModule: tedious,
  dialectOptions: {
    options: {
      encrypt: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log(
      `===== Register Database connection has been established successfully...=====`
    );
  })
  .catch((error) => {
    console.error(
      `=====Unable to connect to the Register Database=====`,
      error
    );
  });

module.exports = sequelize;
