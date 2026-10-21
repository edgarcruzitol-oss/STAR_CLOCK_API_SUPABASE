from pydantic import BaseModel
from typing import List, Optional
from decimal import Decimal
from datetime import datetime


# =====================================================
# USUARIOS
# =====================================================

class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    nombre_usuario: str
    password: str
    rol: str = "vendedor"


class UsuarioUpdate(BaseModel):
    nombre: str
    apellido: str
    nombre_usuario: str
    password: Optional[str] = None
    rol: str


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


class ProductoUpdate(BaseModel):
    codigo_producto: str
    nombre_producto: str
    descripcion: Optional[str] = None
    stock_minimo: int = 0


class ProductoOut(ProductoBase):
    id_producto: int
    estado: bool

    class Config:
        from_attributes = True


# =====================================================
# PROVEEDORES
# =====================================================

class ProveedorCreate(BaseModel):
    nombre_proveedor: str
    nit: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None


class ProveedorUpdate(BaseModel):
    nombre_proveedor: str
    nit: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None


class ProveedorOut(BaseModel):
    id_proveedor: int
    nombre_proveedor: str
    nit: str
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    estado: bool

    class Config:
        from_attributes = True


# =====================================================
# CLIENTES
# =====================================================

class ClienteCreate(BaseModel):
    nombre: str
    apellido: Optional[str] = None
    ci_nit: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None


class ClienteUpdate(BaseModel):
    nombre: str
    apellido: Optional[str] = None
    ci_nit: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None


class ClienteOut(BaseModel):
    id_cliente: int
    nombre: str
    apellido: Optional[str] = None
    ci_nit: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    estado: bool

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


class StockAjuste(BaseModel):
    cantidad: int


# =====================================================
# COMPRAS
# =====================================================

class CompraItemCreate(BaseModel):
    id_producto: int
    cantidad: int
    precio_compra: Decimal
    precio_venta: Decimal


class CompraCreate(BaseModel):
    id_proveedor: int
    descripcion: Optional[str] = None
    items: List[CompraItemCreate]


class CompraOut(BaseModel):
    id_compra: int
    id_proveedor: int
    id_usuario: int
    fecha_compra: datetime
    descripcion: Optional[str] = None
    total_compra: Decimal
    estado: bool

    class Config:
        from_attributes = True


class DetalleCompraOut(BaseModel):
    id_detallecompra: int
    id_compra: int
    id_producto: int
    cantidad: int
    precio_compra: Decimal
    precio_venta: Decimal

    class Config:
        from_attributes = True


class CompraDetalleOut(BaseModel):
    compra: CompraOut
    detalles: List[DetalleCompraOut]


# =====================================================
# VENTAS
# =====================================================

class VentaItemCreate(BaseModel):
    id_producto: int
    cantidad: int
    descuento: Decimal = Decimal("0.00")


class VentaCreate(BaseModel):
    id_cliente: Optional[int] = None
    nombre_cliente_recibo: Optional[str] = None
    items: List[VentaItemCreate]


class VentaOut(BaseModel):
    id_venta: int
    id_cliente: Optional[int] = None
    id_usuario: int
    nombre_cliente_recibo: Optional[str] = None
    fecha_venta: datetime
    total_venta: Decimal
    estado: bool

    class Config:
        from_attributes = True


class DetalleVentaOut(BaseModel):
    id_detalleventa: int
    id_venta: int
    id_producto: int
    cantidad: int
    precio_unitario: Decimal
    descuento: Decimal

    class Config:
        from_attributes = True


class VentaDetalleOut(BaseModel):
    venta: VentaOut
    detalles: List[DetalleVentaOut]


# =====================================================
# RESPUESTAS GENERALES
# =====================================================

class MensajeResponse(BaseModel):
    mensaje: str


# =====================================================
# AUTENTICACIÓN
# =====================================================

class LoginRequest(BaseModel):
    nombre_usuario: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    usuario: str
    rol: str