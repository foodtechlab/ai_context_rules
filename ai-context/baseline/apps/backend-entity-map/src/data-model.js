export const ELEMENT_KINDS = ['entity', 'enum', 'inner-class'];
export const RELATION_KINDS = ['contains', 'extends', 'implements', 'references', 'uses'];

export function emptyGeneratedData() {
  return {
    schemaVersion: 1,
    generatedAt: null,
    source: { repository: null, backendRoots: [], generator: 'aic-collect-backend-entities', coverage: 'empty' },
    elements: [],
    relations: [],
  };
}

export function emptyUserData() {
  return {
    schemaVersion: 1,
    elements: [],
    relations: [],
    annotations: [],
    layout: {},
  };
}

export function validateDataset(value, layer) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return ['root must be an object'];
  }
  if (value.schemaVersion !== 1) errors.push('schemaVersion must equal 1');
  if (!Array.isArray(value.elements)) errors.push('elements must be an array');
  if (!Array.isArray(value.relations)) errors.push('relations must be an array');
  if (layer === 'user' && !Array.isArray(value.annotations)) errors.push('annotations must be an array');
  if (layer === 'user' && (!value.layout || typeof value.layout !== 'object' || Array.isArray(value.layout))) {
    errors.push('layout must be an object');
  }

  const ids = new Set();
  for (const [index, element] of (value.elements || []).entries()) {
    if (!element || typeof element !== 'object') {
      errors.push(`elements[${index}] must be an object`);
      continue;
    }
    if (typeof element.id !== 'string' || !element.id) errors.push(`elements[${index}].id is required`);
    if (ids.has(element.id)) errors.push(`duplicate element id: ${element.id}`);
    ids.add(element.id);
    if (!ELEMENT_KINDS.includes(element.kind)) errors.push(`invalid element kind: ${element.kind}`);
    if (typeof element.name !== 'string' || !element.name) errors.push(`elements[${index}].name is required`);
    if (element.fields !== undefined && !Array.isArray(element.fields)) {
      errors.push(`elements[${index}].fields must be an array`);
    }
    for (const [fieldIndex, field] of (element.fields || []).entries()) {
      if (!field || typeof field !== 'object') {
        errors.push(`elements[${index}].fields[${fieldIndex}] must be an object`);
        continue;
      }
      if (typeof field.name !== 'string' || !field.name) errors.push(`elements[${index}].fields[${fieldIndex}].name is required`);
      if (typeof field.type !== 'string' || !field.type) errors.push(`elements[${index}].fields[${fieldIndex}].type is required`);
      if (field.description !== undefined && typeof field.description !== 'string') {
        errors.push(`elements[${index}].fields[${fieldIndex}].description must be a string`);
      }
      if (field.inherited !== undefined && typeof field.inherited !== 'boolean') {
        errors.push(`elements[${index}].fields[${fieldIndex}].inherited must be a boolean`);
      }
      if (field.declaredIn !== undefined && (typeof field.declaredIn !== 'string' || !field.declaredIn)) {
        errors.push(`elements[${index}].fields[${fieldIndex}].declaredIn must be a non-empty string`);
      }
      if (field.inherited && !field.declaredIn) {
        errors.push(`elements[${index}].fields[${fieldIndex}].declaredIn is required for inherited fields`);
      }
    }
    if (element.values !== undefined && !Array.isArray(element.values)) errors.push(`elements[${index}].values must be an array`);
  }
  for (const [index, relation] of (value.relations || []).entries()) {
    if (!relation || typeof relation !== 'object') {
      errors.push(`relations[${index}] must be an object`);
      continue;
    }
    if (typeof relation.id !== 'string' || !relation.id) errors.push(`relations[${index}].id is required`);
    if (typeof relation.source !== 'string' || !relation.source) errors.push(`relations[${index}].source is required`);
    if (typeof relation.target !== 'string' || !relation.target) errors.push(`relations[${index}].target is required`);
    if (!RELATION_KINDS.includes(relation.kind)) errors.push(`invalid relation kind: ${relation.kind}`);
  }
  return errors;
}

export function validateCombinedDatasets(generated, user) {
  const errors = [...validateDataset(generated, 'generated'), ...validateDataset(user, 'user')];
  const generatedIds = new Set((generated.elements || []).map((element) => element.id));
  const userIds = new Set((user.elements || []).map((element) => element.id));
  const allIds = new Set([...generatedIds, ...userIds]);
  for (const id of userIds) {
    if (generatedIds.has(id)) errors.push(`user element duplicates generated id: ${id}`);
  }
  for (const relation of [...(generated.relations || []), ...(user.relations || [])]) {
    if (!allIds.has(relation.source)) errors.push(`relation ${relation.id} has unknown source: ${relation.source}`);
    if (!allIds.has(relation.target)) errors.push(`relation ${relation.id} has unknown target: ${relation.target}`);
  }
  for (const annotation of user.annotations || []) {
    if (!annotation || typeof annotation.targetId !== 'string' || !annotation.targetId) {
      errors.push('annotation targetId is required');
    } else if (!allIds.has(annotation.targetId)) {
      errors.push(`annotation has unknown target: ${annotation.targetId}`);
    }
  }
  return [...new Set(errors)];
}

export function mergeDatasets(generated, user) {
  const annotations = new Map((user.annotations || []).map((item) => [item.targetId, item]));
  const generatedElements = (generated.elements || []).map((element) => {
    const annotation = annotations.get(element.id);
    return {
      ...element,
      ...(annotation ? { note: annotation.note, color: annotation.color, tags: annotation.tags } : {}),
      origin: 'generated',
    };
  });
  const userElements = (user.elements || []).map((element) => ({ ...element, origin: 'user' }));
  return {
    elements: [...generatedElements, ...userElements],
    relations: [...(generated.relations || []), ...(user.relations || [])],
  };
}

export function createFlowModel(generated, user) {
  const merged = mergeDatasets(generated, user);
  const counters = { entity: 0, enum: 0, 'inner-class': 0 };
  const columns = { entity: 0, enum: 390, 'inner-class': 780 };
  const layout = user.layout || {};
  const nodes = merged.elements.map((element) => {
    const fallback = {
      x: columns[element.kind] || 0,
      y: (counters[element.kind] || 0) * 230,
    };
    counters[element.kind] = (counters[element.kind] || 0) + 1;
    return {
      id: element.id,
      type: element.kind,
      position: layout[element.id] || fallback,
      data: { element },
    };
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = merged.relations
    .filter((relation) => nodeIds.has(relation.source) && nodeIds.has(relation.target))
    .map((relation) => ({
      id: relation.id,
      source: relation.source,
      target: relation.target,
      label: relation.label || relation.kind,
      type: 'smoothstep',
      animated: relation.kind === 'contains',
      className: `edge edge--${relation.kind}`,
    }));
  return { nodes, edges };
}
