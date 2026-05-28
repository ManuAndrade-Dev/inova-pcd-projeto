const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers["x-auth-token"] || req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  try {
    const secret = process.env.JWT_SECRET || "secret123";
    const payload = jwt.verify(token.replace("Bearer ", ""), secret);
    req.userId = payload.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};
