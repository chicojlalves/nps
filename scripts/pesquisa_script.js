const API = {
    attendants: 'https://webhook.franciscojlalves.com.br/webhook/nps/dashboard',
    sellers: 'https://webhook.franciscojlalves.com.br/webhook/nps/sellers',
    stores: 'https://webhook.franciscojlalves.com.br/webhook/nps/store'
};

async function loadStore(storeFromUrl) {

    const { data } = await apiGet(API.stores);
    const loja = (data.store || []).filter(s => s.id === storeFromUrl);


    const span_loja = document.getElementById('loja')
    span_loja.textContent = loja[0].nome
}

loadStore(storeFromUrl)

async function loadAttendants() {
    const store = storeFromUrl;
    const company = companyFromUrl;
    if (!store) {
        console.warn('Loja não informada na URL. Ex: ?store=lojaABC');
        document.getElementById('attendant').innerHTML =
            '<option value="" selected disabled>Loja não informada</option>';
        return;
    }

    try {
        const { data } = await apiGet(API.sellers, { store, company });

        const sel = document.getElementById('attendant');
        sel.innerHTML = '<option value="">Selecione…</option>' +
            (data.attendants || []).map(n => `<option>${String(n)}</option>`).join('');
    } catch (e) {
        console.error('Erro ao carregar vendedores', e);
        document.getElementById('attendant').innerHTML =
            '<option value="" selected disabled>Erro ao carregar</option>';
    }
}

async function apiGet(url, params) {
    const qs = new URLSearchParams(params || {});
    const full = qs.toString() ? `${url}?${qs}` : url;
    const res = await fetch(full, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json(); // espera { data: [...] }
}

// monta botões da escala 0..10
const scale = document.getElementById('scoreScale');
for (let i = 0; i <= 10; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn-score';
    b.dataset.val = String(i);
    b.textContent = String(i);
    b.addEventListener('click', () => {
        document.querySelectorAll('.btn-score').forEach(x => x.dataset.active = 'false');
        b.dataset.active = 'true';
        b.setAttribute('aria-pressed', 'true');
    });
    scale.appendChild(b);
}

function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}

function getSelectedScore() {
    const el = document.querySelector('.btn-score[data-active="true"]');
    return el ? Number(el.dataset.val) : null;
}

function npsCategory(score) {
    if (score <= 6) return 'Detractor';
    if (score <= 8) return 'Passive';
    return 'Promoter';
}

document.getElementById('npsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const attendant = document.getElementById('attendant').value;
    const score = getSelectedScore();
    const comment = document.getElementById('comment').value.trim();
    if (!attendant) { toast('Selecione o atendente.'); return; }
    if (score === null) { toast('Escolha uma nota de 0 a 10.'); return; }

    const payload = {
        timestamp: new Date().toISOString(),
        attendant_name: attendant,
        score,
        category: npsCategory(score),
        comment,
        channel: 'QR',
        company: companyFromUrl,
        store: storeFromUrl,
        client_meta: {
            ua: navigator.userAgent,
            lang: navigator.language,
            platform: navigator.platform
        }
    };

    try {
        const url = EXTRA_SECRET ? `${N8N_WEBHOOK_URL}?key=${encodeURIComponent(EXTRA_SECRET)}` : N8N_WEBHOOK_URL;
        const res = await fetch(url, {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, USE_BASIC_AUTH ? { 'Authorization': BASIC_AUTH_HEADER } : {}),
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Falha no envio: ' + res.status);
        toast('Obrigado! Resposta registrada.');
        // reset visual
        document.getElementById('npsForm').reset();
        document.querySelectorAll('.btn-score').forEach(x => x.dataset.active = 'false');
    } catch (err) {
        console.error(err);
        toast('Ops! Tente novamente em instantes.');
    }
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAttendants);
} else {
    loadAttendants();
}