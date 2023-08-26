import { Sequelize } from "sequelize";

const sequelize = new Sequelize('shop_nodejs', 'root', '92177430112784', {
    dialect: 'mysql',
    host: 'localhost'
});

export default sequelize;