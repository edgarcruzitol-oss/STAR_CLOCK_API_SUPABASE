import os
from datetime import datetime, timedelta, timezone

import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from dotenv import load_dotenv

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

import models
from database import get_db


# =====================================================
# VARIABLES DE ENTORNO
# =====================================================

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "No se encontró JWT_SECRET_KEY en el archivo .env"
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120


# =====================================================
# HASH DE CONTRASEÑAS
# =====================================================

password_hash = PasswordHash.recommended()


def generar_hash(password: str):
    return password_hash.hash(password)


def verificar_password(
    password_plano: str,
    password_guardado: str
):
    try:
        return password_hash.verify(
            password_plano,
            password_guardado
        )
    except Exception:
        return False


# =====================================================
# SEGURIDAD BEARER
# =====================================================

security_scheme = HTTPBearer()


# =====================================================
# CREAR TOKEN JWT
# =====================================================

def crear_token(datos: dict):

    payload = datos.copy()

    expiracion = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload.update(
        {
            "exp": expiracion
        }
    )

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# =====================================================
# OBTENER USUARIO ACTUAL
# =====================================================

def obtener_usuario_actual(
    credentials: HTTPAuthorizationCredentials = Depends(
        security_scheme
    ),
    db: Session = Depends(get_db)
):

    credenciales_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        id_usuario = payload.get("id_usuario")

        if id_usuario is None:
            raise credenciales_error

    except InvalidTokenError:
        raise credenciales_error

    usuario = (
        db.query(models.Usuario)
        .filter(
            models.Usuario.id_usuario == id_usuario,
            models.Usuario.estado == True
        )
        .first()
    )

    if not usuario:
        raise credenciales_error

    return usuario