const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
 const verify = (req, res, next) => {
  const { token } = req.headers;
  console.log({token})
  jwt.verify(token, process.env.jwt_pass, (err, user) => {
    if (err) {
      console.log(err.message);
      return res.status(500).json({ success: false, result: err.message });
    } else {
      
        req.user = user;
        next();

      }
      
  });
};

 const verifyAdmin = (req, res, next) => {
  const { token } = req.headers;
  jwt.verify(token, process.env.jwt_pass, (err, user) => {
    if (err) {
      console.log(err.message);
      return res.status(500).json({ success: false, result: err.message });
    } else {
      if (user.isAdmin) {
        req.user = user;
        next();
      } else {
        return res
          .status(403)
          .json({ success: false, result: "only admins can do that" });
      }
    }
  });
};

module.exports= {verify,verifyAdmin}