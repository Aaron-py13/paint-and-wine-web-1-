/* PAINT & WINE — SCRIPT COMPLETO */

(function () {
  "use strict";

  function iniciar() {
    if (document.documentElement.dataset.paintWineReady === "true") {
      return;
    }

    document.documentElement.dataset.paintWineReady = "true";

    const buscar = (selector) => document.querySelector(selector);
    const buscarTodos = (selector) =>
      Array.from(document.querySelectorAll(selector));

    const movimientoReducido = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const pantallaMenu = window.matchMedia("(max-width: 900px)");

    const pantallaGrande = window.matchMedia(
      "(min-width: 1100px) and (min-height: 800px)"
    );

    const tieneMouse = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    const limitar = (valor, minimo = 0, maximo = 1) =>
      Math.min(maximo, Math.max(minimo, valor));

    function escucharMedia(consulta, funcion) {
      if (consulta.addEventListener) {
        consulta.addEventListener("change", funcion);
      } else {
        consulta.addListener(funcion);
      }
    }

    const header = buscar("#site-header");
    const botonMenu = buscar("#menu-toggle");
    const navegacion = buscar("#main-nav");

    const hero = buscar("#inicio");
    const heroInterior = buscar(".hero-sticky");
    const introduccion = buscar(".hero-intro");
    const tituloPintado = buscar(".paint-title");

    const paquetes = buscar("#paquetes");
    const pistaPaquetes = buscar("#packages-track");
    const escenarioPaquetes = buscar(".packages-sticky");

    const footer = buscar(".site-footer");
    const whatsapp = buscar("#whatsapp-art");

    let menuAbierto = false;
    let portadaAnimada = false;
    let paquetesHorizontales = false;
    let desplazamientoMaximo = 0;

    let frameScroll = 0;
    let frameMedicion = 0;
    let temporizadorWhatsapp = 0;

    /* MENÚ */

    function cambiarMenu(abrir, devolverFoco = false) {
      menuAbierto = Boolean(
        abrir && pantallaMenu.matches && botonMenu && navegacion
      );

      if (navegacion) {
        navegacion.classList.toggle("is-open", menuAbierto);
        navegacion.inert = pantallaMenu.matches && !menuAbierto;
      }

      if (botonMenu) {
        botonMenu.setAttribute("aria-expanded", String(menuAbierto));
        botonMenu.textContent = menuAbierto ? "Cerrar" : "Menú";

        if (devolverFoco) {
          botonMenu.focus();
        }
      }
    }

    if (botonMenu) {
      botonMenu.addEventListener("click", function () {
        cambiarMenu(!menuAbierto);
      });
    }

    if (navegacion) {
      navegacion.querySelectorAll("a").forEach(function (enlace) {
        enlace.addEventListener("click", function () {
          cambiarMenu(false);
        });
      });
    }

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && menuAbierto) {
        cambiarMenu(false, true);
      }
    });

    document.addEventListener("pointerdown", function (evento) {
      if (menuAbierto && header && !header.contains(evento.target)) {
        cambiarMenu(false);
      }
    });

    escucharMedia(pantallaMenu, function () {
      cambiarMenu(false);
      solicitarMedicion();
    });

    cambiarMenu(false);

    /* WHATSAPP: PRINCIPIO Y FINAL */

    function actualizarWhatsapp(posicion) {
      if (!whatsapp) return;

      const rect = footer ? footer.getBoundingClientRect() : null;
      const finalVisible = Boolean(
        rect && rect.top < window.innerHeight && rect.bottom > 0
      );

      const mostrar = posicion <= 80 || finalVisible;

      if (mostrar) {
        window.clearTimeout(temporizadorWhatsapp);
        temporizadorWhatsapp = 0;

        whatsapp.hidden = false;
        whatsapp.inert = false;
        whatsapp.classList.remove("is-leaving");
        return;
      }

      if (whatsapp.hidden || temporizadorWhatsapp) return;

      whatsapp.inert = true;
      whatsapp.classList.add("is-leaving");

      temporizadorWhatsapp = window.setTimeout(function () {
        whatsapp.hidden = true;
        temporizadorWhatsapp = 0;
      }, movimientoReducido.matches ? 0 : 300);
    }

    /* SCROLL */

    function actualizarScroll() {
      frameScroll = 0;

      const posicion = Math.max(0, window.scrollY);

      if (header) {
        const ocultar = posicion > 80;

        header.classList.toggle("is-scrolled", posicion > 40);
        header.classList.toggle("is-hidden", ocultar);
        header.inert = ocultar;

        if (ocultar && menuAbierto) {
          cambiarMenu(false);
        }
      }

      if (hero && heroInterior) {
        const recorrido = Math.max(
          1,
          hero.offsetHeight - heroInterior.offsetHeight
        );

        const progreso = portadaAnimada
          ? limitar(-hero.getBoundingClientRect().top / recorrido)
          : 0;

        const variables = {
          "--hero-scale": 1 + progreso * 0.34,
          "--hero-y": progreso * -3 + "%",
          "--shade-opacity": limitar(1 - progreso * 1.7),
          "--wash-opacity": limitar((progreso - 0.48) * 2.6),
          "--intro-opacity": limitar(1 - progreso * 2.1),
          "--intro-y": progreso * -80 + "px",
          "--logo-opacity": limitar((progreso - 0.35) * 3),
          "--logo-scale": 0.65 + progreso * 0.35,
          "--cue-opacity": limitar(1 - progreso * 4)
        };

        Object.keys(variables).forEach(function (nombre) {
          hero.style.setProperty(nombre, String(variables[nombre]));
        });

        if (introduccion) {
          introduccion.inert = portadaAnimada && progreso >= 0.48;
        }
      }

      if (
        paquetesHorizontales &&
        paquetes &&
        pistaPaquetes &&
        escenarioPaquetes
      ) {
        const recorrido = Math.max(
          1,
          paquetes.offsetHeight - escenarioPaquetes.offsetHeight
        );

        const progreso = limitar(
          -paquetes.getBoundingClientRect().top / recorrido
        );

        pistaPaquetes.style.transform =
          "translate3d(" +
          -progreso * desplazamientoMaximo +
          "px, 0, 0)";
      }

      actualizarWhatsapp(posicion);
    }

    function solicitarScroll() {
      if (!frameScroll) {
        frameScroll = window.requestAnimationFrame(actualizarScroll);
      }
    }

    /* DISTRIBUCIÓN RESPONSIVE */

    function medirDistribucion() {
      frameMedicion = 0;

      const permitirAnimacion =
        pantallaGrande.matches && !movimientoReducido.matches;

      portadaAnimada = false;

      if (hero) {
        hero.classList.remove("is-cinematic");
      }

      if (permitirAnimacion && hero && heroInterior && introduccion) {
        const estilo = window.getComputedStyle(heroInterior);

        const alturaNecesaria =
          introduccion.scrollHeight +
          (parseFloat(estilo.paddingTop) || 0) +
          (parseFloat(estilo.paddingBottom) || 0);

        portadaAnimada = alturaNecesaria <= window.innerHeight;
        hero.classList.toggle("is-cinematic", portadaAnimada);
      }

      paquetesHorizontales = false;
      desplazamientoMaximo = 0;

      if (paquetes) {
        paquetes.classList.remove("is-horizontal");
        paquetes.style.removeProperty("--packages-height");
      }

      if (pistaPaquetes) {
        pistaPaquetes.style.removeProperty("transform");
      }

      if (
        permitirAnimacion &&
        paquetes &&
        pistaPaquetes &&
        escenarioPaquetes
      ) {
        paquetes.classList.add("is-horizontal");

        const estilo = window.getComputedStyle(escenarioPaquetes);

        let alturaNecesaria =
          (parseFloat(estilo.paddingTop) || 0) +
          (parseFloat(estilo.paddingBottom) || 0);

        Array.from(escenarioPaquetes.children).forEach(function (elemento) {
          const propiedades = window.getComputedStyle(elemento);

          alturaNecesaria +=
            Math.max(
              elemento.getBoundingClientRect().height,
              elemento.scrollHeight
            ) +
            (parseFloat(propiedades.marginTop) || 0) +
            (parseFloat(propiedades.marginBottom) || 0);
        });

        desplazamientoMaximo = Math.max(
          0,
          pistaPaquetes.scrollWidth - escenarioPaquetes.clientWidth
        );

        paquetesHorizontales =
          alturaNecesaria <= escenarioPaquetes.clientHeight - 8 &&
          desplazamientoMaximo > 0;

        paquetes.classList.toggle("is-horizontal", paquetesHorizontales);

        if (paquetesHorizontales) {
          paquetes.style.setProperty(
            "--packages-height",
            escenarioPaquetes.offsetHeight + desplazamientoMaximo + "px"
          );
        }
      }

      actualizarScroll();
    }

    function solicitarMedicion() {
      if (!frameMedicion) {
        frameMedicion = window.requestAnimationFrame(medirDistribucion);
      }
    }

    if (pistaPaquetes) {
      pistaPaquetes.addEventListener("focusin", function (evento) {
        if (!paquetesHorizontales || !paquetes || !escenarioPaquetes) return;

        const tarjeta = evento.target.closest(".package-card");
        if (!tarjeta) return;

        const rect = tarjeta.getBoundingClientRect();

        if (rect.left >= 0 && rect.right <= escenarioPaquetes.clientWidth) {
          return;
        }

        const distancia = limitar(
          rect.left - pistaPaquetes.getBoundingClientRect().left - 24,
          0,
          desplazamientoMaximo
        );

        const inicio = paquetes.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: inicio + distancia,
          behavior: "instant"
        });

        solicitarScroll();
      });
    }

    /* PRECIOS */

    const precios = {
      10: {
        label: "1–10 personas",
        people: 10,
        artista: 850,
        picasso: 1500,
        dali: 1650
      },
      12: {
        label: "12 personas",
        people: 12,
        artista: 900,
        picasso: 1704,
        dali: 1920
      },
      15: {
        label: "15 personas",
        people: 15,
        artista: 1050,
        picasso: 1950,
        dali: 2250
      },
      20: {
        label: "20 personas",
        people: 20,
        artista: 1400,
        picasso: 2540,
        dali: 2900
      },
      25: {
        label: "25 personas",
        people: 25,
        artista: 1675,
        picasso: 3125,
        dali: 3575
      },
      30: {
        label: "30 personas",
        people: 30,
        artista: 1950,
        picasso: 3600,
        dali: 4290
      }
    };

    const opcionesGrupo = buscarTodos(".group-option");

    function seleccionarGrupo(clave) {
      const seleccionado = precios[clave];
      if (!seleccionado) return;

      opcionesGrupo.forEach(function (boton) {
        const activo = boton.dataset.group === String(clave);
        boton.classList.toggle("is-selected", activo);
        boton.setAttribute("aria-pressed", String(activo));
      });

      const etiqueta = buscar("#selected-group-label");
      const participantes = buscar("#form-people");

      if (etiqueta) etiqueta.textContent = seleccionado.label;
      if (participantes) participantes.value = seleccionado.people;

      buscarTodos(".package-price").forEach(function (elemento) {
        const importe = seleccionado[elemento.dataset.package];

        if (Number.isFinite(importe)) {
          elemento.textContent = "S/ " + importe.toLocaleString("es-PE");
        }
      });

      solicitarMedicion();
    }

    opcionesGrupo.forEach(function (boton) {
      boton.type = "button";

      boton.addEventListener("click", function () {
        seleccionarGrupo(boton.dataset.group);
      });
    });

    const grupoInicial =
      opcionesGrupo.find(function (boton) {
        return boton.classList.contains("is-selected");
      }) || opcionesGrupo[0];

    if (grupoInicial) {
      seleccionarGrupo(grupoInicial.dataset.group);
    }

    buscarTodos("[data-book-package]").forEach(function (enlace) {
      enlace.addEventListener("click", function () {
        const campo = buscar("#form-package");
        if (campo) campo.value = enlace.dataset.bookPackage;
      });
    });

    /* FORMULARIO */

    const formulario = buscar("#booking-form");
    const campoNombre = buscar("#form-name");

    if (campoNombre) {
      campoNombre.addEventListener("input", function () {
        campoNombre.setCustomValidity("");
      });
    }

    if (formulario) {
      formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        function valor(selector) {
          const campo = buscar(selector);
          return campo ? String(campo.value).trim() : "";
        }

        if (campoNombre) {
          campoNombre.setCustomValidity(
            valor("#form-name") ? "" : "Escribe tu nombre."
          );
        }

        if (!formulario.reportValidity()) return;

        const mensaje =
          "Hola Paint & Wine, soy " + valor("#form-name") + ". " +
          "Quiero información del paquete " + valor("#form-package") + ". " +
          "Tipo de experiencia: " + valor("#form-event") + ". " +
          "Participantes: " + valor("#form-people") + ". " +
          "Fecha tentativa: " + (valor("#form-date") || "por definir") + ".";

        window.open(
          "https://wa.me/51973368973?text=" + encodeURIComponent(mensaje),
          "_blank",
          "noopener,noreferrer"
        );
      });
    }

    /* APARICIÓN AL ENTRAR EN PANTALLA */

    function alAparecer(elementos, accion) {
      if (
        !("IntersectionObserver" in window) ||
        movimientoReducido.matches
      ) {
        elementos.forEach(accion);
        return;
      }

      const observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;

          accion(entrada.target);
          observador.unobserve(entrada.target);
        });
      }, {
        threshold: 0,
        rootMargin: "0px 0px -24px 0px"
      });

      elementos.forEach(function (elemento) {
        observador.observe(elemento);
      });
    }

    alAparecer(buscarTodos(".reveal, .custom-card"), function (elemento) {
      elemento.classList.add("is-visible");
    });

    /* CONTADORES */

    alAparecer(buscarTodos("[data-count]"), function (elemento) {
      const objetivo = Number(elemento.dataset.count);
      if (!Number.isFinite(objetivo)) return;

      const inicio = performance.now();

      function animar(ahora) {
        const progreso = movimientoReducido.matches
          ? 1
          : limitar((ahora - inicio) / 1200);

        const suavizado = 1 - Math.pow(1 - progreso, 3);

        elemento.textContent = Math.round(
          objetivo * suavizado
        ).toLocaleString("es-PE");

        if (progreso < 1) {
          window.requestAnimationFrame(animar);
        }
      }

      window.requestAnimationFrame(animar);
    });

    /* GALERÍA */

    const galeria = buscar("#galeria");

    if (galeria) {
      galeria.classList.add("gallery-rain");

      const elementos = Array.from(
        galeria.querySelectorAll(".gallery-copy > *, .gallery-images img")
      );

      elementos.forEach(function (elemento, indice) {
        elemento.classList.add("rain-item");

        elemento.style.setProperty(
          "--rain-delay",
          (indice % 3) * 120 + "ms"
        );

        elemento.style.setProperty(
          "--rain-angle",
          elemento.tagName === "IMG"
            ? (indice % 2 ? "2deg" : "-2deg")
            : "0deg"
        );
      });

      alAparecer(elementos, function (elemento) {
        elemento.classList.add("is-rain-visible");
      });
    }

    /* PINCEL */

    if (tituloPintado) {
      alAparecer([tituloPintado], function (elemento) {
        if (!movimientoReducido.matches && window.scrollY <= 80) {
          elemento.classList.add("is-painting");
        }
      });

      window.addEventListener("scroll", function () {
        tituloPintado.classList.remove("is-painting");
      }, { once: true, passive: true });
    }

    /* HISTORIA */

    const fotoHistoria = buscar("#story-photo");
    const pasosHistoria = buscarTodos(".story-step");
    let versionFoto = 0;

    if (fotoHistoria && "IntersectionObserver" in window) {
      const observadorHistoria = new IntersectionObserver(function (entradas) {
        const entrada = entradas.find(function (elemento) {
          return elemento.isIntersecting;
        });

        if (!entrada) return;

        pasosHistoria.forEach(function (paso) {
          paso.classList.toggle("is-active", paso === entrada.target);
        });

        if (pantallaMenu.matches) return;

        const ruta = entrada.target.dataset.image;
        if (!ruta) return;

        if (fotoHistoria.src === new URL(ruta, document.baseURI).href) return;

        const versionActual = ++versionFoto;
        const siguiente = new Image();

        siguiente.onload = function () {
          if (versionActual !== versionFoto || pantallaMenu.matches) return;

          fotoHistoria.src = ruta;
          fotoHistoria.alt =
            entrada.target.dataset.imageAlt ||
            "Experiencia de pintura de Paint & Wine";
        };

        siguiente.src = ruta;
      }, {
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0
      });

      pasosHistoria.forEach(function (paso) {
        observadorHistoria.observe(paso);
      });
    }

    /* MARCAS */

    const pistaMarcas = buscar(".brands-track");

    if (pistaMarcas) {
      const listaOriginal = pistaMarcas.querySelector(".brands-list");

      if (listaOriginal) {
        pistaMarcas.querySelectorAll("[data-brands-clone]").forEach(
          function (elemento) {
            elemento.remove();
          }
        );

        const copia = listaOriginal.cloneNode(true);

        copia.dataset.brandsClone = "true";
        copia.setAttribute("aria-hidden", "true");
        copia.inert = true;
        copia.removeAttribute("id");

        copia.querySelectorAll("[id]").forEach(function (elemento) {
          elemento.removeAttribute("id");
        });

        copia.querySelectorAll("img").forEach(function (imagen) {
          imagen.alt = "";
        });

        copia.querySelectorAll("a, button, [tabindex]").forEach(
          function (elemento) {
            elemento.tabIndex = -1;
          }
        );

        pistaMarcas.appendChild(copia);

        const carrusel = pistaMarcas.closest(".brands-carousel");

        if (carrusel) {
          carrusel.classList.add("is-looping");
        }
      }
    }

    const botonPausa = buscar(".brands-pause");
    const carruselMarcas = buscar(".brands-carousel");

    if (botonPausa && carruselMarcas) {
      botonPausa.addEventListener("click", function () {
        const pausado = carruselMarcas.classList.toggle("is-paused");

        botonPausa.setAttribute("aria-pressed", String(pausado));
        botonPausa.textContent = pausado
          ? "Reanudar marcas"
          : "Pausar marcas";
      });
    }

    /* REDES SOCIALES */

    const redes = buscarTodos(".social-link");

    redes.forEach(function (enlace) {
      enlace.addEventListener("pointermove", function (evento) {
        if (
          movimientoReducido.matches ||
          !tieneMouse.matches ||
          evento.pointerType === "touch"
        ) {
          return;
        }

        const rect = enlace.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = limitar((evento.clientX - rect.left) / rect.width) - 0.5;
        const y = limitar((evento.clientY - rect.top) / rect.height) - 0.5;

        enlace.style.transform =
          "perspective(600px) translateY(-5px) rotateX(" +
          -y * 6 + "deg) rotateY(" + x * 6 + "deg)";
      });

      function restaurar() {
        enlace.style.removeProperty("transform");
      }

      enlace.addEventListener("pointerleave", restaurar);
      enlace.addEventListener("pointercancel", restaurar);
      enlace.addEventListener("blur", restaurar);
    });

    /* VIDEOS */

    const seccionVideos = buscar(".pw-reels");

    if (seccionVideos) {
      const videos = Array.from(seccionVideos.querySelectorAll("video"));
      const indicacion = seccionVideos.querySelector(".pw-reels-hint");
      const pantallaVideos = window.matchMedia("(max-width: 700px)");

      function actualizarIndicacion() {
        if (!indicacion) return;

        const deslizable =
          pantallaVideos.matches &&
          !seccionVideos.classList.contains("pw-reels--stack");

        indicacion.textContent = deslizable
          ? "Desliza y elige una experiencia."
          : "Elige un video y vive la experiencia.";
      }

      actualizarIndicacion();
      escucharMedia(pantallaVideos, actualizarIndicacion);

      videos.forEach(function (video) {
        const tarjeta = video.closest(".pw-reel");
        if (!tarjeta) return;

        const boton = tarjeta.querySelector(".pw-reel-start");
        const estado = tarjeta.querySelector(".pw-reel-status");
        const alternativa = tarjeta.querySelector(".pw-reel-fallback");

        video.controls = true;
        video.playsInline = true;

        function mensaje(texto) {
          if (!estado) return;

          estado.textContent = texto;
          estado.hidden = !texto;
        }

        function errorVideo() {
          if (boton) {
            boton.hidden = false;
            video.tabIndex = -1;
          }

          mensaje("No se pudo cargar el video. Intenta abrirlo directamente.");

          if (alternativa) alternativa.hidden = false;
        }

        if (boton) {
          boton.hidden = false;
          video.tabIndex = -1;

          boton.addEventListener("click", function () {
            mensaje("Cargando video…");

            if (alternativa) alternativa.hidden = true;
            if (video.error) video.load();

            const reproduccion = video.play();

            if (reproduccion && reproduccion.catch) {
              reproduccion.catch(function (error) {
                if (error.name === "AbortError") {
                  mensaje("");
                } else {
                  errorVideo();
                }
              });
            }
          });
        }

        video.addEventListener("play", function () {
          videos.forEach(function (otro) {
            if (otro !== video) otro.pause();
          });

          const teniaFoco = boton && document.activeElement === boton;

          if (boton) boton.hidden = true;
          video.tabIndex = 0;

          if (teniaFoco) video.focus({ preventScroll: true });
        });

        video.addEventListener("playing", function () {
          mensaje("");
        });

        video.addEventListener("pause", function () {
          mensaje("");
        });

        video.addEventListener("waiting", function () {
          if (!video.paused) mensaje("Cargando video…");
        });

        video.addEventListener("ended", function () {
          mensaje("");

          if (boton) {
            const teniaFoco = document.activeElement === video;

            boton.hidden = false;
            video.tabIndex = -1;

            if (teniaFoco) boton.focus({ preventScroll: true });
          }
        });

        video.addEventListener("error", errorVideo);

        const fuente = video.querySelector("source");
        if (fuente) fuente.addEventListener("error", errorVideo);
      });

      if ("IntersectionObserver" in window) {
        const observadorVideos = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (entrada) {
            const video = entrada.target;
            const fullscreen = document.fullscreenElement;

            const pantallaCompleta =
              video.webkitDisplayingFullscreen ||
              (fullscreen && fullscreen.contains(video));

            if (!pantallaCompleta && entrada.intersectionRatio < 0.15) {
              video.pause();
            }
          });
        }, { threshold: [0, 0.15] });

        videos.forEach(function (video) {
          observadorVideos.observe(video);
        });
      }

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          videos.forEach(function (video) {
            video.pause();
          });
        }
      });

      /* Entrada de las tarjetas: usa las animaciones del CSS. */

      const elementosVideos = Array.from(
        seccionVideos.querySelectorAll(".pw-reels-heading, .pw-reel")
      );

      alAparecer(elementosVideos, function (elemento) {
        if (!movimientoReducido.matches) {
          elemento.classList.add("pw-fx-enter");
        }
      });

      /* Parallax de las portadas, únicamente con mouse. */

      const portadas = Array.from(
        seccionVideos.querySelectorAll(".pw-reel-start")
      );

      let frameVideos = 0;

      function actualizarPortadas() {
        frameVideos = 0;

        const permitir =
          !movimientoReducido.matches &&
          tieneMouse.matches &&
          window.innerWidth >= 1001;

        portadas.forEach(function (portada) {
          if (!permitir) {
            portada.style.removeProperty("--pw-cover-y");
            return;
          }

          if (portada.hidden) return;

          const rect = portada.parentElement.getBoundingClientRect();

          if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

          const centro = rect.top + rect.height / 2;

          const progreso =
            (window.innerHeight / 2 - centro) /
            Math.max(1, window.innerHeight / 2);

          portada.style.setProperty(
            "--pw-cover-y",
            limitar(progreso * 10, -10, 10).toFixed(2) + "px"
          );
        });
      }

      function solicitarPortadas() {
        if (!frameVideos) {
          frameVideos = window.requestAnimationFrame(actualizarPortadas);
        }
      }

      window.addEventListener("scroll", solicitarPortadas, { passive: true });
      window.addEventListener("resize", solicitarPortadas, { passive: true });

      escucharMedia(movimientoReducido, solicitarPortadas);
      escucharMedia(tieneMouse, solicitarPortadas);

      actualizarPortadas();
    }

    /* ACTUALIZACIONES GENERALES */

    function cambiarMovimiento() {
      redes.forEach(function (enlace) {
        enlace.style.removeProperty("transform");
      });

      if (movimientoReducido.matches && tituloPintado) {
        tituloPintado.classList.remove("is-painting");
      }

      solicitarMedicion();
    }

    escucharMedia(movimientoReducido, cambiarMovimiento);
    escucharMedia(tieneMouse, cambiarMovimiento);
    escucharMedia(pantallaGrande, solicitarMedicion);

    window.addEventListener("scroll", solicitarScroll, { passive: true });
    window.addEventListener("resize", solicitarMedicion, { passive: true });
    window.addEventListener("load", solicitarMedicion);
    window.addEventListener("pageshow", solicitarMedicion);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(solicitarMedicion);
    }

    if (pistaPaquetes) {
      pistaPaquetes.querySelectorAll("img").forEach(function (imagen) {
        imagen.addEventListener("load", solicitarMedicion);
      });
    }

    medirDistribucion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar, { once: true });
  } else {
    iniciar();
  }
})();