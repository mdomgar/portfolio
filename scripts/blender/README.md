# Retro PC opening sequence

`retro_pc.py` builds the whole scene in Blender (no external assets), animates
it and renders the WebP frames the home page plays back on scroll. Requires
Blender 5.x (tested on 5.2.3 LTS). It renders with EEVEE using flat emission
colours (Standard view transform, no lighting, no dither) and a Freestyle ink
outline, on a transparent background.

Palette and `SEQUENCE.screenColor` (`#121212`) are constants at the top of the
script; if the palette changes, edit them, re-render and keep `src/data/sequence.js`
in sync.

## Re-render both variants

Run from the repository root (Git Bash shown; use your own Blender path):

```sh
BLENDER="C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
rm -rf public/seq/desktop public/seq/mobile
"$BLENDER" -b -P scripts/blender/retro_pc.py -- --variant desktop --out public/seq/desktop
"$BLENDER" -b -P scripts/blender/retro_pc.py -- --variant mobile  --out public/seq/mobile
```

About 40 s for desktop and 20 s for mobile. Then run `npm test`: it checks that
every frame exists and that the size budgets hold (desktop <= 4 MB, mobile <= 1.5 MB).

## Arguments (after the `--`)

| Argument | Meaning |
| --- | --- |
| `--variant desktop\|mobile` | `desktop`: 1600x900, 96 frames, tower beside the monitor. `mobile`: 800x1200 portrait, 60 frames, flat desktop case under the monitor and a higher camera so the set fills the portrait frame. |
| `--out <dir>` | Output directory, created if missing. Files are `0001.webp`... (1-based, 4 digits). |
| `--frames <n>` | Frame count, overriding the variant default. Update `count` in `src/data/sequence.js` to match. |
| `--quality <0-100>` | Lossy WebP quality, default 70. Frames from 84% of the animation on (pure screen colour) are always lossless so the colour is exactly `#121212`. |
| `--only <n> [<n>...]` | Render only these 1-based frames, handy for previews. |
| `--format WEBP\|PNG` | Default WEBP. PNG is for previews; do not commit PNG frames. |
| `--samples <n>` | EEVEE render samples, default 16. |
| `--save-blend <file>` | Also save the generated scene as a .blend file to inspect it. |

Quick preview of a few frames as PNG:

```sh
"$BLENDER" -b -P scripts/blender/retro_pc.py -- --variant desktop --out /tmp/prev --format PNG --only 1 48 96
```

## Choreography

Normalised time `t` runs 0..1 over the frames: the set turns about 30 degrees
towards frontal (t 0-0.58), the camera pushes into the screen with a log-spaced
zoom (t 0.36-1.0), the fake code lines retract before the glass fills the
frame, and the last frames are the flat screen colour edge to edge.
