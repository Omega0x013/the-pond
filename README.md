# The Pond
*Own a froggy friend.*

## Original Game

<!-- ![Screenshot of the original game.](https://github.com/user-attachments/assets/be91bc6c-92e8-4e23-ad77-76dfab184f77) -->

<img src="https://github.com/user-attachments/assets/be91bc6c-92e8-4e23-ad77-76dfab184f77" width="200">

I originally developed this game for my Level 4 coursework while studying Software Engineering at the [University of Portsmouth](https://www.port.ac.uk/). A version of it without the coursework-specific boilerplate can be found in [Release 1.0](https://github.com/Omega0x013/the-pond/releases/tag/1.0).

The coursework brief was to design a [Tamagotchi](https://en.wikipedia.org/wiki/Tamagotchi) pet. The pet needed to have a name and could become hungry, tired, and unclean. The user had to be able to interact with their pet to raise its stats, and the pet had to die if the stats got too low.

My pet was a frog that could hop between lily pads on a pond. Each hop cost 1% stamina. The frog could catch flies to become less hungry, and would slowly become unclean. The frog could also collect items to improve its stats: a cookie to feed the frog, a toothbrush to clean the frog, and a bottle of pills to keep the frog awake.

I hand-drew all the graphics using only rectangles and circles in [Excalidraw](https://excalidraw.com/). I used a massively over-engineered OOP solution, where each type of entity inherited from a base `Entity` class, which in turn aggregated two other classes.

## New Game

I've refactored and re-engineered the requirements since then...
