// Encrypted key storage using Web Crypto API
// AES-GCM 256-bit encryption + PBKDF2 key derivation
// No external libraries — uses browser-native crypto

const STORAGE_KEY = 'tvk_encrypted_keys';
const PBKDF2_ITERATIONS = 100_000;

// --- Helpers: ArrayBuffer ↔ Base64 ---
function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function base64ToBuf(b64) {
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// --- Derive AES-GCM key from password + salt using PBKDF2 ---
async function deriveKey(password, salt) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// --- Encrypt keys object with master password ---
export async function encrypt(keysObject, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(keysObject));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plaintext
  );

  return {
    ciphertext: bufToBase64(ciphertext),
    salt: bufToBase64(salt),
    iv: bufToBase64(iv),
  };
}

// --- Decrypt keys with master password ---
// Throws on wrong password (AES-GCM auth tag mismatch)
export async function decrypt(payload, password) {
  const salt = base64ToBuf(payload.salt);
  const iv = base64ToBuf(payload.iv);
  const ciphertext = base64ToBuf(payload.ciphertext);
  const key = await deriveKey(password, salt);

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(iv) },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(plaintext));
}

// --- localStorage persistence ---
export function saveEncryptedKeys(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadEncryptedKeys() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearKeys() {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasStoredKeys() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
