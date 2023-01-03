# aframe-volograms
Aframe component to display volograms in web browser.  
I didn't use a lot aframe; do not hesitate to create an issue to suggest another way to use it.  


# Usage

`<a-entity vologram src="https://www.example.com/foo/bar/1670754904327_ld/texture_1024_h264.mp4"></a-entity>`

See the [index.html](dist/index.html) for a complete example.  

# TODO
Probably better expose the HTMLVideoElement properties, although you can already access them (see [index.html](dist/index.html))

# For older myself

`npm install`  
`npm run start`

## To build
`npm run build` (THREE is not included as in aframe; volograms-js is included)
