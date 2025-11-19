#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as fs from "fs";
import * as path from "path";

// Tipos para melhor type safety
interface GTMContainer {
  accountId: string;
  containerId: string;
  name: string;
  publicId: string;
  usageContext: string[];
  fingerprint?: string;
  tagManagerUrl?: string;
}

interface GTMAccount {
  accountId: string;
  name: string;
}

// Classe principal do servidor MCP
class GTMServer {
  private server: Server;
  private auth: JWT | null = null;
  private tagmanager: any;

  constructor() {
    this.server = new Server(
      {
        name: "gtm-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Setup de handlers
    this.setupHandlers();

    // Setup de tratamento de erros
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  // Inicializar autenticação com Google API
  private async initAuth(): Promise<void> {
    if (this.auth) {
      return; // Já autenticado
    }

    try {
      // Procurar por arquivo de credenciais em variáveis de ambiente ou arquivo local
      const credentialsPath =
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        path.join(process.cwd(), "service-account-key.json");

      if (!fs.existsSync(credentialsPath)) {
        throw new Error(
          `Credentials file not found at ${credentialsPath}. ` +
          `Please set GOOGLE_APPLICATION_CREDENTIALS environment variable ` +
          `or place service-account-key.json in the project root.`
        );
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

      this.auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: [
          "https://www.googleapis.com/auth/tagmanager.readonly",
          "https://www.googleapis.com/auth/tagmanager.edit.containers",
        ],
      });

      // Inicializar cliente do Tag Manager
      this.tagmanager = google.tagmanager({
        version: "v2",
        auth: this.auth,
      });

      console.error("[GTM MCP] Authentication successful");
    } catch (error) {
      console.error("[GTM MCP] Authentication failed:", error);
      throw error;
    }
  }

  private setupHandlers(): void {
    // Handler para listar tools disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    // Handler para executar tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        // Garantir que estamos autenticados
        await this.initAuth();

        const { name, arguments: args } = request.params;

        switch (name) {
          case "list_containers":
            return await this.listContainers(args);
          case "get_container":
            return await this.getContainer(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: "list_containers",
        description:
          "Lista todos os containers GTM de uma conta específica. " +
          "Retorna informações como ID do container, nome, contexto de uso (web/amp/android/ios), e URL do Tag Manager.",
        inputSchema: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "ID da conta GTM (formato: accounts/123456789 ou apenas 123456789)",
            },
          },
          required: ["accountId"],
        },
      },
      {
        name: "get_container",
        description:
          "Obtém detalhes de um container GTM específico. " +
          "Retorna informações completas incluindo ID, nome, contexto de uso, fingerprint, e URL do Tag Manager.",
        inputSchema: {
          type: "object",
          properties: {
            accountId: {
              type: "string",
              description: "ID da conta GTM (formato: accounts/123456789 ou apenas 123456789)",
            },
            containerId: {
              type: "string",
              description: "ID do container (formato: containers/123456 ou apenas 123456)",
            },
          },
          required: ["accountId", "containerId"],
        },
      },
    ];
  }

  // Normalizar IDs para formato correto da API
  private normalizeAccountId(accountId: string): string {
    return accountId.startsWith("accounts/") ? accountId : `accounts/${accountId}`;
  }

  private normalizeContainerId(containerId: string): string {
    return containerId.startsWith("containers/") ? containerId : `containers/${containerId}`;
  }

  // Tool: Listar containers
  private async listContainers(args: any) {
    const { accountId } = args;
    const normalizedAccountId = this.normalizeAccountId(accountId);

    try {
      const response = await this.tagmanager.accounts.containers.list({
        parent: normalizedAccountId,
      });

      const containers = response.data.container || [];

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                accountId: normalizedAccountId,
                totalContainers: containers.length,
                containers: containers.map((c: any) => ({
                  path: c.path,
                  accountId: c.accountId,
                  containerId: c.containerId,
                  name: c.name,
                  publicId: c.publicId,
                  usageContext: c.usageContext,
                  fingerprint: c.fingerprint,
                  tagManagerUrl: c.tagManagerUrl,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(
        `Failed to list containers for account ${normalizedAccountId}: ${error.message}`
      );
    }
  }

  // Tool: Obter container específico
  private async getContainer(args: any) {
    const { accountId, containerId } = args;
    const normalizedAccountId = this.normalizeAccountId(accountId);
    const normalizedContainerId = this.normalizeContainerId(containerId);
    const containerPath = `${normalizedAccountId}/${normalizedContainerId}`;

    try {
      const response = await this.tagmanager.accounts.containers.get({
        path: containerPath,
      });

      const container = response.data;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                path: container.path,
                accountId: container.accountId,
                containerId: container.containerId,
                name: container.name,
                publicId: container.publicId,
                usageContext: container.usageContext,
                fingerprint: container.fingerprint,
                tagManagerUrl: container.tagManagerUrl,
                notes: container.notes,
                domainName: container.domainName,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(
        `Failed to get container ${containerPath}: ${error.message}`
      );
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("[GTM MCP] Server running on stdio");
  }
}

// Iniciar servidor
const server = new GTMServer();
server.run().catch((error) => {
  console.error("[GTM MCP] Fatal error:", error);
  process.exit(1);
});
