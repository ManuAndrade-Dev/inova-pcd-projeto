const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const bcrypt = require("bcryptjs");
const dbStore = require("./db/store");

const dataPath = path.join(__dirname, "..", "data");

const parseNumber = (value) => {
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
};

const parseDate = (value) => {
  if (!value) return undefined;
  const data = new Date(value);
  return Number.isNaN(data.getTime()) ? undefined : data;
};

const readCsv = (fileName) => {
  return new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(path.join(dataPath, fileName))
      .pipe(csv({ separator: "," }))
      .on("data", (row) => result.push(row))
      .on("end", () => resolve(result))
      .on("error", reject);
  });
};

const seed = async () => {
  await dbStore.connect();
  await dbStore.clearAll();

  const atividades = await readCsv("atividades.csv");
  const responsaveis = await readCsv("responsaveis.csv");
  const statusHistorico = await readCsv("status_historico.csv");

  const tasks = atividades.map((item) => ({
    id: parseNumber(item.id),
    titulo: item.titulo,
    descricao: item.descricao,
    categoria: item.categoria,
    status: item.status,
    prioridade: item.prioridade,
    responsavel: item.responsavel,
    papel_responsavel: item.papel_responsavel,
    publico_alvo: item.publico_alvo,
    estimativa_horas: parseNumber(item.estimativa_horas),
    horas_gastas: parseNumber(item.horas_gastas),
    data_criacao: parseDate(item.data_criacao),
    data_conclusao: parseDate(item.data_conclusao),
  }));

  const responsaveisDocs = responsaveis.map((item) => ({
    nome: item.nome,
    papel: item.papel,
    departamento: item.departamento,
    anos_empresa: parseNumber(item.anos_empresa),
    formacao_acessibilidade: item.formacao_acessibilidade,
  }));

  const statusDocs = statusHistorico.map((item) => ({
    task_id: parseNumber(item.task_id),
    status_anterior: item.status_anterior,
    status_novo: item.status_novo,
    data_mudanca: parseDate(item.data_mudanca),
  }));

  await dbStore.insertTasks(tasks);
  await dbStore.insertResponsaveis(responsaveisDocs);
  await dbStore.insertStatusHistory(statusDocs);

  const adminSenha = await bcrypt.hash("senha123", 10);
  await dbStore.createUser({ name: "Admin Inova", email: "admin@inova.com", password: adminSenha });

  console.log("Seed concluído. Dados importados.");
  console.log("Usuário padrão: admin@inova.com / senha123");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Erro no seed:", error);
  process.exit(1);
});
