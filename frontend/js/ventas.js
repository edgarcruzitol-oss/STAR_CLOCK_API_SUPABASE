let clientesVenta = [];
let productosVenta = [];
let stockVenta = [];
let ventas = [];
let itemsVenta = [];


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // Importante: secuencial para evitar que
        // productos y stock carguen desordenados
        await cargarClientesVenta();
        await cargarProductosVenta();
        await cargarStockVenta();
        await cargarVentas();

        document.getElementById(
            "productoVenta"
        ).addEventListener(
            "change",
            actualizarPrecioProducto
        );

        document.getElementById(
            "formVenta"
        ).addEventListener(
            "submit",
            registrarVenta
        );
    }
);


// =====================================================
// CLIENTES
// =====================================================

async function cargarClientesVenta() {

    const respuesta = await fetch(
        API_URL + "/api/v1/clientes"
    );

    clientesVenta =
        await respuesta.json();


    const select = document.getElementById(
        "clienteVenta"
    );


    select.innerHTML = `
        <option value="">
            Venta sin cliente registrado
        </option>
    `;


    clientesVenta
        .filter(cliente => cliente.estado)
        .forEach(cliente => {

            select.innerHTML += `
                <option value="${cliente.id_cliente}">
                    ${cliente.nombre}
                    ${cliente.apellido || ""}
                </option>
            `;
        });
}


// =====================================================
// PRODUCTOS
// =====================================================

async function cargarProductosVenta() {

    const respuesta = await fetch(
        API_URL + "/api/v1/productos"
    );

    productosVenta =
        await respuesta.json();
}


// =====================================================
// STOCK
// =====================================================

async function cargarStockVenta() {

    const respuesta = await fetch(
        API_URL + "/api/v1/stock"
    );

    stockVenta =
        await respuesta.json();


    const select = document.getElementById(
        "productoVenta"
    );


    select.innerHTML = `
        <option value="">
            Seleccione producto
        </option>
    `;


    stockVenta
        .filter(stock => stock.cantidad > 0)
        .forEach(stock => {

            const producto =
                productosVenta.find(
                    item =>
                        item.id_producto ===
                        stock.id_producto
                );


            if (
                producto &&
                producto.estado
            ) {

                select.innerHTML += `
                    <option value="${producto.id_producto}">
                        ${producto.codigo_producto}
                        -
                        ${producto.nombre_producto}
                        (Stock: ${stock.cantidad})
                    </option>
                `;
            }
        });


    document.getElementById(
        "precioVenta"
    ).value = "";
}


// =====================================================
// PRECIO SEGÚN PRODUCTO
// =====================================================

function actualizarPrecioProducto() {

    const idProducto =
        parseInt(
            document.getElementById(
                "productoVenta"
            ).value
        );


    const stock =
        stockVenta.find(
            item =>
                item.id_producto ===
                idProducto
        );


    document.getElementById(
        "precioVenta"
    ).value =
        stock
            ? Number(
                stock.precio_venta
            ).toFixed(2)
            : "";
}


// =====================================================
// LISTAR VENTAS
// =====================================================

