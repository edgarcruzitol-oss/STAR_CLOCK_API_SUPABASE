let proveedoresCompra = [];
let productosCompra = [];
let compras = [];
let itemsCompra = [];


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await cargarProveedoresCompra();
        await cargarProductosCompra();
        await cargarCompras();

        document.getElementById(
            "formCompra"
        ).addEventListener(
            "submit",
            registrarCompra
        );
    }
);


// =====================================================
// PROVEEDORES
// =====================================================

async function cargarProveedoresCompra() {

    const respuesta = await fetch(
        API_URL + "/api/v1/proveedores"
    );

    proveedoresCompra =
        await respuesta.json();


    const select = document.getElementById(
        "proveedorCompra"
    );

    select.innerHTML = `
        <option value="">
            Seleccione proveedor
        </option>
    `;


    proveedoresCompra
        .filter(proveedor => proveedor.estado)
        .forEach(proveedor => {

            select.innerHTML += `
                <option value="${proveedor.id_proveedor}">
                    ${proveedor.nombre_proveedor}
                </option>
            `;
        });
}


// =====================================================
// PRODUCTOS
// =====================================================

async function cargarProductosCompra() {

    const respuesta = await fetch(
        API_URL + "/api/v1/productos"
    );

    productosCompra =
        await respuesta.json();


    const select = document.getElementById(
        "productoCompra"
    );

    select.innerHTML = `
        <option value="">
            Seleccione producto
        </option>
    `;


    productosCompra
        .filter(producto => producto.estado)
        .forEach(producto => {

            select.innerHTML += `
                <option value="${producto.id_producto}">
                    ${producto.codigo_producto}
                    -
                    ${producto.nombre_producto}
                </option>
            `;
        });
}


// =====================================================
// LISTAR COMPRAS
// =====================================================

