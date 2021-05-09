const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('./User');
const Category = require('../categories/Category');
const adminAuth = require('../middlewares/adminauth');
const setIsAuthenticatedFlag = require('../middlewares/setIsAuthenticatedFlag');

router.get('/login', setIsAuthenticatedFlag, (req, res) => {

    console.log('Res.locals => ', res.locals);

    Category.findAll().then(categories => {

        res.render('admin/users/login', {
            categories: categories
        });
    }).catch(error => {
        console.log('Error ', error);
        res.redirect('/');
    })
});

router.post('/authenticate', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if(user != undefined) {
            let isValid = bcrypt.compareSync(password, user.password);
            if(isValid) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                };
                res.redirect('/admin');
            } else {
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    }).catch(error => {
        console.log('Error', error);
    });
});

router.get('/logout', (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

router.get('/admin/users', adminAuth, (req, res) => {

    User.findAll().then(users => {
        res.render('admin/users/index', {
            users: users
        });
    }).catch(error => {
        console.log('Error ', error);
        res.redirect('/');
    });
});

router.get('/admin/users/new', adminAuth, (req, res) => {
    res.render('admin/users/new');
});

router.post('/users/save', adminAuth, (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    let salt = bcrypt.genSaltSync();
    let hash = bcrypt.hashSync(password, salt);

    User.findOne({
        where: {
            email: email
        }
    }).then(user => {
        if(user == null) {
            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect('/admin/users');
            }).catch(error => {
                console.log('Error ', error);
                res.redirect('/');
            });
        } else {
            res.redirect('/admin/users');
        }
    }).catch(error => {
        console.log('Error ', error);
        res.redirect('/admin/users');
    });
});    

router.get('/admin/users/edit/:id', adminAuth, (req, res) => {
    let id = req.params.id;

    if(!isNaN(id)) {
        User.findByPk(id).then(user => {
            if(user != undefined) {
                res.render('admin/users/edit', {
                    user: user
                });
            }
        }).catch(error => {
            console.log('Error ', error);
            res.redirect('/admin/users');
        });
    }
});

router.post('/users/update', adminAuth, (req, res) => {
    let id = req.body.id;
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({
        where: {
            email: email,
        }
    }).then(user => {
        if((user != null && user.id == id) || user == null){

            if(user == null){
                user = User.findOne({ where : {id: id} });
            };

            if(password != '') {
                let salt = bcrypt.genSaltSync();
                password = bcrypt.hashSync(password, salt);
            } else {
                password = user.password;
                
            }  

            User.update({
                email: email,
                password: password}, {
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect('/admin/users');
            }).catch(error => {
                console.log('Error ', error);
                res.redirect('/admin/users');
            });
        } else {
            res.redirect('/admin/users');
        }
    }).catch(error => {
        console.log('Error ', error);
        res.redirect('/admin/users');
    });
});

router.get('/admin/users/delete/:id', adminAuth, (req, res) => {
    let id = req.params.id;

    if(id != undefined && isNaN(id) != true) {
        User.destroy({
            where: {
                id: id
            }
        }).then(() => {
            res.redirect('/admin/users');
        }).catch(error => {
            console.log('Error ', error);
            res.redirect('/admin/users');
        })

    } else {
        res.redirect('/admin/users');
    }
});

module.exports = router;