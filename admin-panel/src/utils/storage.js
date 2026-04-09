/**
 * Safari-safe storage utility.
 * Safari blocks localStorage in:
 *  - Private/Incognito mode (throws QuotaExceededError)
 *  - PWA home-screen apps in some iOS versions
 *  - Cross-origin iframes
 * Falls back to sessionStorage, then an in-memory store.
 */

const memoryStore = {};

const isStorageAvailable = (type) => {
    try {
        const storage = window[type];
        const testKey = '__storage_test__';
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};

const getStore = () => {
    if (isStorageAvailable('localStorage')) return localStorage;
    if (isStorageAvailable('sessionStorage')) return sessionStorage;
    return null; // fall through to memoryStore
};

export const safeSetItem = (key, value) => {
    try {
        const store = getStore();
        if (store) {
            store.setItem(key, value);
        } else {
            memoryStore[key] = value;
        }
    } catch (e) {
        memoryStore[key] = value;
    }
};

export const safeGetItem = (key) => {
    try {
        const store = getStore();
        if (store) {
            return store.getItem(key);
        }
        return memoryStore[key] ?? null;
    } catch {
        return memoryStore[key] ?? null;
    }
};

export const safeRemoveItem = (key) => {
    try {
        const store = getStore();
        if (store) {
            store.removeItem(key);
        } else {
            delete memoryStore[key];
        }
    } catch {
        delete memoryStore[key];
    }
};
