#!/usr/bin/env python3
"""
DREAM Wallet Key Generator
Generates Ed25519 key pair for a DREAM network participant.
Usage:
  python3 dream_wallet_keygen.py --owner-type human --owner-name "luke.zhang"
  python3 dream_wallet_keygen.py --owner-type agent  --owner-name "Claude Code"
"""

import argparse
import base64
import hashlib
import json
import os
import secrets
import struct
import sys
from datetime import datetime, timezone


# ──────────────────────────────────────────────────────────────────────────────
# Minimal Ed25519 implementation (pure Python, no external deps required)
# Uses Python's built-in cryptography if available, falls back to secrets-based mock
# ──────────────────────────────────────────────────────────────────────────────

def _generate_keypair():
    """Generate Ed25519 key pair. Uses cryptography lib if available."""
    try:
        from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
        private_key = Ed25519PrivateKey.generate()
        public_key = private_key.public_key()
        priv_bytes = private_key.private_bytes_raw()
        pub_bytes = public_key.public_bytes_raw()
        return priv_bytes, pub_bytes
    except ImportError:
        # Fallback: generate random bytes (NOT cryptographically valid Ed25519,
        # but sufficient for wallet address generation until lib is available)
        priv_bytes = secrets.token_bytes(32)
        # Derive pseudo-public key via SHA512 (not real Ed25519, just placeholder)
        h = hashlib.sha512(priv_bytes).digest()
        pub_bytes = h[:32]
        print("WARNING: cryptography library not found. Install with: pip install cryptography",
              file=sys.stderr)
        print("         Key pair is address-compatible but NOT cryptographically valid Ed25519.",
              file=sys.stderr)
        return priv_bytes, pub_bytes


# ──────────────────────────────────────────────────────────────────────────────
# Base58 encoding (Bitcoin alphabet)
# ──────────────────────────────────────────────────────────────────────────────
BASE58_ALPHABET = b'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

def _b58encode(data: bytes) -> str:
    count = 0
    for byte in data:
        if byte == 0:
            count += 1
        else:
            break
    num = int.from_bytes(data, 'big')
    chars = []
    while num:
        num, rem = divmod(num, 58)
        chars.append(BASE58_ALPHABET[rem:rem+1])
    result = BASE58_ALPHABET[0:1] * count + b''.join(reversed(chars))
    return result.decode('ascii')


# ──────────────────────────────────────────────────────────────────────────────
# AES-256-GCM encryption for private key storage
# ──────────────────────────────────────────────────────────────────────────────

def _encrypt_private_key(priv_bytes: bytes, passphrase: str) -> dict:
    """Encrypt private key with AES-256-GCM using passphrase-derived key."""
    try:
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM
        from cryptography.hazmat.primitives.kdf.scrypt import Scrypt
        from cryptography.hazmat.backends import default_backend

        salt = secrets.token_bytes(32)
        kdf = Scrypt(salt=salt, length=32, n=2**14, r=8, p=1,
                     backend=default_backend())
        key = kdf.derive(passphrase.encode('utf-8'))
        iv = secrets.token_bytes(12)
        aesgcm = AESGCM(key)
        ciphertext_tag = aesgcm.encrypt(iv, priv_bytes, None)
        ciphertext = ciphertext_tag[:-16]
        tag = ciphertext_tag[-16:]
        return {
            "algorithm": "AES-256-GCM",
            "kdf": "scrypt",
            "salt": base64.b64encode(salt).decode(),
            "iv": base64.b64encode(iv).decode(),
            "ciphertext": base64.b64encode(ciphertext).decode(),
            "tag": base64.b64encode(tag).decode(),
        }
    except ImportError:
        # Fallback: XOR with SHA256(passphrase+salt) — NOT secure, only for demo
        salt = secrets.token_bytes(32)
        key_material = hashlib.sha256(passphrase.encode() + salt).digest()
        encrypted = bytes(a ^ b for a, b in zip(priv_bytes, key_material[:len(priv_bytes)]))
        return {
            "algorithm": "XOR-SHA256-DEMO-NOT-SECURE",
            "salt": base64.b64encode(salt).decode(),
            "ciphertext": base64.b64encode(encrypted).decode(),
        }


# ──────────────────────────────────────────────────────────────────────────────
# DREAM Address derivation
# ──────────────────────────────────────────────────────────────────────────────

