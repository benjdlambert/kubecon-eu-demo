import { CatalogClient } from '@backstage/catalog-client';
import {
  createRouter,
  createBuiltinActions,
  createTemplateAction,
} from '@backstage/plugin-scaffolder-backend';
import { ScmIntegrations } from '@backstage/integration';
import { Router } from 'express';
import gitUrlParse from 'git-url-parse';
import type { PluginEnvironment } from '../types';
import { promises as fs } from 'fs';
import { parse, stringify } from 'yaml';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });
  const additionalTemplateFilters = {
    getEntityLocation: (entity: any) => {
      return entity?.metadata?.annotations?.[
        'backstage.io/source-location'
      ].replace('url:', '');
    },
    getRepoUrl: (entity: any) => {
      const { owner, source, name } = gitUrlParse(
        entity?.metadata?.annotations?.['backstage.io/source-location'].replace(
          'url:',
          '',
        )!,
      );

      return `${source}?owner=${owner}&repo=${name}`;
    },
  };

  const actions = await createBuiltinActions({
    integrations: ScmIntegrations.fromConfig(env.config),
    catalogClient,
    config: env.config,
    reader: env.reader,
    additionalTemplateFilters,
  });

  actions.push(
    createTemplateAction({
      id: 'acme:techdocs:annotate',
      async handler(ctx) {
        const catalogFileContents = await fs.readFile(
          `${ctx.workspacePath}/catalog-info.yaml`,
          'utf8',
        );
        const parsedYaml = parse(catalogFileContents);
        parsedYaml.metadata.annotations = {
          ...parsedYaml.metadata.annotations,
          'backstage.io/techdocs-ref': 'dir:.',
        };
        await fs.writeFile(
          `${ctx.workspacePath}/catalog-info.yaml`,
          stringify(parsedYaml),
        );
      },
    }),
  );

  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
    additionalTemplateFilters,
    actions,
  });
}
