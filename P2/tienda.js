const http = require('http');
const fs = require('fs');
const { log } = require('console');

const puerto = 9000;
const pagina = 'tiendaonline.html';
const paginaEror = 'tiendaerror.html';

let tiendaListaCompraHTML = fs.readFileSync('tiendalistacompra.html', 'utf-8');
let usuariosData, productosData, pedidosData;
let shopList = [];

const server = http.createServer((req, res) => {
    let myURL = new URL(req.url, 'http://' + req.headers['host'])
    console.log("Esta es tu pathname! " + myURL.pathname);

    if (myURL.pathname === "/producto"){
        let nombreProducto = myURL.searchParams.get('nombre');
        addFullProduct(nombreProducto);
        return;
    }else if (myURL.pathname != "/"){
        recurso = "." + myURL.pathname;
    }else{
        recurso = pagina;
    }
    
    fs.readFile(recurso, (error, page) => {
        if (error) {
            fs.readFile(paginaEror, (error, page) => {
                res.statusCode = 404;
                res.statusMessage = "Not Found";
                res.write(page);
                res.end();    
            });
        }else{
            if(myURL.pathname === "/tiendalistacompra.html"){
                res.write(printShopList()); 
            }else{
                res.write(page); 
            }            
            res.statusCode = 200;
            res.statusMessage = "OK";
            res.end();
        } 
    }); 
});

server.listen(puerto);
console.log("Servidor activado. Escuchando en puerto " + puerto);

fs.readFile('tienda.json', 'utf8', (error, data) => {
    if (error) {
      console.error('Error al leer el archivo:', error);
      return;
    } 
    const tiendaData = JSON.parse(data);
    usuariosData = tiendaData.usuarios;
    productosData = tiendaData.productos;
    pedidosData = tiendaData.pedidos;
});

function isUserRegistered(usuario) {
    usuariosData.forEach(usuarioData => {
       return usuarioData.nombreUsuario.toLowerCase() === usuario.nombreUsuario.toLowerCase()
    })
}

function addFullProduct(nombreProducto) {
    if(!isDuplicateProduct(nombreProducto)){
        for (let i = 0; i < productosData.length; i++) {
            const productoData = productosData[i];
            if (productoData.nombre.toLowerCase() === nombreProducto.toLowerCase()) {
                shopList.push(productoData);
                break; 
            }
        }
    }
}

function isDuplicateProduct(nombreProducto) {
    for (let i = 0; i < shopList.length; i++) {
        const productoListaCompra = shopList[i];
        if (productoListaCompra.nombre.toLowerCase() === nombreProducto.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function printShopList() {
    let htmlExtra = "";
    for (let i = 0; i < shopList.length; i++) {
        const divItemImagen = '<div class="itemImagen" id="' + shopList[i].imagen + '"></div>';
        const divItemInfo = '<div class="itemInfo"><span>' + shopList[i].descripcion  + '</span><p id="intPrecio">Precio: ' + shopList[i].precio + '€</p></div>';
        const divFullItem = '<div class="productoItem">' + divItemImagen + divItemInfo + '</div>';
        htmlExtra += divFullItem;
    }

    if(htmlExtra === ""){
        htmlExtra = '<div class="imagenListaCompraVacia"></div>';
    }else{
        htmlExtra = '<div class="divShopList">' + htmlExtra + '</div>';
    }

    return tiendaListaCompraHTML.replace("LISTA_COMPRA", htmlExtra);
}


