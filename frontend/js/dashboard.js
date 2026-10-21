let dashboardProductos = [];
let dashboardProveedores = [];
let dashboardClientes = [];
let dashboardStock = [];
let dashboardUsuarios = [];
let dashboardCompras = [];
let dashboardVentas = [];


document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const usuario =
            localStorage.getItem("usuario") ||
            "Usuario";

        document.getElementById(
            "bienvenidaUsuario"
        ).textContent =
            usuario;


        await cargarDashboard();
    }
);


// =====================================================
// CARGAR DASHBOARD
// =====================================================

async function cargarDashboard() {

    try {

        const respuestas =
            await Promise.all([

                fetch(
                    API_URL +
                    "/api/v1/productos"
                ),

                fetch(
                    API_URL +
                    "/api/v1/proveedores"
                ),

                fetch(
                    API_URL +
                    "/api/v1/clientes"
                ),

                fetch(
                    API_URL +
                    "/api/v1/stock"
                ),

                fetch(
                    API_URL +
                    "/api/v1/usuarios",
                    {
                        headers:
                            headersAuth()
                    }
                ),

                fetch(
                    API_URL +
                    "/api/v1/compras",
                    {
                        headers:
                            headersAuth()
                    }
                ),

                fetch(
                    API_URL +
                    "/api/v1/ventas",
                    {
                        headers:
                            headersAuth()
                    }
                )
            ]);


        for (const respuesta of respuestas) {

            if (!respuesta.ok) {

                if (
                    respuesta.status === 401 ||
                    respuesta.status === 403
                ) {

                    throw new Error(
                        "La sesión expiró o no está autorizada."
                    );
                }

                throw new Error(
                    "No se pudo cargar el dashboard."
                );
            }
        }


        dashboardProductos =
            await respuestas[0].json();

        dashboardProveedores =
            await respuestas[1].json();

        dashboardClientes =
            await respuestas[2].json();

        dashboardStock =
            await respuestas[3].json();

        dashboardUsuarios =
            await respuestas[4].json();

        dashboardCompras =
            await respuestas[5].json();

        dashboardVentas =
            await respuestas[6].json();


        mostrarIndicadores();

        mostrarUltimasVentas();

    } catch (error) {

        console.error(error);

        alert(
            error.message ||
            "No se pudo cargar el dashboard."
        );
    }
}


// =====================================================
// INDICADORES
// =====================================================

function mostrarIndicadores() {

    document.getElementById(
        "totalProductos"
    ).textContent =
        dashboardProductos.length;


    document.getElementById(
        "totalProveedores"
    ).textContent =
        dashboardProveedores.length;


    document.getElementById(
        "totalClientes"
    ).textContent =
        dashboardClientes.length;


    document.getElementById(
        "totalUsuarios"
    ).textContent =
        dashboardUsuarios.length;


    document.getElementById(
        "totalStock"
    ).textContent =
        dashboardStock.length;


    document.getElementById(
        "totalCompras"
    ).textContent =
        dashboardCompras.length;


    document.getElementById(
        "totalVentas"
    ).textContent =
        dashboardVentas.length;


    calcularTotalVendido();

    calcularStockBajo();
}


// =====================================================
// TOTAL VENDIDO
// =====================================================

function calcularTotalVendido() {

    const ventasActivas =
        dashboardVentas.filter(
            venta => venta.estado
        );


    const total =
        ventasActivas.reduce(
            (acumulado, venta) => {

                return (
                    acumulado +
                    Number(
                        venta.total_venta
                    )
                );

            },
            0
        );


    document.getElementById(
        "totalVendido"
    ).textContent =
        "Bs " +
        total.toFixed(2);
}


// =====================================================
// STOCK BAJO
// =====================================================

function calcularStockBajo() {

    const stockPorProducto =
        new Map(
            dashboardStock.map(
                stock => [
                    stock.id_producto,
                    stock.cantidad
                ]
            )
        );


    const cantidadStockBajo =
        dashboardProductos.filter(
            producto => {

                if (!producto.estado) {
                    return false;
                }

                const cantidad =
                    stockPorProducto.get(
                        producto.id_producto
                    ) ?? 0;

                return (
                    cantidad <=
                    producto.stock_minimo
                );
            }
        ).length;


    document.getElementById(
        "totalStockBajo"
    ).textContent =
        cantidadStockBajo;
}

// =====================================================
// ÚLTIMAS VENTAS
// =====================================================

function mostrarUltimasVentas() {

    const tabla =
        document.getElementById(
            "tablaUltimasVentas"
        );


    tabla.innerHTML = "";


    if (
        dashboardVentas.length === 0
    ) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center"
                >
                    No existen ventas registradas.
                </td>
            </tr>
        `;

        return;
    }


    const ultimas =
        [...dashboardVentas]
            .sort(
                (a, b) =>
                    b.id_venta -
                    a.id_venta
            )
            .slice(0, 5);


    ultimas.forEach(venta => {

        let nombreCliente =
            "Sin cliente";


        if (venta.id_cliente) {

            const cliente =
                dashboardClientes.find(
                    item =>
                        item.id_cliente ===
                        venta.id_cliente
                );


            if (cliente) {

                nombreCliente =
                    cliente.nombre +
                    " " +
                    (
                        cliente.apellido ||
                        ""
                    );
            }

        } else if (
            venta.nombre_cliente_recibo
        ) {

            nombreCliente =
                venta.nombre_cliente_recibo;
        }


        const fila =
            document.createElement(
                "tr"
            );


        fila.innerHTML = `

            <td>
                ${venta.id_venta}
            </td>

            <td>
                ${nombreCliente}
            </td>

            <td>
                ${formatearFechaDashboard(
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
        `;


        tabla.appendChild(fila);
    });
}


// =====================================================
// FECHA
// =====================================================

function formatearFechaDashboard(
    fecha
) {

    if (!fecha) {
        return "-";
    }


    const valor =
        new Date(fecha);


    return valor.toLocaleString(
        "es-BO"
    );
}