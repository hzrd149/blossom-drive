import { scrypt } from "@noble/hashes/scrypt";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { concatBytes, randomBytes } from "@noble/hashes/utils";

export function encrypt(data: Uint8Array, password: string, logn: number = 16, ksb: 0x00 | 0x01 | 0x02 = 0x02) {
  let salt = randomBytes(16);
  let n = 2 ** logn;
  let key = scrypt(password.normalize("NFKC"), salt, { N: n, r: 8, p: 1, dkLen: 32 });
  let nonce = randomBytes(24);
  let aad = Uint8Array.from([ksb]);
  let xc2p1 = xchacha20poly1305(key, nonce, aad);
  let ciphertext = xc2p1.encrypt(data);
  let b = concatBytes(Uint8Array.from([0x02]), Uint8Array.from([logn]), salt, nonce, aad, ciphertext);
  return b;
}

export function decrypt(b: Uint8Array, password: string) {
  let version = b[0];
  if (version !== 0x02) {
    throw new Error(`invalid version ${version}, expected 0x02`);
  }

  let logn = b[1];
  let n = 2 ** logn;

  let salt = b.slice(2, 2 + 16);
  let nonce = b.slice(2 + 16, 2 + 16 + 24);
  let ksb = b[2 + 16 + 24];
  let aad = Uint8Array.from([ksb]);
  let ciphertext = b.slice(2 + 16 + 24 + 1);

  let key = scrypt(password.normalize("NFKC"), salt, { N: n, r: 8, p: 1, dkLen: 32 });
  let xc2p1 = xchacha20poly1305(key, nonce, aad);
  let plaintext = xc2p1.decrypt(ciphertext);

  return plaintext;
}
