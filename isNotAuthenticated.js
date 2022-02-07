const isNotAuthenticated = (req,res,next) =>{
    let token = req.cookies["session-token"];
    //console.log(token);
    if (token == undefined){
        next();
    } else {
        return res.redirect("/profile");
    }
}

module.exports = { isNotAuthenticated }