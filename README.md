# Typescript HTML Canvas Game Sample
- Creates a full-screen canvas, no scroll bars
- Browser zoom should be at 100% for 1:1 pixel ratio (Canvas can't do anything if browser zoom is not 100%)
- Canvas is automatically resized on window resizes

# Build
Just run `tsc` and serve `main.html`.

# Lander TODO
- better collision checks
- mark landing sites
- explosion
- points/fuel?
- side-scrolling
    - one landing spot every x meters
    - refuel at landing spot
    - scroll when going to the right
- add ceiling