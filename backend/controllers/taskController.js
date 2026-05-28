const dbStore = require("../db/store");

exports.getTasks = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.categoria) filters.categoria = req.query.categoria;
    const tasks = await dbStore.getTasks(filters);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefas" });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await dbStore.getTask(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tarefa" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await dbStore.createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: "Erro ao criar tarefa" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await dbStore.updateTask(Number(req.params.id), req.body);
    if (!task) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar tarefa" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await dbStore.deleteTask(Number(req.params.id));
    if (!task || (Array.isArray(task) && task.length === 0)) {
      return res.status(404).json({ error: "Tarefa não encontrada" });
    }
    res.json({ message: "Tarefa removida" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao remover tarefa" });
  }
};
