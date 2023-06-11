const http = require('http');
const fs = require('fs');

const puerto = 9000;
const pagina = 'tiendaonline.html';
const paginaEror = 'imagenes/error404.jpg';


const server = http.createServer((req, res) => {
    let myURL = new URL(req.url, 'http://' + req.headers['host'])
    console.log("Esta es tu url! " + myURL.href);
    console.log("Esta es tu pathname! " + myURL.pathname);

    if (myURL.pathname != "/"){
        recurso = "." + myURL.pathname;
    } else{
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
            res.statusCode = 200;
            res.statusMessage = "OK";
            res.write(page);
            res.end();
        } 
    }); 
});

server.listen(puerto);
console.log("Servidor activado. Escuchando en puerto " + puerto);