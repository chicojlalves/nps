const API = {
    company: 'https://webhook.franciscojlalves.com.br/webhook/nps/company',
    store: 'https://webhook.franciscojlalves.com.br/webhook/store-intake',
    stores: 'https://webhook.franciscojlalves.com.br/webhook/nps/store',
};

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

if (companyFromUrl != "0") {
    comp.style.display = "none"
}

if (funcaoFromUrl === "Gerente") {
    const nome = document.getElementById('nome');
    nome.disabled = true
}

async function loadCompanys() {
    try {
        const res = await fetch(API.company);
        if (!res.ok) throw new Error();
        const { data } = await res.json();
        let company = [];

        if (companyFromUrl != "0") {
            company = (data.company || []).filter(s => s.id === companyFromUrl);
            const select = document.getElementById('company_id');
            select.innerHTML = //'<option value="">Selecione…</option>' + 
                (company || []).map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
            select.disabled = true;
            loadStoreForCompany(companyFromUrl)
        } else {
            company = data.company;
            const select = document.getElementById('company_id');
            select.innerHTML = '<option value="">Selecione…</option>' +
                (company || []).map(a => `<option value="${a.id}">${a.nome}</option>`).join('');
        }
    } catch {
        toast('Erro ao carregar empresas');
        document.getElementById('company_id').innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

document.getElementById('storeForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const company_id = document.getElementById('company_id').value.trim();
    const nome = document.getElementById('nome').value.trim();

    if (!company_id || !nome) {
        toast('Preencha todos os campos obrigatórios.');
        return;
    }

    const payload = {
        id: generateID(),
        company_id,
        nome,
        created_at: new Date().toISOString()
    };

    try {
        const res = await fetch(API.store, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error();
        toast('Loja cadastrada com sucesso!');
        loadStoreForCompany(company_id)
        document.getElementById('storeForm').reset();
    } catch (err) {
        console.error(err);
        toast('Erro ao cadastrar loja.');
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCompanys);
} else {
    loadCompanys();
}

document.getElementById('company_id').addEventListener('change', function () {
    const company_id = this.value;
    loadStoreForCompany(company_id);
});

async function loadStoreForCompany(company_id) {
    try {
        const store_id = getQueryParam('store');

        const res = await fetch(API.stores);
        const { data } = await res.json();
        let lojas = [];

        console.log(data.store)

        if (company_id !== "0" && company_id != "" && store_id != "" && store_id != "0") {
            lojas = (data.store || []).filter(s => s.company_id === company_id && s.id === store_id);
        } else if (company_id !== "0" && company_id != "") {
            lojas = (data.store || []).filter(s => s.company_id === company_id);
        } else {
            lojas = data.store;
        }

        const tbody = document.getElementById('storeList');
        if (!lojas || !lojas.length) {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:8px; color:var(--muted)">Nenhuma loja cadastrada ainda.</td></tr>';
            return;
        }

        tbody.innerHTML = lojas.map(s => `
        <tr>
          <td style="text-align:center; padding:8px; border-bottom:1px solid rgba(255,255,255,0.05)">${s.nome}</td>
          <td style="text-align:center; padding:8px; border-bottom:1px solid rgba(255,255,255,0.05)"><a target='_black' href='https://nps.franciscojlalves.com.br/qrcode.html?store=${s.id}&company=${s.company_id}'>Donwaload</a></td>
        </tr>
      `).join('');
    } catch (e) {
        document.getElementById('storeList').innerHTML = '<tr><td colspan="2" style="text-align:center; padding:8px; color:var(--danger)">Erro ao carregar lojas</td></tr>';
    }
}