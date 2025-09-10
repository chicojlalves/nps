// ======== CONFIG ========
const API = {
    dashboard: 'https://webhook.franciscojlalves.com.br/webhook/nps/dashboard',
    store: 'https://webhook.franciscojlalves.com.br/webhook/nps/store',
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || '';
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

if (companyFromUrl != "0") {
    comp.style.display = "none"
}

async function apiGet(url, params) {
    const qs = new URLSearchParams();
    if (params?.from) qs.append('from', params.from);
    if (params?.to) qs.append('to', params.to);
    if (params?.stores) qs.append('stores', params.stores.trim());
    if (params?.company) qs.append('company', params.company.trim());
    const full = qs.toString() ? `${url}?${qs}` : url;

    const res = await fetch(full, { method: 'GET', cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json(); // espera { data: ... }
}

// ======== HELPERS ========
function fmtPct(n) { return (n == null || isNaN(n)) ? '–' : `${Math.round(n)}%`; }
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

// ======== CHARTS ========
let chartByAtt, chartTimes, chartDonut;
function mountCharts() {
    chartByAtt = new ApexCharts(document.querySelector('#chartByAtt'), {
        chart: { type: 'bar', height: 320, toolbar: { show: false }, animations: { enabled: true } },
        series: [{ name: 'NPS', data: [] }],
        xaxis: { categories: [], labels: { style: { colors: '#cbd5e1' } } },
        yaxis: { labels: { style: { colors: '#cbd5e1' } }, max: 100 },
        dataLabels: { enabled: true },
        grid: { borderColor: 'rgba(255,255,255,.08)' },
        theme: { mode: 'dark' }
    });
    chartByAtt.render();

    chartTimes = new ApexCharts(document.querySelector('#chartTimeseries'), {
        chart: { type: 'line', height: 320, toolbar: { show: false }, animations: { enabled: true } },
        series: [{ name: 'NPS', data: [] }],
        xaxis: { type: 'datetime', labels: { style: { colors: '#cbd5e1' } } },
        yaxis: { labels: { style: { colors: '#cbd5e1' } }, max: 100 },
        stroke: { width: 3 },
        grid: { borderColor: 'rgba(255,255,255,.08)' },
        theme: { mode: 'dark' }
    });
    chartTimes.render();

    chartDonut = new ApexCharts(document.querySelector('#chartDonut'), {
        chart: { type: 'donut', height: 320 },
        labels: ['Promotores', 'Neutros', 'Detratores'],
        series: [0, 0, 0],
        dataLabels: { enabled: true },
        legend: { labels: { colors: '#cbd5e1' } },
        colors: [getComputedStyle(document.documentElement).getPropertyValue('--ok').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--warn').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--bad').trim()],
        theme: { mode: 'dark' }
    });
    chartDonut.render();
}

// ======== LOAD / UPDATE ========
async function loadAttendants(att) {
    try {
        data = att;
        const sel = document.getElementById('attendant');
        sel.innerHTML = '<option value="">Todos</option>' +
            (data.attendants || []).map(a => `<option>${a}</option>`).join('');
    } catch (err) {
        console.error('Erro ao carregar vendedores:', err);
    }
}

async function loadStoresForCompany(company_id, store_id) {
    try {
        const res = await fetch(API.store);
        const { data } = await res.json();
        let lojas = [];

        if (company_id !== "0" && company_id != "" && store_id != "" && store_id != "0") {
            lojas = (data.store || []).filter(s => s.company_id === company_id && s.id === store_id);
        } else if (company_id !== "0" && company_id != "") {
            lojas = (data.store || []).filter(s => s.company_id === company_id);
        } else {
            lojas = data.store;
        }

        const select = document.getElementById('stores');
        const currentValue = select.value;

        select.innerHTML = '<option value="">Todas</option>' +
            lojas.map(s => {
                const isSelected = s.id === currentValue ? ' selected' : '';
                return `<option ${isSelected} value="${s.id}">${s.nome}</option>`;
            }).join('');
    } catch {
        toast('Erro ao carregar lojas');
    }
}

function fmtDateISOToLocal(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    // mostra no fuso local, pt-BR
    return d.toLocaleString('pt-BR', { hour12: false });
}

async function loadComments(params) {
    try {
        //const res = await apiGet(API.dashboard, params);
        const res = params;
        const data = Array.isArray(res?.comments) ? res.comments : [];
        const tbody = document.getElementById('tbl-body');
        if (!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding:8px;color:#777">Sem comentários</td></tr>`;
            return;
        }

        const safe = s => String(s ?? '').replace(/</g, '&lt;');
        const toLocal = iso => {
            const d = new Date(iso);
            return Number.isFinite(d.getTime()) ? d.toLocaleString('pt-BR', { hour12: false }) : safe(iso);
        };

        tbody.innerHTML = data.slice(0, 100).map(r => {
            const score = Number(r.score);
            let cls = '';
            if (score >= 9) cls = 'promotor';
            else if (score >= 7) cls = 'neutro';
            else if (score >= 0) cls = 'detrator';

            return `
            <tr style="border-bottom:1px solid #f0f0f0">
              <td style="padding:8px">${toLocal(r.timestamp)}</td>
              <td style="padding:8px">${safe(r.attendant)}</td>
              <td class="score ${cls}" style="padding:8px;text-align:center;font-weight:700">
                ${Number.isFinite(score) ? score : '-'}
              </td>
              <td style="padding:8px">${safe(r.comment)}</td>
            </tr>
          `;
        }).join('');
    } catch (e) {
        console.error('comments error:', e);
        const tbody = document.getElementById('tbl-body');
        if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="padding:8px;color:#c00">Erro ao carregar</td></tr>`;
    }
}

async function refresh() {

    const companyFromUrl = getQueryParam('company');
    const storeFromUrl = getQueryParam('store');
    const params = collectFilters();

    if (companyFromUrl) {

        const all = (await apiGet(API.dashboard, params)).data || {};

        const s = all.summary || {};
        const ba = all.byAttendant || [];
        const st = all.stores || {};
        const ts = all.timeseries || [];
        const cm = all.comments || [];

        // Atualiza os totalizadores
        document.getElementById("kpi-nps").textContent = s.nps + "%";
        document.getElementById("kpi-total").textContent = s.total;
        document.getElementById("kpi-prom").textContent = s.promoters;
        document.getElementById("kpi-detr").textContent = s.detractors

        // Gráfico por atendente
        chartByAtt.updateOptions({ xaxis: { categories: ba.map(x => x.attendant) } });
        chartByAtt.updateSeries([{ name: 'NPS', data: ba.map(x => x.nps) }]);

        // Timeseries
        chartTimes.updateSeries([{ name: 'NPS', data: ts.map(x => ({ x: new Date(x.date).getTime(), y: x.nps })) }]);

        // Donut
        chartDonut.updateSeries([s.promoters || 0, s.passives || 0, s.detractors || 0]);

        // Tabela
        loadComments(all)

        // lojas
        loadStoresForCompany(companyFromUrl, storeFromUrl)

    }
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
}

function collectFilters() {
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    // const st = (document.getElementById('stores').value || '').trim();
    const st = (getQueryParam('store') || '');
    const cp = (getQueryParam('company') || '');
    return { from, to, stores: st, company: cp || undefined };
}


function trendText(v, invert) {
    if (v == null) return '';
    const sign = v > 0 ? '+' : '';
    const cls = (invert ? -v : v) >= 0 ? 'ok' : 'bad';
    return `${sign}${v}${typeof v === 'number' ? '' : ''}`.replace('NaN', '');
}

//  INIT 
(async function () {

    // datas padrão (últimos 7 dias)
    const today = new Date();
    const weekAgo = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    document.getElementById('to').value = today.toISOString().slice(0, 10);
    document.getElementById('from').value = weekAgo.toISOString().slice(0, 10);

    //monta os gráficos
    mountCharts();

    // 1ª atualização já com filtros aplicados
    await refresh();

    // um único listener no botão
    const applyBtn = document.getElementById('apply');
    applyBtn.type = 'button'; // garante que não submeta form
    applyBtn.addEventListener('click', (e) => {
        e.preventDefault?.();
        refresh();
    });
})();

setInterval(() => {
    console.log('Atualizando dados do dashboard automaticamente.....');
    refresh();
}, 3600000);
