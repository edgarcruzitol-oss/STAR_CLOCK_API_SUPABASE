let productos = [];


document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarProductos();

        document.getElementById(
            "buscarProducto"
        ).addEventListener(
            "input",
            filtrarProductos
        );

        document.getElementById(
            "formProducto"
        ).addEventListener(
            "submit",
            crearProducto
        );

        document.getElementById(
            "formEditarProducto"
        ).addEventListener(
            "submit",
            guardarEdicionProducto
        );
    }
);


// =====================================================
// LISTAR PRODUCTOS
// =====================================================

async function cargarProductos() {

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/productos"
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los productos"
            );
        }

        productos = await respuesta.json();

        mostrarProductos(productos);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "tablaProductos"
        ).innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    Error al cargar productos
                </td>
            </tr>
        `;
    }
}


// =====================================================
// MOSTRAR PRODUCTOS
// =====================================================

function mostrarProductos(lista) {

    const tabla = document.getElementById(
        "tablaProductos"
    );

    tabla.innerHTML = "";

    if (lista.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No existen productos registrados.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach(producto => {

        const fila = document.createElement("tr");

        fila.innerHTML = `

            <td>
                ${producto.id_producto}
            </td>

            <td>
                ${producto.codigo_producto}
            </td>

            <td>
                ${producto.nombre_producto}
            </td>

            <td>
                ${producto.descripcion || "-"}
            </td>

            <td>
                ${producto.stock_minimo}
            </td>

            <td>
                ${
                    producto.estado
                    ?
                    '<span class="badge bg-success">Activo</span>'
                    :
                    '<span class="badge bg-secondary">Inactivo</span>'
                }
            </td>

            <td class="text-nowrap">

                <button
                    class="btn btn-sm btn-info me-1"
                    onclick="verProducto(${producto.id_producto})"
                    title="Ver"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

                <button
                    class="btn btn-sm btn-warning me-1"
                    onclick="editarProducto(${producto.id_producto})"
                    title="Editar"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                ${
                    producto.estado
                    ?
                    `
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="desactivarProducto(${producto.id_producto})"
                        title="Desactivar"
                    >
                        <i class="fa-solid fa-ban"></i>
                    </button>
                    `
                    :
                    `
                    <button
                        class="btn btn-sm btn-success"
                        onclick="activarProducto(${producto.id_producto})"
                        title="Activar"
                    >
                        <i class="fa-solid fa-check"></i>
                    </button>
                    `
                }

            </td>
        `;

        tabla.appendChild(fila);
    });
}


// =====================================================
// BUSCAR
// =====================================================

function filtrarProductos() {

    const texto = document.getElementById(
        "buscarProducto"
    ).value.toLowerCase();

    const filtrados = productos.filter(
        producto => {

            return (
                producto.codigo_producto
                    .toLowerCase()
                    .includes(texto)
                ||
                producto.nombre_producto
                    .toLowerCase()
                    .includes(texto)
            );
        }
    );

    mostrarProductos(filtrados);
}


// =====================================================
// CREAR
// =====================================================

async function crearProducto(event) {

    event.preventDefault();

    const datos = {

        codigo_producto:
            document.getElementById(
                "codigoProducto"
            ).value.trim(),

        nombre_producto:
            document.getElementById(
                "nombreProducto"
            ).value.trim(),

        descripcion:
            document.getElementById(
                "descripcionProducto"
            ).value.trim(),

        stock_minimo:
            parseInt(
                document.getElementById(
                    "stockMinimoProducto"
                ).value
            )
    };

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/productos",
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
                "mensajeProducto"
            ).innerHTML = `
                <div class="alert alert-danger">
                    ${
                        resultado.detail ||
                        "No se pudo crear el producto"
                    }
                </div>
            `;

            return;
        }

        document.getElementById(
            "formProducto"
        ).reset();

        document.getElementById(
            "stockMinimoProducto"
        ).value = 0;

        document.getElementById(
            "mensajeProducto"
        ).innerHTML = "";

        const modal =
            bootstrap.Modal.getInstance(
                document.getElementById(
                    "modalProducto"
                )
            );

        modal.hide();

        await cargarProductos();

    } catch (error) {

        console.error(error);
    }
}


// =====================================================
// VER
// =====================================================

async function verProducto(idProducto) {

    try {

        const respuesta = await fetch(
            API_URL +
            "/api/v1/productos/" +
            idProducto,
            {
                headers: headersAuth()
            }
        );

        const producto =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                producto.detail ||
                "No se pudo obtener el producto"
            );

            return;
        }

        document.getElementById(
            "verIdProducto"
        ).textContent =
            producto.id_producto;

        document.getElementById(
            "verCodigoProducto"
        ).textContent =
            producto.codigo_producto;

        document.getElementById(
            "verNombreProducto"
        ).textContent =
            producto.nombre_producto;

        document.getElementById(
            "verDescripcionProducto"
        ).textContent =
            producto.descripcion || "-";

        document.getElementById(
            "verStockMinimoProducto"
        ).textContent =
            producto.stock_minimo;

        document.getElementById(
            "verEstadoProducto"
        ).textContent =
            producto.estado
                ? "Activo"
                : "Inactivo";

        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "modalVerProducto"
                )
            );

        modal.show();

    } catch (error) {

        console.error(error);
    }
}


// =====================================================
// ABRIR MODAL EDITAR
// =====================================================

async function editarProducto(idProducto) {

    try {

        const respuesta = await fetch(
            API_URL +
            "/api/v1/productos/" +
            idProducto,
            {
                headers: headersAuth()
            }
        );

        const producto =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                producto.detail ||
                "No se pudo obtener el producto"
            );

            return;
        }

        document.getElementById(
            "editarIdProducto"
        ).value =
            producto.id_producto;

        document.getElementById(
            "editarCodigoProducto"
        ).value =
            producto.codigo_producto;

        document.getElementById(
            "editarNombreProducto"
        ).value =
            producto.nombre_producto;

        document.getElementById(
            "editarDescripcionProducto"
        ).value =
            producto.descripcion || "";

        document.getElementById(
            "editarStockMinimoProducto"
        ).value =
            producto.stock_minimo;

        document.getElementById(
            "mensajeEditarProducto"
        ).innerHTML = "";

        const modal =
            new bootstrap.Modal(
                document.getElementById(
                    "modalEditarProducto"
                )
            );

        modal.show();

    } catch (error) {

        console.error(error);
    }
}


// =====================================================
// GUARDAR EDICIÓN
// =====================================================

async function guardarEdicionProducto(
    event
) {

    event.preventDefault();

    const idProducto =
        document.getElementById(
            "editarIdProducto"
        ).value;

    const datos = {

        codigo_producto:
            document.getElementById(
                "editarCodigoProducto"
            ).value.trim(),

        nombre_producto:
            document.getElementById(
                "editarNombreProducto"
            ).value.trim(),

        descripcion:
            document.getElementById(
                "editarDescripcionProducto"
            ).value.trim(),

        stock_minimo:
            parseInt(
                document.getElementById(
                    "editarStockMinimoProducto"
                ).value
            )
    };

    try {

        const respuesta = await fetch(
            API_URL +
            "/api/v1/productos/" +
            idProducto,
            {
                method: "PUT",
                headers: headersJSON(),
                body: JSON.stringify(datos)
            }
        );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            document.getElementById(
                "mensajeEditarProducto"
            ).innerHTML = `
                <div class="alert alert-danger">
                    ${
                        resultado.detail ||
                        "No se pudo editar el producto"
                    }
                </div>
            `;

            return;
        }

        const modal =
            bootstrap.Modal.getInstance(
                document.getElementById(
                    "modalEditarProducto"
                )
            );

        modal.hide();

        await cargarProductos();

    } catch (error) {

        console.error(error);
    }
}


// =====================================================
// DESACTIVAR
// =====================================================

async function desactivarProducto(
    idProducto
) {

    const confirmar = confirm(
        "¿Está seguro de desactivar este producto?"
    );

    if (!confirmar) {
        return;
    }

    try {

        const respuesta = await fetch(
            API_URL +
            "/api/v1/productos/" +
            idProducto,
            {
                method: "DELETE",
                headers: headersAuth()
            }
        );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            alert(
                resultado.detail ||
                "No se pudo desactivar el producto"
            );

            return;
        }

        await cargarProductos();

    } catch (error) {

        console.error(error);
    }
}


// =====================================================
// ACTIVAR
// =====================================================

async function activarProducto(
    idProducto
) {

    try {

        const respuesta = await fetch(
            API_URL +
            "/api/v1/productos/" +
            idProducto +
            "/activar",
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
                "No se pudo activar el producto"
            );

            return;
        }

        await cargarProductos();

    } catch (error) {

        console.error(error);
    }
}