const API = {
  companies: "https://webhook.franciscojlalves.com.br/webhook/nps/company",
  stores: "https://webhook.franciscojlalves.com.br/webhook/nps/store",
  collaborators: "https://webhook.franciscojlalves.com.br/webhook/collab-intake",
  users: "https://webhook.franciscojlalves.com.br/webhook/nps/colaborator",
}

const companyFromUrl = getQueryParam('company');
const storeFromUrl = getQueryParam('store');
const userFromUrl = getQueryParam('user');
const funcaoFromUrl = getQueryParam('funcao');

const usuario = document.getElementById('user')
usuario.textContent = "Bem vindo(a) - " + userFromUrl + "";

const dash = document.getElementById('menu_dash')
dash.href = `dashboard.html?company=${companyFromUrl}&store=${storeFromUrl}&user=${userFromUrl}&funcao=${funcaoFromUrl}`;
const comp = document.getElementById('menu_comp')
comp.href = `company.html?company=${companyFromUrl}&store=${storeFromUrl}&user=${userFromUrl}&funcao=${funcaoFromUrl}`;
const store = document.getElementById('menu_store')
store.href = `store.html?company=${companyFromUrl}&store=${storeFromUrl}&user=${userFromUrl}&funcao=${funcaoFromUrl}`;
const user = document.getElementById('menu_user')
user.href = `user.html?company=${companyFromUrl}&store=${storeFromUrl}&user=${userFromUrl}&funcao=${funcaoFromUrl}`;

const prop = document.getElementById('prop');
const sup = document.getElementById('sup');
const ger = document.getElementById('ger');

function loadRoles(funcaoFromUrl) {

  switch (funcaoFromUrl) {
    case "Admin":
      ger.style.display = "block";
      sup.style.display = "block";
      prop.style.display = "block";
      break;

    case "Proprietario":
      ger.style.display = "block";
      sup.style.display = "block";
      break;

    case "Supervisor":
      ger.style.display = "block";
      sup.style.display = "none";
      break;

    default:
      ger.style.display = "none";
      sup.style.display = "none";
      prop.style.display = "none";
      break;

  }

}
if (companyFromUrl != "0") {
  comp.style.display = "none";
}

async function loadCompanys() {
  try {
    const res = await fetch(API.companies);
    const { data } = await res.json();

    let company = [];

    if (companyFromUrl != "0") {
      company = (data.company || []).filter((s) => s.id === companyFromUrl);
      const select = document.getElementById("company_id");
      select.innerHTML = //'<option value="">Selecione…</option>' +
        (company || [])
          .map((c) => `<option value="${c.id}">${c.nome}</option>`)
          .join("");
      select.disabled = true;
      loadStoresForCompany(companyFromUrl);
    } else {
      company = data.company;
      const select = document.getElementById("company_id");
      select.innerHTML = '<option value="">Selecione…</option>' +
        (company || []).map((c) => `<option value="${c.id}">${c.nome}</option>`)
          .join("");
    }
  } catch {
    toast("Erro ao carregar empresas");
  }
}

async function loadStoresForCompany(company_id) {
  try {
    const store_id = getQueryParam('store');
    const res = await fetch(API.stores);
    const { data } = await res.json();
    let lojas = [];


    if (company_id !== "0" && company_id != "" && store_id != "" && store_id != "0") {
      lojas = (data.store || []).filter(s => s.company_id === company_id && s.id === store_id);
    } else if (company_id !== "0" && company_id != "") {
      lojas = (data.store || []).filter(s => s.company_id === company_id);
    } else {
      lojas = data.store;
    }

    const select = document.getElementById("store_id");
    select.innerHTML =
      '<option value="">Selecione…</option>' +
      lojas.map((s) => `<option value="${s.id}">${s.nome}</option>`).join("");
  } catch {
    toast("Erro ao carregar colaboradores");
  }
}

loadUserForCompany(companyFromUrl);

document.getElementById("company_id").addEventListener("change", function () {
  const company_id = this.value;

  loadStoresForCompany(company_id);
  loadUserForCompany(company_id);
  loadRoles(funcaoFromUrl);
});

