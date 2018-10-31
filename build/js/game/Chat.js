/**
 * This class handles the sending and receiving of chat messages as well as
 * their display. Chat messages will use the same socket as the game.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

/**
 * Constructor for the Chat class.
 * @constructor
 * @param {Object} socket The socket connected to the server.
 * @param {Element} displayElement The element in which the chat will be
 *   displayed.
 * @param {Element} textElement The input element from which text will be read
 *   to be sent as a chat message to the server.
 */
function Chat(socket, displayElement, textElement) {
  this.socket = socket;
  this.displayElement = displayElement;
  this.textElement = textElement;
}

/**
 * Factory method to create a Chat object.
 * @param {Object} socket The socket connected to the server.
 * @param {Element} displayElement The element in which the chat will be
 *   displayed.
 * @param {Element} textElement The input element from which text will be read
 *   to be sent as a chat message to the server.
 * @return {Chat}
 */
Chat.create = function(socket, displayElement, textElement) {
  var chat = new Chat(socket, displayElement, textElement);
  chat.init();
  return chat;
};

/**
 * Binds the event handlers. This should be called during the initialization
 * in client.js.
 */
Chat.prototype.init = function() {
  this.textElement.addEventListener('keydown', bind(this, function(e) {
    if (e.keyCode == 13) {
      this.sendMessage();
    }
  }));

  this.socket.on('dialogo-servidor-usuarios', bind(this, function(data) {
    //enviamos la información al canal
    this.receiveMessage(data['name'], data['message'], data['isNotification']);
  }));
};

/**
 * This is called when a message is received, and will display the new
 * received message.
 * @param {string} name The name of the message sender.
 * @param {string} message The content of the message.
 * @param {boolean} isNotification Whether or not this message is an
 *   administrative notification.
 */
Chat.prototype.receiveMessage = function(name, message, isNotification) {

  //mandamos el li con la clase desvanecedora
  variable  = "<li class='dialog'>";
  variable += name;
  variable += message;
  variable += "</li>";

  //mandamos el li preparado para ser eliminado en 4500 segundos (demora 4500 en desvanecer)
  $(variable).appendTo('#chat-display').delay(4500).queue(function() { $(this).remove(); });
  //calculamos los lis que lleva
  var messages_size = $("#chat-display li").length;
  //si acumulamos más de 3, liquidamos el primero
  if (messages_size > 3) {
    $('#chat-display li').first().remove();
  }

};

/**
 * This is called when the user presses enter in the chatbox, and takes care
 * of taking the message they typed and sending it to the server to be relayed
 * to other clients.
 */
 //se modifica el chat para que funcione con las cookies.
 //es un problema de seguridad, dado que el usuario podría manipular las Cookies
 //a fin de impersonificar a un segundo usuario.
 //el servidor debería de recibir el nombre de usuario y el password
 //a fin de verificar que el usuario sea válido.
 //no es recomendable inicializar la información del sock, como segunda opción.
Chat.prototype.sendMessage = function() {
  var message = this.textElement.value;
  var username = Cookies('user_username');
  //var password = Cookies('user_password');
  this.textElement.value = '';
  this.socket.emit('dialogo-usuario-servidor', username, message);
  $('#chat-display').scrollTop(0);
};
