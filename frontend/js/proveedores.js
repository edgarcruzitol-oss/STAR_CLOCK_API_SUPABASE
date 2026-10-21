let proveedores = [];


document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarProveedores();

        document.getElementById(
            "buscarProveedor"
        ).addEventListener(
            "input",
            filtrarProveedores
        );

        document.getElementById(
            "formProveedor"
        ).addEventListener(
            "submit",
            crearProveedor
        );

        document.getElementById(
            "formEditarProveedor"
        ).addEventListener(
            "submit",
            guardarEdicionProveedor
        );
    }
);


// =====================================================
// LISTAR
// =====================================================

async function cargarProveedores() {

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/proveedores"
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los proveedores"
            );
        }

        proveedores = await respuesta.json();

        mostrarProveedores(proveedores);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "tablaProveedores"
        ).innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Error al cargar proveedores
                </td>
            </tr>
        `;
    }
}


// =====================================================
// MOSTRAR
// =====================================================

function mostrarProveedores(lista) {

    const tabla = document.getElementById(
        "tablaProveedores"
    );

    tabla.innerHTML = "";

    if (lista.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No existen proveedores registrados.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach(proveedor => {

        const fila = document.createElement("tr");

        fila.innerHTML = `

            <td>${proveedor.id_proveedor}</td>

            <td>${proveedor.nombre_proveedor}</td>

            <td>${proveedor.nit}</td>

            <td>${proveedor.telefono || "-"}</td>

            <td>${proveedor.email || "-"}</td>

            <td>${proveedor.direccion || "-"}</td>

            <td>
                ${
                    proveedor.estado
                    ?
                    '<span class="badge bg-success">Activo</span>'
                    :
                    '<span class="badge bg-secondary">Inactivo</span>'
                }
            </td>

            <td class="text-nowrap">

                <button
                    class="btn btn-sm btn-info me-1"
                    onclick="verProveedor(${proveedor.id_proveedor})"
                    title="Ver"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

                <button
                    class="btn btn-sm btn-warning me-1"
                    onclick="editarProveedor(${proveedor.id_proveedor})"
                    title="Editar"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                ${
                    proveedor.estado
                    ?
                    `
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="desactivarProveedor(${proveedor.id_proveedor})"
                        title="Desactivar"
                    >
                        <i class="fa-solid fa-ban"></i>
                    </button>
                    `
                    :
                    `
                    <button
                        class="btn btn-sm btn-success"
                        onclick="activarProveedor(${proveedor.id_proveedor})"
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

function filtrarProveedores() {

    const texto = document.getElementById(
        "buscarProveedor"
    ).value.toLowerCase();

    const filtrados = proveedores.filter(
        proveedor => {

            return (
                proveedor.nombre_proveedor
                    .toLowerCase()
                    .includes(texto)
                ||
                proveedor.nit
                    .toLowerCase()
                    .includes(texto)
                ||
                (proveedor.email || "")
                    .toLowerCase()
                    .includes(texto)
            );
        }
    );

    mostrarProveedores(filtrados);
}


// =====================================================
// CREAR
// =====================================================

async function crearProveedor(event) {

    event.preventDefault();

    const datos = {

        nombre_proveedor:
            document.getElementById(
                "nombreProveedor"
            ).value.trim(),

        nit:
            document.getElementById(
                "nitProveedor"
            ).value.trim(),

        telefono:
            document.getElementById(
                "telefonoProveedor"
            ).value.trim(),

        email:
            document.getElementById(
                "emailProveedor"
            ).value.trim(),

        direccion:
            document.getElementById(
                "direccionProveedor"
            ).value.trim()
    };

    const respuesta = await fetch(
        API_URL + "/api/v1/proveedores",
        {
            method: "POST",
            headers: headersJSON(),
            body: JSON.stringify(datos)
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        document.getElementById(
            "mensajeProveedor"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo crear el proveedor"
                }
            </div>
        `;

        return;
    }

    document.getElementById(
        "formProveedor"
    ).reset();

    document.getElementById(
        "mensajeProveedor"
    ).innerHTML = "";

    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalProveedor"
        )
    ).hide();

    await cargarProveedores();
}


// =====================================================
// VER
// =====================================================

