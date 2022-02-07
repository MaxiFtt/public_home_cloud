const hbs = require("handlebars")

const if_eq = hbs.registerHelper("if_eq", function(a,b,opts){
    if(a == b){
        return opts.fn(this);
    }
});
module.exports = {if_eq}