async function cargarVentas() {

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/ventas",
            {
                headers: headersAuth()
            }
        );


        const resultado =
            await respuesta.json();


        if (!respuesta.ok) {

            throw new Error(
                resultado.detail ||
                "No se pudieron cargar las ventas"
            );
        }


        ventas = resultado;

        mostrarVentas();

    } catch (error) {

        console.error(error);

        document.getElementById(
            "tablaVentas"
        ).innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="text-center text-danger"
                >
                    ${error.message}
                </td>
            </tr>
        `;
    }
}


// =====================================================
// MOSTRAR VENTAS
// =====================================================

function mostrarVentas() {

    const tabla =
        document.getElementById(
            "tablaVentas"
        );


    tabla.innerHTML = "";


    if (ventas.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="text-center"
                >
                    No existen ventas registradas.
                </td>
            </tr>
        `;

        return;
    }


    ventas.forEach(venta => {

        const cliente =
            clientesVenta.find(
                item =>
                    item.id_cliente ===
                    venta.id_cliente
            );


        let nombreCliente = "Sin cliente";


        if (cliente) {

            nombreCliente =
                cliente.nombre +
                " " +
                (cliente.apellido || "");

        } else if (
            venta.nombre_cliente_recibo
        ) {

            nombreCliente =
                venta.nombre_cliente_recibo;
        }


        const fila =
            document.createElement("tr");


        fila.innerHTML = `

            <td>
                ${venta.id_venta}
            </td>

            <td>
                ${nombreCliente}
            </td>

            <td>
                ${venta.id_usuario}
            </td>

            <td>
                ${formatearFechaVenta(
                    venta.fecha_venta
                )}
            </td>

            <td>
                Bs ${Number(
                    venta.total_venta
                ).toFixed(2)}
            </td>

            <td>
                ${
                    venta.estado
                    ?
                    '<span class="badge bg-success">Activa</span>'
                    :
                    '<span class="badge bg-danger">Anulada</span>'
                }
            </td>

            <td class="text-nowrap">

                <button
                    class="btn btn-sm btn-info me-1"
                    onclick="verVenta(${venta.id_venta})"
                    title="Ver detalle"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

                ${
                    venta.estado
                    ?
                    `
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="anularVenta(${venta.id_venta})"
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
// AGREGAR PRODUCTO A LA VENTA
// =====================================================

function agregarItemVenta() {

    const idProducto =
        parseInt(
            document.getElementById(
                "productoVenta"
            ).value
        );


    const cantidad =
        parseInt(
            document.getElementById(
                "cantidadVenta"
            ).value
        );


    const descuento =
        parseFloat(
            document.getElementById(
                "descuentoVenta"
            ).value || 0
        );


    if (
        !idProducto ||
        !cantidad ||
        cantidad <= 0
    ) {

        alert(
            "Seleccione un producto y una cantidad válida."
        );

        return;
    }


    const stock =
        stockVenta.find(
            item =>
                item.id_producto ===
                idProducto
        );


    if (!stock) {

        alert(
            "No existe stock para este producto."
        );

        return;
    }


    if (
        cantidad >
        stock.cantidad
    ) {

        alert(
            "Stock insuficiente. Disponible: " +
            stock.cantidad
        );

        return;
    }


    const producto =
        productosVenta.find(
            item =>
                item.id_producto ===
                idProducto
        );


    const existente =
        itemsVenta.find(
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


    const precio =
        Number(
            stock.precio_venta
        );


    const subtotalBruto =
        precio * cantidad;


    if (
        descuento < 0 ||
        descuento > subtotalBruto
    ) {

        alert(
            "El descuento no es válido."
        );

        return;
    }


    itemsVenta.push({

        id_producto:
            idProducto,

        nombre_producto:
            producto
                ? producto.nombre_producto
                : "Producto",

        cantidad:
            cantidad,

        precio:
            precio,

        descuento:
            descuento
    });


    mostrarDetalleVenta();


    document.getElementById(
        "productoVenta"
    ).value = "";


    document.getElementById(
        "cantidadVenta"
    ).value = 1;


    document.getElementById(
        "precioVenta"
    ).value = "";


    document.getElementById(
        "descuentoVenta"
    ).value = 0;
}


// =====================================================
// MOSTRAR DETALLE
// =====================================================

function mostrarDetalleVenta() {

    const tabla =
        document.getElementById(
            "tablaDetalleVenta"
        );


    tabla.innerHTML = "";


    let total = 0;


    itemsVenta.forEach(
        (item, indice) => {

            const subtotal =
                (
                    item.precio *
                    item.cantidad
                )
                -
                item.descuento;


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
                        Bs ${item.precio.toFixed(2)}
                    </td>

                    <td>
                        Bs ${item.descuento.toFixed(2)}
                    </td>

                    <td>
                        Bs ${subtotal.toFixed(2)}
                    </td>

                    <td>

                        <button
                            type="button"
                            class="btn btn-sm btn-danger"
                            onclick="eliminarItemVenta(${indice})"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </td>

                </tr>
            `;
        }
    );


    document.getElementById(
        "totalVenta"
    ).textContent =
        total.toFixed(2);
}


// =====================================================
// ELIMINAR ITEM
// =====================================================

function eliminarItemVenta(indice) {

    itemsVenta.splice(
        indice,
        1
    );


    mostrarDetalleVenta();
}


// =====================================================
// REGISTRAR VENTA
// =====================================================

async function registrarVenta(event) {

    event.preventDefault();


    if (itemsVenta.length === 0) {

        alert(
            "Debe agregar al menos un producto."
        );

        return;
    }


    const valorCliente =
        document.getElementById(
            "clienteVenta"
        ).value;


    const datos = {

        id_cliente:
            valorCliente
                ? parseInt(valorCliente)
                : null,

        nombre_cliente_recibo:
            document.getElementById(
                "nombreRecibo"
            ).value.trim(),

        items:
            itemsVenta.map(
                item => ({
                    id_producto:
                        item.id_producto,

                    cantidad:
                        item.cantidad,

                    descuento:
                        item.descuento
                })
            )
    };


    const respuesta = await fetch(
        API_URL + "/api/v1/ventas",
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
            "mensajeVenta"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo registrar la venta"
                }
            </div>
        `;

        return;
    }


    document.getElementById(
        "formVenta"
    ).reset();


    itemsVenta = [];


    mostrarDetalleVenta();


    document.getElementById(
        "mensajeVenta"
    ).innerHTML = "";


    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalVenta"
        )
    ).hide();


    // Volvemos a consultar stock porque
    // la venta acaba de descontarlo
    await cargarStockVenta();

    await cargarVentas();
}


// =====================================================
// VER VENTA
// =====================================================

async function verVenta(idVenta) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/ventas/" +
        idVenta,
        {
            headers: headersAuth()
        }
    );


    const resultado =
        await respuesta.json();


    if (!respuesta.ok) {

        alert(
            resultado.detail ||
            "No se pudo obtener la venta"
        );

        return;
    }


    const venta =
        resultado.venta;


    const detalles =
        resultado.detalles;


    const cliente =
        clientesVenta.find(
            item =>
                item.id_cliente ===
                venta.id_cliente
        );


    let nombreCliente =
        "Sin cliente registrado";


    if (cliente) {

        nombreCliente =
            cliente.nombre +
            " " +
            (cliente.apellido || "");
    }


    document.getElementById(
        "verIdVenta"
    ).textContent =
        venta.id_venta;


    document.getElementById(
        "verClienteVenta"
    ).textContent =
        nombreCliente;


    document.getElementById(
        "verUsuarioVenta"
    ).textContent =
        venta.id_usuario;


    document.getElementById(
        "verFechaVenta"
    ).textContent =
        formatearFechaVenta(
            venta.fecha_venta
        );


    document.getElementById(
        "verTotalVenta"
    ).textContent =
        Number(
            venta.total_venta
        ).toFixed(2);


    document.getElementById(
        "verEstadoVenta"
    ).textContent =
        venta.estado
            ? "Activa"
            : "Anulada";


    document.getElementById(
        "verNombreRecibo"
    ).textContent =
        venta.nombre_cliente_recibo ||
        "-";


    const tabla =
        document.getElementById(
            "tablaVerDetalleVenta"
        );


    tabla.innerHTML = "";


    detalles.forEach(detalle => {

        const producto =
            productosVenta.find(
                item =>
                    item.id_producto ===
                    detalle.id_producto
            );


        const subtotal =
            (
                Number(
                    detalle.precio_unitario
                )
                *
                detalle.cantidad
            )
            -
            Number(
                detalle.descuento
            );


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
                        detalle.precio_unitario
                    ).toFixed(2)}
                </td>

                <td>
                    Bs ${Number(
                        detalle.descuento
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
            "modalVerVenta"
        )
    ).show();
}


// =====================================================
// ANULAR
// =====================================================

async function anularVenta(idVenta) {

    if (!confirm(
        "¿Está seguro de anular esta venta?"
    )) {
        return;
    }


    const respuesta = await fetch(
        API_URL +
        "/api/v1/ventas/" +
        idVenta +
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
            "No se pudo anular la venta"
        );

        return;
    }


    alert(
        resultado.mensaje ||
        "Venta anulada correctamente"
    );


    // El backend devuelve las unidades
    // al inventario.
    await cargarStockVenta();

    await cargarVentas();
}


// =====================================================
// FECHA
// =====================================================

function formatearFechaVenta(fecha) {

    if (!fecha) {
        return "-";
    }


    const valor =
        new Date(fecha);


    return valor.toLocaleString(
        "es-BO"
    );
}