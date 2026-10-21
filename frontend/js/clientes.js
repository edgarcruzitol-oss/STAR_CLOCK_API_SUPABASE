let clientes = [];


document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarClientes();

        document.getElementById(
            "buscarCliente"
        ).addEventListener(
            "input",
            filtrarClientes
        );

        document.getElementById(
            "formCliente"
        ).addEventListener(
            "submit",
            crearCliente
        );

        document.getElementById(
            "formEditarCliente"
        ).addEventListener(
            "submit",
            guardarEdicionCliente
        );
    }
);


// =====================================================
// LISTAR
// =====================================================

async function cargarClientes() {

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/clientes"
        );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudieron cargar los clientes"
            );
        }

        clientes = await respuesta.json();

        mostrarClientes(clientes);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "tablaClientes"
        ).innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-danger">
                    Error al cargar clientes
                </td>
            </tr>
        `;
    }
}


// =====================================================
// MOSTRAR
// =====================================================

function mostrarClientes(lista) {

    const tabla = document.getElementById(
        "tablaClientes"
    );

    tabla.innerHTML = "";

    if (lista.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    No existen clientes registrados.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach(cliente => {

        const fila = document.createElement("tr");

        fila.innerHTML = `

            <td>${cliente.id_cliente}</td>

            <td>${cliente.nombre}</td>

            <td>${cliente.apellido || "-"}</td>

            <td>${cliente.ci_nit || "-"}</td>

            <td>${cliente.telefono || "-"}</td>

            <td>${cliente.email || "-"}</td>

            <td>
                ${
                    cliente.estado
                    ?
                    '<span class="badge bg-success">Activo</span>'
                    :
                    '<span class="badge bg-secondary">Inactivo</span>'
                }
            </td>

            <td class="text-nowrap">

                <button
                    class="btn btn-sm btn-info me-1"
                    onclick="verCliente(${cliente.id_cliente})"
                    title="Ver"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

                <button
                    class="btn btn-sm btn-warning me-1"
                    onclick="editarCliente(${cliente.id_cliente})"
                    title="Editar"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                ${
                    cliente.estado
                    ?
                    `
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="desactivarCliente(${cliente.id_cliente})"
                        title="Desactivar"
                    >
                        <i class="fa-solid fa-ban"></i>
                    </button>
                    `
                    :
                    `
                    <button
                        class="btn btn-sm btn-success"
                        onclick="activarCliente(${cliente.id_cliente})"
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

function filtrarClientes() {

    const texto = document.getElementById(
        "buscarCliente"
    ).value.toLowerCase();

    const filtrados = clientes.filter(
        cliente => {

            return (
                (cliente.nombre || "")
                    .toLowerCase()
                    .includes(texto)
                ||
                (cliente.apellido || "")
                    .toLowerCase()
                    .includes(texto)
                ||
                (cliente.ci_nit || "")
                    .toLowerCase()
                    .includes(texto)
            );
        }
    );

    mostrarClientes(filtrados);
}


// =====================================================
// CREAR
// =====================================================

async function crearCliente(event) {

    event.preventDefault();

    const datos = {

        nombre:
            document.getElementById(
                "nombreCliente"
            ).value.trim(),

        apellido:
            document.getElementById(
                "apellidoCliente"
            ).value.trim(),

        ci_nit:
            document.getElementById(
                "ciNitCliente"
            ).value.trim(),

        telefono:
            document.getElementById(
                "telefonoCliente"
            ).value.trim(),

        email:
            document.getElementById(
                "emailCliente"
            ).value.trim()
    };

    const respuesta = await fetch(
        API_URL + "/api/v1/clientes",
        {
            method: "POST",
            headers: headersJSON(),
            body: JSON.stringify(datos)
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        document.getElementById(
            "mensajeCliente"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo crear el cliente"
                }
            </div>
        `;

        return;
    }

    document.getElementById(
        "formCliente"
    ).reset();

    document.getElementById(
        "mensajeCliente"
    ).innerHTML = "";

    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalCliente"
        )
    ).hide();

    await cargarClientes();
}


// =====================================================
// VER
// =====================================================

