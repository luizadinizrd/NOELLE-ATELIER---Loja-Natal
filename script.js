document.addEventListener("DOMContentLoaded", () => {

    const formatarPreco = valor =>
        valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    const nomesCategorias = {
        sueteres: "Suéteres",
        pijamas: "Pijamas",
        meias: "Meias",
        acessorios: "Acessórios",
        fantasias: "Fantasias"
    };

    function criarCard(produto, compacto = false) {

        const card = document.createElement("article");
        card.className = "product-card";

        const imagem = document.createElement("div");
        imagem.className = "product-image";

        const img = document.createElement("img");
        img.src = produto.imagem;
        img.alt = produto.nome;
        img.loading = "lazy";

        img.onerror = () => {
            imagem.innerHTML = `
                <div class="image-placeholder">
                    <span class="placeholder-mark">✧</span>
                    <span>NOËLLE ATELIER</span>
                    <small>Imagem do produto</small>
                </div>
            `;
        };

        imagem.appendChild(img);

        const categoria = document.createElement("p");
        categoria.className = "product-category";
        categoria.textContent =
            nomesCategorias[produto.categoria] || produto.categoria;

        const titulo = document.createElement("h3");
        titulo.textContent = produto.nome;

        const descricao = document.createElement("p");
        descricao.className = "product-description";
        descricao.textContent = produto.descricao;

        const bottom = document.createElement("div");
        bottom.className = "product-bottom";

        const preco = document.createElement("span");
        preco.className = "product-price";
        preco.textContent = formatarPreco(produto.preco);

        bottom.appendChild(preco);

        if (!compacto) {

            const botao = document.createElement("button");

            botao.type = "button";
            botao.className = "add-cart";
            botao.textContent = "Adicionar +";

            botao.addEventListener("click", () => {
                adicionarAoCarrinho(produto.id);
            });

            bottom.appendChild(botao);
        }

        card.append(
            imagem,
            categoria,
            titulo,
            descricao,
            bottom
        );

        return card;
    }

    const lista = document.getElementById("lista-produtos");
    const busca = document.getElementById("busca");
    const filtro = document.getElementById("filtro-categoria");
    const contador = document.getElementById("contador-produtos");
    const vazio = document.getElementById("mensagem-vazia");

    function renderizarProdutos() {

        if (!lista || typeof produtos === "undefined") return;

        const termo = (busca?.value || "")
            .trim()
            .toLocaleLowerCase("pt-BR");

        const categoria = filtro?.value || "todas";

        const filtrados = produtos.filter(produto => {

            const correspondeCategoria =
                categoria === "todas" ||
                produto.categoria === categoria;

            const correspondeBusca =
                produto.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
                produto.descricao.toLocaleLowerCase("pt-BR").includes(termo);

            return correspondeCategoria && correspondeBusca;
        });

        lista.replaceChildren(
            ...filtrados.map(produto => criarCard(produto))
        );

        if (contador) {
            contador.textContent =
                `Mostrando ${filtrados.length} de ${produtos.length} produtos`;
        }

        if (vazio) {
            vazio.hidden = filtrados.length > 0;
        }
    }

    busca?.addEventListener("input", renderizarProdutos);
    filtro?.addEventListener("change", renderizarProdutos);

    renderizarProdutos();

    const destaques = document.getElementById("produtos-destaque");

    if (destaques && typeof produtos !== "undefined") {

        const selecionados = [
            produtos[0],
            produtos[8],
            produtos[24],
            produtos[44]
        ];

        destaques.replaceChildren(
            ...selecionados.map(produto => criarCard(produto, true))
        );
    }

    const menuBotao = document.getElementById("botao-menu");
    const menu = document.getElementById("menu-principal");

    menuBotao?.addEventListener("click", () => {

        if (!menu) return;

        const aberto = menu.classList.toggle("open");

        menuBotao.setAttribute("aria-expanded", String(aberto));

        menuBotao.textContent = aberto ? "✕" : "☰";
    });

    menu?.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("open");

            menuBotao?.setAttribute("aria-expanded", "false");

            if (menuBotao) {
                menuBotao.textContent = "☰";
            }
        });
    });

    let carrinho = [];

    try {

        carrinho = JSON.parse(
            localStorage.getItem("noelle-carrinho") || "[]"
        );

        if (!Array.isArray(carrinho)) {
            carrinho = [];
        }

    } catch {
        carrinho = [];
    }

    function adicionarAoCarrinho(id) {

        const produto = produtos.find(p => p.id === id);

        if (!produto) return;

        const item = carrinho.find(p => p.id === id);

        if (item) {

            item.quantidade += 1;

        } else {

            carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: 1
            });
        }

        try {

            localStorage.setItem(
                "noelle-carrinho",
                JSON.stringify(carrinho)
            );

        } catch {}

        mostrarAviso(
            `${produto.nome} foi adicionado ao carrinho demonstrativo.`
        );
    }

    function mostrarAviso(texto) {

        let aviso = document.getElementById("aviso-site");

        if (!aviso) {

            aviso = document.createElement("div");
            aviso.id = "aviso-site";

            Object.assign(aviso.style, {

                position: "fixed",
                left: "50%",
                bottom: "24px",
                transform: "translateX(-50%)",
                zIndex: "50",
                background: "#173b2e",
                color: "#fffdf8",
                padding: "13px 20px",
                maxWidth: "90%",
                boxShadow: "0 8px 25px #0002",
                fontSize: ".82rem",
                textAlign: "center"

            });

            document.body.appendChild(aviso);
        }

        aviso.textContent = texto;
        aviso.style.display = "block";

        clearTimeout(aviso._timer);

        aviso._timer = setTimeout(() => {
            aviso.style.display = "none";
        }, 2600);
    }

    function atualizarContagem() {

        const agora = new Date();

        const alvo = new Date(
            agora.getFullYear(),
            11,
            25,
            0,
            0,
            0
        );

        if (agora >= alvo) {
            alvo.setFullYear(alvo.getFullYear() + 1);
        }

        const total = alvo - agora;

        const valores = {

            dias: Math.floor(total / 86400000),

            horas: Math.floor(total / 3600000) % 24,

            minutos: Math.floor(total / 60000) % 60,

            segundos: Math.floor(total / 1000) % 60

        };

        Object.entries(valores).forEach(([id, valor]) => {

            const elemento = document.getElementById(id);

            if (elemento) {
                elemento.textContent =
                    String(valor).padStart(2, "0");
            }
        });
    }

    atualizarContagem();

    setInterval(atualizarContagem, 1000);

    const form = document.getElementById("form-contato");

    form?.addEventListener("submit", event => {

        event.preventDefault();

        const campos = [

            [
                "nome",
                valor => valor.trim().length >= 2,
                "Informe seu nome (mínimo de 2 caracteres)."
            ],

            [
                "email",
                valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor),
                "Informe um e-mail válido."
            ],

            [
                "assunto",
                valor => valor.trim() !== "",
                "Selecione um assunto."
            ],

            [
                "mensagem",
                valor => valor.trim().length >= 10,
                "Escreva uma mensagem com pelo menos 10 caracteres."
            ]

        ];

        let valido = true;

        campos.forEach(([id, regra, erro]) => {

            const campo = document.getElementById(id);

            const saida = document.getElementById(`erro-${id}`);

            if (!campo) {
                valido = false;
                return;
            }

            const ok = regra(campo.value);

            if (saida) {
                saida.textContent = ok ? "" : erro;
            }

            campo.setAttribute("aria-invalid", String(!ok));

            if (!ok) {
                valido = false;
            }
        });

        const status = document.getElementById("mensagem-form");

        if (status) {

            status.textContent = valido

                ? "Mensagem validada! Este site é demonstrativo, então nenhum e-mail foi enviado."

                : "Confira os campos destacados e tente novamente.";

            status.className = valido
                ? "success-message"
                : "error-message";
        }

        if (valido) {
            form.reset();
        }
    });

    const neve = document.getElementById("efeito-neve");

    if (
        neve &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {

        let ultimaNeve = 0;

        window.addEventListener("scroll", () => {

            const agora = Date.now();

            if (agora - ultimaNeve < 900) return;

            ultimaNeve = agora;

            const floco = document.createElement("span");

            floco.className = "snowflake";

            floco.textContent =
                Math.random() > 0.5 ? "❄" : "·";

            floco.style.left = `${Math.random() * 100}%`;

            floco.style.fontSize =
                `${8 + Math.random() * 12}px`;

            floco.style.animationDuration =
                `${4 + Math.random() * 5}s`;

            neve.appendChild(floco);

            setTimeout(() => {
                floco.remove();
            }, 9500);

        }, { passive: true });
    }
const topo = document.getElementById("voltar-topo");

    window.addEventListener("scroll", () => {

        topo?.classList.toggle(
            "visible",
            window.scrollY > 450
        );

    }, { passive: true });

    topo?.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

    const botaoSom = document.getElementById("botao-som");

    const musica = new Audio("js/All Want For Christmas.mp3");

    musica.loop = true;
    musica.volume = 0.25;
    musica.preload = "auto";

    if (botaoSom) {

        botaoSom.textContent = "♫ Som: desligado";

        botaoSom.setAttribute("aria-pressed", "false");
    }

    async function alternarSom() {

        if (!botaoSom) return;

        if (!musica.paused) {

            musica.pause();

            botaoSom.textContent = "♫ Som: desligado";

            botaoSom.setAttribute("aria-pressed", "false");

            return;
        }

        try {

            await musica.play();

            botaoSom.textContent = "♫ Som: ligado";

            botaoSom.setAttribute("aria-pressed", "true");

        } catch (erro) {

            botaoSom.textContent = "♫ Som: desligado";

            botaoSom.setAttribute("aria-pressed", "false");

            mostrarAviso(
                "Não foi possível reproduzir a música. Verifique o arquivo MP3."
            );
        }
    }

    musica.addEventListener("pause", () => {

        if (botaoSom) {

            botaoSom.textContent = "♫ Som: desligado";

            botaoSom.setAttribute("aria-pressed", "false");
        }
    });

    musica.addEventListener("play", () => {

        if (botaoSom) {

            botaoSom.textContent = "♫ Som: ligado";

            botaoSom.setAttribute("aria-pressed", "true");
        }
    });

    botaoSom?.addEventListener("click", alternarSom);

const slides = document.querySelectorAll(".hero-slide");
const indicadores = document.querySelectorAll(".hero-indicator");
const anterior = document.getElementById("slide-anterior");
const proximo = document.getElementById("slide-proximo");

if (slides.length > 0 && anterior && proximo) {
  let slideAtual = 0;
  let intervalo;

  function mostrarSlide(indice) {
    slides[slideAtual].classList.remove("is-active");
    indicadores[slideAtual].classList.remove("is-active");

    slideAtual = (indice + slides.length) % slides.length;

    slides[slideAtual].classList.add("is-active");
    indicadores[slideAtual].classList.add("is-active");
  }

  function iniciarSlideshow() {
    clearInterval(intervalo);

    intervalo = setInterval(() => {
      mostrarSlide(slideAtual + 1);
    }, 5000);
  }

  anterior.addEventListener("click", () => {
    mostrarSlide(slideAtual - 1);
    iniciarSlideshow();
  });

  proximo.addEventListener("click", () => {
    mostrarSlide(slideAtual + 1);
    iniciarSlideshow();
  });

  indicadores.forEach((indicador) => {
    indicador.addEventListener("click", () => {
      mostrarSlide(Number(indicador.dataset.slide));
      iniciarSlideshow();
    });
  });

  iniciarSlideshow();}

});

document.addEventListener("DOMContentLoaded", function () {

    const lightbox = document.getElementById("lightbox");
    const imagemGrande = document.getElementById("lightbox-imagem");
    const legenda = document.getElementById("lightbox-legenda");
    const fechar = document.getElementById("fechar-lightbox");

    const imagens = document.querySelectorAll(".gallery-card img");

    imagens.forEach(function (imagem) {

        imagem.style.cursor = "zoom-in";

        imagem.onclick = function () {

            imagemGrande.src = imagem.src;
            imagemGrande.alt = imagem.alt;

            const texto = imagem.closest(".gallery-card")
                .querySelector("figcaption");

            legenda.textContent = texto.textContent;

            lightbox.hidden = false;
            document.body.style.overflow = "hidden";
        };

    });

    fechar.onclick = function () {
        lightbox.hidden = true;
        document.body.style.overflow = "";
        imagemGrande.src = "";
    };

    lightbox.onclick = function (evento) {
        if (evento.target === lightbox) {
            lightbox.hidden = true;
            document.body.style.overflow = "";
            imagemGrande.src = "";
        }
    };

    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {
            lightbox.hidden = true;
            document.body.style.overflow = "";
            imagemGrande.src = "";
        }
    });

});