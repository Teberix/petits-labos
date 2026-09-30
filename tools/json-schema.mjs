// A small JSON Schema validator for the gate (dev-only; the project has no dependencies
// besides Playwright, so no ajv). It supports the subset level schemas need:
//   type (object, array, string, integer, number, boolean, null — or a list of them),
//   properties, required, additionalProperties (true/false or a schema), items,
//   minItems, maxItems, uniqueItems, enum, const, minimum, maximum, minLength,
//   maxLength, pattern, and $ref to "#/$defs/<name>" or "#/definitions/<name>".
// Annotations ($schema, $id, $comment, title, description, default, examples) are
// ignored. Any OTHER keyword is reported as an error, so a schema never silently relies
// on something this validator doesn't check.
//
//   validate(schema, data) → ['levels[2].size: must be >= 3', …]  (empty = valid)

const ANNOTATIONS = new Set(['$schema', '$id', '$comment', 'title', 'description', 'default', 'examples']);
const KEYWORDS = new Set([
  'type', 'properties', 'required', 'additionalProperties', 'items', 'minItems', 'maxItems',
  'uniqueItems', 'enum', 'const', 'minimum', 'maximum', 'minLength', 'maxLength', 'pattern',
  '$ref', '$defs', 'definitions',
]);

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value; // 'number', 'string', 'boolean', 'object'
}

function hasType(value, type) {
  const actual = typeOf(value);
  return actual === type || (type === 'number' && actual === 'integer');
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function resolve(root, ref) {
  const m = ref.match(/^#\/(\$defs|definitions)\/([^/]+)$/);
  const target = m && root[m[1]]?.[m[2]];
  if (!target) throw new Error(`unsupported or unknown $ref "${ref}"`);
  return target;
}

function check(schema, value, path, root, errors) {
  if (schema === true) return;
  if (schema === false) { errors.push(`${path}: not allowed`); return; }
  for (const key of Object.keys(schema)) {
    if (!KEYWORDS.has(key) && !ANNOTATIONS.has(key)) errors.push(`${path}: schema keyword "${key}" is not supported by tools/json-schema.mjs`);
  }
  if (schema.$ref) { check(resolve(root, schema.$ref), value, path, root, errors); return; }

  if (schema.type) {
    const types = [].concat(schema.type);
    if (!types.some((t) => hasType(value, t))) {
      errors.push(`${path}: must be ${types.join(' or ')} (is ${typeOf(value)})`);
      return; // the other keywords would only add noise
    }
  }
  if ('const' in schema && !same(value, schema.const)) errors.push(`${path}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((option) => same(option, value))) {
    errors.push(`${path}: must be one of ${schema.enum.map((o) => JSON.stringify(o)).join(', ')}`);
  }

  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: must be >= ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: must be <= ${schema.maximum}`);
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: must have >= ${schema.minLength} characters`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${path}: must have <= ${schema.maxLength} characters`);
    if (schema.pattern !== undefined && !new RegExp(schema.pattern, 'u').test(value)) errors.push(`${path}: must match /${schema.pattern}/`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: must have >= ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: must have <= ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) errors.push(`${path}: items must be unique`);
    if (schema.items) value.forEach((item, i) => check(schema.items, item, `${path}[${i}]`, root, errors));
  }
  if (typeOf(value) === 'object') {
    for (const key of schema.required ?? []) {
      if (!(key in value)) errors.push(`${path}: missing "${key}"`);
    }
    const props = schema.properties ?? {};
    for (const [key, item] of Object.entries(value)) {
      if (props[key]) check(props[key], item, `${path}.${key}`, root, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}: unexpected "${key}"`);
      else if (typeof schema.additionalProperties === 'object') check(schema.additionalProperties, item, `${path}.${key}`, root, errors);
    }
  }
}

export function validate(schema, data, rootPath = '$') {
  const errors = [];
  try {
    check(schema, data, rootPath, schema, errors);
  } catch (err) {
    errors.push(`${rootPath}: ${err.message}`);
  }
  return errors;
}
