// Escucha el evento 'DOMContentLoaded' para ejecutar el JavaScript una vez que el navegador haya cargado todo el HTML
document.addEventListener("DOMContentLoaded", () => {

    // ==================== 1. VARIABLES DE ESTADO Y ALMACENAMIENTO ====================
    let carrito = JSON.parse(localStorage.getItem("carritoCooratiendas")) || [];
    let usuariosRegistrados = JSON.parse(localStorage.getItem("usuariosCooratiendas")) || [];
    let usuarioActivo = JSON.parse(localStorage.getItem("sesionCooratiendas")) || null;
    let categoriaActual = "todos";
    let modoLista = false;
    let tamanoLetra = parseInt(localStorage.getItem("tamanoFuente"), 10) || 16;
    const metaEnvio = 150000;
    const telefonoWhatsApp = "573124261632";
    const temporizadoresBotones = new WeakMap();

    // ==================== 2. REFERENCIAS A ELEMENTOS DEL HTML ====================
    const tarjetasCatalogoHTML = document.querySelectorAll(".item-producto, .item-catalogo");
    const listaProductosHTML = document.getElementById("lista-productos");
    const rejillaPromocionesHTML = document.getElementById("rejilla-promociones");
    const inputBuscar = document.getElementById("input-buscar");
    const btnCambiarVista = document.getElementById("btn-cambiar-vista");
    const botonesFiltro = document.querySelectorAll(".btn-filtro");
    const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");

    const botonesNav = document.querySelectorAll(".nav-link-landing");
    const vistasLanding = document.querySelectorAll(".landing-page");

    const btnAumentarTexto = document.getElementById("btn-aumentar-texto");
    const btnDisminuirTexto = document.getElementById("btn-disminuir-texto");
    const btnRestaurarTexto = document.getElementById("btn-restaurar-texto");
    const btnAltoContraste = document.getElementById("btn-alto-contraste");
    const btnTema = document.getElementById("btn-tema");

    const contadorCarrito = document.getElementById("contador-carrito");
    const modalCarrito = document.getElementById("modal-carrito");
    const btnAbrirCarrito = document.getElementById("btn-abrir-carrito");
    const btnCerrarCarrito = document.getElementById("btn-cerrar-carrito");
    const listaCarritoHTML = document.getElementById("items-carrito");
    const totalCarritoHTML = document.getElementById("total-carrito");
    const textoAhorroHTML = document.getElementById("texto-ahorro");
    const textoDescuentoSocioHTML = document.getElementById("texto-descuento-socio");
    const btnVaciar = document.getElementById("btn-vaciar");
    const btnComprar = document.getElementById("btn-comprar");
    const btnPedirWaCarrito = document.getElementById("btn-pedir-wa-carrito");
    const textoEnvio = document.getElementById("texto-envio");
    const barraProgresoEnvio = document.getElementById("barra-progreso-envio");

    const btnToggleChat = document.getElementById("btn-toggle-chat");
    const ventanaChatbot = document.getElementById("ventana-chatbot");
    const btnCerrarChat = document.getElementById("btn-cerrar-chat");
    const mensajesChat = document.getElementById("mensajes-chat");
    const formChatbot = document.getElementById("form-chatbot");
    const inputChat = document.getElementById("input-chat");
    const btnIrWhatsapp = document.getElementById("btn-ir-whatsapp");
    const chipsChat = document.querySelectorAll(".btn-chip-chat");

    const formRegistroUsuario = document.getElementById("form-registro-usuario");
    const formLoginUsuario = document.getElementById("form-login-usuario");
    const panelUsuarioActivo = document.getElementById("panel-usuario-activo");
    const contenedorFormulariosAuth = document.getElementById("contenedor-formularios-auth");
    const saludoUsuarioTop = document.getElementById("saludo-usuario-top");
    const totalUsuariosRegHTML = document.getElementById("total-usuarios-reg");

    const notificacion = document.getElementById("notificacion");
    let temporizadorAviso;

    // ==================== 3. FUNCIÓN DE NOTIFICACIONES FLOTANTES ====================
    function mostrarAviso(mensaje) {
        if (!notificacion) return;
        notificacion.textContent = mensaje;
        notificacion.classList.remove("oculto");
        clearTimeout(temporizadorAviso);
        temporizadorAviso = setTimeout(() => {
            notificacion.classList.add("oculto");
        }, 2500);
    }

    // ==================== 4. NAVEGACIÓN ENTRE LAS 7 VISTAS LANDING ====================
    function cambiarVista(idVistaDestino) {
        vistasLanding.forEach((vista) => {
            vista.classList.add("oculto");
            vista.classList.remove("activa");
        });

        const vistaActiva = document.getElementById(idVistaDestino);
        if (vistaActiva) {
            vistaActiva.classList.remove("oculto");
            vistaActiva.classList.add("activa");
        }

        botonesNav.forEach((btn) => {
            btn.classList.toggle("activo", btn.getAttribute("data-vista") === idVistaDestino);
        });

        const menuCollapse = document.getElementById("menuPrincipal");
        if (menuCollapse && menuCollapse.classList.contains("show") && window.bootstrap) {
            bootstrap.Collapse.getOrCreateInstance(menuCollapse).hide();
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    botonesNav.forEach((boton) => {
        boton.addEventListener("click", () => cambiarVista(boton.getAttribute("data-vista")));
    });

    document.querySelectorAll("[data-ir-vista]").forEach((boton) => {
        boton.addEventListener("click", () => cambiarVista(boton.getAttribute("data-ir-vista")));
    });

    document.querySelectorAll("[data-ir-categoria]").forEach((tarjeta) => {
        tarjeta.addEventListener("click", () => {
            const cat = tarjeta.getAttribute("data-ir-categoria");
            cambiarVista("vista-catalogo");
            categoriaActual = cat;
            botonesFiltro.forEach((b) => b.classList.toggle("activo", b.getAttribute("data-categoria") === cat));
            filtrarCatalogo();
        });
    });

    // ==================== 5. FILTRADO DEL CATÁLOGO HTML Y CLONADO DE PROMOCIONES ====================
    function filtrarCatalogo() {
        const texto = inputBuscar ? inputBuscar.value.toLowerCase().trim() : "";
        let visibles = 0;

        tarjetasCatalogoHTML.forEach((tarjeta) => {
            const cat = tarjeta.getAttribute("data-categoria") || tarjeta.getAttribute("data-cat") || "";
            const contenidoTexto = tarjeta.textContent.toLowerCase();

            const coincideCat = categoriaActual === "todos" || cat === categoriaActual;
            const coincideTexto = contenidoTexto.includes(texto);

            if (coincideCat && coincideTexto) {
                tarjeta.classList.remove("oculto");
                visibles++;
            } else {
                tarjeta.classList.add("oculto");
            }
        });

        if (listaProductosHTML) {
            listaProductosHTML.classList.toggle("vista-lista-activa", modoLista);
        }
        if (mensajeSinResultados) {
            mensajeSinResultados.classList.toggle("oculto", visibles > 0);
        }
    }

    function cargarPromocionesDesdeHTML() {
        if (!rejillaPromocionesHTML) return;
        rejillaPromocionesHTML.innerHTML = "";
        tarjetasCatalogoHTML.forEach((tarjeta) => {
            if (tarjeta.getAttribute("data-promo") === "true") {
                const clon = tarjeta.cloneNode(true);
                clon.classList.remove("oculto");
                rejillaPromocionesHTML.appendChild(clon);
            }
        });
    }

    if (inputBuscar) {
        inputBuscar.addEventListener("input", filtrarCatalogo);
    }

    if (btnCambiarVista) {
        btnCambiarVista.addEventListener("click", () => {
            modoLista = !modoLista;
            btnCambiarVista.textContent = modoLista ? "Vista Cuadrícula" : "Vista Lista";
            tarjetasCatalogoHTML.forEach((tarjeta) => {
                if (modoLista) {
                    tarjeta.classList.remove("col-sm-6", "col-md-4", "col-lg-3");
                    tarjeta.classList.add("col-12");
                } else {
                    tarjeta.classList.remove("col-12");
                    tarjeta.classList.add("col-sm-6", "col-md-4", "col-lg-3");
                }
            });
            filtrarCatalogo();
        });
    }

    botonesFiltro.forEach((boton) => {
        boton.addEventListener("click", () => {
            botonesFiltro.forEach((b) => b.classList.remove("activo"));
            boton.classList.add("activo");
            categoriaActual = boton.getAttribute("data-categoria");
            filtrarCatalogo();
        });
    });

    // ==================== 6. AGREGAR PRODUCTOS Y RECETAS AL CARRITO ====================
    function feedbackBotonAgregar(boton, cantidadActual) {
        if (!boton) return;
        if (!boton.dataset.textoOriginal) {
            boton.dataset.textoOriginal = boton.textContent.trim();
        }
        const textoBase = boton.dataset.textoOriginal;
        boton.textContent = `Añadido (${cantidadActual})`;
        boton.classList.remove("btn-success");
        boton.classList.add("btn-dark");

        const timerPrevio = temporizadoresBotones.get(boton);
        if (timerPrevio) clearTimeout(timerPrevio);

        const nuevoTimer = setTimeout(() => {
            boton.textContent = textoBase;
            boton.classList.remove("btn-dark");
            boton.classList.add("btn-success");
        }, 1200);
        temporizadoresBotones.set(boton, nuevoTimer);
    }

    function agregarProductoDesdeTarjeta(tarjeta, botonClickeado = null) {
        const id = String(tarjeta.getAttribute("data-id") || "").trim();
        const nombre = (tarjeta.getAttribute("data-nombre") || "Producto").trim();
        const precio = parseInt(tarjeta.getAttribute("data-precio"), 10) || 0;
        const precioNormal = parseInt(tarjeta.getAttribute("data-precio-antes"), 10) || precio;

        const existente = carrito.find((item) => String(item.id) === id);
        let cantidadNueva = 1;

        if (existente) {
            existente.cantidad += 1;
            cantidadNueva = existente.cantidad;
        } else {
            carrito.push({ id, nombre, precio, precioNormal, cantidad: 1 });
        }

        actualizarCarrito();
        feedbackBotonAgregar(botonClickeado, cantidadNueva);
        return { nombre, cantidadNueva };
    }

    document.addEventListener("click", (evento) => {
        const btnAgregar = evento.target.closest(".btn-agregar-carrito, .btn-agregar");
        if (btnAgregar) {
            const tarjeta = btnAgregar.closest(".item-producto, .item-catalogo");
            if (tarjeta) {
                const { nombre, cantidadNueva } = agregarProductoDesdeTarjeta(tarjeta, btnAgregar);
                mostrarAviso(`Añadido al carrito: ${nombre} (${cantidadNueva})`);
            }
            return;
        }

        const btnReceta = evento.target.closest(".btn-agregar-receta");
        if (btnReceta) {
            const listaIds = (btnReceta.getAttribute("data-ids") || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            const nombreReceta = btnReceta.getAttribute("data-nombre-receta") || "Receta";

            listaIds.forEach((idProd) => {
                const tarjeta = document.querySelector(`.item-producto[data-id="${idProd}"], .item-catalogo[data-id="${idProd}"]`);
                if (tarjeta) {
                    const botonTarjeta = tarjeta.querySelector(".btn-agregar-carrito, .btn-agregar");
                    agregarProductoDesdeTarjeta(tarjeta, botonTarjeta);
                }
            });
            mostrarAviso(`¡Ingredientes de ${nombreReceta} añadidos al carrito!`);
        }
    });

    // ==================== 7. SISTEMA DE REGISTRO E INICIO DE SESIÓN DE USUARIOS ====================
    function actualizarEstadoSesion() {
        if (totalUsuariosRegHTML) {
            totalUsuariosRegHTML.textContent = usuariosRegistrados.length;
        }

        const navBtnRegistro = document.getElementById("nav-btn-registro");
        if (usuarioActivo) {
            panelUsuarioActivo?.classList.remove("oculto");
            contenedorFormulariosAuth?.classList.add("oculto");
            const elNombre = document.getElementById("perfil-nombre");
            const elCorreo = document.getElementById("perfil-correo");
            const elCiudad = document.getElementById("perfil-ciudad");
            if (elNombre) elNombre.textContent = usuarioActivo.nombre;
            if (elCorreo) elCorreo.textContent = usuarioActivo.correo;
            if (elCiudad) elCiudad.textContent = `${usuarioActivo.ciudad} (${usuarioActivo.tipo})`;
            if (saludoUsuarioTop) {
                saludoUsuarioTop.textContent = `Hola, ${usuarioActivo.nombre.split(" ")[0]} (5% Dcto. Activo)`;
            }
            if (navBtnRegistro) navBtnRegistro.textContent = "Mi Cuenta";
        } else {
            panelUsuarioActivo?.classList.add("oculto");
            contenedorFormulariosAuth?.classList.remove("oculto");
            if (saludoUsuarioTop) saludoUsuarioTop.textContent = "";
            if (navBtnRegistro) navBtnRegistro.textContent = "Registro / Cuenta";
        }

        actualizarCarrito();
    }

    if (formRegistroUsuario) {
        formRegistroUsuario.addEventListener("submit", (e) => {
            e.preventDefault();
            const nombre = document.getElementById("reg-nombre").value.trim();
            const documento = document.getElementById("reg-documento").value.trim();
            const correo = document.getElementById("reg-correo").value.trim().toLowerCase();
            const telefono = document.getElementById("reg-telefono").value.trim();
            const ciudad = document.getElementById("reg-ciudad").value;
            const tipo = document.getElementById("reg-tipo").value;
            const clave = document.getElementById("reg-clave").value;

            if (usuariosRegistrados.some((u) => u.correo === correo)) {
                return mostrarAviso("Este correo ya está registrado. Inicia sesión en el panel derecho.");
            }

            const nuevoUsuario = { nombre, documento, correo, telefono, ciudad, tipo, clave };
            usuariosRegistrados.push(nuevoUsuario);
            localStorage.setItem("usuariosCooratiendas", JSON.stringify(usuariosRegistrados));

            usuarioActivo = nuevoUsuario;
            localStorage.setItem("sesionCooratiendas", JSON.stringify(usuarioActivo));

            e.target.reset();
            actualizarEstadoSesion();
            mostrarAviso(`¡Registro exitoso, ${nombre}! Tienes 5% de descuento activo.`);
        });
    }

    if (formLoginUsuario) {
        formLoginUsuario.addEventListener("submit", (e) => {
            e.preventDefault();
            const correo = document.getElementById("login-correo").value.trim().toLowerCase();
            const clave = document.getElementById("login-clave").value;

            const encontrado = usuariosRegistrados.find((u) => u.correo === correo && u.clave === clave);
            if (!encontrado) {
                return mostrarAviso("Correo o contraseña incorrectos. Regístrate gratis si aún no tienes cuenta.");
            }

            usuarioActivo = encontrado;
            localStorage.setItem("sesionCooratiendas", JSON.stringify(usuarioActivo));
            e.target.reset();
            actualizarEstadoSesion();
            mostrarAviso(`Bienvenido de nuevo, ${encontrado.nombre}`);
        });
    }

    const btnCerrarSesion = document.getElementById("btn-cerrar-sesion");
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            usuarioActivo = null;
            localStorage.removeItem("sesionCooratiendas");
            actualizarEstadoSesion();
            mostrarAviso("Has cerrado tu sesión correctamente.");
        });
    }

    // ==================== 8. RELOJ TEMPORIZADOR DE PROMOCIONES ====================
    let segundosRestantes = 8 * 3600 + 45 * 60 + 30;
    const relojPromo = document.getElementById("reloj-promo");
    setInterval(() => {
        if (segundosRestantes > 0) segundosRestantes--;
        const h = String(Math.floor(segundosRestantes / 3600)).padStart(2, "0");
        const m = String(Math.floor((segundosRestantes % 3600) / 60)).padStart(2, "0");
        const s = String(segundosRestantes % 60).padStart(2, "0");
        if (relojPromo) relojPromo.textContent = `${h}h : ${m}m : ${s}s`;
    }, 1000);

    // ==================== 9. CARRITO DE COMPRAS, DESCUENTO SOCIO Y WHATSAPP ====================
    function actualizarCarrito() {
        if (!listaCarritoHTML) return;
        listaCarritoHTML.innerHTML = "";
        let subtotal = 0;
        let ahorroOfertas = 0;
        let unidades = 0;

        if (carrito.length === 0) {
            listaCarritoHTML.innerHTML = '<p class="text-muted">Aún no has agregado productos.</p>';
        } else {
            carrito.forEach((item, idx) => {
                const sub = item.precio * item.cantidad;
                const ahorroItem = ((item.precioNormal || item.precio) - item.precio) * item.cantidad;
                subtotal += sub;
                ahorroOfertas += ahorroItem;
                unidades += item.cantidad;

                listaCarritoHTML.innerHTML += `
                    <div class="item-carrito d-flex justify-content-between align-items-center border-bottom py-2 gap-2">
                        <div><strong>${item.nombre}</strong><br><small>$${item.precio.toLocaleString("es-CO")} c/u</small></div>
                        <div class="d-flex align-items-center gap-1">
                            <button type="button" class="btn btn-sm btn-outline-secondary btn-restar" data-idx="${idx}">-</button>
                            <span class="px-2 fw-bold">${item.cantidad}</span>
                            <button type="button" class="btn btn-sm btn-outline-secondary btn-sumar" data-idx="${idx}">+</button>
                            <button type="button" class="btn btn-sm btn-danger btn-eliminar-item" data-idx="${idx}">X</button>
                        </div>
                        <span class="fw-bold">$${sub.toLocaleString("es-CO")}</span>
                    </div>
                `;
            });
        }

        const descuentoSocio = usuarioActivo ? Math.round(subtotal * 0.05) : 0;
        const totalFinal = subtotal - descuentoSocio;

        if (contadorCarrito) contadorCarrito.textContent = unidades;
        if (totalCarritoHTML) totalCarritoHTML.textContent = `$${totalFinal.toLocaleString("es-CO")}`;

        if (textoAhorroHTML) {
            if (ahorroOfertas > 0) {
                textoAhorroHTML.textContent = `Ahorro en ofertas semanales: $${ahorroOfertas.toLocaleString("es-CO")}`;
                textoAhorroHTML.classList.remove("oculto");
            } else {
                textoAhorroHTML.classList.add("oculto");
            }
        }

        if (textoDescuentoSocioHTML) {
            if (descuentoSocio > 0) {
                textoDescuentoSocioHTML.textContent = `Descuento Socio Registrado (5%): -$${descuentoSocio.toLocaleString("es-CO")}`;
                textoDescuentoSocioHTML.classList.remove("oculto");
            } else {
                textoDescuentoSocioHTML.classList.add("oculto");
            }
        }

        const porcentaje = Math.min((totalFinal / metaEnvio) * 100, 100);
        if (barraProgresoEnvio) barraProgresoEnvio.style.width = `${porcentaje}%`;
        if (textoEnvio) {
            textoEnvio.innerHTML = totalFinal >= metaEnvio
                ? "<strong>¡Felicidades! Tienes ENVÍO GRATIS</strong>"
                : `Te faltan <strong>$${(metaEnvio - totalFinal).toLocaleString("es-CO")}</strong> para envío gratis`;
        }

        localStorage.setItem("carritoCooratiendas", JSON.stringify(carrito));
    }

    if (listaCarritoHTML) {
        listaCarritoHTML.addEventListener("click", (e) => {
            const idx = e.target.getAttribute("data-idx");
            if (idx === null) return;
            const i = Number(idx);
            if (e.target.classList.contains("btn-sumar")) carrito[i].cantidad++;
            if (e.target.classList.contains("btn-restar")) {
                carrito[i].cantidad > 1 ? carrito[i].cantidad-- : carrito.splice(i, 1);
            }
            if (e.target.classList.contains("btn-eliminar-item")) carrito.splice(i, 1);
            actualizarCarrito();
        });
    }

    btnAbrirCarrito?.addEventListener("click", () => modalCarrito?.classList.remove("oculto"));
    btnCerrarCarrito?.addEventListener("click", () => modalCarrito?.classList.add("oculto"));
    btnVaciar?.addEventListener("click", () => {
        carrito = [];
        actualizarCarrito();
        mostrarAviso("Carrito vaciado");
    });
    btnComprar?.addEventListener("click", () => {
        if (carrito.length === 0) return mostrarAviso("Tu carrito está vacío");
        carrito = [];
        actualizarCarrito();
        modalCarrito?.classList.add("oculto");
        mostrarAviso("Pedido confirmado en Cooratiendas");
    });

    function enviarCarritoAWhatsApp() {
        if (carrito.length === 0) return mostrarAviso("Agrega productos al carrito primero para pedir por WhatsApp");

        const nombreCliente = usuarioActivo ? ` (${usuarioActivo.nombre} - ${usuarioActivo.ciudad})` : "";
        let textoPedido = `Hola Cooratiendas${nombreCliente}, quisiera realizar el siguiente pedido:%0A%0A`;
        let subtotal = 0;

        carrito.forEach((item) => {
            const sub = item.precio * item.cantidad;
            subtotal += sub;
            textoPedido += `- ${item.cantidad}x ${item.nombre} ($${sub.toLocaleString("es-CO")})%0A`;
        });

        const descuentoSocio = usuarioActivo ? Math.round(subtotal * 0.05) : 0;
        const totalFinal = subtotal - descuentoSocio;

        if (descuentoSocio > 0) {
            textoPedido += `%0ADescuento Socio (5%): -$${descuentoSocio.toLocaleString("es-CO")}`;
        }
        textoPedido += `%0ATotal a pagar: $${totalFinal.toLocaleString("es-CO")} COP`;
        window.open(`https://wa.me/${telefonoWhatsApp}?text=${textoPedido}`, "_blank");
    }

    btnPedirWaCarrito?.addEventListener("click", enviarCarritoAWhatsApp);

    // ==================== 10. CHATBOT CONECTADO A WHATSAPP (+57 312 4261632) ====================
    let ultimoMensajeUsuario = "Hola Cooratiendas, necesito ayuda con mi mercado.";

    btnToggleChat?.addEventListener("click", () => {
        ventanaChatbot?.classList.toggle("oculto");
        if (ventanaChatbot && !ventanaChatbot.classList.contains("oculto")) inputChat?.focus();
    });

    btnCerrarChat?.addEventListener("click", () => ventanaChatbot?.classList.add("oculto"));

    function responderChatbot(pregunta) {
        if (!mensajesChat) return;
        mensajesChat.innerHTML += `<div class="mensaje-usuario">${pregunta}</div>`;
        ultimoMensajeUsuario = pregunta;

        const p = pregunta.toLowerCase();
        let respuesta = "Con gusto te atendemos. Presiona el botón verde de abajo para escribirnos directo a nuestro WhatsApp <strong>+57 312 426 1632</strong>.";

        if (p.includes("horario")) {
            respuesta = "Atendemos de <strong>Lunes a Domingo de 6:00 a.m. a 9:00 p.m.</strong>";
        } else if (p.includes("descuento") || p.includes("socio") || p.includes("registro")) {
            respuesta = "Ve a la pestaña <strong>Registro / Cuenta</strong>, crea tu usuario gratis y obtendrás un <strong>5% de descuento adicional</strong> automático en tu carrito.";
        } else if (p.includes("domicilio") || p.includes("envio")) {
            respuesta = "El domicilio cuesta <strong>$6.000 COP</strong> y es <strong>GRATIS</strong> por compras desde <strong>$150.000 COP</strong>.";
        } else if (p.includes("carrito") || p.includes("pedir")) {
            respuesta = "Abriendo WhatsApp (+57 312 426 1632) con la lista de tu carrito...";
            setTimeout(enviarCarritoAWhatsApp, 1000);
        }

        setTimeout(() => {
            mensajesChat.innerHTML += `<div class="mensaje-bot">${respuesta}</div>`;
            mensajesChat.scrollTop = mensajesChat.scrollHeight;
        }, 350);
    }

    formChatbot?.addEventListener("submit", (e) => {
        e.preventDefault();
        const texto = inputChat ? inputChat.value.trim() : "";
        if (!texto) return;
        inputChat.value = "";
        responderChatbot(texto);
    });

    chipsChat.forEach((chip) => {
        chip.addEventListener("click", () => responderChatbot(chip.getAttribute("data-pregunta")));
    });

    btnIrWhatsapp?.addEventListener("click", () => {
        if (carrito.length > 0) {
            enviarCarritoAWhatsApp();
        } else {
            const urlWa = `https://wa.me/${telefonoWhatsApp}?text=${encodeURIComponent("Hola Cooratiendas: " + ultimoMensajeUsuario)}`;
            window.open(urlWa, "_blank");
        }
    });

    // ==================== 11. ACCESIBILIDAD WCAG, FILTRO DE SEDES Y PQRS ====================
    document.documentElement.style.fontSize = `${tamanoLetra}px`;

    btnAumentarTexto?.addEventListener("click", () => {
        if (tamanoLetra < 22) {
            tamanoLetra += 2;
            document.documentElement.style.fontSize = `${tamanoLetra}px`;
            localStorage.setItem("tamanoFuente", tamanoLetra);
        }
    });

    btnDisminuirTexto?.addEventListener("click", () => {
        if (tamanoLetra > 14) {
            tamanoLetra -= 2;
            document.documentElement.style.fontSize = `${tamanoLetra}px`;
            localStorage.setItem("tamanoFuente", tamanoLetra);
        }
    });

    btnRestaurarTexto?.addEventListener("click", () => {
        tamanoLetra = 16;
        document.documentElement.style.fontSize = "16px";
        localStorage.setItem("tamanoFuente", 16);
    });

    btnAltoContraste?.addEventListener("click", () => {
        const activo = document.body.classList.toggle("alto-contraste");
        btnAltoContraste.setAttribute("aria-pressed", activo);
        if (activo) document.body.classList.remove("modo-oscuro");
    });

    btnTema?.addEventListener("click", () => {
        document.body.classList.remove("alto-contraste");
        const oscuro = document.body.classList.toggle("modo-oscuro");
        btnTema.setAttribute("aria-pressed", oscuro);
        btnTema.textContent = oscuro ? "Modo Claro" : "Modo Oscuro";
    });

    const filtroSedes = document.getElementById("filtro-sedes");
    if (filtroSedes) {
        filtroSedes.addEventListener("input", () => {
            const busqueda = filtroSedes.value.toLowerCase();
            document.querySelectorAll("#tabla-sedes tbody tr").forEach((fila) => {
                fila.style.display = fila.textContent.toLowerCase().includes(busqueda) ? "" : "none";
            });
        });
    }

    document.getElementById("form-pqrs")?.addEventListener("submit", (e) => {
        e.preventDefault();
        mostrarAviso("Solicitud PQRS enviada correctamente. Autorización de datos registrada.");
        e.target.reset();
    });

    // ==================== 12. INICIALIZACIÓN AL CARGAR LA PÁGINA ====================
    cargarPromocionesDesdeHTML();
    filtrarCatalogo();
    actualizarEstadoSesion();
});

