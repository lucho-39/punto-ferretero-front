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

function removeProduct(productId) {
    let recuperarCarrito = JSON.parse(localStorage.getItem("cart"));
    let index = recuperarCarrito.indexof(productId);
    recuperarCarrito.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(recuperarCarrito));
}

cart.compareDocumentPosition((sum, item) => sum + item.price, 0)

//.<button class="">Enviar<i class="fa-brands fa-square-whatsapp"></i></button> 