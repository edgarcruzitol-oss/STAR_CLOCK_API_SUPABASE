from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    nombre_usuario = Column(String(100), unique=True, nullable=False)
    contrasena_hash = Column(String(255), nullable=False)
    rol = Column(String(30), nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())
    estado = Column(Boolean, default=True)


class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)
    codigo_producto = Column(String(20), unique=True, nullable=False)
    nombre_producto = Column(String(100), nullable=False)
    descripcion = Column(String(300))
    stock_minimo = Column(Integer, default=0)
    estado = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())


class Proveedor(Base):
    __tablename__ = "proveedores"

    id_proveedor = Column(Integer, primary_key=True, index=True)
    nombre_proveedor = Column(String(150), nullable=False)
    nit = Column(String(30), unique=True, nullable=False)
    telefono = Column(String(20))
    email = Column(String(100))
    direccion = Column(String(200))
    estado = Column(Boolean, default=True)
    fecha_creacion = Column(DateTime, server_default=func.now())


class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100))
    ci_nit = Column(String(30))
    telefono = Column(String(20))
    email = Column(String(100))
    estado = Column(Boolean, default=True)
    fecha_registro = Column(DateTime, server_default=func.now())


class Compra(Base):
    __tablename__ = "compras"

    id_compra = Column(Integer, primary_key=True, index=True)
    id_proveedor = Column(
        Integer,
        ForeignKey("proveedores.id_proveedor"),
        nullable=False
    )
    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    fecha_compra = Column(DateTime, server_default=func.now())
    descripcion = Column(String(300))
    total_compra = Column(Numeric(18, 2), default=0)
    estado = Column(Boolean, default=True)


class DetalleCompra(Base):
    __tablename__ = "detalle_compra"

    id_detallecompra = Column(Integer, primary_key=True, index=True)

    id_compra = Column(
        Integer,
        ForeignKey("compras.id_compra"),
        nullable=False
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto"),
        nullable=False
    )

    cantidad = Column(Integer, nullable=False)
    precio_compra = Column(Numeric(18, 2), nullable=False)
    precio_venta = Column(Numeric(18, 2), nullable=False)


class Stock(Base):
    __tablename__ = "stock"

    id_stock = Column(Integer, primary_key=True, index=True)

    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto"),
        unique=True,
        nullable=False
    )

    precio_compra = Column(Numeric(18, 2), default=0)
    precio_venta = Column(Numeric(18, 2), default=0)

    cantidad_ingreso = Column(Integer, default=0)
    cantidad_egreso = Column(Integer, default=0)
    cantidad = Column(Integer, default=0)

    fecha_ultimaactualizacion = Column(
        DateTime,
        server_default=func.now()
    )


class Venta(Base):
    __tablename__ = "ventas"

    id_venta = Column(Integer, primary_key=True, index=True)

    id_cliente = Column(
        Integer,
        ForeignKey("clientes.id_cliente"),
        nullable=True
    )

    id_usuario = Column(
        Integer,
        ForeignKey("usuarios.id_usuario"),
        nullable=False
    )

    nombre_cliente_recibo = Column(String(150))
    fecha_venta = Column(DateTime, server_default=func.now())
    total_venta = Column(Numeric(18, 2), default=0)
    estado = Column(Boolean, default=True)


class DetalleVenta(Base):
    __tablename__ = "detalle_venta"

    id_detalleventa = Column(Integer, primary_key=True, index=True)

    id_venta = Column(
        Integer,
        ForeignKey("ventas.id_venta"),
        nullable=False
    )

    id_producto = Column(
        Integer,
        ForeignKey("productos.id_producto"),
        nullable=False
    )

    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(18, 2), nullable=False)
    descuento = Column(Numeric(18, 2), default=0)