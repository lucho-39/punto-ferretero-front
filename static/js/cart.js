const cartDetail = document.getElementById("cartDetail");
const cartTotalContainer = document.getElementById("cartTotalContainer");

// --- Funciones de Utilidad para el Carrito (Manejo de LocalStorage) ---

const CART_KEY = "cart";

function safeParse(raw) {
    try {
        const parsed = raw ? JSON.parse(raw) : [];
        // Aseguramos que el carrito sea un objeto con IDs y cantidades, o un array vacío si falla
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

// Obtiene el carrito del LocalStorage. Devuelve un array de IDs.
function getCartIds() {
    return safeParse(localStorage.getItem(CART_KEY));
}

// Guarda el carrito en LocalStorage.
function saveCart(arr) {
    localStorage.setItem(CART_KEY, JSON.stringify(arr));
    updateCartBadge();
}

// Actualiza el número en el icono del carrito en la barra de navegación
function updateCartBadge() {
    const cartEl = document.getElementById("cart");
    if (!cartEl) return;
    const count = getCartIds().length;
    // Asumiendo que el badge es un span dentro del icono
    cartEl.innerHTML = `<i class="fa-solid fa-cart-shopping"></i><span>${count > 0 ? count : ''}</span>`;
}

// --- Funciones de Renderizado ---

// Función para renderizar un ítem individual del carrito
function renderCartItem(product, quantity = 1) {
    const imgSrc = product.imagen?.url_img || "placeholder.jpg";
    const imgAlt = product.imagen?.txt_alt || product.tit || "Imagen no disponible";
    const productoId = product.id ?? product.pk ?? product.cod ?? product.codigo ?? "";
    const price = product.price ?? 0;
    const subtotal = (price * quantity).toFixed(2);

    return `
        <div class="cart-item" data-id="${productoId}">
            <img src="${imgSrc}" alt="${imgAlt}" class="cart-item-thumbnail">
            <div class="item-info">
                <h4>${product.tit ?? product.title ?? "Producto sin título"}</h4>
                <p>Artículo: ${product.art ?? "-"}</p>
                <p>Código: ${product.cod ?? product.codigo ?? "-"}</p>
            </div>
            <div class="item-quantity-controls">
                <button class="quantity-btn" data-action="decrease" data-id="${productoId}">-</button>
                <span class="quantity-value">${quantity}</span>
                <button class="quantity-btn" data-action="increase" data-id="${productoId}">+</button>
            </div>
            <div class="item-price">
                <span class="price-label">Precio:</span>
                <span class="price-value">$${price.toFixed(2)}</span>
            </div>
            <div class="item-subtotal">
                <span class="subtotal-label">Subtotal:</span>
                <span class="subtotal-value">$${subtotal}</span>
            </div>
            <button class="remove-btn" data-id="${productoId}">
                <i class="fa-solid fa-trash"></i> Eliminar
            </button>
        </div>
    `;
}

// Función principal para renderizar todo el carrito
async function renderCart() {
    const cartIds = getCartIds();
    cartDetail.innerHTML = "";
    cartTotalContainer.innerHTML = "";

    if (cartIds.length === 0) {
        cartDetail.innerHTML = "<p class='empty-cart-message'>Tu carrito está vacío.</p>";
        return;
    }

    // Agrupar IDs para simular cantidad (ya que solo tenemos IDs repetidos)
    const cartMap = cartIds.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    // Obtener detalles de todos los productos únicos
    const uniqueIds = Object.keys(cartMap);
    const productPromises = uniqueIds.map(id =>
        fetch(`https://luciano.pythonanywhere.com/api/productos/${id}`)
            .then(res => res.json())
            .catch(err => {
                console.error(`Error al obtener producto ${id}:`, err);
                return null;
            })
    );

    const products = await Promise.all(productPromises);
    let total = 0;
    let cartHTML = "";

    products.forEach(product => {
        if (product) {
            const id = product.id ?? product.pk ?? product.cod ?? product.codigo ?? "";
            const quantity = cartMap[id];
            const price = product.price ?? 0;
            total += price * quantity;
            cartHTML += renderCartItem(product, quantity);
        }
    });

    cartDetail.innerHTML = cartHTML;

    // Renderizar el total y el botón de finalizar pedido
    cartTotalContainer.innerHTML = `
        <div class="cart-summary">
            <div class="cart-total">
                <h3>Total:</h3>
                <span class="total-value">$${total.toFixed(2)}</span>
            </div>
            <a href="https://wa.me/TUNUMERODEWHATSAPP?text=Hola,%20me%20gustaría%20finalizar%20mi%20pedido%20de%20Punto%20Ferretero." target="_blank" class="checkout-button">
                FINALIZAR PEDIDO <i class="fa-brands fa-whatsapp"></i>
            </a>
        </div>
    `;
}

// --- Manejo de Eventos ---

// Delegación de eventos para botones de cantidad y eliminar
cartDetail.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove-btn");
    if (btn) {
        const id = btn.dataset.id;
        if (id) {
            // Eliminar todas las instancias del producto
            let currentCart = getCartIds();
            currentCart = currentCart.filter(itemId => itemId !== id);
            saveCart(currentCart);
            renderCart(); // Volver a renderizar el carrito
        }
        return;
    }

    const quantityBtn = e.target.closest(".quantity-btn");
    if (quantityBtn) {
        const id = quantityBtn.dataset.id;
        const action = quantityBtn.dataset.action;
        if (id) {
            let currentCart = getCartIds();
            if (action === "increase") {
                currentCart.push(id);
            } else if (action === "decrease") {
                // Encontrar la primera instancia del ID y eliminarla
                const index = currentCart.indexOf(id);
                if (index > -1) {
                    currentCart.splice(index, 1);
                }
            }
            saveCart(currentCart);
            renderCart(); // Volver a renderizar el carrito
        }
    }
});

// Inicializar la vista del carrito al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    if (cartDetail) {
        renderCart();
    }
});

// Exponer funciones globalmente para que otros scripts (products.js) las llamen
window.cartAPI = {
    getCartIds,
    saveCart,
    updateCartBadge
};
