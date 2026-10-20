from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime


# =====================================================
# USUARIOS
# =====================================================

class UsuarioOut(BaseModel):
    id_usuario: int
    nombre: str
    apellido: str
    nombre_usuario: str
    rol: str
    estado: bool

    class Config:
        from_attributes = True


# =====================================================
# PRODUCTOS
# =====================================================

class ProductoBase(BaseModel):
    codigo_producto: str
    nombre_producto: str
    descripcion: Optional[str] = None
    stock_minimo: int = 0


class ProductoCreate(ProductoBase):
    pass


class ProductoOut(ProductoBase):
    id_producto: int
    estado: bool

    class Config:
        from_attributes = True


# =====================================================
# PROVEEDORES
# =====================================================

class ProveedorOut(BaseModel):
    id_proveedor: int
    nombre_proveedor: str
    nit: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None

    class Config:
        from_attributes = True


# =====================================================
# CLIENTES
# =====================================================

class ClienteOut(BaseModel):
    id_cliente: int
    nombre: str
    apellido: Optional[str] = None
    ci_nit: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True


# =====================================================
# STOCK
# =====================================================

class StockOut(BaseModel):
    id_stock: int
    id_producto: int
    precio_compra: Decimal
    precio_venta: Decimal
    cantidad_ingreso: int
    cantidad_egreso: int
    cantidad: int

    class Config:
        from_attributes = True


# =====================================================
# VENTAS
# =====================================================

class VentaItemCreate(BaseModel):
    id_producto: int
    cantidad: int
    descuento: Decimal = 0


class VentaCreate(BaseModel):
    id_cliente: Optional[int] = None
    id_usuario: int
    nombre_cliente_recibo: Optional[str] = None
    items: List[VentaItemCreate]


class VentaOut(BaseModel):
    id_venta: int
    id_cliente: Optional[int]
    id_usuario: int
    nombre_cliente_recibo: Optional[str]
    fecha_venta: datetime
    total_venta: Decimal
    estado: bool

    class Config:
        from_attributes = True