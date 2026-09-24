import hashlib
import os
import secrets
import hmac

def hash_password(password: str) -> str:
    """Menghasilkan hash aman untuk kata sandi menggunakan PBKDF2-HMAC-SHA256."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt,
        100000
    )
    # Format: salt_hex$key_hex
    return f"{salt.hex()}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Memverifikasi kecocokan kata sandi dengan hash tersimpan."""
    try:
        salt_hex, key_hex = hashed_password.split('$')
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        key = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt,
            100000
        )
        return hmac.compare_digest(key, expected_key)
    except Exception:
        return False

def generate_session_token() -> str:
    """Menghasilkan token sesi autentikasi yang aman."""
    return secrets.token_hex(32)
