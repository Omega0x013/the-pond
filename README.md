# The Pond
*Own a froggy friend.*

## Original Game

I originally developed this game for my Level 4 coursework while studying Software Engineering at the [University of Portsmouth](https://www.port.ac.uk/). A version of it with some of the coursework submission specific boilerplate cut out can be found in [Release 1.0](https://github.com/Omega0x013/the-pond/releases/tag/1.0).

The coursework brief was to design a [Tamagotchi](https://en.wikipedia.org/wiki/Tamagotchi) pet. The pet needed to have a name and could become hungry, tired, and unclean. The user had to be able to interact with their pet to raise its stats, and the pet had to die if the stats got too low.

My implementation was a frog that could hop around a pond. When the player clicked on a lily pad, the frog hops to it. It could catch flies to become less hungry, but each jump cost 1% stamina. Stamina would fully recharge after an hour; the pet would go from full stats to empty in 24h. The frog could also pick up items: a toothbrush, a cookie, and a bottle of pills. These items would restore the frog's stats. I chose these items because I could draw them using only circles and squircles.

## New Game

I've refactored and re-engineered the requirements since then...
