const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uuid = require("uuid").v4;
const path = require("path");
const app = express();
//DB
const pool = require("../database");
//public route
const public_route = "PATH/TO/FILE"//M 
const { isNotAuthenticated } = require("../isNotAuthenticated");
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = "CLIENT_ID";//M
const client = new OAuth2Client(CLIENT_ID);
//files
const storage = multer.diskStorage({
    destination:(req,file, cb) =>{
        cb(null, "files")
    },
    filename: (req,file, cb) =>{
        const {originalname} = file; 
        cb(null, `${uuid()}-${originalname}`);
    }
});
const upload = multer({storage});
//routing
router.get("/", (req,res)=>{
	res.sendFile("/html/index.html", {
        root: public_route
    })
});
//root folder
router.get("/myfiles",isAuthenticated, async (req,res)=>{
    const { google_id } = req.user;
    const rootFolder = await pool.query(`
    SELECT *
    FROM folders
    WHERE owner = ? AND folder_type = "root"
    `,[google_id]);
    const rootFolder_id  = rootFolder[0].id;
    res.redirect(`myfiles/${rootFolder_id}`)
});
//adding a file
router.post("/myfiles/addfile/:id",isAuthenticated, upload.single("media"), async (req,res)=>{
    console.log(req.file);
    const { google_id } = req.user;
    const current_folder_id = req.params.id;
    if(req.file != undefined){
        const {originalname, path, mimetype} = req.file;
        const newFile = {
            owner: google_id,
            file_name: originalname,
            file_type: mimetype,
            path_name: path,
            contained_by: current_folder_id,
            public: 0
        }
        await pool.query("INSERT INTO files SET ?", [newFile]);
        console.log("Uploaded file");
    }
    res.redirect(`/myfiles/${current_folder_id}`)
});
//adding a folder
router.post("/myfiles/addfolder/:id",isAuthenticated, async (req,res)=>{
    const { google_id } = req.user;
    const current_folder_id = req.params.id;
    const { folder_name } = req.body;
    if(!spacesInFolderName(folder_name) && folder_name != ""){
        const newFolder = {
            owner: google_id,
            folder_name,
            contained_by: current_folder_id
        };
        await pool.query("INSERT INTO folders SET ? ",[newFolder]);
    }
    res.redirect(`/myfiles/${current_folder_id}`);
});
//publish and privatize
router.get("/myfiles/topublic/:id",isAuthenticated, async (req,res) =>{
    const { id } = req.params;
    const { google_id } = req.user;
    const file = await pool.query("SELECT * FROM files WHERE id = ? AND owner = ?",[id, google_id]);
    if (file[0].public == 0){
        await pool.query("UPDATE files SET public = 1 WHERE id = ? AND owner = ?",[id,google_id])
    }else{
        await pool.query("UPDATE files SET public = 0 WHERE id = ? AND owner = ?",[id,google_id])
    }
    res.redirect("/myfiles")
});
//folders behaviour
router.get("/myfiles/:id", isAuthenticated, async (req,res)=>{
    const { google_id } = req.user; 
    const current_folder_id = req.params.id;
    const files = await pool.query(`
    SELECT
    f.id AS file_id, 
    f.owner,
    f.file_name,
    f.path_name,
    f.file_type,
    f.public,
    f.contained_by
    FROM files f
    JOIN folders fo 
        ON f.contained_by = fo.id 
    WHERE  fo.owner = ? 
    AND fo.id = ?`
    ,[google_id, current_folder_id]);
    const folders = await pool.query(`
    SELECT 
    fo.id AS folder_id,
    fo.owner,
    fo.folder_name,
    fo.folder_type,
    fo.contained_by
    FROM folders fo
    JOIN folders fo2 
        ON fo.contained_by = fo2.id 
    WHERE  fo.owner = ? AND 
    fo2.id = ?;
    `,[google_id,current_folder_id]);
	res.render("files/myFiles",{files,folders, google_id, current_folder_id});
});
//public files
router.get("/allfiles",isAuthenticated, async (req,res)=>{
    const { google_id } = req.user
    const files = await pool.query("SELECT * FROM files WHERE public = 1"); 
	res.render("files/allFiles",{files, google_id});
    
});
router.get("/login",isNotAuthenticated, (req,res) =>{
    res.render("auth/login");
});
router.post("/login", (req,res)=>{
    let token = req.body.token;
    //console.log(token);
    const verify = async () => {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        console.log(payload);
        const userid = payload['sub'];
        const gmail = payload["email"];
        const name = payload["name"];
        const verifiedEmail = payload["email_verified"];

        const users = await pool.query("SELECT * FROM users WHERE google_id = ?", [userid]);
        console.log(users);
        if(users.length == 0){ //empty
            console.log("unregistered user --> register user")
            await pool.query("INSERT INTO users VALUES(?,?,?,?)", [userid,name,gmail,verifiedEmail]);
            //folder creation for new users
            let folderName = `${name}'s main_folder`
            await pool.query('INSERT INTO folders (owner,folder_name,folder_type) VALUES(?,?,"root")', [userid,folderName]);
        }
    }
    verify()
    .then(()=>{
        res.cookie("session-token", token)
        res.send("success")
    })
    .catch(console.error);
});

router.get("/logout", (req,res) =>{
    res.clearCookie("session-token");
    res.redirect("/login");
});

router.get("/profile", isAuthenticated, (req,res) =>{
    let user = req.user;
    const { google_id } = req.user;
    res.render("profile", {user, google_id});
});
module.exports = router;
