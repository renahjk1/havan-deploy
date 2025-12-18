const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rota raiz - redireciona para a pasta 4 (oferta)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '4', 'index.html'));
});

// Servir arquivos estáticos das pastas
app.use(express.static(path.join(__dirname)));

// Rota para cada etapa do funil
app.get('/:stage', (req, res) => {
  const stage = req.params.stage;
  const filePath = path.join(__dirname, stage, 'index.html');
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Página não encontrada');
    }
  });
});

// Rota para subrotas (ex: /4/index.html)
app.get('/:stage/*', (req, res) => {
  const filePath = path.join(__dirname, req.params.stage, req.params[0]);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Arquivo não encontrado');
    }
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📱 Oferta disponível em http://localhost:${PORT}/4`);
});
