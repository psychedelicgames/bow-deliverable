 // This class stores global constants between the client and server.
 // author alvin.lin.dev@gmail.com (Alvin Lin)

 // Empty constructor for the Constants class.
// @constructor

function Constants() {
  throw new Error('Constants should not be instantiated!');
}

// The world will always be a square, so there's no need for an x and y max.
// WORLD and CANVAS constants should mirror those in the client side. All values are in pixels.

Constants.WORLD_MIN = 0;
Constants.WORLD_MAX = 2500;

//el padding se usa para no poner cosas cerca de los bordes
Constants.WORLD_PADDING = 30;

Constants.CANVAS_WIDTH = 2500;
Constants.CANVAS_HEIGHT = 2500;

//creo que es recomendable no modificar acá, parece en vano anclarlo.
Constants.VISIBILITY_THRESHOLD_X = (Constants.CANVAS_WIDTH / 2) + 25
Constants.VISIBILITY_THRESHOLD_Y = (Constants.CANVAS_HEIGHT / 2) + 25

// If Constants is loaded as a Node module, then this line is called.
if (typeof module === 'object') { module.exports = Constants; }
// If Constants is loaded into the browser, then this line is called.
else { window.Constants = Constants; }
