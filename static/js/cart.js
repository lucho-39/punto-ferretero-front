const cart = document.getElementById("cart");
const cartDetail = document.getElementById("cartDetail");

cart.innerHTML = ` 
    <span>${JSON.parse(localStorage.getItem("cart")).length}</span>
    `;

const productsCart = JSON.parse(localStorage.getItem("cart"));

productsCart.forEach(product => {
    fetch(`https://luciano.pythonanywhere.com/api/productos/${(product)}`)
        .then(response => response.json())
        .then(product => {
            cartDetail.innerHTML += `             
                <div class="detalle-texto">
                    <h3>${product.tit ?? product.title ?? "-"}</h3>            
                    <h5>Artículo: ${product.art ?? "-"}</h5>
                    <h5>Código Proveedor: ${product.cod ?? product.codigo ?? "-"}</h5>
                    <p>${product.desc ?? ""}</p>
                    <h4>$${product.price ?? "-"}</h4>
                    <div class="botones">
                        <button onclick= "removeProduct(${product.id})><i class="fa-regular fa-trash"></i>Elimirar</i></button>                       
                    </div>                     
                </div>               
            `;
        });
});


document.addEventListener('DOMContentLoaded', () => {

    const CART_KEY = "cart";

    function safeParse(raw) {
        try {
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function getCart() {
        return safeParse(localStorage.getItem(CART_KEY));
    }

    function saveCart(arr) {
        localStorage.setItem(CART_KEY, JSON.stringify(arr));
        updateCartBadge();
    }

    function updateCartBadge() {
        const cartEl = document.getElementById("cart");
        if (!cartEl) return;
        const count = getCart().length;
        cartEl.innerHTML = `<span>${count}</span>`;
    }

    function addToCart(id) {
        if (!id) return false;
        const cart = getCart();
        // evitar duplicados; comentar next line si quieres permitir múltiples unidades
        if (!cart.includes(id)) cart.push(id);
        saveCart(cart);
        return true;
    }

    function removeFromCart(id) {
        if (!id) return false;
        let cart = getCart();
        cart = cart.filter(item => item !== id);
        saveCart(cart);
        return true;
    }

    // Exponer funciones globalmente para que otros scripts (products.js) las llamen
    window.cartAPI = {
        getCart,
        saveCart,
        addToCart,
        removeFromCart,
        updateCartBadge
    };

    // Inicializar badge al cargar
    updateCartBadge();

});

//para mostrar un producto
function removeProduct(productId) {
    let recuperarCarrito = JSON.parse(localStorage.getItem("cart"));
    let index = recuperarCarrito.indexof(productId);
    recuperarCarrito.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(recuperarCarrito));
}

//para sumar los productos
cart.compareDocumentPosition((sum, item) => sum + item.price, 0)

//.<button class="">Enviar<i class="fa-brands fa-square-whatsapp"></i></button> 