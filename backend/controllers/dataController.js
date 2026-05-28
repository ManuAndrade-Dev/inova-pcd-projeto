const dbStore = require("../db/store");

exports.getSummary = async (req, res) => {
  try {
    const tasks = await dbStore.getSummary();
    const resumo = {
      total: tasks.length,
      status: {},
      categoria: {},
      publico_alvo: {},
    };

    tasks.forEach((task) => {
      resumo.status[task.status] = (resumo.status[task.status] || 0) + 1;
      resumo.categoria[task.categoria] = (resumo.categoria[task.categoria] || 0) + 1;
      resumo.publico_alvo[task.publico_alvo] = (resumo.publico_alvo[task.publico_alvo] || 0) + 1;
    });

    res.json(resumo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar resumo" });
  }
};

exports.getResponsaveis = async (req, res) => {
  try {
    const lista = await dbStore.getResponsaveis();
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar responsáveis" });
  }
};

exports.getStatusHistory = async (req, res) => {
  try {
    const historico = await dbStore.getStatusHistory();
    res.json(historico);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar histórico de status" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const tasks = await dbStore.getSummary();
    const resumo = {
      finishRateByCategory: {},
      avgLeadTimeDays: 0,
      tasksByOwner: {},
    };

    const counts = {
      totalByCategory: {},
      doneByCategory: {},
      leadDays: [],
    };

    tasks.forEach((task) => {
      const categoria = task.categoria || "Sem categoria";
      counts.totalByCategory[categoria] = (counts.totalByCategory[categoria] || 0) + 1;
      if (task.status === "concluida") {
        counts.doneByCategory[categoria] = (counts.doneByCategory[categoria] || 0) + 1;
      }
      if (task.responsavel) {
        resumo.tasksByOwner[task.responsavel] = (resumo.tasksByOwner[task.responsavel] || 0) + 1;
      }
      if (task.data_criacao && task.data_conclusao) {
        const start = new Date(task.data_criacao);
        const end = new Date(task.data_conclusao);
        if (!isNaN(start) && !isNaN(end)) {
          counts.leadDays.push(Math.round((end - start) / (1000 * 60 * 60 * 24)));
        }
      }
    });

    Object.keys(counts.totalByCategory).forEach((categoria) => {
      const total = counts.totalByCategory[categoria];
      const done = counts.doneByCategory[categoria] || 0;
      resumo.finishRateByCategory[categoria] = Number(((done / total) * 100).toFixed(1));
    });

    resumo.avgLeadTimeDays = counts.leadDays.length
      ? Number((counts.leadDays.reduce((sum, value) => sum + value, 0) / counts.leadDays.length).toFixed(1))
      : 0;

    res.json(resumo);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar analytics" });
  }
};