async function cargarCompras() {

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/compras",
            {
                headers: headersAuth()
            }
        );

        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.detail ||
                "No se pudieron cargar las compras"
            );
        }


        compras = resultado;

        mostrarCompras();

    } catch (error) {

        console.error(error);

        document.getElementById(
            "tablaCompras"
        ).innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center text-danger"
                >
                    ${error.message}
                </td>
            </tr>
        `;
    }
}


// =====================================================
// MOSTRAR COMPRAS
// =====================================================

function mostrarCompras() {

    const tabla =
        document.getElementById(
            "tablaCompras"
        );


    tabla.innerHTML = "";


    if (compras.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="8"
                    class="text-center"
                >
                    No existen compras registradas.
                </td>
            </tr>
        `;

        return;
    }


    compras.forEach(compra => {

        const proveedor =
            proveedoresCompra.find(
                item =>
                    item.id_proveedor ===
                    compra.id_proveedor
            );


        const nombreProveedor =
            proveedor
                ? proveedor.nombre_proveedor
                : "Proveedor #" +
                  compra.id_proveedor;


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${compra.id_compra}
            </td>

            <td>
                ${nombreProveedor}
            </td>

            <td>
                ${compra.id_usuario}
            </td>

            <td>
                ${formatearFecha(compra.fecha_compra)}
            </td>

            <td>
                ${compra.descripcion || "-"}
            </td>

            <td>
                Bs ${Number(
                    compra.total_compra
                ).toFixed(2)}
            </td>

            <td>
                ${
                    compra.estado
                    ?
                    '<span class="badge bg-success">Activa</span>'
                    :
                    '<span class="badge bg-danger">Anulada</span>'
                }
            </td>

            <td class="text-nowrap">

                <button
                    class="btn btn-sm btn-info me-1"
                    onclick="verCompra(${compra.id_compra})"
                    title="Ver detalle"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

                ${
                    compra.estado
                    ?
                    `
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="anularCompra(${compra.id_compra})"
                        title="Anular"
                    >
                        <i class="fa-solid fa-ban"></i>
                    </button>
                    `
                    :
                    ""
                }

            </td>
        `;


        tabla.appendChild(fila);
    });
}


// =====================================================
// AGREGAR PRODUCTO
// =====================================================

function agregarItemCompra() {

    const idProducto =
        parseInt(
            document.getElementById(
                "productoCompra"
            ).value
        );


    const cantidad =
        parseInt(
            document.getElementById(
                "cantidadCompra"
            ).value
        );


    const precioCompra =
        parseFloat(
            document.getElementById(
                "precioCompra"
            ).value
        );


    const precioVenta =
        parseFloat(
            document.getElementById(
                "precioVentaCompra"
            ).value
        );


    if (
        !idProducto ||
        !cantidad ||
        cantidad <= 0 ||
        !precioCompra ||
        precioCompra <= 0 ||
        !precioVenta ||
        precioVenta <= 0
    ) {

        alert(
            "Complete correctamente los datos del producto."
        );

        return;
    }


    const existente =
        itemsCompra.find(
            item =>
                item.id_producto ===
                idProducto
        );


    if (existente) {

        alert(
            "El producto ya fue agregado."
        );

        return;
    }


    const producto =
        productosCompra.find(
            item =>
                item.id_producto ===
                idProducto
        );


    itemsCompra.push({

        id_producto: idProducto,

        nombre_producto:
            producto
                ? producto.nombre_producto
                : "Producto",

        cantidad: cantidad,

        precio_compra: precioCompra,

        precio_venta: precioVenta
    });


    mostrarDetalleCompra();


    document.getElementById(
        "productoCompra"
    ).value = "";


    document.getElementById(
        "cantidadCompra"
    ).value = 1;


    document.getElementById(
        "precioCompra"
    ).value = "";


    document.getElementById(
        "precioVentaCompra"
    ).value = "";
}


// =====================================================
// MOSTRAR DETALLE
// =====================================================

function mostrarDetalleCompra() {

    const tabla =
        document.getElementById(
            "tablaDetalleCompra"
        );


    tabla.innerHTML = "";


    let total = 0;


    itemsCompra.forEach(
        (item, indice) => {

            const subtotal =
                item.cantidad *
                item.precio_compra;


            total += subtotal;


            tabla.innerHTML += `

                <tr>

                    <td>
                        ${item.nombre_producto}
                    </td>

                    <td>
                        ${item.cantidad}
                    </td>

                    <td>
                        Bs ${item.precio_compra.toFixed(2)}
                    </td>

                    <td>
                        Bs ${item.precio_venta.toFixed(2)}
                    </td>

                    <td>
                        Bs ${subtotal.toFixed(2)}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick="eliminarItemCompra(${indice})"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </td>

                </tr>
            `;
        }
    );


    document.getElementById(
        "totalCompra"
    ).textContent =
        total.toFixed(2);
}


// =====================================================
// ELIMINAR ITEM
// =====================================================

function eliminarItemCompra(indice) {

    itemsCompra.splice(
        indice,
        1
    );


    mostrarDetalleCompra();
}


// =====================================================
// REGISTRAR COMPRA
// =====================================================

async function registrarCompra(event) {

    event.preventDefault();


    const idProveedor =
        parseInt(
            document.getElementById(
                "proveedorCompra"
            ).value
        );


    if (!idProveedor) {

        alert(
            "Seleccione un proveedor."
        );

        return;
    }


    if (itemsCompra.length === 0) {

        alert(
            "Debe agregar al menos un producto."
        );

        return;
    }


    const datos = {

        id_proveedor:
            idProveedor,

        descripcion:
            document.getElementById(
                "descripcionCompra"
            ).value.trim(),

        items:
            itemsCompra.map(
                item => ({
                    id_producto:
                        item.id_producto,

                    cantidad:
                        item.cantidad,

                    precio_compra:
                        item.precio_compra,

                    precio_venta:
                        item.precio_venta
                })
            )
    };


    const respuesta = await fetch(
        API_URL + "/api/v1/compras",
        {
            method: "POST",
            headers: headersJSON(),
            body: JSON.stringify(datos)
        }
    );


    const resultado =
        await respuesta.json();


    if (!respuesta.ok) {

        document.getElementById(
            "mensajeCompra"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo registrar la compra"
                }
            </div>
        `;

        return;
    }


    document.getElementById(
        "formCompra"
    ).reset();


    itemsCompra = [];


    mostrarDetalleCompra();


    document.getElementById(
        "mensajeCompra"
    ).innerHTML = "";


    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalCompra"
        )
    ).hide();


    await cargarCompras();
}


