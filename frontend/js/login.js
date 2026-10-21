const API_URL =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost"
        ? "http://127.0.0.1:8000"
        : "https://star-clock-api-supabase.onrender.com";


const loginForm =
    document.getElementById("loginForm");

const mensaje =
    document.getElementById("mensaje");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // =====================================================
        // OBTENER DATOS DEL FORMULARIO
        // =====================================================

        const usuario =
            document.getElementById(
                "usuario"
            ).value.trim();

        const password =
            document.getElementById(
                "password"
            ).value;


        mensaje.innerHTML = "";


        // =====================================================
        // VALIDACIONES BÁSICAS
        // =====================================================

        if (!usuario || !password) {

            mensaje.innerHTML =
                '<span class="text-danger">' +
                'Complete usuario y contraseña.' +
                '</span>';

            return;
        }


        try {

            // =====================================================
            // ENVIAR LOGIN A FASTAPI
            // =====================================================

            const respuesta = await fetch(
                API_URL +
                "/api/v1/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        nombre_usuario:
                            usuario,

                        password:
                            password
                    })
                }
            );


            // =====================================================
            // LEER RESPUESTA
            // =====================================================

            const datos =
                await respuesta.json();


            // =====================================================
            // LOGIN INCORRECTO
            // =====================================================

            if (!respuesta.ok) {

                mensaje.innerHTML =
                    '<span class="text-danger">' +
                    (
                        datos.detail ||
                        "Usuario o contraseña incorrectos"
                    ) +
                    '</span>';

                return;
            }


            // =====================================================
            // GUARDAR JWT Y DATOS DEL USUARIO
            // =====================================================

            sessionStorage.setItem(
                "token",
                datos.access_token
            );

            sessionStorage.setItem(
                "usuario",
                datos.usuario
            );

            sessionStorage.setItem(
                "rol",
                datos.rol
            );

            sessionStorage.setItem(
                "ultimaActividad",
                Date.now().toString()
            );


            // =====================================================
            // MENSAJE CORRECTO
            // =====================================================

            mensaje.innerHTML =
                '<span class="text-success">' +
                '<i class="fa-solid fa-circle-check me-1"></i>' +
                'Inicio de sesión correcto' +
                '</span>';


            // =====================================================
            // REDIRECCIONAR AL DASHBOARD
            // =====================================================

            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                700
            );

        } catch (error) {

            console.error(
                "Error en login:",
                error
            );


            mensaje.innerHTML =
                '<span class="text-danger">' +
                '<i class="fa-solid fa-triangle-exclamation me-1"></i>' +
                'No se pudo conectar con la API' +
                '</span>';

        }

    }
);