async function verCliente(idCliente) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/clientes/" +
        idCliente,
        {
            headers: headersAuth()
        }
    );

    const cliente = await respuesta.json();

    if (!respuesta.ok) {

        alert(
            cliente.detail ||
            "No se pudo obtener el cliente"
        );

        return;
    }

    document.getElementById(
        "verIdCliente"
    ).textContent =
        cliente.id_cliente;

    document.getElementById(
        "verNombreCliente"
    ).textContent =
        cliente.nombre;

    document.getElementById(
        "verApellidoCliente"
    ).textContent =
        cliente.apellido || "-";

    document.getElementById(
        "verCiNitCliente"
    ).textContent =
        cliente.ci_nit || "-";

    document.getElementById(
        "verTelefonoCliente"
    ).textContent =
        cliente.telefono || "-";

    document.getElementById(
        "verEmailCliente"
    ).textContent =
        cliente.email || "-";

    document.getElementById(
        "verEstadoCliente"
    ).textContent =
        cliente.estado
            ? "Activo"
            : "Inactivo";

    new bootstrap.Modal(
        document.getElementById(
            "modalVerCliente"
        )
    ).show();
}


// =====================================================
// EDITAR
// =====================================================

async function editarCliente(idCliente) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/clientes/" +
        idCliente,
        {
            headers: headersAuth()
        }
    );

    const cliente = await respuesta.json();

    if (!respuesta.ok) {

        alert(
            cliente.detail ||
            "No se pudo obtener el cliente"
        );

        return;
    }

    document.getElementById(
        "editarIdCliente"
    ).value =
        cliente.id_cliente;

    document.getElementById(
        "editarNombreCliente"
    ).value =
        cliente.nombre || "";

    document.getElementById(
        "editarApellidoCliente"
    ).value =
        cliente.apellido || "";

    document.getElementById(
        "editarCiNitCliente"
    ).value =
        cliente.ci_nit || "";

    document.getElementById(
        "editarTelefonoCliente"
    ).value =
        cliente.telefono || "";

    document.getElementById(
        "editarEmailCliente"
    ).value =
        cliente.email || "";

    document.getElementById(
        "mensajeEditarCliente"
    ).innerHTML = "";

    new bootstrap.Modal(
        document.getElementById(
            "modalEditarCliente"
        )
    ).show();
}


// =====================================================
// GUARDAR EDICIÓN
// =====================================================

async function guardarEdicionCliente(
    event
) {

    event.preventDefault();

    const idCliente =
        document.getElementById(
            "editarIdCliente"
        ).value;

    const datos = {

        nombre:
            document.getElementById(
                "editarNombreCliente"
            ).value.trim(),

        apellido:
            document.getElementById(
                "editarApellidoCliente"
            ).value.trim(),

        ci_nit:
            document.getElementById(
                "editarCiNitCliente"
            ).value.trim(),

        telefono:
            document.getElementById(
                "editarTelefonoCliente"
            ).value.trim(),

        email:
            document.getElementById(
                "editarEmailCliente"
            ).value.trim()
    };

    const respuesta = await fetch(
        API_URL +
        "/api/v1/clientes/" +
        idCliente,
        {
            method: "PUT",
            headers: headersJSON(),
            body: JSON.stringify(datos)
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        document.getElementById(
            "mensajeEditarCliente"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo editar el cliente"
                }
            </div>
        `;

        return;
    }

    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalEditarCliente"
        )
    ).hide();

    await cargarClientes();
}


// =====================================================
// DESACTIVAR
// =====================================================

async function desactivarCliente(
    idCliente
) {

    if (!confirm(
        "¿Está seguro de desactivar este cliente?"
    )) {
        return;
    }

    const respuesta = await fetch(
        API_URL +
        "/api/v1/clientes/" +
        idCliente,
        {
            method: "DELETE",
            headers: headersAuth()
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok) {

        alert(
            resultado.detail ||
            "No se pudo desactivar el cliente"
        );

        return;
    }

    await cargarClientes();
}


// =====================================================
// ACTIVAR
// =====================================================

async function activarCliente(
    idCliente
) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/clientes/" +
        idCliente +
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
            "No se pudo activar el cliente"
        );

        return;
    }

    await cargarClientes();
}