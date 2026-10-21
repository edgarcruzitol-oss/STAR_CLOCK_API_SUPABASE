// =====================================================
// CONFIGURACIÓN DE LA API
// =====================================================

const API_URL =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
        ? "http://127.0.0.1:8000"
        : "https://star-clock-api-supabase.onrender.com";


// =====================================================
// DATOS DE SESIÓN
// =====================================================

const token =
    sessionStorage.getItem("token");

const usuario =
    sessionStorage.getItem("usuario");

const rol =
    sessionStorage.getItem("rol");


// 30 minutos de inactividad
const TIEMPO_MAXIMO_INACTIVIDAD =
    30 * 60 * 1000;


// =====================================================
// VERIFICAR SI EXISTE SESIÓN
// =====================================================

if (!token) {

    window.location.href =
        "login.html";
}


// =====================================================
// MOSTRAR USUARIO Y ROL
// =====================================================

function cargarUsuario() {

    const nombreUsuario =
        document.getElementById(
            "nombreUsuario"
        );

    const rolUsuario =
        document.getElementById(
            "rolUsuario"
        );


    if (nombreUsuario) {

        nombreUsuario.innerText =
            usuario || "Usuario";
    }


    if (rolUsuario) {

        rolUsuario.innerText =
            rol || "Sin rol";
    }
}


// =====================================================
// CERRAR SESIÓN
// =====================================================

function cerrarSesion() {

    sessionStorage.removeItem(
        "token"
    );

    sessionStorage.removeItem(
        "usuario"
    );

    sessionStorage.removeItem(
        "rol"
    );

    sessionStorage.removeItem(
        "ultimaActividad"
    );


    window.location.href =
        "login.html";
}


// =====================================================
// NAVEGACIÓN
// =====================================================

function irA(pagina) {

    window.location.href =
        pagina;
}


// =====================================================
// HEADERS JWT
// =====================================================

function headersAuth() {

    return {
        "Authorization":
            "Bearer " + token
    };
}


function headersJSON() {

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            "Bearer " + token
    };
}


// =====================================================
// CONTROL DE INACTIVIDAD
// =====================================================

function registrarActividad() {

    sessionStorage.setItem(
        "ultimaActividad",
        Date.now().toString()
    );
}


function verificarTiempoSesion() {

    const ultimaActividad =
        sessionStorage.getItem(
            "ultimaActividad"
        );


    // Si no existe registro de actividad,
    // se inicia desde este momento.
    if (!ultimaActividad) {

        registrarActividad();

        return;
    }


    const tiempoActual =
        Date.now();


    const tiempoAnterior =
        Number(
            ultimaActividad
        );


    const tiempoTranscurrido =
        tiempoActual -
        tiempoAnterior;


    if (
        tiempoTranscurrido >=
        TIEMPO_MAXIMO_INACTIVIDAD
    ) {

        alert(
            "La sesión ha expirado por inactividad. Debe iniciar sesión nuevamente."
        );

        cerrarSesion();
    }
}


// =====================================================
// DETECTAR ACTIVIDAD DEL USUARIO
// =====================================================

const eventosActividad = [

    "click",
    "keydown",
    "scroll",
    "touchstart"

];


eventosActividad.forEach(
    evento => {

        document.addEventListener(
            evento,
            registrarActividad
        );

    }
);


// =====================================================
// REVISAR SESIÓN CADA MINUTO
// =====================================================

setInterval(
    verificarTiempoSesion,
    60 * 1000
);


// Revisar inmediatamente
verificarTiempoSesion();


// =====================================================
// CARGAR DATOS DEL USUARIO
// =====================================================

cargarUsuario();


// =====================================================
// PIE DE PÁGINA GLOBAL
// =====================================================

function agregarFooterGlobal() {

    const existeFooter =
        document.getElementById(
            "footerGlobal"
        );


    if (existeFooter) {

        return;
    }


    const footer =
        document.createElement(
            "footer"
        );


    footer.id =
        "footerGlobal";


    footer.className =
        "text-center mt-4 mb-3 pt-3 text-muted";


    footer.innerHTML = `
        <hr>
        <small>
            © 2026 Edgar Panfilo Cruz Huanaco |
            STAR CLOCK - Sistema de Compra, Venta e Inventario |
            Proyecto académico
        </small>
    `;


    const main =
        document.querySelector(
            "main"
        );


    if (main) {

        main.appendChild(
            footer
        );

    } else {

        document.body.appendChild(
            footer
        );
    }
}


// Como comun.js se carga al final del HTML,
// podemos agregarlo directamente.
agregarFooterGlobal();

// =====================================================
// AGREGAR MODELO 3D AL MENÚ GLOBAL
// =====================================================

function agregarModelo3DMenu() {

    const menu =
        document.querySelector(
            ".sidebar-menu"
        );

    if (!menu) {
        return;
    }

    if (
        document.getElementById(
            "menuModelo3D"
        )
    ) {
        return;
    }


    const enlace =
        document.createElement(
            "a"
        );


    enlace.id =
        "menuModelo3D";

    enlace.href =
        "modelo3d.html";

    enlace.className =
        "menu-item";


    enlace.innerHTML = `
        <i class="fa-solid fa-cube"></i>
        <span>Modelo 3D</span>
    `;


    menu.appendChild(
        enlace
    );
}


agregarModelo3DMenu();