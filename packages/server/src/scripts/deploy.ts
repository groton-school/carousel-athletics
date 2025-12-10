import { Core } from '@qui-cli/core';
import { register } from '@qui-cli/plugin';
import * as Deploy from './DeployPlugin.js';

await register(Deploy);
await Core.run();
