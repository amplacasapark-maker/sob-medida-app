/**
 * Sob Medida · Ampla — recebe as fotos/vídeos do app e salva no Google Drive.
 * Pasta: "SOB MEDIDA AMPLA - Fotos e Registros" > DD-MM-AAAA > Cliente - Pedido N (mesma ordem do AMPLA LOG)
 * Como publicar: Implantar > Nova implantação > Tipo: App da Web
 *   Executar como: Eu  |  Quem pode acessar: Qualquer pessoa
 */
const NOME_PASTA_RAIZ = 'SOB MEDIDA AMPLA - Fotos e Registros'; // criada sozinha no Drive da conta que publicar este código
const TOKEN = '48af7616012b42d9c8f4e3aa0713e432';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.token !== TOKEN) return saida({ ok: false, erro: 'token invalido' });
    const raiz = raizDrive();
    const pDia = pasta(raiz, d.dia || Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd-MM-yyyy'));
    const pObra = pasta(pDia, (d.cliente || 'Sem cliente') + ' - Pedido ' + (d.pedido || 's-n'));
    const resp = UrlFetchApp.fetch(d.url, { muteHttpExceptions: true });
    if (resp.getResponseCode() !== 200) return saida({ ok: false, erro: 'download ' + resp.getResponseCode() });
    const blob = resp.getBlob();
    blob.setName((d.hora || '') + ' ' + (d.etapa || 'Registro') + ' - ' + (d.tipo || 'foto') + ' ' + String(d.url).split('/').pop());
    pObra.createFile(blob);
    return saida({ ok: true });
  } catch (err) {
    return saida({ ok: false, erro: String(err) });
  }
}

function raizDrive() {
  const it = DriveApp.getRootFolder().getFoldersByName(NOME_PASTA_RAIZ);
  return it.hasNext() ? it.next() : DriveApp.getRootFolder().createFolder(NOME_PASTA_RAIZ);
}

function doGet() { return saida({ ok: true, app: 'Sob Medida Ampla - Drive' }); }

function pasta(pai, nome) {
  const it = pai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : pai.createFolder(nome);
}

function saida(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
