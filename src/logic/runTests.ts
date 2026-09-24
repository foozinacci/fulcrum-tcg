import { runRulesEngineTests } from './rulesEngine.test';

const success = runRulesEngineTests();
if (!success) {
  process.exit(1);
}
