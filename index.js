const express = require('express');
const bodyParser = require('body-parser');
const articles = require('./packet.json');

const app = express();
app.use(bodyParser.json());

// Rota para retornar o editor de artigo
app.get('/', (req, res) => {
  res.send('Editor de artigo');
});

// Rota para retornar as informações do artigo
app.get('/api/getArticle', (req, res) => {
  const id = req.query.id;
  const article = articles.find(article => article.id === id);
  if (article) {
    res.json(article);
    res.send('Editor de artigo2');
  } else {
    res.status(404).send('Artigo não foi encontrado');
  }
});

// Rota para receber as alterações no artigo
app.put('/api/updateArticle', (req, res) => {
  const id = req.query.id;
  const article = articles.find(article => article.id === id);
  if (article) {
    article.title = req.body.title || article.title;
    article.content = req.body.content || article.content;
    res.json(article);
  } else {
    res.status(404).send('Artigo não foi encontrado');
  }
});

// Iniciar o servidor na porta 3000
app.listen(5555, () => {
  console.log('Servidor rodando na porta 3000');
});