// =====================================================
// VER COMPRA
// =====================================================

async function verCompra(idCompra) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/compras/" +
        idCompra,
        {
            headers: headersAuth()
        }
    );


    const resultado =
        await respuesta.json();


    if (!respuesta.ok) {

        alert(
            resultado.detail ||
            "No se pudo obtener la compra"
        );

        return;
    }


    const compra =
        resultado.compra;


    const detalles =
        resultado.detalles;


    const proveedor =
        proveedoresCompra.find(
            item =>
                item.id_proveedor ===
                compra.id_proveedor
        );


    document.getElementById(
        "verIdCompra"
    ).textContent =
        compra.id_compra;


    document.getElementById(
        "verProveedorCompra"
    ).textContent =
        proveedor
            ? proveedor.nombre_proveedor
            : "Proveedor #" +
              compra.id_proveedor;


    document.getElementById(
        "verUsuarioCompra"
    ).textContent =
        compra.id_usuario;


    document.getElementById(
        "verFechaCompra"
    ).textContent =
        formatearFecha(
            compra.fecha_compra
        );


    document.getElementById(
        "verTotalCompra"
    ).textContent =
        Number(
            compra.total_compra
        ).toFixed(2);


    document.getElementById(
        "verEstadoCompra"
    ).textContent =
        compra.estado
            ? "Activa"
            : "Anulada";


    document.getElementById(
        "verDescripcionCompra"
    ).textContent =
        compra.descripcion || "-";


    const tabla =
        document.getElementById(
            "tablaVerDetalleCompra"
        );


    tabla.innerHTML = "";


    detalles.forEach(detalle => {

        const producto =
            productosCompra.find(
                item =>
                    item.id_producto ===
                    detalle.id_producto
            );


        const subtotal =
            Number(
                detalle.precio_compra
            ) *
            detalle.cantidad;


        tabla.innerHTML += `

            <tr>

                <td>
                    ${
                        producto
                        ? producto.nombre_producto
                        : "Producto #" +
                          detalle.id_producto
                    }
                </td>

                <td>
                    ${detalle.cantidad}
                </td>

                <td>
                    Bs ${Number(
                        detalle.precio_compra
                    ).toFixed(2)}
                </td>

                <td>
                    Bs ${Number(
                        detalle.precio_venta
                    ).toFixed(2)}
                </td>

                <td>
                    Bs ${subtotal.toFixed(2)}
                </td>

            </tr>
        `;
    });


    new bootstrap.Modal(
        document.getElementById(
            "modalVerCompra"
        )
    ).show();
}


// =====================================================
// ANULAR COMPRA
// =====================================================

async function anularCompra(idCompra) {

    if (!confirm(
        "¿Está seguro de anular esta compra?"
    )) {
        return;
    }


    const respuesta = await fetch(
        API_URL +
        "/api/v1/compras/" +
        idCompra +
        "/anular",
        {
            method: "PATCH",
            headers: headersAuth()
        }
    );


    const resultado =
        await respuesta.json();


    if (!respuesta.ok) {

        alert(
            resultado.detail ||
            "No se pudo anular la compra"
        );

        return;
    }


    alert(
        resultado.mensaje ||
        "Compra anulada correctamente"
    );


    await cargarCompras();
}


// =====================================================
// FECHA
// =====================================================

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }


    const valor =
        new Date(fecha);


    return valor.toLocaleString(
        "es-BO"
    );
}