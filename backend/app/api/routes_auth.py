from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User
from app.core.security import hash_password, verify_password, generate_session_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Schemas
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "Peneliti / Mahasiswa Budaya"

class LoginRequest(BaseModel):
    identifier: str  # username or email
    password: str

class AuthResponse(BaseModel):
    status: str
    message: str
    token: str
    user: dict

def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Mengambil user berdasarkan header Bearer token jika disediakan."""
    if not authorization or not db:
        return None
    try:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
            user = db.query(User).filter(User.session_token == token).first()
            return user
    except Exception:
        pass
    return None

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Mengambil user aktif dan melempar error 401 jika tidak terautentikasi."""
    user = get_current_user_optional(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentikasi diperlukan. Silakan masuk terlebih dahulu."
        )
    return user

@router.post("/register", response_model=AuthResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    """Mendaftar akun baru dan langsung menghasilkan token sesi."""
    if not db:
        raise HTTPException(status_code=500, detail="Database belum terhubung.")

    clean_username = req.username.strip().lower()
    clean_email = req.email.strip().lower()

    if len(clean_username) < 3:
        raise HTTPException(status_code=400, detail="Username minimal 3 karakter.")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Kata sandi minimal 6 karakter.")

    # Cek duplikasi
    existing_user = db.query(User).filter(
        (User.username == clean_username) | (User.email == clean_email)
    ).first()
    if existing_user:
        if existing_user.username == clean_username:
            raise HTTPException(status_code=400, detail="Username sudah digunakan.")
        else:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar.")

    # Buat user baru
    token = generate_session_token()
    new_user = User(
        username=clean_username,
        email=clean_email,
        full_name=req.full_name.strip() if req.full_name else clean_username,
        password_hash=hash_password(req.password),
        role=req.role or "Peneliti / Mahasiswa Budaya",
        session_token=token
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return AuthResponse(
        status="success",
        message="Pendaftaran akun berhasil.",
        token=token,
        user=new_user.to_dict()
    )

@router.post("/login", response_model=AuthResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Masuk menggunakan username atau email dan kata sandi."""
    if not db:
        raise HTTPException(status_code=500, detail="Database belum terhubung.")

    clean_id = req.identifier.strip().lower()
    user = db.query(User).filter(
        (User.username == clean_id) | (User.email == clean_id)
    ).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Username/email atau kata sandi tidak sesuai.")

    # Perbarui session token
    token = generate_session_token()
    user.session_token = token
    db.commit()

    return AuthResponse(
        status="success",
        message="Berhasil masuk.",
        token=token,
        user=user.to_dict()
    )

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Mengambil informasi akun pengguna yang sedang aktif."""
    return {
        "status": "success",
        "user": current_user.to_dict()
    }

@router.post("/logout")
def logout(current_user: Optional[User] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Keluar dan mencabut token sesi."""
    if current_user and db:
        current_user.session_token = None
        db.commit()
    return {"status": "success", "message": "Berhasil keluar."}
