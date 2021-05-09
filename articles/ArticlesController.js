const express = require('express');
const router = express.Router();

const Category = require('../categories/Category');
const Article = require('../articles/Article');
const slugify = require('slugify');
const adminAuth = require('../middlewares/adminauth');

router.get('/admin/articles', adminAuth, (req, res) => {
    res.redirect('/admin/articles/page/1');
});

router.get('/admin/articles/new', adminAuth, (req, res) => {
    Category.findAll().then(categories => {

        res.render('admin/articles/new', {
            categories: categories
        });

    }).catch(error => {
        console.log('Error ', error);
        res.render('/');
    });
});

router.post('/articles/save', adminAuth, (req, res) => {
    let title = req.body.title;
    let category = req.body.category;
    let body = req.body.body;

    if(title != undefined && category != undefined && body != undefined) {
        Article.create({
            title: title,
            slug: slugify(title),
            body: body,
            categoryId: category
        }).then(() => {
            res.redirect('/admin/articles');
        }).catch(error => {
            console.log('Error ', error);
            res.redirect('/admin/articles');
        });
    } else {
        res.redirect('/admin/articles');
    }

});

router.get('/admin/articles/delete/:id', adminAuth, (req, res) => {
    let id = req.params.id;

    if(id != undefined && isNaN(id) != true) {
        Article.destroy({
            where: {
                id: id
            }
        }).then(() => {
            res.redirect('/admin/articles');
        }).catch(error => {
            console.log('Error ', error);
            res.redirect('/admin/articles');
        })

    } else {
        res.redirect('/admin/articles');
    }
});

router.get('/admin/articles/edit/:id', adminAuth, (req, res) => {
    let id = req.params.id;

    if(!isNaN(id)) {
        Article.findByPk(id).then(article => {

            if(article != undefined) {
                Category.findAll().then(categories => {
                    res.render('admin/articles/edit', {
                        article: article,
                        categories: categories
                    });
                }).catch(error => {
                    console.log('Error ', error);
                    res.redirect('/admin/articles');
                });
            }

        }).catch(error => {
            console.log('Error ', error);
            res.redirect('/admin/articles');
        });
    }

});

router.post('/articles/update', adminAuth, (req, res) => {
    let id = req.body.id;
    let title = req.body.title;
    let category = req.body.category;
    let body = req.body.body;

    Article.update({title: title, slug: slugify(title), categoryId: category, body: body}, {
        where: {
            id: id
        }
    }).then(() => {
        res.redirect('/admin/articles');
    }).catch(error => {
        console.log('Error ', error);
        res.redirect('/admin/articles');
    });
});

router.get('/admin/articles/page/:num', adminAuth, (req, res) => {
    let page = req.params.num;

    if(isNaN(page) || page <= 0){
        page = 1;
    }else {
        page = parseInt(page);
    }

    let articlesPerPage = 8;
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
            res.render('admin/articles/page', {result: result, categories: categories});
        }).catch(error => {
            console.log('Error ', error);
            res.redirect('/');
        })
    });
});

module.exports = router;