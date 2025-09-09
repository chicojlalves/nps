const API = {
    // login: 'https://n8n.franciscojlalves.com.br/webhook-test/login' // Ajuste para seu endpoint real
    login: 'https://webhook.franciscojlalves.com.br/webhook/login' // Ajuste para seu endpoint real
};

function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}

document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    if (!email || !senha) {
        toast('Preencha todos os campos.');
        return;
    }

    try {
        const res = await fetch(API.login, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });

        const json = await res.json();

        if (res.ok && json.token) {
            // Sucesso no login — você pode salvar o token, redirecionar, etc.
            localStorage.setItem("authToken", json.token);
            toast('Login realizado com sucesso!');
            window.location.href = `dashboard.html?company=${json.token}`; // ou qualquer outra página
        } else {
            toast(json.message || 'Usuário ou senha inválidos.');
        }
    } catch (err) {
        console.error(err);
        toast('Erro ao tentar fazer login.');
    }
});