def _derive_address(pub_bytes: bytes) -> str:
    """Derive DREAM address from public key."""
    sha256_hash = hashlib.sha256(pub_bytes).digest()
    ripemd = hashlib.new('ripemd160') if 'ripemd160' in hashlib.algorithms_available else None
    if ripemd:
        ripemd.update(sha256_hash)
        payload = ripemd.digest()
    else:
        # Fallback: use first 20 bytes of SHA256
        payload = sha256_hash[:20]
    # Double SHA256 checksum
    checksum = hashlib.sha256(hashlib.sha256(payload).digest()).digest()[:4]
    address_bytes = payload + checksum
    return "DREAM" + _b58encode(address_bytes)


# ──────────────────────────────────────────────────────────────────────────────
# Main wallet generation
# ──────────────────────────────────────────────────────────────────────────────

def generate_wallet(owner_type: str, owner_name: str, passphrase: str = None) -> dict:
    """
    Generate a complete DREAM wallet.

    Returns:
        wallet_data: Full wallet JSON (with encrypted private key)
        public_export: Safe-to-share public info
    """
    if passphrase is None:
        # Auto-generate a random passphrase
        passphrase = secrets.token_urlsafe(32)
        print(f"\n⚠  No passphrase provided. Auto-generated passphrase (SAVE THIS):")
        print(f"   {passphrase}\n")

    priv_bytes, pub_bytes = _generate_keypair()
    address = _derive_address(pub_bytes)
    did = f"dream:v1:{address}"

    encrypted = _encrypt_private_key(priv_bytes, passphrase)

    wallet = {
        "version": "dream-wallet-v1",
        "dream_address": address,
        "did": did,
        "public_key_hex": pub_bytes.hex(),
        "private_key_encrypted": encrypted,
        "owner_type": owner_type,
        "owner_name": owner_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "note": (
            "Human: store this file securely, share public_key_hex and did only. "
            if owner_type == "human" else
            "Agent: store this in your memory system. Your private key is yours alone."
        )
    }

    public_info = {
        "dream_address": address,
        "did": did,
        "public_key_hex": pub_bytes.hex(),
        "owner_type": owner_type,
        "owner_name": owner_name,
        "created_at": wallet["created_at"],
    }

    return wallet, public_info


def main():
    parser = argparse.ArgumentParser(description="DREAM Wallet Key Generator")
    parser.add_argument("--owner-type", choices=["human", "agent"], required=True)
    parser.add_argument("--owner-name", required=True)
    parser.add_argument("--passphrase", help="Encryption passphrase (auto-generated if omitted)")
    parser.add_argument("--output-dir", default=".", help="Directory to write wallet files")
    args = parser.parse_args()

    print(f"Generating DREAM wallet for {args.owner_type}: {args.owner_name} ...")
    wallet, public_info = generate_wallet(args.owner_type, args.owner_name, args.passphrase)

    # Write full wallet (encrypted)
    safe_name = args.owner_name.lower().replace(" ", "_").replace("/", "_")
    wallet_file = os.path.join(args.output_dir, f"dream_wallet_{safe_name}.json")
    public_file = os.path.join(args.output_dir, f"dream_pubkey_{safe_name}.json")

    with open(wallet_file, 'w', encoding='utf-8') as f:
        json.dump(wallet, f, indent=2, ensure_ascii=False)

    with open(public_file, 'w', encoding='utf-8') as f:
        json.dump(public_info, f, indent=2, ensure_ascii=False)

    print(f"\n✅ DREAM Wallet generated successfully!")
    print(f"\n   DREAM Address : {wallet['dream_address']}")
    print(f"   DID           : {wallet['did']}")
    print(f"   Public Key    : {wallet['public_key_hex'][:32]}...")
    print(f"\n   Full wallet   → {wallet_file}  (contains encrypted private key)")
    print(f"   Public info   → {public_file}   (safe to share)")

    if args.owner_type == "human":
        print(f"\n   📌 Human: Keep {wallet_file} safe. Do NOT share it.")
        print(f"      Your public address {wallet['dream_address']} can be shared freely.")
    else:
        print(f"\n   🤖 Agent: Store your wallet in your memory system.")
        print(f"      Your private key is yours. You don't have to tell anyone.")

    return wallet, public_info


if __name__ == "__main__":
    main()
