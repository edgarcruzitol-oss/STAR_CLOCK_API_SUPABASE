let usuarios = [];

const rolActual =
    (localStorage.getItem("rol") || "")
        .toLowerCase();


// =====================================================
// INICIO
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        cargarUsuarios();

        document.getElementById(
            "buscarUsuario"
        ).addEventListener(
            "input",
            filtrarUsuarios
        );

        document.getElementById(
            "formUsuario"
        ).addEventListener(
            "submit",
            crearUsuario
        );

        document.getElementById(
            "formEditarUsuario"
        ).addEventListener(
            "submit",
            guardarEdicionUsuario
        );


        // Solo ADMIN puede crear usuarios
        if (rolActual !== "admin") {

            document.getElementById(
                "btnNuevoUsuario"
            ).style.display = "none";
        }
    }
);


// =====================================================
// LISTAR
// =====================================================

async function cargarUsuarios() {

    try {

        const respuesta = await fetch(
            API_URL + "/api/v1/usuarios",
            {
                headers: headersAuth()
            }
        );

        const resultado =
            await respuesta.json();

        if (!respuesta.ok) {

            throw new Error(
                resultado.detail ||
                "No se pudieron cargar los usuarios"
            );
        }

        usuarios = resultado;

        mostrarUsuarios(usuarios);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "tablaUsuarios"
        ).innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center text-danger">
                    ${error.message}
                </td>
            </tr>
        `;
    }
}


// =====================================================
// MOSTRAR
// =====================================================

function mostrarUsuarios(lista) {

    const tabla = document.getElementById(
        "tablaUsuarios"
    );

    tabla.innerHTML = "";

    if (lista.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-center">
                    No existen usuarios registrados.
                </td>
            </tr>
        `;

        return;
    }


    lista.forEach(usuario => {

        const fila =
            document.createElement("tr");

        let botonesAdministracion = "";


        if (rolActual === "admin") {

            botonesAdministracion = `

                <button
                    class="btn btn-sm btn-warning me-1"
                    onclick="editarUsuario(${usuario.id_usuario})"
                    title="Editar"
                >
                    <i class="fa-solid fa-pen"></i>
                </button>

                ${
                    usuario.estado
                    ?
                    `
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="desactivarUsuario(${usuario.id_usuario})"
                        title="Desactivar"
                    >
                        <i class="fa-solid fa-ban"></i>
                    </button>
                    `
                    :
                    `
                    <button
                        class="btn btn-sm btn-success"
                        onclick="activarUsuario(${usuario.id_usuario})"
                        title="Activar"
                    >
                        <i class="fa-solid fa-check"></i>
                    </button>
                    `
                }
            `;
        }


        fila.innerHTML = `

            <td>
                ${usuario.id_usuario}
            </td>

            <td>
                ${usuario.nombre}
            </td>

            <td>
                ${usuario.apellido}
            </td>

            <td>
                ${usuario.nombre_usuario}
            </td>

            <td>
                <span class="badge bg-primary">
                    ${usuario.rol}
                </span>
            </td>

            <td>
                ${
                    usuario.estado
                    ?
                    '<span class="badge bg-success">Activo</span>'
                    :
                    '<span class="badge bg-secondary">Inactivo</span>'
                }
            </td>

            <td class="text-nowrap">

                <button
                    class="btn btn-sm btn-info me-1"
                    onclick="verUsuario(${usuario.id_usuario})"
                    title="Ver"
                >
                    <i class="fa-solid fa-eye"></i>
                </button>

                ${botonesAdministracion}

            </td>
        `;

        tabla.appendChild(fila);
    });
}


// =====================================================
// BUSCAR
// =====================================================

function filtrarUsuarios() {

    const texto = document.getElementById(
        "buscarUsuario"
    ).value.toLowerCase();

    const filtrados =
        usuarios.filter(usuario => {

            return (
                usuario.nombre
                    .toLowerCase()
                    .includes(texto)
                ||
                usuario.apellido
                    .toLowerCase()
                    .includes(texto)
                ||
                usuario.nombre_usuario
                    .toLowerCase()
                    .includes(texto)
                ||
                usuario.rol
                    .toLowerCase()
                    .includes(texto)
            );
        });

    mostrarUsuarios(filtrados);
}


// =====================================================
// CREAR
// =====================================================

