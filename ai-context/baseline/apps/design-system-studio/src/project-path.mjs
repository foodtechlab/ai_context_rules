import path from 'node:path';

export const DESIGN_SYSTEMS_ROOT = 'design-system';
const portableDesignSystemId = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export function resolveProjectDesignSystemDirectory(repositoryRoot, configuredDirectory) {
  if (!configuredDirectory) {
    throw new Error('AIC_DESIGN_SYSTEM_DIR is required, for example: design-system/mobile');
  }

  const designSystemDirectory = path.resolve(repositoryRoot, configuredDirectory);
  const relativeDirectory = path.relative(repositoryRoot, designSystemDirectory);
  if (!relativeDirectory || relativeDirectory.startsWith('..') || path.isAbsolute(relativeDirectory)) {
    throw new Error('AIC_DESIGN_SYSTEM_DIR must point inside the current repository');
  }

  const segments = relativeDirectory.split(path.sep);
  if (segments.length !== 2 || segments[0] !== DESIGN_SYSTEMS_ROOT || !portableDesignSystemId.test(segments[1])) {
    throw new Error('AIC_DESIGN_SYSTEM_DIR must match design-system/<id>, for example: design-system/mobile');
  }

  return { designSystemDirectory, relativeDirectory, designSystemId: segments[1] };
}
