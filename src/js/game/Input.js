/**
 * This class facilitates the tracking of user input, such as mouse clicks
 * and button presses.
 * @author alvin.lin.dev@gmail.com (Alvin Lin)
 */

/**
 * Empty constructor for the Input object.
 */
function Input() {
  throw new Error('Input should not be instantiated!');
}

//definiciones
Input.LEFT_CLICK    = false;
Input.RIGHT_CLICK   = false;
Input.MOUSE         = [];
Input.LEFT          = false;
Input.UP            = false;
Input.RIGHT         = false;
Input.DOWN          = false;
Input.MISC_KEYS     = {};

//perceive mouse down
Input.onMouseDown = function(event) {
  if (event.which == 1) { Input.LEFT_CLICK = true; }
  else if (event.which == 3) { Input.RIGHT_CLICK = true; }
};

//perceive mouse up
Input.onMouseUp = function(event) {
  if (event.which == 1) { Input.LEFT_CLICK = false; }
  else if (event.which == 3) { Input.RIGHT_CLICK = false; }
};

//perceive keydown
Input.onKeyDown = function(event) {
  // console.log('Keydown: ' + event.keyCode);
  switch (event.keyCode) {
    case 37:
    case 65:
      Input.LEFT = true;
      break;
    case 38:
    case 87:
      Input.UP = true;
      break;
    case 39:
    case 68:
      Input.RIGHT = true;
      break;
    case 40:
    case 83:
      Input.DOWN = true;
      break;
    default:
      Input.MISC_KEYS[event.keyCode] = true;
      break;
  }
};

//perceive keyup
Input.onKeyUp = function(event) {
  switch (event.keyCode) {
    case 37:
    case 65:
      Input.LEFT = false;
      break;
    case 38:
    case 87:
      Input.UP = false;
      break;
    case 39:
    case 68:
      Input.RIGHT = false;
      break;
    case 40:
    case 83:
      Input.DOWN = false;
      break;
    default:
      Input.MISC_KEYS[event.keyCode] = false;
  }
};

//aplica handlers para enviar a la fuinción
Input.applyEventHandlers = function(element) {
  element.setAttribute('tabindex', 1);
  element.addEventListener('mousedown', Input.onMouseDown);
  element.addEventListener('mouseup', Input.onMouseUp);
  element.addEventListener('keyup', Input.onKeyUp);
  element.addEventListener('keydown', Input.onKeyDown);
};

//persigue las coordenadas del mouse
Input.addMouseTracker = function(element) {
  element.addEventListener('mousemove', function(event) {
    Input.MOUSE = [event.offsetX, event.offsetY];
  });
};
