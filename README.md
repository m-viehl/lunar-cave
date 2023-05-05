# Lunar Cave game
Cool auto-generated caves!

# Build and run
1. Clone this repo
2. Run `npm install`
3. Deployment:
    - *Development server*: Run `npm run dev` and visit the displayed URL.
    - *Production build*: Run `npm run build`, which will place output files in the `dist/` directory. These files can then be served. (E.g. by using the `./put_online.sh` script.)

# Changelog
This changelog is for *user-visible features*, not internal improvements.

## Version 0, 2022-03-01
- Playable game different from the current "lunar cave" game
- No cave, but a landscape with landing areas

## Version 1.0, 2022-03-11
- Basic version of the "lunar cave" game
- Add cave
- New filled drawing style instead of lines
- No "user interface" whatsoever

## Version 1.1, 2022-05-03
- Allow to draw construction lines
- Add velocity-dependent scaling
- Add rudimentary difficulty selector

## Version 2.0, 2022-06-02
- Fix arrow keys affecting the difficulty selector
- Add a HTML user interface with instructions
- Switch from progress bar to percentage text
- Hide the cursor when playing
- Add two drawing modes: filled and lines only
- Switch name to **Lunar Cave**
- Freeze the game when crashing

## Version 3.0, 2022-08-16
Not mentioning the huge rewrite to allow for proper configuration would be sad... (But yes, this is no user-visible feature, I see.)

- Do not hide progress on crash
- Improve easy mode:
    - Increase rotational speed by 100%
    - Increase the cave dimensions
    - Make the cave shorter

## Version 3.1, 2022-08-22
- Make style configurable via jsons
- Add dark lines only mode

## Version 3.2, 2023-05-05
- Make cave generation deterministic and add a seed selection prompt when pressing shift+N
- Fix the cave generation bug which caused long straight cave segments sometimes even running "backwards"
- Add a favicon
- Switch to parceljs, which
    - reduced the deployment size
    - automatically adds hashed filenames for cache busting
