const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const articlePath = path.join(__dirname, 'Packet.json');

app.use(bodyParser.json());

app.get('/styles/styles.html', (req, res) => {
    res.sendFile(__dirname + '/styles/styles.html');
});


// Endpoint para retornar o editor de artigo
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// Endpoint para retornar as informações do artigo
app.get('/api/getArticle', (req, res) => {
    const id = req.query.id;
    if (id === '1') {
        fs.readFile(articlePath, 'utf8', (err, data) => {
            if (err) {
                res.status(500).send('Erro ao ler o arquivo do artigo');
            } else {
                res.json(JSON.parse(data));
            }
        });
    } else {
        res.status(404).send('Artigo não encontrado');
    }
});

// Endpoint para receber as alterações realizadas no artigo
app.put('/api/updateArticle', (req, res) => {
    const id = req.query.id;
    if (id === '1') {
        const changes = req.body;
        const article = require(articlePath);
        // Aplicar as alterações no artigo
        Object.assign(article, changes);
        // Salvar o artigo atualizado no arquivo
        fs.writeFile(articlePath, JSON.stringify(article, null, 2), (err) => {
            if (err) {
                res.status(500).send('Erro ao salvar as alterações no artigo');
            } else {
                res.send('Alterações salvas com sucesso');
            }
        });
    } else {
        res.status(404).send('Artigo não encontrado');
    }
});

// Variável para armazenar as alterações no artigo
let pendingChanges = {};

// Função para enviar as alterações pendentes ao servidor
function sendChanges() {
    if (Object.keys(pendingChanges).length > 0) {
        fetch('/api/updateArticle?id=1', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pendingChanges)
            })
            .then(response => {
                if (!response.ok) {
                    console.error('Erro ao enviar as alterações para o servidor');
                }
                // Limpar as alterações pendentes
                pendingChanges = {};
            })
            .catch(error => {
                console.error('Erro ao enviar as alterações para o servidor', error);
            });
    }
}

// Intervalo de tempo para enviar as alterações pendentes
const saveInterval = 5000;
let saveTimer = null;

// Endpoint para receber as alterações em tempo real
app.put('/api/liveUpdateArticle', (req, res) => {
    const id = req.query.id;
    if (id === '1') {
        const changes = req.body;
        // Armazenar as alterações pendentes
        Object.assign(pendingChanges, changes);
        // Reiniciar o temporizador para enviar as alterações
        clearTimeout(saveTimer);
        saveTimer = setTimeout(sendChanges, saveInterval);
        res.send('Alterações recebidas com sucesso');
    } else {
        res.status(404).send('Artigo não encontrado');
    }
});


app.post('/enviar-dados', (req, res) => {
    const id = req.body.id;
    const type = req.body.type;
    const content = req.body.content;

    console.log('ID:', id);
    console.log('Tipo:', type);
    console.log('Conteúdo:', content);

    // Lógica para adicionar os dados do objeto ao arquivo packet.json
    const novoObjeto = {
        id,
        type,
        content
    };
    const arquivo = 'packet.json';
    let dados = [];

    // Lê o arquivo
    fs.readFile(arquivo, (erro, conteudo) => {
        if (!erro) {
            dados = JSON.parse(conteudo);
        }

        // Adiciona o novo objeto aos dados
        dados.push(novoObjeto);

        // Grava os dados atualizados no arquivo
        fs.writeFile(arquivo, JSON.stringify(dados), (erro) => {
            if (erro) {
                console.error(erro);
                res.status(500).send('Erro ao gravar os dados no arquivo.');
            } else {
                res.send('Dados adicionados com sucesso!');
            }
        });
    });
});

// Iniciar o servidor
const port = 3000;
app.listen(port, () => {
    console.log('Servidor rodando na porta 3000');
});