const productDetail = document.getElementById("productDetail");
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
const cart = document.getElementById("cart")

function getProductIdValue(product) {
    return product.id ?? product.pk ?? product.cod ?? product.codigo ?? product._id ?? "";
}

function displayProductDetails(product) {
    if (!product) {
        productDetail.innerHTML = `<p>Producto no encontrado.</p>`;
        return;
    }

    const imgSrc = product.imagen?.url_img || product.image || product.img || "placeholder.jpg";
    const imgAlt = product.imagen?.texto_alt || product.tit || product.title || "Imagen del producto";
    const idValue = getProductIdValue(product);

    productDetail.innerHTML = `
       <div class="producto-card">
           <img src="${imgSrc}" alt="${imgAlt}">
           <div class="detalle-texto">
               <div>
                   <h3>${product.tit ?? product.title ?? "-"}</h3>       
                   <h4>${product.categoria?.name ?? "Sin categoría"}</h4>
                   <h5>Artículo: ${product.art ?? "-"}</h5>
                   <h5>Código: ${product.cod ?? product.codigo ?? "-"}</h5>
                   <p>${product.desc ?? product.descripcion ?? ""}</p>
                   <h4>$${product.price ?? product.precio ?? "-"}</h4>
               </div>
               <div class="botones">
                   <div class="rating-container">
                       <span class="rating-value">${product.rating ?? "-"}</span>
                       <span class="rating-star">⭐</span>
                   </div>
                   <button id="addCartBtn" data-id="${idValue}">
                       Agregar al Carrito <i class="fa-solid fa-cart-shopping"></i>
                   </button>
               </div>
           </div>
       </div>
    `;

    const addBtn = document.getElementById("addCartBtn");
    if (addBtn) {
        addBtn.addEventListener("click", () => addCart(addBtn.dataset.id));
    }
}

function addCart(productId) {
    const cart = JSON.parse(localStorage.getItem("cart"));
    if (cart) {
        cart.push(productId);
        localStorage.setItem("cart", JSON.stringify(cart));
    } else {
        localStorage.setItem("cart", JSON.stringify([productId]));
    }
}

cart.innerHTML = ` 
    <span>${JSON.parse(localStorage.getItem("cart")).length}</span> 
    `;
cart.onclick = () => {
    window.location.href = "/pages/cart.html";
}


if (!productId) {
    productDetail && (productDetail.innerHTML = `<p>ID de producto no especificado.</p>`);
} else {
    const singleUrl = `https://luciano.pythonanywhere.com/api/productos/${encodeURIComponent(productId)}`;
    const listUrl = `https://luciano.pythonanywhere.com/api/productos`;

    console.log("Solicitando producto individual:", singleUrl);

    fetch(singleUrl)
        .then(response => {
            console.log("Respuesta (individual):", response.status, response.statusText, response.headers.get('content-type'));
            if (!response.ok) {
                // intentar fallback a la lista completa
                console.warn("Endpoint individual no OK, intentando lista completa...");
                return fetch(listUrl).then(r => {
                    if (!r.ok) throw new Error(`Lista HTTP ${r.status}`);
                    return r.json();
                });
            }
            const ct = (response.headers.get('content-type') || '').toLowerCase();
            if (ct.includes('application/json')) {
                return response.json();
            }
            // respuesta no JSON (HTML/text) -> obtener texto para debug y hacer fallback
            return response.text().then(text => {
                console.error("Respuesta inesperada (no JSON) del endpoint individual:", text.slice(0, 1000));
                return fetch(listUrl).then(r => {
                    if (!r.ok) throw new Error(`Lista HTTP ${r.status}`);
                    return r.json();
                });
            });
        })
        .then(data => {
            console.log("Data recibida:", data);
            let product = null;
            if (Array.isArray(data)) {
                product = data.find(p => getProductIdValue(p).toString() === productId.toString());
                if (!product) {
                    console.warn("Producto no encontrado en la lista. Mostrando primer elemento como fallback.");
                    product = data[0];
                }
            } else {
                product = data;
            }
            if (!product) {
                productDetail.innerHTML = `<p>Producto no encontrado.</p>`;
                return;
            }
            displayProductDetails(product);
        })
        .catch(err => {
            console.error("Error al obtener producto:", err);
            productDetail && (productDetail.innerHTML = `<p>Error al cargar el producto. Intenta más tarde.</p>`);
        });
}

