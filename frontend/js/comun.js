const API_URL =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
        ? "http://127.0.0.1:8000"
        : "https://star-clock-api-supabase.onrender.com";

const token = localStorage.getItem("token");
const usuario = localStorage.getItem("usuario");
const rol = localStorage.getItem("rol");

if (!token) {
    window.location.href = "login.html";
}

function cargarUsuario() {

    const nombreUsuario =
        document.getElementById("nombreUsuario");

    const rolUsuario =
        document.getElementById("rolUsuario");

    if (nombreUsuario) {
        nombreUsuario.innerText =
            usuario || "Usuario";
    }

    if (rolUsuario) {
        rolUsuario.innerText =
            rol || "Sin rol";
    }
}


function cerrarSesion() {

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("rol");

    window.location.href =
        "login.html";
}


function irA(pagina) {

    window.location.href =
        pagina;
}


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


cargarUsuario();

// =====================================================
// PIE DE PÁGINA GLOBAL
// =====================================================

function agregarFooterGlobal() {

    const existeFooter =
        document.getElementById("footerGlobal");

    if (existeFooter) {
        return;
    }

    const footer =
        document.createElement("footer");

    footer.id = "footerGlobal";

    footer.className =
        "text-center mt-4 mb-3 text-muted";

    footer.innerHTML = `
        <small>
            © 2026 Edgar Panfilo Cruz Huanaco |
            STAR CLOCK - Sistema de Compra, Venta e Inventario |
            Proyecto académico
        </small>
    `;

    const main =
        document.querySelector("main");

    if (main) {
        main.appendChild(footer);
    } else {
        document.body.appendChild(footer);
    }
}


document.addEventListener(
    "DOMContentLoaded",
    agregarFooterGlobal
);