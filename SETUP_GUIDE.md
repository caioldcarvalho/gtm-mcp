# Guia Completo: Configuração da Service Account para GTM MCP

Este guia vai te levar passo a passo pela criação de uma Service Account no Google Cloud e configuração das permissões no GTM.

## 📝 O que é uma Service Account?

Uma **Service Account** é como um "usuário robô" que permite que aplicações acessem APIs do Google de forma programática, sem precisar de login manual. Pense nela como um usuário especial que seu código pode usar para acessar o GTM.

---

## Parte 1: Google Cloud Console (10 minutos)

### Passo 1: Acessar o Google Cloud Console

1. Abra seu navegador e acesse: https://console.cloud.google.com/
2. Faça login com sua conta Google (use a mesma conta que tem acesso ao GTM)

### Passo 2: Criar ou Selecionar um Projeto

**Se você já tem um projeto:**
- Clique no nome do projeto no topo da página (ao lado de "Google Cloud")
- Selecione o projeto que você quer usar

**Se você NÃO tem um projeto:**
1. Clique no nome do projeto no topo
2. Clique em "NEW PROJECT" (Novo Projeto)
3. Dê um nome, por exemplo: `gtm-api-project`
4. Clique em "CREATE" (Criar)
5. Aguarde alguns segundos até o projeto ser criado
6. Selecione o projeto recém-criado

> **💡 Dica:** O projeto é como uma "pasta" que agrupa recursos do Google Cloud. Você só precisa criar um projeto uma vez.

### Passo 3: Ativar a Tag Manager API

1. No menu lateral esquerdo, clique em **"APIs & Services"** (APIs e Serviços)
   - Se não encontrar, clique nas 3 linhas (☰) no canto superior esquerdo para abrir o menu

2. Clique em **"Library"** (Biblioteca)

3. Na caixa de busca, digite: `Tag Manager API`

4. Clique no resultado **"Tag Manager API"**

5. Clique no botão azul **"ENABLE"** (Ativar)

6. Aguarde alguns segundos - você verá uma tela dizendo "API enabled" (API ativada)

> **✅ Checkpoint:** Você deve ver "Tag Manager API" com um status verde de "Enabled"

### Passo 4: Criar a Service Account

1. No menu lateral, em **"APIs & Services"**, clique em **"Credentials"** (Credenciais)

2. No topo da página, clique em **"+ CREATE CREDENTIALS"** (Criar Credenciais)

3. Selecione **"Service account"** (Conta de serviço)

4. Preencha o formulário:
   - **Service account name:** `gtm-mcp-server` (ou qualquer nome que você quiser)
   - **Service account ID:** será preenchido automaticamente, algo como `gtm-mcp-server`
   - **Description:** `Service account para acessar GTM via MCP` (opcional mas recomendado)

5. Clique em **"CREATE AND CONTINUE"** (Criar e Continuar)

6. Na próxima tela "Grant this service account access to project":
   - Você pode **PULAR** esta etapa clicando em **"CONTINUE"** (não precisa adicionar roles)

7. Na próxima tela "Grant users access to this service account":
   - Você pode **PULAR** esta etapa clicando em **"DONE"** (não precisa adicionar usuários)

> **✅ Checkpoint:** Você deve ver sua nova service account listada em "Service Accounts"

### Passo 5: Obter o Email da Service Account (IMPORTANTE!)

1. Na lista de Service Accounts, você verá sua nova conta
2. O **email** estará no formato: `gtm-mcp-server@seu-projeto-id.iam.gserviceaccount.com`
3. **COPIE ESTE EMAIL** - você vai precisar dele no GTM!

> 📋 **Anote este email em algum lugar seguro - você vai usá-lo daqui a pouco!**

### Passo 6: Criar e Baixar a Chave JSON

1. Clique no **nome** da service account que você acabou de criar (não no email, mas no nome em azul)

2. Vá para a aba **"KEYS"** (Chaves) no topo

3. Clique em **"ADD KEY"** (Adicionar Chave) > **"Create new key"** (Criar nova chave)

4. Selecione o tipo **"JSON"** (deve estar selecionado por padrão)

5. Clique em **"CREATE"** (Criar)

6. **Um arquivo JSON será baixado automaticamente** para seu computador
   - O nome será algo como: `seu-projeto-id-abc123def456.json`
   - **GUARDE ESTE ARQUIVO COM SEGURANÇA!** Ele é como uma senha - qualquer pessoa com este arquivo pode acessar sua API

> ⚠️ **IMPORTANTE:** Este arquivo contém credenciais sensíveis. Nunca compartilhe publicamente ou commite no git!

### Passo 7: Mover o Arquivo JSON para o Projeto

1. Renomeie o arquivo baixado para: `service-account-key.json`

2. Mova este arquivo para a **raiz do seu projeto gtm-mcp**
   - A estrutura de pastas deve ficar assim:
   ```
   gtm-mcp/
   ├── src/
   ├── build/
   ├── package.json
   ├── service-account-key.json  ← SEU ARQUIVO AQUI
   └── README.md
   ```

> ✅ **Parte 1 Completa!** Agora vamos para o Google Tag Manager...

