import Product from "../models/product.js";

export const getProducts = (req, res, next) => {
    Product.findAll()
    .then((products) => {
        res.render('shop/product-list', {
            prods: products, 
            docTitle: "All products", 
            path: '/products'
        });
    })
    .catch(err => console.log(err));
},
getProduct = (req, res, next) => {
    const productId = req.params.productId;
    Product.findByPk(productId)
    .then((product) => {
        res.render('shop/product-detail', {
            product: product,
            docTitle: "Product detail",
            path: '/products'
        })
    })
    .catch(err => console.log(err));
},
getIndex = (req, res, next) => {
    Product.findAll()
    .then((products) => {
        res.render('shop/index', {
            prods: products, 
            docTitle: "Shop", 
            path: '/'
        });
    })
    .catch(err => console.log(err));
},
getCart = (req, res, next) => {
    req.user.getCart()
    .then(cart => {
        return cart.getProducts()
        .then(products => {
            res.render('shop/cart', {
                path: '/cart',
                docTitle: 'Cart',
                products: products
            });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
},
postCart = (req, res, next) => {
    const productId = req.body.productId;
    let fetchedCart;
    let newQuantity = 1;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts({where: {id: productId}});
    })
    .then(products => {
        let product;
        if (products.length > 0) {
            product = products[0];
        }
        if (product) {
            const oldQuantity = product.cartItem.quantity;
            newQuantity += oldQuantity;
            return product;
        }
        return Product.findByPk(productId);
    })
    .then(product => {
        return fetchedCart.addProduct(product, { through: { quantity: newQuantity } });
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
},
cartDeleteItem = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.getCart()
    .then(cart => {
        return cart.getProducts({where: {id: prodId}});
    })
    .then(products => {
        const product = products[0];
        return product.cartItem.destroy();
    })
    .then(() => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
},
getOrders = (req, res, next) => {
    req.user.getOrders({include: ['products']})
    .then(orders => {
        console.log(orders);
        res.render('shop/orders', {
            path: '/orders',
            docTitle: 'Orders',
            orders: orders
        })
    })
    .catch(err => console.log(err));
},
postOrder = (req, res, next) => {
    let fetchedCart;
    req.user.getCart()
    .then(cart => {
        fetchedCart = cart;
        return cart.getProducts();
    })
    .then(products => {
        return req.user.createOrder()
        .then(order => {
            return order.addProducts(products.map(prod => {
                prod.orderItem = {quantity: prod.cartItem.quantity};
                return prod;
            }));
        })
        .catch(err => console.log(err));
    })
    .then(result => {
        return fetchedCart.setProducts(null);
    })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
};