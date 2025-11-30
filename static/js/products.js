const container = document.getElementById("container");
const searchInput = document.getElementById("search");
const dropdownContainer = document.getElementById('dropdown-container');

// helper: obtener id robusto del producto
function getProductId(product) {
    return product.id ?? product._id ?? product.pk ?? product.cod ?? product.codigo ?? "";
}

// Función para renderizar productos
function renderProducts(array) {
    // Limpiar el contenedor antes de cargar (por si ya había elementos)
    container.innerHTML = "";

    if (array.length === 0) {
        container.innerHTML = "<p>No se encontraron productos.</p>";
        return;
    }

    array.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("producto");

        // Manejo seguro de imagen (por si falta alguna propiedad)
        const imgSrc = product.imagen?.url_img || "placeholder.jpg";
        const imgAlt = product.imagen?.txt_alt || "Imagen no disponible";
        const productoId = getProductId(product);

        productCard.innerHTML = `
                <div class="producto-card">
                    <h3>${product.tit ?? product.title ?? "-"}</h3>
                    <img src="${imgSrc}" alt="${imgAlt}">
                    <h4>${product.categoria?.name ?? ""}</h4>
                    <h5>Artículo: ${product.art ?? "-"}</h5>
                    <h5>Código: ${product.cod ?? product.codigo ?? "-"}</h5>                   
                    <h4>$${product.price ?? ""}</h4>
                    <div class="rating-container">
                        <span class="rating-value">${product.rating ?? "-"}</span>
                        <span class="rating-star">⭐</span>
                    </div>
                    <div class="botones">
                        <button class="ver-detalle" data-id="${productoId}"> Ver Detalle  <i class="fa-solid fa-circle-info"></i></button>
                        <button class="add-to-cart" data-id="${productoId}"> Añadir al Carrito  <i class="fa-solid fa-cart-plus"></i></button>
                    </div>
                </div> 
            `;

        container.appendChild(productCard);
    });
}

// Función para filtrar productos por categoría y búsqueda
function filterProducts(products, selectedCategoryId, searchTerm) {
    let filtered = products;

    // Filtrar por categoría si no es "all"
    if (selectedCategoryId !== "all") {
        filtered = filtered.filter(product => {
            const productCategoryId = product.categoria?.id?.toString();
            return productCategoryId === selectedCategoryId;
        });
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
        filtered = filtered.filter(product => {
            const title = (product.tit ?? product.title ?? "").toLowerCase();
            const desc = (product.desc ?? "").toLowerCase();
            const art = (product.art ?? "").toLowerCase();
            return title.includes(searchTerm) || desc.includes(searchTerm) || art.includes(searchTerm);
        });
    }

    renderProducts(filtered);
}

// Función que crea el dropdown de categorías desde la API
function createCategoryDropdown(categories, products) {
    dropdownContainer.innerHTML = `
        <select id="categoryDropdown">
            <option value="all">Todas las categorías</option>
            ${categories.map(category => `<option value="${category.id}">${category.name}</option>`).join('')}
        </select>
    `;

    const dropdown = document.getElementById("categoryDropdown");
    dropdown.addEventListener("change", (e) => {
        const selectedCategoryId = e.target.value;
        const searchTerm = searchInput.value.toLowerCase();
        filterProducts(products, selectedCategoryId, searchTerm);
    });
}

// Delegación de eventos para botones "Ver Detalle"
container.addEventListener("click", (e) => {
    const btn = e.target.closest(".ver-detalle");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) {
        console.warn("ID de producto no disponible para ver detalle");
        return;
    }
    // Navegar a la página de detalle (ruta relativa a pages)
    window.location.href = `product.html?id=${encodeURIComponent(id)}`;
});

// Delegación de eventos para botones "Añadir al Carrito"
container.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id) {
        console.warn("ID de producto no disponible para añadir al carrito");
        return;
    }

    // Usar la función expuesta por cart.js
    if (window.cartAPI && window.cartAPI.addToCart) {
        window.cartAPI.addToCart(id);
        alert("Producto añadido al carrito!");
    } else {
        console.error("cartAPI no está disponible. Asegúrate de que cart.js se cargue antes.");
    }
});

function loadCategoriesAndProducts() {
    // Obtener categorías y productos           
    return Promise.all([
        fetch('https://luciano.pythonanywhere.com/api/categorias').then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP en categorías: ${response.status}`);
            }
            return response.json();
        }),
        fetch('https://luciano.pythonanywhere.com/api/productos').then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP en productos: ${response.status}`);
            }
            return response.json();
        })
    ])
        .then(([categories, products]) => {
            // Renderizar productos y crear dropdown
            renderProducts(products);
            createCategoryDropdown(categories, products);

            // Agregar evento de búsqueda
            searchInput.addEventListener("input", () => {
                const selectedCategoryId = document.getElementById("categoryDropdown")?.value ?? "all";
                const searchTerm = searchInput.value.toLowerCase();
                filterProducts(products, selectedCategoryId, searchTerm);
            });
        })
        .catch(error => {
            console.error("Error al obtener datos:", error);
            container.innerHTML = `<p>Error al cargar los productos. Intenta nuevamente más tarde.</p>`;
            dropdownContainer.innerHTML = `<p>Error al cargar las categorías.</p>`;
        });
}


// Iniciar carga de datos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadCategoriesAndProducts);