---

## Parte 2: Google Tag Manager (5 minutos)

Agora precisamos dar permissão para a Service Account acessar seus containers do GTM.

### Passo 8: Acessar o Google Tag Manager

1. Abra: https://tagmanager.google.com/
2. Faça login (mesma conta Google)

### Passo 9: Encontrar o ID da Conta

1. Você verá uma lista de contas e containers
2. Anote o número que aparece como **"Account ID"** ou na URL
   - Na URL: `https://tagmanager.google.com/#/container/accounts/123456789/...`
   - O número `123456789` é o seu Account ID

> 📋 **Anote este Account ID - você vai usar nos comandos!**

### Passo 10: Adicionar a Service Account como Usuário

1. Clique no nome da **conta** (não do container) que você quer dar acesso

2. No canto superior direito, clique em **"Admin"**

3. Na seção da CONTA (Account), clique em **"User Management"** (Gerenciamento de Usuários)

4. Clique no botão **"+"** ou **"Add Users"** (Adicionar Usuários)

5. No campo de email, cole o email da service account que você copiou antes:
   - `gtm-mcp-server@seu-projeto-id.iam.gserviceaccount.com`

6. Escolha as permissões:
   - **Para começar:** Marque **"Read"** (Leitura) - permite apenas consultar dados
   - **Se quiser criar/editar tags depois:** Marque também **"Edit"** (Edição)
   - **Se quiser publicar depois:** Marque também **"Publish"** (Publicar)

7. **IMPORTANTE:** Marque a opção **"Account"** para dar acesso a todos os containers da conta
   - Ou marque containers específicos se preferir

8. Clique em **"Invite"** (Convidar)

> ✅ **Pronto!** A service account agora tem acesso ao seu GTM!

---

## Parte 3: Testar a Configuração (2 minutos)

### Passo 11: Verificar o Arquivo JSON

Abra o arquivo `service-account-key.json` em um editor de texto. Ele deve parecer com isso:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-123456",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQ...\n-----END PRIVATE KEY-----\n",
  "client_email": "gtm-mcp-server@seu-projeto-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

**Campos importantes:**
- `client_email`: O email da sua service account
- `private_key`: A chave privada (deve começar com `-----BEGIN PRIVATE KEY-----`)
- `project_id`: O ID do seu projeto no Google Cloud

Se está tudo certo, **você está pronto!** 🎉

---

## 🚀 Próximos Passos

Agora você pode:

1. **Compilar o projeto:**
   ```bash
   cd /caminho/para/gtm-mcp
   npm install
   npm run build
   ```

2. **Configurar no Claude Desktop:**
   - Edite seu `claude_desktop_config.json`
   - Adicione a configuração do servidor GTM (veja README.md principal)

3. **Testar:**
   - Reinicie o Claude Desktop
   - Tente comandos como: "Liste os containers da conta GTM [SEU_ACCOUNT_ID]"

---

## 🔍 Troubleshooting Comum

### "Credentials file not found"
- Verifique se o arquivo está em `gtm-mcp/service-account-key.json`
- Verifique se o nome está correto (com hífen, não underscore)

### "Permission denied" ou "403 Forbidden"
- Verifique se você adicionou o email da service account no GTM
- Verifique se deu pelo menos permissão "Read"
- Aguarde 1-2 minutos para as permissões serem propagadas

### "Invalid credentials" ou "Invalid JWT"
- Verifique se o arquivo JSON não está corrompido
- Tente baixar uma nova chave da service account

### "API not enabled"
- Volte ao Google Cloud Console
- Verifique se a "Tag Manager API" está com status "Enabled"

---

## 🔒 Segurança

**NUNCA:**
- ❌ Commite o arquivo `service-account-key.json` no git
- ❌ Compartilhe o arquivo publicamente
- ❌ Envie o arquivo por email sem criptografia

**SEMPRE:**
- ✅ Mantenha o arquivo local e seguro
- ✅ Use `.gitignore` para prevenir commits acidentais
- ✅ Crie novas chaves se você suspeitar que a chave vazou
- ✅ Use variável de ambiente `GOOGLE_APPLICATION_CREDENTIALS` em produção

**Se você suspeitar que a chave vazou:**
1. Volte ao Google Cloud Console
2. Clique na service account
3. Aba "KEYS"
4. Delete a chave comprometida
5. Crie uma nova chave

---

## ✅ Checklist Final

Antes de usar o MCP server, certifique-se que:

- [ ] Criou um projeto no Google Cloud
- [ ] Ativou a Tag Manager API
- [ ] Criou uma Service Account
- [ ] Baixou o arquivo JSON da chave
- [ ] Renomeou para `service-account-key.json`
- [ ] Colocou o arquivo na raiz do projeto gtm-mcp
- [ ] Copiou o email da service account
- [ ] Adicionou a service account como usuário no GTM
- [ ] Deu permissões adequadas (Read, Edit, etc)
- [ ] Anotou o Account ID do GTM

Se marcou todos os itens, você está pronto para usar! 🎉

---

Tem alguma dúvida ou encontrou algum problema? Consulte a seção de Troubleshooting ou me pergunte!
