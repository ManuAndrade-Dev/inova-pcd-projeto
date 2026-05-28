const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authMessage = document.getElementById("authMessage");
const resumoEl = document.getElementById("resumo");
const listaEl = document.getElementById("lista");
const analyticsEl = document.getElementById("analyticsContent");
const controlsSection = document.getElementById("controls");
const filterStatus = document.getElementById("filterStatus");
const filterCategory = document.getElementById("filterCategory");
const applyFilterBtn = document.getElementById("applyFilterBtn");
const clearFilterBtn = document.getElementById("clearFilterBtn");
const createTaskBtn = document.getElementById("createTaskBtn");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskCategory = document.getElementById("taskCategory");
const taskStatus = document.getElementById("taskStatus");
const taskPriority = document.getElementById("taskPriority");
const taskOwner = document.getElementById("taskOwner");
const taskPublic = document.getElementById("taskPublic");
const taskEstimate = document.getElementById("taskEstimate");
const statusChartCtx = document.getElementById("statusChart");
const categoryChartCtx = document.getElementById("categoryChart");

const tokenKey = "taskinsight_token";
let statusChart;
let categoryChart;

const getToken = () => localStorage.getItem(tokenKey);
const setToken = (token) => localStorage.setItem(tokenKey, token);
const removeToken = () => localStorage.removeItem(tokenKey);

const showMessage = (text, type = "error") => {
  authMessage.textContent = text;
  authMessage.className = `message ${type}`;
};

