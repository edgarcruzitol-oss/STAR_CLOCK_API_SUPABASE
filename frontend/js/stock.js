let stocks = [];
let productosStock = [];


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await cargarProductosStock();
        await cargarStock();

        document.getElementById(
            "buscarStock"
        ).addEventListener(
            "input",
            filtrarStock
        );

        document.getElementById(
            "formAjustarStock"
        ).addEventListener(
            "submit",
            guardarAjusteStock
        );
    }
);


// =====================================================
// PRODUCTOS
// =====================================================

async function cargarProductosStock() {

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/productos"
        );

        if (!respuesta.ok) {
            return;
        }

        productosStock = await respuesta.json();

    } catch (error) {

        console.error(error);
    }
}


function obtenerNombreProducto(idProducto) {

    const producto = productosStock.find(
        item => item.id_producto === idProducto
    );

    return producto
        ? producto.nombre_producto
        : "Producto #" + idProducto;
}


// =====================================================
// LISTAR STOCK
// =====================================================

async function cargarStock() {

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/stock"
        );

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo cargar el stock"
            );
        }

        stocks = await respuesta.json();

        mostrarStock(stocks);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "tablaStock"
        ).innerHTML = `
            <tr>
                <td
                    colspan="9"
                    class="text-center text-danger"
                >
                    Error al cargar el inventario
                </td>
            </tr>
        `;
    }
}


// =====================================================
// MOSTRAR
// =====================================================

function mostrarStock(lista) {

    const tabla = document.getElementById(
        "tablaStock"
    );

    tabla.innerHTML = "";

    if (lista.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    No existen registros de stock.
                </td>
            </tr>
        `;

        return;
    }


    lista.forEach(stock => {

        const nombreProducto =
            obtenerNombreProducto(
                stock.id_producto
            );

        let estado = "";

        if (stock.cantidad <= 0) {

            estado = `
                <span class="badge bg-danger">
                    Sin stock
                </span>
            `;

        } else if (stock.cantidad <= 5) {

            estado = `
                <span class="badge bg-warning text-dark">
                    Stock bajo
                </span>
            `;

        } else {

            estado = `
                <span class="badge bg-success">
                    Disponible
                </span>
            `;
        }


        const fila =
            document.createElement("tr");

        fila.innerHTML = `

            <td>
                ${stock.id_stock}
            </td>

            <td>
                ${nombreProducto}
            </td>

            <td>
                Bs ${Number(
                    stock.precio_compra
                ).toFixed(2)}
            </td>

            <td>
                Bs ${Number(
                    stock.precio_venta
                ).toFixed(2)}
            </td>

            <td>
                ${stock.cantidad_ingreso}
            </td>

            <td>
                ${stock.cantidad_egreso}
            </td>

            <td>
                <strong>
                    ${stock.cantidad}
                </strong>
            </td>

            <td>
                ${estado}
            </td>

            <td class="text-nowrap">

                <button
                    class="btn btn-sm btn-info me-1"
                    onclick="verStock(${stock.id_stock})"
                    title="Ver"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

                <button
                    class="btn btn-sm btn-warning"
                    onclick="abrirAjustarStock(${stock.id_stock})"
                    title="Ajustar"
                >
                    <i class="fa-solid fa-sliders"></i>
                </button>

            </td>
        `;

        tabla.appendChild(fila);
    });
}


// =====================================================
// BUSCAR
// =====================================================

function filtrarStock() {

    const texto = document.getElementById(
        "buscarStock"
    ).value.toLowerCase();


    const filtrados = stocks.filter(
        stock => {

            const nombreProducto =
                obtenerNombreProducto(
                    stock.id_producto
                ).toLowerCase();


            return (
                stock.id_stock
                    .toString()
                    .includes(texto)
                ||
                stock.id_producto
                    .toString()
                    .includes(texto)
                ||
                nombreProducto.includes(texto)
            );
        }
    );


    mostrarStock(filtrados);
}


// =====================================================
// VER
// =====================================================

async function verStock(idStock) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/stock/" +
        idStock,
        {
            headers: headersAuth()
        }
    );


    const stock =
        await respuesta.json();


    if (!respuesta.ok) {

        alert(
            stock.detail ||
            "No se pudo obtener el stock"
        );

        return;
    }


    document.getElementById(
        "verIdStock"
    ).textContent =
        stock.id_stock;


    document.getElementById(
        "verProductoStock"
    ).textContent =
        obtenerNombreProducto(
            stock.id_producto
        );


    document.getElementById(
        "verPrecioCompraStock"
    ).textContent =
        Number(
            stock.precio_compra
        ).toFixed(2);


    document.getElementById(
        "verPrecioVentaStock"
    ).textContent =
        Number(
            stock.precio_venta
        ).toFixed(2);


    document.getElementById(
        "verIngresoStock"
    ).textContent =
        stock.cantidad_ingreso;


    document.getElementById(
        "verEgresoStock"
    ).textContent =
        stock.cantidad_egreso;


    document.getElementById(
        "verCantidadStock"
    ).textContent =
        stock.cantidad;


    new bootstrap.Modal(
        document.getElementById(
            "modalVerStock"
        )
    ).show();
}


// =====================================================
// ABRIR AJUSTE
// =====================================================

async function abrirAjustarStock(
    idStock
) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/stock/" +
        idStock,
        {
            headers: headersAuth()
        }
    );


    const stock =
        await respuesta.json();


    if (!respuesta.ok) {

        alert(
            stock.detail ||
            "No se pudo obtener el stock"
        );

        return;
    }


    document.getElementById(
        "ajustarIdStock"
    ).value =
        stock.id_stock;


    document.getElementById(
        "ajustarProductoStock"
    ).value =
        obtenerNombreProducto(
            stock.id_producto
        );


    document.getElementById(
        "ajustarStockActual"
    ).value =
        stock.cantidad;


    document.getElementById(
        "cantidadAjusteStock"
    ).value = "";


    document.getElementById(
        "mensajeAjustarStock"
    ).innerHTML = "";


    new bootstrap.Modal(
        document.getElementById(
            "modalAjustarStock"
        )
    ).show();
}


// =====================================================
// GUARDAR AJUSTE
// =====================================================

async function guardarAjusteStock(
    event
) {

    event.preventDefault();


    const idStock =
        document.getElementById(
            "ajustarIdStock"
        ).value;


    const cantidad =
        parseInt(
            document.getElementById(
                "cantidadAjusteStock"
            ).value
        );


    if (cantidad === 0) {

        document.getElementById(
            "mensajeAjustarStock"
        ).innerHTML = `
            <div class="alert alert-warning">
                La cantidad de ajuste no puede ser 0.
            </div>
        `;

        return;
    }


    const respuesta = await fetch(
        API_URL +
        "/api/v1/stock/" +
        idStock +
        "/ajustar",
        {
            method: "PATCH",
            headers: headersJSON(),
            body: JSON.stringify({
                cantidad: cantidad
            })
        }
    );


    const resultado =
        await respuesta.json();


    if (!respuesta.ok) {

        document.getElementById(
            "mensajeAjustarStock"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo ajustar el stock"
                }
            </div>
        `;

        return;
    }


    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalAjustarStock"
        )
    ).hide();


    await cargarStock();
}