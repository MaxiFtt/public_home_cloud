const express = require("express");
const path = require("path");
const exphbs = require ("express-handlebars");
const cookieParser = require("cookie-parser");
const app = express();
//settings
app.set("port", process.env.PORT || 5000);
app.set("views", path.join(__dirname, "views"))

//middlewares
app.engine(".hbs", exphbs({
    defaultLayout:"main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"),"partials"),
    extname: ".hbs"
}));
app.set("view engine", ".hbs");
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); //datos de formularios al backend
//handle_helpers
const if_regex = require("./handle_helpers/if_regex");
const if_eq = require("./handle_helpers/if_eq");
//routes
app.use(require("./routes/routing.js"));

app.use(express.static(__dirname));

//server listening
app.listen(app.get("port"), ()=>{
	console.log("server on port", app.get("port"));
});