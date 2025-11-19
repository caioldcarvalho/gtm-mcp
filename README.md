# GTM MCP Server

Servidor MCP (Model Context Protocol) para integração com a API do Google Tag Manager.

## 🚀 Funcionalidades

### Fase 1 - MVP (Atual)
- ✅ `list_containers` - Lista todos os containers de uma conta GTM
- ✅ `get_container` - Obtém detalhes de um container específico

### Próximas Fases
- **Fase 2**: Workspaces e Tags
- **Fase 3**: Triggers e Variables
- **Fase 4**: Operações de escrita (criar/atualizar/deletar)
- **Fase 5**: Versionamento e publicação

## 📋 Pré-requisitos

- Node.js 18+
- Uma conta Google Cloud com acesso ao Google Tag Manager
- Credenciais de Service Account do Google Cloud

## 🔑 Configuração de Autenticação

> 📖 **Para um guia passo a passo detalhado com explicações, veja [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

### Resumo Rápido:

1. **Google Cloud Console** → Criar Service Account → Baixar JSON
2. **Google Tag Manager** → Adicionar email da Service Account como usuário
3. **Projeto** → Colocar JSON como `service-account-key.json`

### Passo 1: Criar um Projeto no Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o ID do projeto

### Passo 2: Ativar a API do Google Tag Manager

1. No Google Cloud Console, vá para **APIs & Services** > **Library**
2. Procure por "Tag Manager API"
3. Clique em **Enable** (Ativar)

### Passo 3: Criar uma Service Account

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **Service Account**
3. Preencha os detalhes:
   - **Service account name**: `gtm-mcp-server` (ou outro nome de sua escolha)
   - **Service account ID**: será gerado automaticamente
   - **Description**: "Service account for GTM MCP Server"
4. Clique em **Create and Continue**
5. Em **Grant this service account access to project**, você pode pular (não é necessário para GTM)
6. Clique em **Done**

### Passo 4: Criar e Baixar a Chave da Service Account

1. Na lista de Service Accounts, clique na que você acabou de criar
2. Vá para a aba **Keys**
3. Clique em **Add Key** > **Create new key**
4. Selecione **JSON** como tipo
5. Clique em **Create**
6. O arquivo JSON será baixado automaticamente

### Passo 5: Dar Permissões no Google Tag Manager

1. Acesse o [Google Tag Manager](https://tagmanager.google.com/)
2. Selecione a conta que deseja acessar via API
3. Vá para **Admin** > **User Management**
4. Clique em **Add Users**
5. Cole o email da service account (formato: `nome@projeto-id.iam.gserviceaccount.com`)
6. Defina as permissões:
   - **Read**: Para apenas leitura
   - **Edit**: Para leitura e escrita
   - **Publish**: Para publicar versões
7. Clique em **Invite**

### Passo 6: Configurar as Credenciais no Projeto

Renomeie o arquivo JSON baixado para `service-account-key.json` e coloque-o na raiz deste projeto.

**Ou** defina a variável de ambiente:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/seu/service-account-key.json"
```

⚠️ **IMPORTANTE**: Nunca commite o arquivo `service-account-key.json` no git! Ele já está no `.gitignore`.

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Compilar o projeto
npm run build
```

## 🎯 Como Usar

### Configuração no Claude Desktop

Adicione ao seu `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "gtm": {
      "command": "node",
      "args": ["/caminho/completo/para/gtm-mcp/build/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/caminho/completo/para/service-account-key.json"
      }
    }
  }
}
```

### Encontrar o ID da Conta GTM

O ID da conta GTM pode ser encontrado de duas formas:

1. **Na URL do Google Tag Manager**:
   - Acesse https://tagmanager.google.com/
   - A URL será algo como: `https://tagmanager.google.com/#/container/accounts/123456789/containers/987654/...`
   - O número após `/accounts/` é o seu Account ID: `123456789`

2. **No painel do GTM**:
   - Vá para Admin > Account Settings
   - O Account ID está listado lá

## 🛠️ Tools Disponíveis

### 1. list_containers

Lista todos os containers de uma conta GTM.

**Parâmetros:**
- `accountId` (string): ID da conta GTM (pode ser `123456789` ou `accounts/123456789`)

**Exemplo de resposta:**
```json
{
  "accountId": "accounts/123456789",
  "totalContainers": 2,
  "containers": [
    {
      "path": "accounts/123456789/containers/987654",
      "accountId": "123456789",
      "containerId": "987654",
      "name": "My Website",
      "publicId": "GTM-XXXXXX",
      "usageContext": ["web"],
      "fingerprint": "1234567890",
      "tagManagerUrl": "https://tagmanager.google.com/#/container/accounts/123456789/containers/987654/workspaces/1"
    }
  ]
}
```

### 2. get_container

Obtém detalhes de um container específico.

**Parâmetros:**
- `accountId` (string): ID da conta GTM
- `containerId` (string): ID do container (pode ser `987654` ou `containers/987654`)

**Exemplo de resposta:**
```json
{
  "path": "accounts/123456789/containers/987654",
  "accountId": "123456789",
  "containerId": "987654",
  "name": "My Website",
  "publicId": "GTM-XXXXXX",
  "usageContext": ["web"],
  "fingerprint": "1234567890",
  "tagManagerUrl": "https://tagmanager.google.com/#/container/accounts/123456789/containers/987654/workspaces/1",
  "notes": "Production container",
  "domainName": ["example.com", "www.example.com"]
}
```

## 🧪 Testando o Servidor

Para verificar se o servidor está funcionando corretamente, você pode usar o MCP Inspector:

```bash
# Instalar o MCP Inspector globalmente (se ainda não tiver)
npm install -g @modelcontextprotocol/inspector

# Executar o servidor com o inspector
mcp-inspector node build/index.js
```

O Inspector abrirá uma interface web onde você pode testar as tools manualmente.

### Teste Rápido

Reinicie o Claude Desktop após configurar o servidor e verifique se:

1. O servidor GTM aparece na lista de servidores conectados
2. As tools `list_containers` e `get_container` estão disponíveis
3. Você consegue executar comandos como:
   - "Liste todos os containers da conta GTM 123456789"
   - "Mostre detalhes do container 987654 da conta 123456789"

## 🔍 Troubleshooting

### Erro: "Credentials file not found"
- Verifique se o arquivo `service-account-key.json` está na raiz do projeto
- Ou se a variável `GOOGLE_APPLICATION_CREDENTIALS` está configurada corretamente

### Erro: "Permission denied" ou "403 Forbidden"
- Verifique se a service account foi adicionada como usuário no GTM
- Verifique se as permissões foram concedidas corretamente
- Aguarde alguns minutos, pois pode levar tempo para as permissões serem propagadas

### Erro: "API not enabled"
- Certifique-se de que a Tag Manager API está ativada no Google Cloud Console

## 📚 Recursos

- [Google Tag Manager API Documentation](https://developers.google.com/tag-platform/tag-manager/api/v2)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)

## 📝 Licença

MIT

## 🗺️ Roadmap Completo

### ✅ Fase 1 - MVP
- [x] Autenticação OAuth 2.0
- [x] list_containers
- [x] get_container

### 🔄 Fase 2 - Workspaces e Tags
- [ ] list_workspaces
- [ ] get_workspace
- [ ] list_tags
- [ ] get_tag

### 📋 Fase 3 - Triggers e Variables
- [ ] list_triggers
- [ ] get_trigger
- [ ] list_variables
- [ ] get_variable

### ✏️ Fase 4 - Operações de Escrita
- [ ] create_tag
- [ ] update_tag
- [ ] delete_tag
- [ ] create_trigger
- [ ] update_trigger
- [ ] delete_trigger

### 🚀 Fase 5 - Versionamento
- [ ] create_version
- [ ] publish_version
- [ ] list_versions
- [ ] get_version
