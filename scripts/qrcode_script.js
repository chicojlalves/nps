const companyFromUrl = getQueryParam('company');
const storeFromUrl = getQueryParam('store');

var qrcode = new QRCode("qrcode", {
    width: 300,
    height: 300,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
});

function gerarQRCode(nome, company_selected) {

    var elText = `https://nps.franciscojlalves.com.br/pesquisa.html?store=${nome}&company=${company_selected}`;
    const content = document.getElementById('content')

    console.log(elText);

    if (!elText) {
        content.style.display = 'none';
        toast('Erro ao gerar o QRCode.');
        return;
    }
    qrcode.makeCode(elText); // Gera o QR Code

}

gerarQRCode(storeFromUrl, companyFromUrl)


// Função para salvar a imagem da div
function salvarDivComoImagem() {
    const elementoDiv = document.getElementById('qrcode'); // Obtém a div pelo ID

    html2canvas(elementoDiv).then(function (canvas) {
        // Converte o canvas para uma URL de dados (formato PNG)
        const imgData = canvas.toDataURL("image/png");

        // Cria um link temporário para download
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'qrcode.png'; // Define o nome do arquivo

        // Adiciona o link ao documento (necessário para que funcione)
        document.body.appendChild(link);

        // Simula o clique para iniciar o download
        link.click();

        // Remove o link temporário após o download
        document.body.removeChild(link);
    });
}