const fetchJson = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Erro ${res.status}`);
  }
  return res.json();
};

const setAuthUI = () => {
  const token = getToken();
  controlsSection.classList.toggle("hidden", !token);
  logoutBtn.classList.toggle("hidden", !token);
  if (token) {
    loginBtn.textContent = "Entrar";
  }
};

const renderResumo = (data) => {
  resumoEl.innerHTML = `
    <p><strong>Total de tarefas:</strong> ${data.total}</p>
    <p><strong>Status:</strong> ${Object.entries(data.status).map(([k,v]) => `${k}: ${v}`).join(" | ")}</p>
    <p><strong>Categoria:</strong> ${Object.entries(data.categoria).map(([k,v]) => `${k}: ${v}`).join(" | ")}</p>
    <p><strong>Público-alvo:</strong> ${Object.entries(data.publico_alvo).map(([k,v]) => `${k}: ${v}`).join(" | ")}</p>
  `;
};

const renderCharts = (data) => {
  const statusLabels = Object.keys(data.status);
  const statusValues = Object.values(data.status);
  const categoryLabels = Object.keys(data.categoria);
  const categoryValues = Object.values(data.categoria);

  if (statusChart) statusChart.destroy();
  if (categoryChart) categoryChart.destroy();

  statusChart = new Chart(statusChartCtx, {
    type: "pie",
    data: {
      labels: statusLabels,
      datasets: [{ data: statusValues, backgroundColor: ["#2563eb", "#f59e0b", "#10b981"] }],
    },
  });

  categoryChart = new Chart(categoryChartCtx, {
    type: "bar",
    data: {
      labels: categoryLabels,
      datasets: [{ data: categoryValues, backgroundColor: "#3b82f6" }],
    },
    options: { indexAxis: "y" },
  });
};

const renderTasks = (tasks) => {
  if (!tasks || tasks.length === 0) {
    listaEl.textContent = "Nenhuma tarefa encontrada.";
    return;
  }

  listaEl.innerHTML = tasks
    .map((task) => `
      <div class="task-card">
        <div class="task-card-header">
          <h3>${task.titulo}</h3>
          <div class="task-actions">
            <button class="small" data-action="complete" data-id="${task.id}">Concluir</button>
            <button class="small secondary" data-action="delete" data-id="${task.id}">Excluir</button>
          </div>
        </div>
        <p>${task.descricao || "Sem descrição."}</p>
        <p>Status: <strong>${task.status}</strong></p>
        <p>Categoria: <strong>${task.categoria}</strong></p>
        <p>Responsável: <strong>${task.responsavel || "-"}</strong></p>
        <p>Prioridade: <strong>${task.prioridade || "-"}</strong></p>
        <p>Público-alvo: <strong>${task.publico_alvo || "-"}</strong></p>
      </div>
    `)
    .join("");
};

const renderAnalytics = (data) => {
  analyticsEl.innerHTML = `
    <p><strong>Taxa de conclusão por categoria:</strong> ${Object.entries(data.finishRateByCategory)
      .map(([cat, value]) => `${cat}: ${value}%`)
      .join(" | ")}</p>
    <p><strong>Lead time médio:</strong> ${data.avgLeadTimeDays} dias</p>
    <p><strong>Tarefas por responsável:</strong> ${Object.entries(data.tasksByOwner)
      .map(([owner, value]) => `${owner}: ${value}`)
      .join(" | ")}</p>
  `;
};

const apiHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchResumo = async () => {
  try {
    const data = await fetchJson("/api/data/summary");
    renderResumo(data);
    renderCharts(data);
  } catch (error) {
    resumoEl.textContent = "Erro ao carregar resumo.";
  }
};

const fetchAnalytics = async () => {
  try {
    const data = await fetchJson("/api/data/analytics");
    renderAnalytics(data);
  } catch (error) {
    analyticsEl.textContent = "Erro ao carregar métricas.";
  }
};

const fetchTasks = async () => {
  const token = getToken();
  if (!token) {
    listaEl.textContent = "Faça login para ver as tarefas.";
    return;
  }

  try {
    const res = await fetch("/api/tasks", { headers: apiHeaders() });
    if (res.status === 401) {
      removeToken();
      setAuthUI();
      showMessage("Sessão expirada. Faça login novamente.");
      listaEl.textContent = "Faça login para ver as tarefas.";
      return;
    }
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (error) {
    listaEl.textContent = "Erro ao carregar tarefas.";
  }
};

const createTask = async () => {
  const payload = {
    titulo: taskTitle.value.trim(),
    descricao: taskDesc.value.trim(),
    categoria: taskCategory.value.trim(),
    status: taskStatus.value,
    prioridade: taskPriority.value,
    responsavel: taskOwner.value.trim(),
    publico_alvo: taskPublic.value.trim(),
    estimativa_horas: Number(taskEstimate.value) || 0,
  };

  if (!payload.titulo) {
    showMessage("Título é obrigatório.");
    return;
  }

  try {
    await fetchJson("/api/tasks", {
      method: "POST",
      headers: { ...apiHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showMessage("Tarefa criada com sucesso.", "success");
    taskTitle.value = "";
    taskDesc.value = "";
    taskCategory.value = "";
    taskOwner.value = "";
    taskPublic.value = "";
    taskEstimate.value = "";
    fetchTasks();
    fetchResumo();
    fetchAnalytics();
  } catch (error) {
    showMessage(error.message || "Erro ao criar tarefa.");
  }
};

const updateTaskStatus = async (id, status) => {
  try {
    await fetchJson(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { ...apiHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTasks();
    fetchResumo();
    fetchAnalytics();
  } catch (error) {
    showMessage("Não foi possível atualizar a tarefa.");
  }
};

const deleteTask = async (id) => {
  try {
    await fetchJson(`/api/tasks/${id}`, {
      method: "DELETE",
      headers: apiHeaders(),
    });
    fetchTasks();
    fetchResumo();
    fetchAnalytics();
  } catch (error) {
    showMessage("Não foi possível excluir a tarefa.");
  }
};

const handleTaskAction = (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === "complete") {
    updateTaskStatus(id, "concluida");
  } else if (action === "delete") {
    deleteTask(id);
  }
};

listaEl.addEventListener("click", handleTaskAction);
applyFilterBtn.addEventListener("click", async () => {
  const status = filterStatus.value;
  const categoria = filterCategory.value.trim();
  const query = new URLSearchParams();
  if (status) query.set("status", status);
  if (categoria) query.set("categoria", categoria);
  try {
    const res = await fetch(`/api/tasks?${query.toString()}`, { headers: apiHeaders() });
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (error) {
    listaEl.textContent = "Erro ao aplicar filtro.";
  }
});

clearFilterBtn.addEventListener("click", () => {
  filterStatus.value = "";
  filterCategory.value = "";
  fetchTasks();
});

loginBtn.addEventListener("click", async () => {
  const result = await authRequest("login");
  if (result && result.token) {
    setToken(result.token);
    setAuthUI();
    showMessage("Login efetuado com sucesso.", "success");
    fetchTasks();
    fetchAnalytics();
  }
});

registerBtn.addEventListener("click", async () => {
  const result = await authRequest("register");
  if (result && result.token) {
    setToken(result.token);
    setAuthUI();
    showMessage("Usuário registrado e logado.", "success");
    fetchTasks();
    fetchAnalytics();
  }
});

logoutBtn.addEventListener("click", () => {
  removeToken();
  setAuthUI();
  showMessage("Você saiu.", "success");
  listaEl.textContent = "Faça login para ver as tarefas.";
});

createTaskBtn.addEventListener("click", createTask);

const authRequest = async (path) => {
  const body = {
    email: emailEl.value.trim(),
    password: passwordEl.value.trim(),
  };
  if (!body.email || !body.password) {
    showMessage("Informe email e senha.");
    return null;
  }

  try {
    const res = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage(data.error || "Erro na autenticação.");
      return null;
    }
    return data;
  } catch (error) {
    showMessage("Erro de conexão.");
    return null;
  }
};

const initialize = () => {
  setAuthUI();
  fetchResumo();
  fetchAnalytics();
  if (getToken()) fetchTasks();
};

initialize();