async function verProveedor(idProveedor) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/proveedores/" +
        idProveedor,
        {
            headers: headersAuth()
        }
    );

    const proveedor = await respuesta.json();

    if (!respuesta.ok) {

        alert(
            proveedor.detail ||
            "No se pudo obtener el proveedor"
        );

        return;
    }

    document.getElementById(
        "verIdProveedor"
    ).textContent =
        proveedor.id_proveedor;

    document.getElementById(
        "verNombreProveedor"
    ).textContent =
        proveedor.nombre_proveedor;

    document.getElementById(
        "verNitProveedor"
    ).textContent =
        proveedor.nit;

    document.getElementById(
        "verTelefonoProveedor"
    ).textContent =
        proveedor.telefono || "-";

    document.getElementById(
        "verEmailProveedor"
    ).textContent =
        proveedor.email || "-";

    document.getElementById(
        "verDireccionProveedor"
    ).textContent =
        proveedor.direccion || "-";

    document.getElementById(
        "verEstadoProveedor"
    ).textContent =
        proveedor.estado
            ? "Activo"
            : "Inactivo";

    new bootstrap.Modal(
        document.getElementById(
            "modalVerProveedor"
        )
    ).show();
}


// =====================================================
// EDITAR
// =====================================================

async function editarProveedor(idProveedor) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/proveedores/" +
        idProveedor,
        {
            headers: headersAuth()
        }
    );

    const proveedor = await respuesta.json();

    if (!respuesta.ok) {

        alert(
            proveedor.detail ||
            "No se pudo obtener el proveedor"
        );

        return;
    }

    document.getElementById(
        "editarIdProveedor"
    ).value =
        proveedor.id_proveedor;

    document.getElementById(
        "editarNombreProveedor"
    ).value =
        proveedor.nombre_proveedor;

    document.getElementById(
        "editarNitProveedor"
    ).value =
        proveedor.nit;

    document.getElementById(
        "editarTelefonoProveedor"
    ).value =
        proveedor.telefono || "";

    document.getElementById(
        "editarEmailProveedor"
    ).value =
        proveedor.email || "";

    document.getElementById(
        "editarDireccionProveedor"
    ).value =
        proveedor.direccion || "";

    document.getElementById(
        "mensajeEditarProveedor"
    ).innerHTML = "";

    new bootstrap.Modal(
        document.getElementById(
            "modalEditarProveedor"
        )
    ).show();
}


// =====================================================
// GUARDAR EDICIÓN
// =====================================================

async function guardarEdicionProveedor(
    event
) {

    event.preventDefault();

    const idProveedor =
        document.getElementById(
            "editarIdProveedor"
        ).value;

    const datos = {

        nombre_proveedor:
            document.getElementById(
                "editarNombreProveedor"
            ).value.trim(),

        nit:
            document.getElementById(
                "editarNitProveedor"
            ).value.trim(),

        telefono:
            document.getElementById(
                "editarTelefonoProveedor"
            ).value.trim(),

        email:
            document.getElementById(
                "editarEmailProveedor"
            ).value.trim(),

        direccion:
            document.getElementById(
                "editarDireccionProveedor"
            ).value.trim()
    };

    const respuesta = await fetch(
        API_URL +
        "/api/v1/proveedores/" +
        idProveedor,
        {
            method: "PUT",
            headers: headersJSON(),
            body: JSON.stringify(datos)
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        document.getElementById(
            "mensajeEditarProveedor"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo editar el proveedor"
                }
            </div>
        `;

        return;
    }

    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalEditarProveedor"
        )
    ).hide();

    await cargarProveedores();
}


// =====================================================
// DESACTIVAR
// =====================================================

async function desactivarProveedor(
    idProveedor
) {

    if (!confirm(
        "¿Está seguro de desactivar este proveedor?"
    )) {
        return;
    }

    const respuesta = await fetch(
        API_URL +
        "/api/v1/proveedores/" +
        idProveedor,
        {
            method: "DELETE",
            headers: headersAuth()
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        alert(
            resultado.detail ||
            "No se pudo desactivar el proveedor"
        );

        return;
    }

    await cargarProveedores();
}


// =====================================================
// ACTIVAR
// =====================================================

async function activarProveedor(
    idProveedor
) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/proveedores/" +
        idProveedor +
        "/activar",
        {
            method: "PATCH",
            headers: headersAuth()
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        alert(
            resultado.detail ||
            "No se pudo activar el proveedor"
        );

        return;
    }

    await cargarProveedores();
}