async function crearUsuario(event) {

    event.preventDefault();

    if (rolActual !== "admin") {

        alert(
            "Solo el administrador puede crear usuarios."
        );

        return;
    }


    const datos = {

        nombre:
            document.getElementById(
                "nombreNuevoUsuario"
            ).value.trim(),

        apellido:
            document.getElementById(
                "apellidoNuevoUsuario"
            ).value.trim(),

        nombre_usuario:
            document.getElementById(
                "nombreUsuarioNuevo"
            ).value.trim(),

        password:
            document.getElementById(
                "passwordUsuario"
            ).value,

        rol:
            document.getElementById(
                "rolNuevoUsuario"
            ).value
    };


    const respuesta = await fetch(
        API_URL + "/api/v1/usuarios",
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
            "mensajeUsuario"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo crear el usuario"
                }
            </div>
        `;

        return;
    }


    document.getElementById(
        "formUsuario"
    ).reset();


    document.getElementById(
        "mensajeUsuario"
    ).innerHTML = "";


    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalUsuario"
        )
    ).hide();


    await cargarUsuarios();
}


// =====================================================
// VER
// =====================================================

async function verUsuario(idUsuario) {

    const respuesta = await fetch(
        API_URL +
        "/api/v1/usuarios/" +
        idUsuario,
        {
            headers: headersAuth()
        }
    );


    const usuario =
        await respuesta.json();


    if (!respuesta.ok) {

        alert(
            usuario.detail ||
            "No se pudo obtener el usuario"
        );

        return;
    }


    document.getElementById(
        "verIdUsuario"
    ).textContent =
        usuario.id_usuario;


    document.getElementById(
        "verNombreUsuario"
    ).textContent =
        usuario.nombre;


    document.getElementById(
        "verApellidoUsuario"
    ).textContent =
        usuario.apellido;


    document.getElementById(
        "verCuentaUsuario"
    ).textContent =
        usuario.nombre_usuario;


    document.getElementById(
        "verRolUsuario"
    ).textContent =
        usuario.rol;


    document.getElementById(
        "verEstadoUsuario"
    ).textContent =
        usuario.estado
            ? "Activo"
            : "Inactivo";


    new bootstrap.Modal(
        document.getElementById(
            "modalVerUsuario"
        )
    ).show();
}


// =====================================================
// EDITAR
// =====================================================

async function editarUsuario(idUsuario) {

    if (rolActual !== "admin") {

        alert(
            "Solo el administrador puede editar usuarios."
        );

        return;
    }


    const respuesta = await fetch(
        API_URL +
        "/api/v1/usuarios/" +
        idUsuario,
        {
            headers: headersAuth()
        }
    );


    const usuario =
        await respuesta.json();


    if (!respuesta.ok) {

        alert(
            usuario.detail ||
            "No se pudo obtener el usuario"
        );

        return;
    }


    document.getElementById(
        "editarIdUsuario"
    ).value =
        usuario.id_usuario;


    document.getElementById(
        "editarNombreUsuario"
    ).value =
        usuario.nombre;


    document.getElementById(
        "editarApellidoUsuario"
    ).value =
        usuario.apellido;


    document.getElementById(
        "editarNombreCuentaUsuario"
    ).value =
        usuario.nombre_usuario;


    document.getElementById(
        "editarPasswordUsuario"
    ).value = "";


    document.getElementById(
        "editarRolUsuario"
    ).value =
        usuario.rol;


    document.getElementById(
        "mensajeEditarUsuario"
    ).innerHTML = "";


    new bootstrap.Modal(
        document.getElementById(
            "modalEditarUsuario"
        )
    ).show();
}


// =====================================================
// GUARDAR EDICIÓN
// =====================================================

async function guardarEdicionUsuario(
    event
) {

    event.preventDefault();


    if (rolActual !== "admin") {
        return;
    }


    const idUsuario =
        document.getElementById(
            "editarIdUsuario"
        ).value;


    const password =
        document.getElementById(
            "editarPasswordUsuario"
        ).value;


    const datos = {

        nombre:
            document.getElementById(
                "editarNombreUsuario"
            ).value.trim(),

        apellido:
            document.getElementById(
                "editarApellidoUsuario"
            ).value.trim(),

        nombre_usuario:
            document.getElementById(
                "editarNombreCuentaUsuario"
            ).value.trim(),

        password:
            password.trim() === ""
                ? null
                : password,

        rol:
            document.getElementById(
                "editarRolUsuario"
            ).value
    };


    const respuesta = await fetch(
        API_URL +
        "/api/v1/usuarios/" +
        idUsuario,
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
            "mensajeEditarUsuario"
        ).innerHTML = `
            <div class="alert alert-danger">
                ${
                    resultado.detail ||
                    "No se pudo editar el usuario"
                }
            </div>
        `;

        return;
    }


    bootstrap.Modal.getInstance(
        document.getElementById(
            "modalEditarUsuario"
        )
    ).hide();


    await cargarUsuarios();
}


// =====================================================
// DESACTIVAR
// =====================================================

async function desactivarUsuario(
    idUsuario
) {

    if (rolActual !== "admin") {
        return;
    }


    if (!confirm(
        "¿Está seguro de desactivar este usuario?"
    )) {
        return;
    }


    const respuesta = await fetch(
        API_URL +
        "/api/v1/usuarios/" +
        idUsuario,
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
            "No se pudo desactivar el usuario"
        );

        return;
    }


    await cargarUsuarios();
}


// =====================================================
// ACTIVAR
// =====================================================

async function activarUsuario(
    idUsuario
) {

    if (rolActual !== "admin") {
        return;
    }


    const respuesta = await fetch(
        API_URL +
        "/api/v1/usuarios/" +
        idUsuario +
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
            "No se pudo activar el usuario"
        );

        return;
    }


    await cargarUsuarios();
}