import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { resolveProjectDesignSystemDirectory } from '../src/project-path.mjs';

const repositoryRoot = path.resolve('/tmp/aic-repository');

test('accepts one named design system below the repository design-system root', () => {
  const result = resolveProjectDesignSystemDirectory(repositoryRoot, 'design-system/admin-panel');
  assert.equal(result.designSystemDirectory, path.join(repositoryRoot, 'design-system/admin-panel'));
  assert.equal(result.relativeDirectory, path.join('design-system', 'admin-panel'));
  assert.equal(result.designSystemId, 'admin-panel');
});

test('accepts another design system beside the first one', () => {
  assert.equal(resolveProjectDesignSystemDirectory(repositoryRoot, 'design-system/mobile').designSystemId, 'mobile');
  assert.equal(resolveProjectDesignSystemDirectory(repositoryRoot, 'design-system/web.dark').designSystemId, 'web.dark');
});

test('rejects the previous suffix-based and example paths', () => {
  for (const candidate of ['apps/mobile/design-system', 'examples/design-system-example', 'design-system']) {
    assert.throws(() => resolveProjectDesignSystemDirectory(repositoryRoot, candidate), /must match design-system\/<id>/);
  }
});

test('rejects nested, non-portable and escaping paths', () => {
  assert.throws(() => resolveProjectDesignSystemDirectory(repositoryRoot, 'design-system/group/mobile'), /must match/);
  assert.throws(() => resolveProjectDesignSystemDirectory(repositoryRoot, 'design-system/mobile app'), /must match/);
  assert.throws(() => resolveProjectDesignSystemDirectory(repositoryRoot, '../design-system/mobile'), /inside the current repository/);
});
