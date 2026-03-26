/**
 * localStorage polyfill that mirrors the window.storage API
 * used in the Claude.ai artifact version of the hub.
 * Keys with shared:true use a "shared_" prefix to distinguish them.
 */

const PREFIX = "ns_";
const SHARED_PREFIX = "shared_";

function getKey(key, shared) {
  return (shared ? SHARED_PREFIX : "") + PREFIX + key;
}

export const storage = {
  async get(key, shared = false) {
    try {
      const k = getKey(key, shared);
      const val = localStorage.getItem(k);
      if (val === null) throw new Error("Not found");
      return { key, value: val, shared: !!shared };
    } catch {
      return null;
    }
  },

  async set(key, value, shared = false) {
    try {
      const k = getKey(key, shared);
      localStorage.setItem(k, value);
      return { key, value, shared: !!shared };
    } catch {
      return null;
    }
  },

  async delete(key, shared = false) {
    try {
      const k = getKey(key, shared);
      localStorage.removeItem(k);
      return { key, deleted: true, shared: !!shared };
    } catch {
      return null;
    }
  },

  async list(prefix = "", shared = false) {
    try {
      const full = getKey(prefix, shared);
      const keys = Object.keys(localStorage)
        .filter(k => k.startsWith(full))
        .map(k => k.replace(getKey("", shared), ""));
      return { keys, prefix, shared: !!shared };
    } catch {
      return { keys: [], prefix, shared: !!shared };
    }
  },
};
