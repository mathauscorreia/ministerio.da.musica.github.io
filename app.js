// Importando o módulo 'express'
const express = require('express');

// Criando uma instância do Express
const app = express();

// Servindo arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Definindo a rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Envia o arquivo index.html
});

// Definindo a porta em que o servidor irá rodar
const PORT = process.env.PORT || 3000;

// Inicializando o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
