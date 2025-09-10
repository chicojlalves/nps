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

const FORM = document.getElementById('companyForm');
FORM.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!nome || !responsavel || !email || !telefone) {
        toast('Preencha todos os campos obrigatórios.');
        return;
    }

    const payload = {
        company_id: generateID(),
        nome: document.getElementById('nome').value.trim(),
        cnpj: document.getElementById('cnpj').value.trim(),
        email: document.getElementById('email').value.trim(),
        responsavel: document.getElementById('responsavel').value.trim(),
        telefone: document.getElementById('telefone').value.trim(),
        created_at: new Date().toISOString()
    };

    try {
        const res = await fetch("https://webhook.franciscojlalves.com.br/webhook/company-intake", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Erro ao cadastrar empresa");
        toast("Empresa cadastrada com sucesso!");
        FORM.reset();
    } catch (err) {
        console.error(err);
        toast("Erro no cadastro. Tente novamente.");
    }
});