document.addEventListener('DOMContentLoaded', () => {
    const quienesSomosLink = document.getElementById('quienes-somos-link');
    const contactosLink = document.getElementById('contactos-link');
    const quienesSomosModal = document.getElementById('quienes-somos-modal');
    const contactosModal = document.getElementById('contactos-modal');
    const closeButtons = document.querySelectorAll('.close-button');

    if (quienesSomosLink) {
        quienesSomosLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (quienesSomosModal) {
                quienesSomosModal.style.display = 'flex';
                // Aplicar transparencia a la tarjeta modal
                const modalContent = quienesSomosModal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; // Color primario con 80% opacidad
                }
            }
        });
    }

    if (contactosLink) {
        contactosLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (contactosModal) {
                contactosModal.style.display = 'flex';
                // Aplicar transparencia a la tarjeta modal
                const modalContent = contactosModal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.style.backgroundColor = 'rgba(255, 255, 255, 0.7)'; // Color primario con 80% opacidad
                }
            }
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (quienesSomosModal) {
                quienesSomosModal.style.display = 'none';
            }
            if (contactosModal) {
                contactosModal.style.display = 'none';
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target == quienesSomosModal) {
            quienesSomosModal.style.display = 'none';
        }
        if (e.target == contactosModal) {
            contactosModal.style.display = 'none';
        }
    });

    // Lógica de navegación del carrito
    const cartIcon = document.getElementById("cart");
    if (cartIcon) {
        cartIcon.addEventListener("click", (e) => {
            // Prevenir la navegación si el clic es en el span del contador
            if (e.target.tagName !== 'SPAN') {
                window.location.href = "/pages/cart.html";
            }
        });
    }
});

