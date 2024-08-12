# LeafletIShape

Made with fun, durring an interview test, and went to be an npm package :)

# iShapeContext class
A core component of the iShape library for Leaflet maps. It provides a centralized way to manage shapes on your map and enables features like shape creation, manipulation, and interaction.

# iShapeCli Function
Purpose:
The iShapeCli function provides a background command-line interface (CLI) for creating and manipulating shapes on a Leaflet map. Users can execute specific actions by pressing keyboard shortcuts. This functionality is built into the iShape library by default, offering an alternative method of interaction with the map.

# Functionality:

Listens for keydown events to capture user input, it builds a command string based on pressed keys, and it executes commands based on the built command string.
Supports the following commands:
 + polygon: Creates a new polygon shape.
 + circle: Creates a new circle shape.
 + rectangle: Creates a new rectangle shape.
 + path: Creates a new path shape.
 + pins: Toggles the pin state for all shapes.
 + edit: Toggles the edit mode for all shapes.
 + hide: Hides all shapes.
 + show: Shows all shapes.
 + clean or clear: Deletes all shapes.