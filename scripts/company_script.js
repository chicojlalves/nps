const companyFromUrl = getQueryParam('company');

const dash = document.getElementById('menu_dash');
dash.href = `dashboard.html?company=${companyFromUrl}`;
const comp = document.getElementById('menu_comp');
comp.href = `company.html?company=${companyFromUrl}`;
const store = document.getElementById('menu_store');
store.href = `store.html?company=${companyFromUrl}`;
const user = document.getElementById('menu_user');
user.href = `user.html?company=${companyFromUrl}`;

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