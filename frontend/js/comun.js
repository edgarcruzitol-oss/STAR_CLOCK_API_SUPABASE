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