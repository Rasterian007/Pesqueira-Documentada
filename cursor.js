document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica do Cursor Personalizado ---
    const cursor = document.getElementById('cursor');
    
    // Posição atual do mouse
    let mouseX = 0;
    let mouseY = 0;
    
    // Posição atual dos elementos (para o efeito de atraso/lag)
    let cursorX = 0;
    let cursorY = 0;
    
    // Elementos para Parallax
    const parallaxImages = document.querySelectorAll('.gallery-item img');

    // Atualiza coordenadas do mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Função de animação (Loop)
    function animateCursor() {
        // Interpolação Linear (Lerp) para suavidade
        // O cursor principal segue rápido (0.2)
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        // Aplica as posições
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        // --- Lógica de Parallax Suave ---
        // Executa apenas se houver imagens de galeria na página
        if (parallaxImages.length > 0) {
            parallaxImages.forEach(img => {
                const parent = img.parentElement;
                const rect = parent.getBoundingClientRect();
                
                // Verifica se a imagem está visível na tela para economizar processamento
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    // Calcula o deslocamento baseado na posição da tela
                    // Velocidade 0.08 é bem lenta e elegante
                    const speed = 0.08; 
                    const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
                    
                    img.style.transform = `translateY(${offset}px)`;
                }
            });
        }

        requestAnimationFrame(animateCursor);
    }

    // Inicia o loop
    animateCursor();

    // --- Efeitos de Hover (Links e Botões) ---
    const hoverTriggers = document.querySelectorAll('.hover-trigger, a, button, p, h1, h2, h3, h4, h5, h6, img, span, li, .logo');

    hoverTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering');
        });
        trigger.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering');
        });
    });

    // --- Efeito Máquina de Escrever (Typewriter) ---
    const typeWriterElements = document.querySelectorAll('.section-title, .hero-content h1');

    if (typeWriterElements.length > 0) {
        typeWriterElements.forEach(el => {
            // Guarda o texto original e limpa o elemento
            const text = el.innerText;
            el.setAttribute('data-text', text);
            el.innerText = '';
            
            // Remove a classe fade-in para evitar conflito de animações
            el.classList.remove('fade-in');
            el.style.opacity = '1'; // Garante que o container esteja visível
            
            // Adiciona o cursor piscante
            const cursorSpan = document.createElement('span');
            cursorSpan.classList.add('typing-cursor');
            el.appendChild(cursorSpan);
        });

        const typeWriterObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const text = target.getAttribute('data-text');
                    const cursorSpan = target.querySelector('.typing-cursor');
                    let index = 0;

                    function type() {
                        if (index < text.length) {
                            target.insertBefore(document.createTextNode(text.charAt(index)), cursorSpan);
                            index++;
                            // Velocidade aleatória para simular digitação humana (entre 50ms e 100ms)
                            setTimeout(type, Math.random() * 50 + 50);
                        }
                    }

                    type();
                    obs.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        typeWriterElements.forEach(el => typeWriterObserver.observe(el));
    }

    // --- Animação de Scroll (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Dispara quando 15% do elemento estiver visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Para de observar após animar
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .timeline-item');
    fadeElements.forEach(el => observer.observe(el));

    // --- Lightbox da Galeria ---
    if (parallaxImages.length > 0) {
        // Criação dinâmica do HTML do Lightbox
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-close">&times;</button>
            <button class="lightbox-prev">&#10094;</button>
            <button class="lightbox-next">&#10095;</button>
            <div class="lightbox-track"></div>
        `;
        document.body.appendChild(lightbox);

        // Adiciona efeito de hover nos botões do lightbox
        const lightboxButtons = lightbox.querySelectorAll('button');
        lightboxButtons.forEach(btn => {
            btn.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            btn.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });

        const track = lightbox.querySelector('.lightbox-track');
        let currentIndex = 0;

        // Popula o Lightbox com as imagens da galeria
        parallaxImages.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'lightbox-item';
            const clone = document.createElement('img');
            clone.src = img.src;
            
            // Adiciona efeito de hover na imagem ampliada
            clone.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            clone.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
            
            item.appendChild(clone);
            track.appendChild(item);

            // Evento de clique na imagem original
            img.parentElement.addEventListener('click', (e) => {
                e.preventDefault();
                currentIndex = index;
                updateLightboxPosition();
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Bloqueia o scroll da página ao abrir
            });
        });

        // Atualiza a posição do slider (Side by Side)
        function updateLightboxPosition() {
            // Usa vw para garantir alinhamento perfeito com o CSS (min-width: 100vw)
            track.style.transform = `translateX(-${currentIndex * 100}vw)`;
        }

        // Navegação
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
            if (currentIndex > 0) currentIndex--;
            updateLightboxPosition();
        });

        lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
            if (currentIndex < parallaxImages.length - 1) currentIndex++;
            updateLightboxPosition();
        });

        lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restaura o scroll da página ao fechar
        });

        // Efeito Parallax Lento no Mousemove dentro do Lightbox
        document.addEventListener('mousemove', (e) => {
            if (!lightbox.classList.contains('active')) return;
            
            const activeItem = track.children[currentIndex];
            if (activeItem) {
                const img = activeItem.querySelector('img');
                // Calcula o deslocamento suave oposto ao mouse
                const x = (window.innerWidth / 2 - e.clientX) / 40; // Fator 40 para ser bem lento
                const y = (window.innerHeight / 2 - e.clientY) / 40;
                
                img.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
    }

    // --- Menu Mobile (Hambúrguer) ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});