document
  .getElementById("collabForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const company_id = document.getElementById("company_id").value.trim();
    const store_id = document.getElementById("store_id").value.trim();
    const role = document.getElementById("role").value.trim();
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const confirme_senha = document
      .getElementById("confirme_senha")
      .value.trim();

    if (
      !company_id ||
      !store_id ||
      !role ||
      !nome ||
      ((role === "admin" || role === "manager") &&
        (!email || !senha || !confirme_senha))
    ) {
      toast("Preencha todos os campos obrigatórios.");
      return;
    }

    if (nome.length < 2) {
      toast("O nome precisar ter pelo menos duas letras");
      return;
    }

    if (senha !== confirme_senha) {
      toast("As senhas precisam ser iguais.");
      return;
    }

    const payload = {
      id: generateID(),
      company_id,
      store_id,
      role,
      nome,
      email,
      senha,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch(API.collaborators, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      toast("Colaborador cadastrado com sucesso!");
      document.getElementById("collabForm").reset();
      loadUserForCompany(company_id);
    } catch (err) {
      console.log(err);
      toast("Erro ao cadastrar colaborador.");
    }
  });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadCompanys);
} else {
  loadCompanys();
  loadRoles(funcaoFromUrl)
}

document.getElementById("role").addEventListener("change", function () {
  const credenciais = document.getElementById("credenciais");
  const email = document.getElementById("email");
  const senha = document.getElementById("senha");
  const confirme_senha = document.getElementById("confirme_senha");
  const role = this.value;

  if (role === "Supervisor(a)" || role === "Gerente" || role === "Proprietario(a)") {
    credenciais.style.display = "block";
    email.setAttribute("required", "");
    senha.setAttribute("required", "");
    confirme_senha.setAttribute("required", "");
  } else {
    credenciais.style.display = "none";
    email.removeAttribute("required");
    senha.removeAttribute("required");
    confirme_senha.removeAttribute("required");
    // limpa os campos
    document.getElementById("email").value = "";
    document.getElementById("senha").value = "";
    document.getElementById("confirme_senha").value = "";
  }
});

async function loadUserForCompany(company_id) {
  try {
    const store_id = getQueryParam('store');

    const resColabs = await fetch(API.users);
    var { data } = await resColabs.json();
    const colaborators = (data.users || [])

    const res = await fetch(API.stores);
    var { data } = await res.json();
    const stores = (data.store || []);

    let colabs = [];
    let lojas = [];

    if (company_id !== "0" && company_id != "" && store_id != "" && store_id != "0") {
      lojas = (stores || []).filter(s => s.company_id === company_id && s.id === store_id);
      colabs = (colaborators || []).filter(s => s.company_id === company_id && s.store_id === store_id);

    } else if (company_id !== "0" && company_id != "") {
      lojas = (stores || []).filter(s => s.company_id === company_id);
      colabs = (colaborators || []).filter(s => s.company_id === company_id);
    } else {
      lojas = stores;
      colabs = colaborators;
    }

    for (let i = 0; i < colabs.length; i++) {
      for (let j = 0; j < lojas.length; j++) {
        if (colabs[i].store_id === lojas[j].id) {
          colabs[i]["loja"] = lojas[j].nome;
        }
      }
    }

    colabs.sort(function (a, b) {
      return a.loja < b.loja ? -1 : a.loja > b.loja ? 1 : 0;
    });

    const tbody = document.getElementById("userList");
    if (!colabs || !colabs.length) {
      tbody.innerHTML =
        '<tr><td colspan="3" style="text-align:center; padding:8px; color:var(--muted)">Nenhum colaborador cadastrado(a).</td></tr>';
      return;
    }

    tbody.innerHTML = colabs
      .map(
        (s) => `
        <tr>
          <td style="text-align:center; padding:8px; border-bottom:1px solid rgba(255,255,255,0.05)">${s.nome}</td>
          <td style="text-align:center; padding:8px; border-bottom:1px solid rgba(255,255,255,0.05)">${s.funcao}</td>
          <td style="text-align:center; padding:8px; border-bottom:1px solid rgba(255,255,255,0.05)">${s.loja}</td>
        </tr>
      `
      )
      .join("");
  } catch (e) {
    document.getElementById("userList").innerHTML =
      '<tr><td colspan="3" style="text-align:center; padding:8px; color:var(--danger)">Erro ao carregar lojas</td></tr>';
  }
}
