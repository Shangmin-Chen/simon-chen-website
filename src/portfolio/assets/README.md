# ASCII frame data

`crew.json` contains the approved 72 × 33 character grids, sampled HSL
palettes, and eyelid masks. No raster source images are bundled or fetched.
`intro.json` is the approved 60 × 61 interlocked SC emblem; keep its spacing.

The character artwork comes from Cyberpunk: Edgerunners. Frame references:

- David: https://cyberpunk.fandom.com/wiki/David_Martinez
- Lucy: https://www.animeunited.com.br/noticias/animes/cyberpunk-edgerunners-ganha-novo-trailer/
- Rebecca: https://www.svg.com/1045771/cyberpunk-2077-how-to-get-rebeccas-shotgun/
- Maine: https://gameranx.com/features/id/370100/article/cyberpunk-2077-how-to-play-like-maine-maine-build-guide/
- Falco: https://www.gamesradar.com/cyberpunk-2077-phantom-liberty-wont-feature-an-edgerunners-character-after-all/

The footer links to the active frame reference. Grids were made by cropping a
frame, resampling to character cells, quantizing to 20 colors, and assigning
characters by luminance. The rendering algorithm groups adjacent colors into
text spans. Eyes use original iris texture inside hand-positioned eyelid masks;
Maine's visor has no animated iris. To change a crop, update its grid and masks
together. Asset integrity and frame dimensions are checked in the domain tests.
