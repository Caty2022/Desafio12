class UserDTO {
  constructor(firstName, lastName, email, rol) {
    this.nombre = firstName;
    this.apellido = lastName;
    this.email = email;
    this.rol = rol;
  }
}

module.exports = UserDTO;
