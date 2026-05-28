const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dbStore = require("../db/store");

const gerarToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "1h",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
    }
    let user = await dbStore.getUserByEmail(email);
    if (user) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }
    const hash = await bcrypt.hash(password, 10);
    user = await dbStore.createUser({ name, email, password: hash });
    res.json({ token: gerarToken(user.id || user._id) });
  } catch (error) {
    res.status(500).json({ error: "Erro no registro" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('LOGIN ATTEMPT', { email, hasPassword: Boolean(password) });
    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }
    const user = await dbStore.getUserByEmail(email);
    console.log('LOGIN USER', user ? { email: user.email, id: user.id || user._id } : null);
    if (!user) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }
    const senhaValida = await bcrypt.compare(password, user.password);
    console.log('LOGIN CHECK', { senhaValida });
    if (!senhaValida) {
      return res.status(400).json({ error: "Credenciais inválidas" });
    }
    res.json({ token: gerarToken(user.id || user._id) });
  } catch (error) {
    console.error('LOGIN ERROR', error);
    res.status(500).json({ error: "Erro no login" });
  }
};
