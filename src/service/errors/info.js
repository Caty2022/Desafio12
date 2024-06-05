const generarInfoError = (producto) => {
  return ` Los datos estan incompletos o son invalidos. 
        Necesitamos recibir lo siguiente: 
        - Nombre: String, pero recibimos ${producto.title}
        - Descripcion: String, pero recibimos ${producto.description}
        - Precio: Number, pero recibimos ${producto.price}
        - Codigo: String, pero recibimos ${producto.code}
        - Stock: Number, pero recibimos ${producto.stock}
        - Categoria: String, pero recibimos ${producto.category}
    `;
};

module.exports = {
  generarInfoError,
};
