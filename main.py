from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

import models
import schemas

from database import get_db


app = FastAPI(
    title="STAR CLOCK API - Supabase",
    version="1.0.0",
    description="API MVP de compra, venta e inventario"
)


# =====================================================
# INICIO
# =====================================================

@app.get("/")
def inicio():
    return {
        "mensaje": "STAR CLOCK API funcionando correctamente"
    }


# =====================================================
# PRODUCTOS
# =====================================================

@app.get(
    "/api/v1/productos",
    response_model=List[schemas.ProductoOut],
    tags=["Productos"]
)
def listar_productos(db: Session = Depends(get_db)):
    productos = db.query(models.Producto).all()
    return productos


@app.post(
    "/api/v1/productos",
    response_model=schemas.ProductoOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Productos"]
)
def crear_producto(
    producto: schemas.ProductoCreate,
    db: Session = Depends(get_db)
):
    existente = (
        db.query(models.Producto)
        .filter(
            models.Producto.codigo_producto
            == producto.codigo_producto
        )
        .first()
    )

    if existente:
        raise HTTPException(
            status_code=400,
            detail="El código del producto ya existe"
        )

    nuevo_producto = models.Producto(
        codigo_producto=producto.codigo_producto,
        nombre_producto=producto.nombre_producto,
        descripcion=producto.descripcion,
        stock_minimo=producto.stock_minimo,
        estado=True
    )

    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)

    return nuevo_producto


# =====================================================
# STOCK
# =====================================================

@app.get(
    "/api/v1/stock",
    response_model=List[schemas.StockOut],
    tags=["Inventario"]
)
def listar_stock(db: Session = Depends(get_db)):
    stock = db.query(models.Stock).all()
    return stock


# =====================================================
# USUARIOS
# =====================================================

@app.get(
    "/api/v1/usuarios",
    response_model=List[schemas.UsuarioOut],
    tags=["Usuarios"]
)
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(models.Usuario).all()
    return usuarios


# =====================================================
# PROVEEDORES
# =====================================================

@app.get(
    "/api/v1/proveedores",
    response_model=List[schemas.ProveedorOut],
    tags=["Proveedores"]
)
def listar_proveedores(db: Session = Depends(get_db)):
    proveedores = db.query(models.Proveedor).all()
    return proveedores


# =====================================================
# CLIENTES
# =====================================================

@app.get(
    "/api/v1/clientes",
    response_model=List[schemas.ClienteOut],
    tags=["Clientes"]
)
def listar_clientes(db: Session = Depends(get_db)):
    clientes = db.query(models.Cliente).all()
    return clientes


# =====================================================
# VENTAS
# =====================================================

@app.post(
    "/api/v1/ventas",
    response_model=schemas.VentaOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Ventas"]
)
def registrar_venta(
    venta: schemas.VentaCreate,
    db: Session = Depends(get_db)
):

    if not venta.items:
        raise HTTPException(
            status_code=400,
            detail="La venta debe contener productos"
        )

    total_venta = Decimal("0.00")
    detalles = []

    try:

        usuario = (
            db.query(models.Usuario)
            .filter(
                models.Usuario.id_usuario
                == venta.id_usuario
            )
            .first()
        )

        if not usuario:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado"
            )

        if venta.id_cliente is not None:
            cliente = (
                db.query(models.Cliente)
                .filter(
                    models.Cliente.id_cliente
                    == venta.id_cliente
                )
                .first()
            )

            if not cliente:
                raise HTTPException(
                    status_code=404,
                    detail="Cliente no encontrado"
                )

        for item in venta.items:

            producto = (
                db.query(models.Producto)
                .filter(
                    models.Producto.id_producto
                    == item.id_producto
                )
                .first()
            )

            if not producto:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Producto {item.id_producto} "
                        "no encontrado"
                    )
                )

            stock = (
                db.query(models.Stock)
                .filter(
                    models.Stock.id_producto
                    == item.id_producto
                )
                .first()
            )

            if not stock:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"No existe stock para el producto "
                        f"{producto.nombre_producto}"
                    )
                )

            if item.cantidad <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="La cantidad debe ser mayor a 0"
                )

            if stock.cantidad < item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Stock insuficiente para "
                        f"{producto.nombre_producto}. "
                        f"Disponible: {stock.cantidad}"
                    )
                )

            precio = Decimal(stock.precio_venta)

            subtotal_bruto = (
                precio * item.cantidad
            )

            descuento = Decimal(item.descuento)

            if descuento < 0:
                raise HTTPException(
                    status_code=400,
                    detail="El descuento no puede ser negativo"
                )

            if descuento > subtotal_bruto:
                raise HTTPException(
                    status_code=400,
                    detail="El descuento supera el subtotal"
                )

            subtotal = subtotal_bruto - descuento

            total_venta += subtotal

            detalles.append(
                {
                    "producto": producto,
                    "stock": stock,
                    "cantidad": item.cantidad,
                    "precio": precio,
                    "descuento": descuento
                }
            )

        nueva_venta = models.Venta(
            id_cliente=venta.id_cliente,
            id_usuario=venta.id_usuario,
            nombre_cliente_recibo=venta.nombre_cliente_recibo,
            total_venta=total_venta,
            estado=True
        )

        db.add(nueva_venta)

        # Obtiene el ID sin hacer commit todavía
        db.flush()

        for detalle in detalles:

            nuevo_detalle = models.DetalleVenta(
                id_venta=nueva_venta.id_venta,
                id_producto=detalle["producto"].id_producto,
                cantidad=detalle["cantidad"],
                precio_unitario=detalle["precio"],
                descuento=detalle["descuento"]
            )

            db.add(nuevo_detalle)

            # Descuento de inventario
            detalle["stock"].cantidad -= detalle["cantidad"]
            detalle["stock"].cantidad_egreso += detalle["cantidad"]

        # Todo se confirma junto
        db.commit()

        db.refresh(nueva_venta)

        return nueva_venta

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al registrar la venta: {str(e)}"
        )