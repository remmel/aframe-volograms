# aframe-volograms
Aframe component to display volograms in web browser. Use [volograms-js](https://www.npmjs.com/package/volograms-js).  
I didn't use a lot aframe; do not hesitate to create an issue to suggest another way to use it.  


# Usage

`<a-entity vologram src="https://www.example.com/foo/bar/1670754904327_ld/texture_1024_h264.mp4"></a-entity>`

See the [index.html](dist/index.html) for a complete example.  
[Live demo](https://remmel.github.io/aframe-volograms/dist/index.html)

# TODO
Probably better expose the `HTMLVideoElement` properties, although you can already access them (see [index.html](dist/index.html))

## How to contribute
- clone repo : `git clone git@github.com:remmel/aframe-volograms.git`
- run local webserver : `npm run start`
- build js : `npm run build` (THREE is not included as in aframe; volograms-js is included)
- publish new version : `npm version 0.1.1` `npm publish`
