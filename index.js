const express = require('express');
const app = express();
const connection = require('./database/database');
const session = require('express-session');
const adminAuth = require('./middlewares/adminauth');

// Controllers
const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');
const usersController = require('./users/UserController');

// Models
const Article = require('./articles/Article');
const Category = require('./categories/Category');
const setIsAuthenticatedFlag = require('./middlewares/setIsAuthenticatedFlag');

// View engine
app.set('view engine', 'ejs');

// Sessions
app.use(session({
    secret: "3&~vUisTjm6*Gs]yEQ6@yRnq^>(G^OW+}}qvFs>z*a)4!V?i~e[[Z#';Ust}H,p",
    cookie: { maxAge: 30000000}
}));

// Static files
app.use(express.static('public'));

// Body parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Database
connection
    .authenticate()
    .then(() => {
        console.log('Database connected!');
    })
    .catch(error => {
        console.log('Database error', error);
    })

// Server hostname and port
port = 3000;
hostname = 'localhost';

app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', usersController);

const bcrypt = require('bcryptjs');
const User = require('./users/User');

let salt = bcrypt.genSaltSync();
let hash = bcrypt.hashSync('admin', salt);

// This creates the system first user with email "admin@admin.com" and password "admin"
User.findOrCreate({
    where: { email: 'admin@admin.com' },
    defaults: { password: hash }
}).then(([user, created]) => {
    if(created) {
        console.log('Admin user created');
    }
    //console.log(user.get({ plain: true }));
}).catch(error => {
    console.log('Error creating Admin', error);
});

app.get('/', (req, res) => {
    res.redirect('articles/page/1');
});

app.get('/admin', adminAuth, (req, res) => {
    res.render('admin/index');
});

app.get('/articles/page/:num', setIsAuthenticatedFlag, (req, res) => {
    let page = req.params.num;

    if(isNaN(page) || page <= 0){
        page = 1;
    } else {
        page = parseInt(page);
    }
    let articlesPerPage = 4;
    let offset = articlesPerPage * (page - 1);

    Article.findAndCountAll({
        limit: articlesPerPage,
        offset: offset,
        include: [{model: Category}],
        order: [
            ['id', 'DESC']
        ]
    }).then(articles => {
        let next = true;
        if(offset + articlesPerPage >= articles.count){
            next = false;
        }

        let result = {
            page: page,
            next: next,
            articles: articles
        }

        Category.findAll().then(categories => {
            res.render('index', {result: result, categories: categories});
        }).catch(error => {
            console.log('Error ', error);
            res.redirect('/');
        })
    });
});

app.get('/:slug', setIsAuthenticatedFlag, (req, res) => {
    let slug = req.params.slug;

    if(slug != undefined) {
        Article.findOne({
            where: {
                slug: slug
            }
        }).then(article => {

            Category.findAll({raw:true}).then(categories => {
                res.render('article', {
                    article: article,
                    categories: categories
                });
            }).catch(error => {
                console.log('Error ', error);
                res.send('404');
            });
        }).catch(error => {
            console.log('Error ', error);
            res.redirect('/');
        })
    }

});

app.get('/category/:slug/:page', setIsAuthenticatedFlag, (req, res) => {
    let slug = req.params.slug;
    let page = req.params.page;

    if(isNaN(page) || page <= 0){
        page = 1;
    } else {
        page = parseInt(page);
    }
    let articlesPerPage = 4;
    let offset = articlesPerPage * (page - 1);

    Category.findOne({
        where: {
            slug: slug
        },
        include: [{
            model: Article,
            limit: articlesPerPage,
            offset: offset,
            order: [
                ['id', 'DESC']
            ]
        }]
    }).then( category => {
        Article.count({
            where: {
                categoryId: category.id
            }
        }).then(numOfArticles => {

            // Unfortnately i can't undestand this anymore xD
            // Nem eu entendo mais nada

            Category.findAll().then(categories => {

                let next = true;
                if(offset + articlesPerPage >= numOfArticles){
                    next = false;
                }
                
                res.render('articles-per-category', {
                    page: page,
                    next: next,
                    articles: category.articles,
                    category: category,
                    categories: categories
                })
            }).catch(error => {
                console.log(error);
                res.redirect('/');
            })

        }).catch(error => {
            console.log('Error \n\n', error);
            res.redirect('/');
        });
    }).catch(error => {
        console.log('Error ', error);
        res.redirect('/');
    });
});

app.listen(port, hostname, () => {
    console.log(`App listen on http://${hostname}:${port}`);
})