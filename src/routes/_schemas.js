import { writable, derived, get } from "svelte/store";
import ptr from "jsonpointer";

/**
 * all the schemas the app is aware of
 */
const schemas = writable({});

/**
 * the currently viewed instance url
 */
const selected_instance_url = writable(null);
const set_selected_instance_url = selected_instance_url.set;

const selected_instance = derived(
  [schemas, selected_instance_url],
  ([$schemas, $selected_instance_url]) => {
    if (!$selected_instance_url) return null;

    const [url, segment] = $selected_instance_url.split("#");

    return $schemas[url];
  }
);

const add_schema = (schema, url) => {
  // $id for >v4, id before
  const id = schema["$id"] || schema.id || "file:///" + url;

  if (!schema['$id']) {
    schema = { ...schema, '$id': id };
  }

  schemas.update(($s) => ({ ...$s, [id]: schema }));

  selected_instance_url.update(($url) => $url || id);
};

const fetch_segment = async (target, origin) => {
  let schema_id, path;

  if (target.indexOf("#") === 0) {
    [schema_id] = origin.split("#");
    path = target.substr(1);
  } else if (target.indexOf("#") === undefined) {
    schema_id = target;
  } else {
    [schema_uri, path] = target.split("#");
  }

  const schema = get(schemas)[schema_id];

  if (!path) return schema;

  return ptr.get(schema, path);
};

export {
  schemas,
  add_schema,
  selected_instance_url,
  set_selected_instance_url,
  selected_instance,
  fetch_segment,
};
