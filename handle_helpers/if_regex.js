const hbs = require("handlebars")

const if_regex = hbs.registerHelper("if_regex", function(a,b,opts){
    let match = a.match(b)
    // console.log(match)
    if(match == b){
        return opts.fn(this);
    }
});
module.exports = {if_regex}