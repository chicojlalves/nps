const API = {
    login: 'https://webhook.franciscojlalves.com.br/webhook/nps/login' // Ajuste para seu endpoint real
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

        console.log(json)

        if (res.ok && json.token) {
            // Sucesso no login — você pode salvar o token, redirecionar, etc.
            localStorage.setItem("authToken", json.token);
            toast('Login realizado com sucesso!');

            if (json.nome && json.token) {
                window.location.href = `dashboard.html?company=${json.token}&store=${json.loja_id}&user=${json.nome}&funcao=${json.funcao}`; // ou qualquer outra página
            } else {
                window.location.href = `dashboard.html?company=${json.token}`; // ou qualquer outra página
            }
        } else {
            toast(json.message || 'Usuário ou senha inválidos.');
        }
    } catch (err) {
        console.error(err);
        toast('Erro ao tentar fazer login.');
    }
});