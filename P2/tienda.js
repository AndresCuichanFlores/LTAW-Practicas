const http = require('http');
const fs = require('fs');

const puerto = 9000;
const pagina = 'tiendaonline.html';
const paginaEror = 'tiendaerror.html';
let tiendaListaCompraHTML = fs.readFileSync('tiendalistacompra.html', 'utf-8');
let tiendaOnlineHTML = fs.readFileSync('tiendaonline.html', 'utf-8');
let usuariosData, productosData, pedidosData;
let shopList = [];
let userRegistered = false;
let userSignIn;
let tiendaData;

const server = http.createServer((req, res) => {
    let myURL = new URL(req.url, 'http://' + req.headers['host'])
    if (myURL.pathname === "/producto"){
        let nombreProducto = myURL.searchParams.get('nombre');
        addFullProduct(nombreProducto);
        return;
    }else if (myURL.pathname === "/signin"){
        var emailUsuario = myURL.searchParams.get('email');
        var passwordUsuario = myURL.searchParams.get('password');
        isUserRegistered(emailUsuario, passwordUsuario)
    }else if(myURL.pathname === "/datosListaCompra"){
        var miJSON = JSON.stringify(shopList);
        res.setHeader('Content-Type', 'application/json');
        res.write(miJSON);
        res.end();
        return;
    }else if(myURL.pathname === "/finalizarCompra"){
        var dirreccionEnvio = myURL.searchParams.get('dirreccionEnvio');
        var numeroTarjeta = myURL.searchParams.get('numeroTarjeta');
        addOrder(dirreccionEnvio, numeroTarjeta);
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
            }else if(myURL.pathname === "/signin" || myURL.pathname === "/" ||  myURL.pathname === "/tiendaonline.html"){
                if (userRegistered){
                    res.write(printMainPageWithUserRegistered());
                }else{
                    res.write(tiendaOnlineHTML);
                }
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
    tiendaData = JSON.parse(data);
    usuariosData = tiendaData.usuarios;
    productosData = tiendaData.productos;
    pedidosData = tiendaData.pedidos;
});

function isUserRegistered(emailUsuario, passwordUsuario) {
    usuariosData.forEach(usuarioData => {
        if(usuarioData.email === emailUsuario && usuarioData.password === passwordUsuario){
            userRegistered = true;
            userSignIn = usuarioData;
        }
    })
    return userRegistered;
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
        htmlExtra += '<div class="divSeparador"></div>';
    }else{
        htmlExtra = '<div class="divShopList">' + htmlExtra + '</div>';
        htmlExtra += '<div class="divButtonFinalizarCompra"><button id="buttonFinalizarCompra" onclick="openPopupFinalizarCompra()">Finalizar Compra</button></div>';
    }

    return tiendaListaCompraHTML.replace("LISTA_COMPRA", htmlExtra);
}

function printMainPageWithUserRegistered() {
    var perr = userSignIn.nombreUsuario;
    return tiendaOnlineHTML.replace("LOGIN", perr);
}

function addOrder(envio, tarjeta) {
    listaNombreViajesPedidos = [];
    for (let i = 0; i < shopList.length; i++) {
        listaNombreViajesPedidos.push(shopList[i].nombre);
    }

    if(userSignIn != null){
        var objetoPedido = {
            nombreUsuario: userSignIn.nombreUsuario,
            direccionEnvio: envio,
            numeroTarjeta: tarjeta,
            productos: listaNombreViajesPedidos
        };
    
        pedidosData.push(objetoPedido);
        tiendaData["pedidos"] = pedidosData;
        let tiendaDataJSON = JSON.stringify(tiendaData)
    
        fs.writeFile('tienda.json', tiendaDataJSON, 'utf8', (error) => {
            if (error) {
              console.error('Error al escribir en el archivo:', error);
              return;
            }
            console.log('Archivo "tienda.json" actualizado correctamente.');
        });
    }
}


