# Havan Deploy - Funil de Vendas

Projeto de funil de vendas com integração de consulta de CPF via API Kodexpert.

## 📋 Estrutura do Projeto

```
├── 1-12/          # Diferentes etapas do funil
├── 4/             # Etapa de consulta de CPF (OFERTA PRINCIPAL)
├── assets/        # Imagens e recursos compartilhados
├── express/       # Integração com Express
├── palmeiras/     # Conteúdo específico
├── server.js      # Servidor Node.js
├── package.json   # Dependências
└── Procfile       # Configuração para Railway
```

## 🚀 Deploy no Railway

### Pré-requisitos
- Conta no [Railway.app](https://railway.app)
- Repositório GitHub conectado

### Passos para Deploy

1. **Conectar repositório ao Railway**
   - Acesse [railway.app](https://railway.app)
   - Clique em "New Project"
   - Selecione "Deploy from GitHub"
   - Autorize e selecione o repositório `renahjk1/havan-deploy`

2. **Configurar variáveis de ambiente**
   - Na aba "Variables" do Railway, adicione:
     ```
     PORT=3000
     NODE_ENV=production
     SKALEPAY_SECRET_KEY=sk_live_XXXXX
     ```

3. **Deploy automático**
   - Railway detectará o `Procfile` e `package.json`
   - O deploy será feito automaticamente a cada push para `main`

4. **Acessar a aplicação**
   - Railway fornecerá uma URL pública
   - A oferta estará disponível em `https://seu-dominio.railway.app/4`

## 🔧 Desenvolvimento Local

### Instalação
```bash
npm install
```

### Executar localmente
```bash
npm start
```

Acesse `http://localhost:3000/4` no navegador.

## 📱 Etapas do Funil

- **Etapa 4**: Consulta de CPF (OFERTA PRINCIPAL)
  - API: `https://fluxos.kodexpert.com.br/webhook/e3358323-f6eb-42e5-8a54-7513d794b2c4/kodexpert/api/${cpf}`
  - Retorna: NOME, NOME_MAE, SEXO

## 🔐 Segurança

- Chaves de API são armazenadas em variáveis de ambiente
- Arquivo `.env` não é commitado
- Use `.env.example` como referência

## 📝 Notas Importantes

- O servidor Express serve todos os arquivos estáticos
- A rota raiz `/` redireciona para `/4` (oferta)
- Cada etapa pode ser acessada diretamente: `/1`, `/2`, `/3`, etc.

## 🐛 Troubleshooting

### Erro "error creating building plan with railpack"
- Certifique-se de que `package.json` e `Procfile` estão na raiz
- Verifique se `server.js` existe
- Confirme que as dependências estão listadas em `package.json`

### API de CPF não funciona
- Verifique se a URL está correta
- Teste com CPF: `91241189900`
- Verifique os logs do Railway

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- [Documentação Railway](https://docs.railway.app)
- [Express.js Docs](https://expressjs.com)
