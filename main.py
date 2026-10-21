from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

import models
import schemas
import security

from database import get_db


# =====================================================
# APP
# =====================================================

app = FastAPI(
    title="STAR CLOCK API - Supabase",
    version="2.0.0",
    description=(
        "API completa de compra, venta e inventario "
        "con autenticación JWT y operaciones CRUD"
    )
)

# =====================================================
# CORS
# =====================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://star-clock-frontend.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# INICIO
# =====================================================

@app.get("/", tags=["Inicio"])
def inicio():
    return {
        "mensaje": "STAR CLOCK API funcionando correctamente"
    }


# =====================================================
# AUTENTICACIÓN
# =====================================================

@app.post(
    "/api/v1/auth/login",
    response_model=schemas.TokenResponse,
    tags=["Seguridad"]
)
def login(
    datos: schemas.LoginRequest,
    db: Session = Depends(get_db)
):

    usuario = (
        db.query(models.Usuario)
        .filter(
            models.Usuario.nombre_usuario == datos.nombre_usuario,
            models.Usuario.estado == True
        )
        .first()
    )

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    if not security.verificar_password(
        datos.password,
        usuario.contrasena_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    token = security.crear_token(
        {
            "id_usuario": usuario.id_usuario,
            "sub": usuario.nombre_usuario,
            "rol": usuario.rol
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": usuario.nombre_usuario,
        "rol": usuario.rol
    }


# =====================================================
# PRODUCTOS
# =====================================================

@app.get(
    "/api/v1/productos",
    response_model=List[schemas.ProductoOut],
    tags=["Productos"]
)
def listar_productos(
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Producto)
        .order_by(models.Producto.id_producto)
        .all()
    )


@app.get(
    "/api/v1/productos/{id_producto}",
    response_model=schemas.ProductoOut,
    tags=["Productos"]
)
def obtener_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    producto = (
        db.query(models.Producto)
        .filter(
            models.Producto.id_producto == id_producto
        )
        .first()
    )

    if not producto:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return producto


@app.post(
    "/api/v1/productos",
    response_model=schemas.ProductoOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Productos"]
)
def crear_producto(
    producto: schemas.ProductoCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
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

    nuevo = models.Producto(
        codigo_producto=producto.codigo_producto,
        nombre_producto=producto.nombre_producto,
        descripcion=producto.descripcion,
        stock_minimo=producto.stock_minimo,
        estado=True
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return nuevo


@app.put(
    "/api/v1/productos/{id_producto}",
    response_model=schemas.ProductoOut,
    tags=["Productos"]
)
def editar_producto(
    id_producto: int,
    datos: schemas.ProductoUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    producto = (
        db.query(models.Producto)
        .filter(
            models.Producto.id_producto == id_producto
        )
        .first()
    )

    if not producto:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    duplicado = (
        db.query(models.Producto)
        .filter(
            models.Producto.codigo_producto
            == datos.codigo_producto,
            models.Producto.id_producto
            != id_producto
        )
        .first()
    )

    if duplicado:
        raise HTTPException(
            status_code=400,
            detail="El código del producto ya existe"
        )

    producto.codigo_producto = datos.codigo_producto
    producto.nombre_producto = datos.nombre_producto
    producto.descripcion = datos.descripcion
    producto.stock_minimo = datos.stock_minimo

    db.commit()
    db.refresh(producto)

    return producto


@app.delete(
    "/api/v1/productos/{id_producto}",
    response_model=schemas.MensajeResponse,
    tags=["Productos"]
)
def desactivar_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    producto = db.get(
        models.Producto,
        id_producto
    )

    if not producto:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    producto.estado = False

    db.commit()

    return {
        "mensaje": "Producto desactivado correctamente"
    }


@app.patch(
    "/api/v1/productos/{id_producto}/activar",
    response_model=schemas.MensajeResponse,
    tags=["Productos"]
)
def activar_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    producto = db.get(
        models.Producto,
        id_producto
    )

    if not producto:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    producto.estado = True

    db.commit()

    return {
        "mensaje": "Producto activado correctamente"
    }


# =====================================================
# PROVEEDORES
# =====================================================

@app.get(
    "/api/v1/proveedores",
    response_model=List[schemas.ProveedorOut],
    tags=["Proveedores"]
)
def listar_proveedores(
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Proveedor)
        .order_by(models.Proveedor.id_proveedor)
        .all()
    )


@app.get(
    "/api/v1/proveedores/{id_proveedor}",
    response_model=schemas.ProveedorOut,
    tags=["Proveedores"]
)
def obtener_proveedor(
    id_proveedor: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    proveedor = db.get(
        models.Proveedor,
        id_proveedor
    )

    if not proveedor:
        raise HTTPException(
            status_code=404,
            detail="Proveedor no encontrado"
        )

    return proveedor


@app.post(
    "/api/v1/proveedores",
    response_model=schemas.ProveedorOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Proveedores"]
)
def crear_proveedor(
    proveedor: schemas.ProveedorCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    existente = (
        db.query(models.Proveedor)
        .filter(
            models.Proveedor.nit == proveedor.nit
        )
        .first()
    )

    if existente:
        raise HTTPException(
            status_code=400,
            detail="El NIT del proveedor ya existe"
        )

    nuevo = models.Proveedor(
        nombre_proveedor=proveedor.nombre_proveedor,
        nit=proveedor.nit,
        telefono=proveedor.telefono,
        email=proveedor.email,
        direccion=proveedor.direccion,
        estado=True
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return nuevo


@app.put(
    "/api/v1/proveedores/{id_proveedor}",
    response_model=schemas.ProveedorOut,
    tags=["Proveedores"]
)
def editar_proveedor(
    id_proveedor: int,
    datos: schemas.ProveedorUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    proveedor = db.get(
        models.Proveedor,
        id_proveedor
    )

    if not proveedor:
        raise HTTPException(
            status_code=404,
            detail="Proveedor no encontrado"
        )

    duplicado = (
        db.query(models.Proveedor)
        .filter(
            models.Proveedor.nit == datos.nit,
            models.Proveedor.id_proveedor
            != id_proveedor
        )
        .first()
    )

    if duplicado:
        raise HTTPException(
            status_code=400,
            detail="El NIT ya pertenece a otro proveedor"
        )

    proveedor.nombre_proveedor = (
        datos.nombre_proveedor
    )

    proveedor.nit = datos.nit
    proveedor.telefono = datos.telefono
    proveedor.email = datos.email
    proveedor.direccion = datos.direccion

    db.commit()
    db.refresh(proveedor)

    return proveedor


@app.delete(
    "/api/v1/proveedores/{id_proveedor}",
    response_model=schemas.MensajeResponse,
    tags=["Proveedores"]
)
def desactivar_proveedor(
    id_proveedor: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    proveedor = db.get(
        models.Proveedor,
        id_proveedor
    )

    if not proveedor:
        raise HTTPException(
            status_code=404,
            detail="Proveedor no encontrado"
        )

    proveedor.estado = False

    db.commit()

    return {
        "mensaje": "Proveedor desactivado correctamente"
    }


@app.patch(
    "/api/v1/proveedores/{id_proveedor}/activar",
    response_model=schemas.MensajeResponse,
    tags=["Proveedores"]
)
def activar_proveedor(
    id_proveedor: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    proveedor = db.get(
        models.Proveedor,
        id_proveedor
    )

    if not proveedor:
        raise HTTPException(
            status_code=404,
            detail="Proveedor no encontrado"
        )

    proveedor.estado = True

    db.commit()

    return {
        "mensaje": "Proveedor activado correctamente"
    }


# =====================================================
# CLIENTES
# =====================================================

@app.get(
    "/api/v1/clientes",
    response_model=List[schemas.ClienteOut],
    tags=["Clientes"]
)
def listar_clientes(
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Cliente)
        .order_by(models.Cliente.id_cliente)
        .all()
    )


@app.get(
    "/api/v1/clientes/{id_cliente}",
    response_model=schemas.ClienteOut,
    tags=["Clientes"]
)
def obtener_cliente(
    id_cliente: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    cliente = db.get(
        models.Cliente,
        id_cliente
    )

    if not cliente:
        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado"
        )

    return cliente


@app.post(
    "/api/v1/clientes",
    response_model=schemas.ClienteOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Clientes"]
)
def crear_cliente(
    cliente: schemas.ClienteCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    nuevo = models.Cliente(
        nombre=cliente.nombre,
        apellido=cliente.apellido,
        ci_nit=cliente.ci_nit,
        telefono=cliente.telefono,
        email=cliente.email,
        estado=True
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return nuevo


@app.put(
    "/api/v1/clientes/{id_cliente}",
    response_model=schemas.ClienteOut,
    tags=["Clientes"]
)
def editar_cliente(
    id_cliente: int,
    datos: schemas.ClienteUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    cliente = db.get(
        models.Cliente,
        id_cliente
    )

    if not cliente:
        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado"
        )

    cliente.nombre = datos.nombre
    cliente.apellido = datos.apellido
    cliente.ci_nit = datos.ci_nit
    cliente.telefono = datos.telefono
    cliente.email = datos.email

    db.commit()
    db.refresh(cliente)

    return cliente


@app.delete(
    "/api/v1/clientes/{id_cliente}",
    response_model=schemas.MensajeResponse,
    tags=["Clientes"]
)
def desactivar_cliente(
    id_cliente: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    cliente = db.get(
        models.Cliente,
        id_cliente
    )

    if not cliente:
        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado"
        )

    cliente.estado = False

    db.commit()

    return {
        "mensaje": "Cliente desactivado correctamente"
    }


@app.patch(
    "/api/v1/clientes/{id_cliente}/activar",
    response_model=schemas.MensajeResponse,
    tags=["Clientes"]
)
def activar_cliente(
    id_cliente: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    cliente = db.get(
        models.Cliente,
        id_cliente
    )

    if not cliente:
        raise HTTPException(
            status_code=404,
            detail="Cliente no encontrado"
        )

    cliente.estado = True

    db.commit()

    return {
        "mensaje": "Cliente activado correctamente"
    }


# =====================================================
# USUARIOS
# =====================================================

@app.get(
    "/api/v1/usuarios",
    response_model=List[schemas.UsuarioOut],
    tags=["Usuarios"]
)
def listar_usuarios(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):
    return (
        db.query(models.Usuario)
        .order_by(models.Usuario.id_usuario)
        .all()
    )


@app.get(
    "/api/v1/usuarios/{id_usuario}",
    response_model=schemas.UsuarioOut,
    tags=["Usuarios"]
)
def obtener_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    usuario = db.get(
        models.Usuario,
        id_usuario
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return usuario


@app.post(
    "/api/v1/usuarios",
    response_model=schemas.UsuarioOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Usuarios"]
)
def crear_usuario(
    datos: schemas.UsuarioCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    if usuario_actual.rol.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo el administrador puede crear usuarios"
        )

    existente = (
        db.query(models.Usuario)
        .filter(
            models.Usuario.nombre_usuario
            == datos.nombre_usuario
        )
        .first()
    )

    if existente:
        raise HTTPException(
            status_code=400,
            detail="El nombre de usuario ya existe"
        )

    nuevo = models.Usuario(
        nombre=datos.nombre,
        apellido=datos.apellido,
        nombre_usuario=datos.nombre_usuario,
        contrasena_hash=security.generar_hash(
            datos.password
        ),
        rol=datos.rol,
        estado=True
    )

    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return nuevo


@app.put(
    "/api/v1/usuarios/{id_usuario}",
    response_model=schemas.UsuarioOut,
    tags=["Usuarios"]
)
def editar_usuario(
    id_usuario: int,
    datos: schemas.UsuarioUpdate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    if usuario_actual.rol.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo el administrador puede editar usuarios"
        )

    usuario = db.get(
        models.Usuario,
        id_usuario
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    duplicado = (
        db.query(models.Usuario)
        .filter(
            models.Usuario.nombre_usuario
            == datos.nombre_usuario,
            models.Usuario.id_usuario
            != id_usuario
        )
        .first()
    )

    if duplicado:
        raise HTTPException(
            status_code=400,
            detail="El nombre de usuario ya existe"
        )

    usuario.nombre = datos.nombre
    usuario.apellido = datos.apellido
    usuario.nombre_usuario = datos.nombre_usuario
    usuario.rol = datos.rol

    if datos.password:
        usuario.contrasena_hash = (
            security.generar_hash(
                datos.password
            )
        )

    db.commit()
    db.refresh(usuario)

    return usuario


@app.delete(
    "/api/v1/usuarios/{id_usuario}",
    response_model=schemas.MensajeResponse,
    tags=["Usuarios"]
)
def desactivar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    if usuario_actual.rol.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo el administrador puede desactivar usuarios"
        )

    if id_usuario == usuario_actual.id_usuario:
        raise HTTPException(
            status_code=400,
            detail="No puede desactivar su propio usuario"
        )

    usuario = db.get(
        models.Usuario,
        id_usuario
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario.estado = False

    db.commit()

    return {
        "mensaje": "Usuario desactivado correctamente"
    }


@app.patch(
    "/api/v1/usuarios/{id_usuario}/activar",
    response_model=schemas.MensajeResponse,
    tags=["Usuarios"]
)
def activar_usuario(
    id_usuario: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    if usuario_actual.rol.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Solo el administrador puede activar usuarios"
        )

    usuario = db.get(
        models.Usuario,
        id_usuario
    )

    if not usuario:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    usuario.estado = True

    db.commit()

    return {
        "mensaje": "Usuario activado correctamente"
    }


# =====================================================
# STOCK
# =====================================================

@app.get(
    "/api/v1/stock",
    response_model=List[schemas.StockOut],
    tags=["Inventario"]
)
def listar_stock(
    db: Session = Depends(get_db)
):
    return (
        db.query(models.Stock)
        .order_by(models.Stock.id_stock)
        .all()
    )


@app.get(
    "/api/v1/stock/{id_stock}",
    response_model=schemas.StockOut,
    tags=["Inventario"]
)
def obtener_stock(
    id_stock: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    stock = db.get(
        models.Stock,
        id_stock
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Registro de stock no encontrado"
        )

    return stock


@app.patch(
    "/api/v1/stock/{id_stock}/ajustar",
    response_model=schemas.StockOut,
    tags=["Inventario"]
)
def ajustar_stock(
    id_stock: int,
    datos: schemas.StockAjuste,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    stock = db.get(
        models.Stock,
        id_stock
    )

    if not stock:
        raise HTTPException(
            status_code=404,
            detail="Registro de stock no encontrado"
        )

    nueva_cantidad = (
        stock.cantidad + datos.cantidad
    )

    if nueva_cantidad < 0:
        raise HTTPException(
            status_code=400,
            detail="El ajuste dejaría el stock en negativo"
        )

    if datos.cantidad > 0:
        stock.cantidad_ingreso += datos.cantidad

    elif datos.cantidad < 0:
        stock.cantidad_egreso += abs(
            datos.cantidad
        )

    stock.cantidad = nueva_cantidad

    db.commit()
    db.refresh(stock)

    return stock


# =====================================================
# COMPRAS
# =====================================================

@app.get(
    "/api/v1/compras",
    response_model=List[schemas.CompraOut],
    tags=["Compras"]
)
def listar_compras(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):
    return (
        db.query(models.Compra)
        .order_by(
            models.Compra.id_compra.desc()
        )
        .all()
    )


@app.get(
    "/api/v1/compras/{id_compra}",
    response_model=schemas.CompraDetalleOut,
    tags=["Compras"]
)
def obtener_compra(
    id_compra: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    compra = db.get(
        models.Compra,
        id_compra
    )

    if not compra:
        raise HTTPException(
            status_code=404,
            detail="Compra no encontrada"
        )

    detalles = (
        db.query(models.DetalleCompra)
        .filter(
            models.DetalleCompra.id_compra
            == id_compra
        )
        .all()
    )

    return {
        "compra": compra,
        "detalles": detalles
    }


@app.post(
    "/api/v1/compras",
    response_model=schemas.CompraOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Compras"]
)
def registrar_compra(
    compra: schemas.CompraCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    if not compra.items:
        raise HTTPException(
            status_code=400,
            detail="La compra debe contener productos"
        )

    try:

        proveedor = db.get(
            models.Proveedor,
            compra.id_proveedor
        )

        if not proveedor:
            raise HTTPException(
                status_code=404,
                detail="Proveedor no encontrado"
            )

        if not proveedor.estado:
            raise HTTPException(
                status_code=400,
                detail="El proveedor está inactivo"
            )

        total_compra = Decimal("0.00")
        detalles = []

        for item in compra.items:

            producto = db.get(
                models.Producto,
                item.id_producto
            )

            if not producto:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Producto {item.id_producto} "
                        "no encontrado"
                    )
                )

            if item.cantidad <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="La cantidad debe ser mayor a 0"
                )

            if item.precio_compra <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="El precio de compra debe ser mayor a 0"
                )

            if item.precio_venta <= 0:
                raise HTTPException(
                    status_code=400,
                    detail="El precio de venta debe ser mayor a 0"
                )

            subtotal = (
                Decimal(item.precio_compra)
                * item.cantidad
            )

            total_compra += subtotal

            detalles.append(item)

        nueva_compra = models.Compra(
            id_proveedor=compra.id_proveedor,
            id_usuario=usuario_actual.id_usuario,
            descripcion=compra.descripcion,
            total_compra=total_compra,
            estado=True
        )

        db.add(nueva_compra)
        db.flush()

        for item in detalles:

            nuevo_detalle = models.DetalleCompra(
                id_compra=nueva_compra.id_compra,
                id_producto=item.id_producto,
                cantidad=item.cantidad,
                precio_compra=item.precio_compra,
                precio_venta=item.precio_venta
            )

            db.add(nuevo_detalle)

            stock = (
                db.query(models.Stock)
                .filter(
                    models.Stock.id_producto
                    == item.id_producto
                )
                .first()
            )

            if stock:

                stock.precio_compra = (
                    item.precio_compra
                )

                stock.precio_venta = (
                    item.precio_venta
                )

                stock.cantidad_ingreso += (
                    item.cantidad
                )

                stock.cantidad += (
                    item.cantidad
                )

            else:

                nuevo_stock = models.Stock(
                    id_producto=item.id_producto,
                    precio_compra=item.precio_compra,
                    precio_venta=item.precio_venta,
                    cantidad_ingreso=item.cantidad,
                    cantidad_egreso=0,
                    cantidad=item.cantidad
                )

                db.add(nuevo_stock)

        db.commit()
        db.refresh(nueva_compra)

        return nueva_compra

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Error al registrar la compra: "
                f"{str(e)}"
            )
        )


@app.patch(
    "/api/v1/compras/{id_compra}/anular",
    response_model=schemas.MensajeResponse,
    tags=["Compras"]
)
def anular_compra(
    id_compra: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    compra = db.get(
        models.Compra,
        id_compra
    )

    if not compra:
        raise HTTPException(
            status_code=404,
            detail="Compra no encontrada"
        )

    if not compra.estado:
        raise HTTPException(
            status_code=400,
            detail="La compra ya está anulada"
        )

    try:

        detalles = (
            db.query(models.DetalleCompra)
            .filter(
                models.DetalleCompra.id_compra
                == id_compra
            )
            .all()
        )

        for detalle in detalles:

            stock = (
                db.query(models.Stock)
                .filter(
                    models.Stock.id_producto
                    == detalle.id_producto
                )
                .first()
            )

            if not stock:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No existe stock para revertir "
                        f"el producto {detalle.id_producto}"
                    )
                )

            if stock.cantidad < detalle.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "No se puede anular la compra porque "
                        "parte del stock ya fue vendido"
                    )
                )

        for detalle in detalles:

            stock = (
                db.query(models.Stock)
                .filter(
                    models.Stock.id_producto
                    == detalle.id_producto
                )
                .first()
            )

            stock.cantidad -= detalle.cantidad

            stock.cantidad_ingreso -= (
                detalle.cantidad
            )

        compra.estado = False

        db.commit()

        return {
            "mensaje": "Compra anulada correctamente"
        }

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al anular compra: {str(e)}"
        )


# =====================================================
# VENTAS
# =====================================================

@app.get(
    "/api/v1/ventas",
    response_model=List[schemas.VentaOut],
    tags=["Ventas"]
)
def listar_ventas(
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):
    return (
        db.query(models.Venta)
        .order_by(
            models.Venta.id_venta.desc()
        )
        .all()
    )


@app.get(
    "/api/v1/ventas/{id_venta}",
    response_model=schemas.VentaDetalleOut,
    tags=["Ventas"]
)
def obtener_venta(
    id_venta: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    venta = db.get(
        models.Venta,
        id_venta
    )

    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Venta no encontrada"
        )

    detalles = (
        db.query(models.DetalleVenta)
        .filter(
            models.DetalleVenta.id_venta
            == id_venta
        )
        .all()
    )

    return {
        "venta": venta,
        "detalles": detalles
    }


@app.post(
    "/api/v1/ventas",
    response_model=schemas.VentaOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Ventas"]
)
def registrar_venta(
    venta: schemas.VentaCreate,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    if not venta.items:
        raise HTTPException(
            status_code=400,
            detail="La venta debe contener productos"
        )

    total_venta = Decimal("0.00")
    detalles = []

    try:

        if venta.id_cliente is not None:

            cliente = db.get(
                models.Cliente,
                venta.id_cliente
            )

            if not cliente:
                raise HTTPException(
                    status_code=404,
                    detail="Cliente no encontrado"
                )

            if not cliente.estado:
                raise HTTPException(
                    status_code=400,
                    detail="El cliente está inactivo"
                )

        for item in venta.items:

            producto = db.get(
                models.Producto,
                item.id_producto
            )

            if not producto:
                raise HTTPException(
                    status_code=404,
                    detail=(
                        f"Producto {item.id_producto} "
                        "no encontrado"
                    )
                )

            if not producto.estado:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"El producto "
                        f"{producto.nombre_producto} "
                        "está inactivo"
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
                        "No existe stock para "
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

            precio = Decimal(
                stock.precio_venta
            )

            subtotal_bruto = (
                precio * item.cantidad
            )

            descuento = Decimal(
                item.descuento
            )

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

            subtotal = (
                subtotal_bruto - descuento
            )

            total_venta += subtotal

            detalles.append({
                "producto": producto,
                "stock": stock,
                "cantidad": item.cantidad,
                "precio": precio,
                "descuento": descuento
            })

        nueva_venta = models.Venta(
            id_cliente=venta.id_cliente,

            # USUARIO TOMADO DEL JWT
            id_usuario=usuario_actual.id_usuario,

            nombre_cliente_recibo=(
                venta.nombre_cliente_recibo
            ),

            total_venta=total_venta,
            estado=True
        )

        db.add(nueva_venta)
        db.flush()

        for detalle in detalles:

            nuevo_detalle = models.DetalleVenta(
                id_venta=nueva_venta.id_venta,
                id_producto=(
                    detalle["producto"].id_producto
                ),
                cantidad=detalle["cantidad"],
                precio_unitario=detalle["precio"],
                descuento=detalle["descuento"]
            )

            db.add(nuevo_detalle)

            detalle["stock"].cantidad -= (
                detalle["cantidad"]
            )

            detalle["stock"].cantidad_egreso += (
                detalle["cantidad"]
            )

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
            detail=(
                "Error al registrar la venta: "
                f"{str(e)}"
            )
        )


@app.patch(
    "/api/v1/ventas/{id_venta}/anular",
    response_model=schemas.MensajeResponse,
    tags=["Ventas"]
)
def anular_venta(
    id_venta: int,
    db: Session = Depends(get_db),
    usuario_actual: models.Usuario = Depends(
        security.obtener_usuario_actual
    )
):

    venta = db.get(
        models.Venta,
        id_venta
    )

    if not venta:
        raise HTTPException(
            status_code=404,
            detail="Venta no encontrada"
        )

    if not venta.estado:
        raise HTTPException(
            status_code=400,
            detail="La venta ya está anulada"
        )

    try:

        detalles = (
            db.query(models.DetalleVenta)
            .filter(
                models.DetalleVenta.id_venta
                == id_venta
            )
            .all()
        )

        for detalle in detalles:

            stock = (
                db.query(models.Stock)
                .filter(
                    models.Stock.id_producto
                    == detalle.id_producto
                )
                .first()
            )

            if stock:

                stock.cantidad += (
                    detalle.cantidad
                )

                stock.cantidad_egreso -= (
                    detalle.cantidad
                )

                if stock.cantidad_egreso < 0:
                    stock.cantidad_egreso = 0

        venta.estado = False

        db.commit()

        return {
            "mensaje": "Venta anulada correctamente"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Error al anular venta: {str(e)}"
        )