const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const Task = require("../models/Task");
const Responsavel = require("../models/Responsavel");
const StatusHistory = require("../models/StatusHistory");
const User = require("../models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/inova_pcd";
const localDbPath = path.join(__dirname, "..", "local-db.json");
let db = null;
let useMongo = false;

const initLocalDb = () => {
  if (!fs.existsSync(localDbPath)) {
    fs.writeFileSync(localDbPath, JSON.stringify({ tasks: [], responsaveis: [], statusHistory: [], users: [] }, null, 2), "utf-8");
  }
  const adapter = new FileSync(localDbPath);
  db = low(adapter);
  db.defaults({ tasks: [], responsaveis: [], statusHistory: [], users: [] }).write();
};

const connect = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    useMongo = true;
    console.log("MongoDB conectado");
  } catch (error) {
    console.error("Falha MongoDB:", error.message);
    console.log("Usando banco local em backend/local-db.json");
    initLocalDb();
  }
};

const applyFilters = (items, filters) => {
  return items.filter((item) => {
    return Object.entries(filters).every(([key, value]) => {
      if (item[key] === undefined || item[key] === null) {
        return false;
      }
      return String(item[key]) === String(value);
    });
  });
};

const getNextId = (collection) => {
  const all = db.get(collection).map("id").value();
  return all.length ? Math.max(...all) + 1 : 1;
};

const normalizeTask = (task) => {
  if (!task) return task;
  if (task.data_criacao && typeof task.data_criacao === "string") {
    task.data_criacao = new Date(task.data_criacao);
  }
  if (task.data_conclusao && typeof task.data_conclusao === "string") {
    task.data_conclusao = new Date(task.data_conclusao);
  }
  return task;
};

exports.connect = connect;

exports.getTasks = async (filters = {}) => {
  if (useMongo) {
    return Task.find(filters).sort({ id: 1 });
  }
  const tasks = applyFilters(db.get("tasks").value(), filters);
  return tasks.sort((a, b) => (a.id || 0) - (b.id || 0));
};

exports.getTask = async (id) => {
  if (useMongo) {
    return Task.findOne({ id });
  }
  return normalizeTask(db.get("tasks").find({ id }).value());
};

exports.createTask = async (data) => {
  if (useMongo) {
    const task = new Task(data);
    return task.save();
  }
  const item = { ...data, id: data.id || getNextId() };
  db.get("tasks").push(item).write();
  return normalizeTask(item);
};

exports.updateTask = async (id, data) => {
  if (useMongo) {
    return Task.findOneAndUpdate({ id }, data, { new: true });
  }
  const item = db.get("tasks").find({ id }).assign(data).write();
  return normalizeTask(item);
};

exports.deleteTask = async (id) => {
  if (useMongo) {
    return Task.findOneAndDelete({ id });
  }
  return db.get("tasks").remove({ id }).write();
};

exports.getSummary = async () => {
  if (useMongo) {
    const tasks = await Task.find();
    return tasks;
  }
  return db.get("tasks").value();
};

exports.getResponsaveis = async () => {
  if (useMongo) {
    return Responsavel.find();
  }
  return db.get("responsaveis").value();
};

exports.getStatusHistory = async () => {
  if (useMongo) {
    return StatusHistory.find().sort({ data_mudanca: -1 });
  }
  return db.get("statusHistory").sortBy("data_mudanca").reverse().value();
};

exports.getUserByEmail = async (email) => {
  if (useMongo) {
    return User.findOne({ email });
  }
  return db.get("users").find({ email }).value();
};

exports.createUser = async (data) => {
  if (useMongo) {
    const user = new User(data);
    return user.save();
  }
  const item = { ...data, id: getNextId("users") };
  db.get("users").push(item).write();
  return item;
};

exports.clearAll = async () => {
  if (useMongo) {
    await Task.deleteMany();
    await Responsavel.deleteMany();
    await StatusHistory.deleteMany();
    await User.deleteMany();
    return;
  }
  db.set("tasks", []).write();
  db.set("responsaveis", []).write();
  db.set("statusHistory", []).write();
  db.set("users", []).write();
};

exports.insertTasks = async (items) => {
  if (useMongo) {
    return Task.insertMany(items);
  }
  db.get("tasks").push(...items).write();
};

exports.insertResponsaveis = async (items) => {
  if (useMongo) {
    return Responsavel.insertMany(items);
  }
  db.get("responsaveis").push(...items).write();
};

exports.insertStatusHistory = async (items) => {
  if (useMongo) {
    return StatusHistory.insertMany(items);
  }
  db.get("statusHistory").push(...items).write();
};
