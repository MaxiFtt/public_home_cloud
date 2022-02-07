const {OAuth2Client} = require('google-auth-library');
const isAuthenticated = (req,res,next) =>{
    const CLIENT_ID = "CLIENT_ID";//M
    const client = new OAuth2Client(CLIENT_ID);
    let token = req.cookies["session-token"];
    //console.log(token);
    let user = {};
    const verify = async () => {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        //console.log(payload);
        user.google_id = payload.sub;
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    }
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err =>{
        res.redirect("/login");
        console.log("error")
    });
}
module.exports = {isAuthenticated}
