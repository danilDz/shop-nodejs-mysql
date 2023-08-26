import Product from "../models/product.js";

export const getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        docTitle: "Add product", 
        path: "/admin/add-product",
        editing: false
    });
}, 
postAddProduct = (req, res, next) => {
    req.user.createProduct({
        title: req.body.title,
        price: Number.parseFloat(req.body.price),
        imageURL: req.body.imageURL,
        description: req.body.description,
    })
    .then((result) => {
        console.log(result);
        res.redirect('/products');
    })
    .catch(err => console.log(err));
},
getEditProduct = (req, res, next) => {
    const editMode = req.query.edit,
          prodId = req.params.productId;
    if (!editMode) return res.redirect('/');
    req.user.getProducts({where: {id: prodId}})
    .then(products => {
        if (!products) return res.redirect('/');
        res.render('admin/edit-product', {
            docTitle: "Edit product",
            path: '/admin/edit-product',
            editing: editMode,
            product: products[0]
        });
    })
    .catch(err => console.log(err));
},
postEditProduct = (req, res, next) => {
    Product.findByPk(req.body.productId)
    .then(product => {
        product.title = req.body.title;
        product.imageURL = req.body.imageURL;
        product.description = req.body.description;
        product.price = req.body.price;
        return product.save();
    })
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
},
getProducts = (req, res, next) => {
    req.user.getProducts()
    .then(products => {
        res.render('admin/products', {
            prods: products, 
            docTitle: "Admin products", 
            path: '/admin/products'
        });
    })
    .catch(err => console.log(err));
},
deleteProduct = (req, res, next) => {
    Product.findByPk(req.body.productId)
    .then(product => {
        product.destroy();
    })
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};