#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import pkg from '../package.json';
import { resolveDocs } from './resolve';

const server = new McpServer({
  name: 'discord-ts-selfbot',
  version: pkg.version,
});

server.registerTool(
  'selfbot_docs',
  {
    description: `Find the version-accurate discord-ts-selfbot Agent docs for THIS project.

This tool does NOT fetch documentation. The installed package ships a plain-Markdown docs tree at \`docs/\`, kept in sync with the exact version in the project. This tool returns the absolute path and reading instructions, so you read the docs that match the installed package, not a generic or outdated copy.

Call this before answering discord-ts-selfbot questions or writing code. Then read the index it returns and open only the page for the task.`,
    inputSchema: {
      topic: z
        .string()
        .optional()
        .describe(
          "Optional: what you're looking for (e.g. 'send a message', 'voice', 'record a call'). Used only to suggest where to start.",
        ),
      project_path: z
        .string()
        .optional()
        .describe('Path to the project that uses discord-ts-selfbot (defaults to the current directory).'),
    },
  },
  async ({ topic, project_path }) => {
    try {
      const result = resolveDocs(project_path ?? process.cwd(), topic);
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'error',
              message: error instanceof Error ? error.message : String(error),
            }),
          },
        ],
      };
    }
  },
);

await server.connect(new StdioServerTransport());
