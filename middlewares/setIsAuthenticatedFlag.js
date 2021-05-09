function setIsAuthenticatedFlag(req, res, next) {
    res.locals.isAuthenticated = false;

    if(req.session.user != undefined) {
        res.locals.isAuthenticated = true;
    }
    console.log(res.locals);
    next();
}

module.exports = setIsAuthenticatedFlag;