import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = new URL('../workflows/', import.meta.url);
const files = (await readdir(root)).filter(name => name.endsWith('.json')).sort();
const workflows = await Promise.all(files.map(async name => ({
  name,
  value: JSON.parse(await readFile(new URL(name, root), 'utf8')),
})));

test('exports are inactive, credential-free and contain no secret-looking values', () => {
  assert.equal(workflows.length, 2);
  for (const { name, value } of workflows) {
    assert.equal(value.active, false, name);
    const serialized = JSON.stringify(value);
    assert.doesNotMatch(serialized, /(?:password|api[_-]?key|private[_-]?key)\s*["':=]+\s*(?!\$env)/iu);
    assert.doesNotMatch(serialized, /Bearer\s+(?!\{\{\s*\$env)[A-Za-z0-9._-]{16,}/u);
    for (const node of value.nodes) {
      for (const credential of Object.values(node.credentials ?? {})) {
        assert.deepEqual(Object.keys(credential), ['name']);
        assert.match(credential.name, /^CAREEROS_[A-Z_]+$/u);
      }
    }
  }
});

test('profile projection validates the versioned event before forwarding it', () => {
  const workflow = workflows.find(item => item.name.includes('profile-search')).value;
  const types = workflow.nodes.map(node => node.type);
  assert.deepEqual(types, [
    'n8n-nodes-base.rabbitmqTrigger', 'n8n-nodes-base.code', 'n8n-nodes-base.httpRequest',
  ]);
  const request = workflow.nodes.at(-1);
  assert.equal(request.parameters.url.endsWith('/v1/internal/discovery/search-snapshots'), true);
  assert.equal(request.retryOnFail, true);
  assert.equal(request.maxTries, 4);
  assert.match(request.parameters.body, /JSON\.stringify\(\$json\)/u);
});

test('daily discovery uses stable idempotency, exponential backoff and a minimal DLQ record', () => {
  const workflow = workflows.find(item => item.name.includes('daily-opportunity')).value;
  const attempts = workflow.nodes.filter(node => node.name.startsWith('Run discovery attempt'));
  const waits = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.wait');
  const deadLetter = workflow.nodes.find(node => node.name === 'Publish minimal dead letter');

  assert.equal(attempts.length, 4);
  assert.deepEqual(waits.map(node => node.parameters.amount), [30, 120, 480]);
  assert.ok(attempts.every(node => (
    node.parameters.url.endsWith('/v1/internal/discovery/runs')
    && JSON.stringify(node.parameters).includes('Idempotency-Key')
    && JSON.stringify(node.parameters).includes('X-Correlation-ID')
  )));
  assert.equal(deadLetter.parameters.queue, 'careeros.discovery.run.v1.dlq');
  assert.doesNotMatch(deadLetter.parameters.message, /rawSource|description|contact|token/iu);
  assert.deepEqual(workflow.meta.careeros.retryBackoffSeconds, [30, 120, 480]);
  assert.equal(workflow.settings.saveDataSuccessExecution, 'none');
  assert.equal(workflow.settings.saveDataErrorExecution, 'none');
});

test('all workflow connections reference declared nodes', () => {
  for (const { name, value } of workflows) {
    const declared = new Set(value.nodes.map(node => node.name));
    for (const [source, outputs] of Object.entries(value.connections)) {
      assert.ok(declared.has(source), `${name}: missing source ${source}`);
      for (const channel of Object.values(outputs)) {
        for (const branch of channel) {
          for (const edge of branch) assert.ok(declared.has(edge.node), `${name}: ${edge.node}`);
        }
      }
    }
  }
});
