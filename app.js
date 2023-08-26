import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import adminRoutes from './routes/admin.js';
import shopRoutes from './routes/shop.js';
import { pageNotFound } from './controllers/404.js';

import sequelize from './util/database.js';
import Product from './models/product.js';
import User from './models/user.js';
import Cart from './models/cart.js';
import CartItem from './models/cart-item.js';
import Order from './models/order.js';
import OrderItem from './models/order-item.js';

const __filename = fileURLToPath(import.meta.url),
      __dirname = path.dirname(__filename);

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(pageNotFound);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, {through: OrderItem});


sequelize
.sync()
// .sync({force: true})
.then(result => {
    return User.findByPk(1)
})
.then(user => {
    if(!user) {
        return User.create({name: 'Daniil', email: 'test@test.com'});
    }
    return Promise.resolve(user);
})
.then(user => {
    return user.getCart()
    .then(cart => {
        if (!cart) return user.createCart();
        return cart;
    })
    .catch(err => console.log(err));
})
.then(cart => {
    app.listen(3000);
}) 
.catch(err => console.log(err));