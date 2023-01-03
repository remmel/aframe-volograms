/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "three":
/*!************************!*\
  !*** external "THREE" ***!
  \************************/
/***/ ((module) => {

module.exports = THREE;

/***/ }),

/***/ "./node_modules/volograms-js/src/BinaryReader.js":
/*!*******************************************************!*\
  !*** ./node_modules/volograms-js/src/BinaryReader.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BinaryReader": () => (/* binding */ BinaryReader)
/* harmony export */ });
// const { IOBuffer } = require('iobuffer') //npm i iobuffer
//let iobuffer = new IOBuffer(arrayBuffer)

class BinaryReader {
    /** */
    constructor(arrayBuffer) {
        this.array = new Uint8Array(arrayBuffer)
        this.dataView = new DataView(arrayBuffer)
        this.cur=0
        this.arrayBuffer = arrayBuffer
    }

    readString(){
        let val = ''
        let size = this.array[this.cur]
        this.cur++

        for(let i = 0; i<size; i++, this.cur++) {
            let cascii = this.array[this.cur]
            let char = String.fromCharCode(cascii)
            val += char
        }

        return val
    }


    //        // let blob = await(response.blob())
    //         // let version = new Uint16Array(arrayBuffer, 4, 1)// let dataView = new DataView(arrayBuffer)
    readInt32() {
        let val =  this.dataView.getInt32(this.cur,true)
        this.cur += 4 //move pointer 4 bytes further
        // let val = 0
        // for(let i=0; i<4; i++, this.cur++) {
        //     val +=this.array[this.cur]<<i // * Math.pow(2,i*8) //TODO check the pow or use << instead
        // }
        return val
    }

    readInt16() {
        let val = this.dataView.getInt32(this.cur, true)
        this.cur += 2
        return val
    }

    readByte() {
        return this.array[this.cur++]
    }

    // // https://stackoverflow.com/questions/42699162/javascript-convert-array-of-4-bytes-into-a-float-value-from-modbustcp-read
    // static readSingle(data) {
    //
    //     //(new DataView(arrayBuffer)).getFloat32(75, true)

    //     var data4 =  [this.array[this.cur++], this.array[this.cur++], this.array[this.cur++], this.array[this.cur++]]
    //
    //     var buf = new ArrayBuffer(4);
    //     var view = new DataView(buf);
    //
    //     data4.forEach((b, i) => {
    //         view.setUint8(i, b)
    //     })
    //
    //     // Read the bits as a float; note that by doing this, we're implicitly
    //     // converting it from a 32-bit float into JavaScript's native 64-bit double
    //     return view.getFloat32(0, true);
    // }

    readSingle(){
        let val =  this.dataView.getFloat32(this.cur, true) //see IOBuffer.ts readFloat32
        this.cur += 4
        return val
    }

    readShort() {
        let val = this.dataView.getInt16(this.cur, true)
        this.cur += 2
        return val
    }

    isEOF() {
        return this.cur === this.dataView.byteLength
    }
}

/***/ }),

/***/ "./node_modules/volograms-js/src/Vologram.js":
/*!***************************************************!*\
  !*** ./node_modules/volograms-js/src/Vologram.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Vologram": () => (/* binding */ Vologram)
/* harmony export */ });
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./node_modules/volograms-js/src/utils.js");
/* harmony import */ var _VologramHeaderReader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./VologramHeaderReader.js */ "./node_modules/volograms-js/src/VologramHeaderReader.js");
/* harmony import */ var _VologramBodyReader_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./VologramBodyReader.js */ "./node_modules/volograms-js/src/VologramBodyReader.js");





//VologramFrame.cs AND VologramAssetLoader.cs
class Vologram extends three__WEBPACK_IMPORTED_MODULE_0__.Group {

    constructor(folder, onProgress = () => {}, options = {}) {
        super()
        this.onProgress = onProgress
        this.options = {texture: 'texture_1024_h264.mp4', autoplay: true, ...options}

        this.elVideo = (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.createElement)(`<video width='400' height='80' muted controls loop playsinline preload='auto' crossorigin='anonymous'>`)
        this.geometries = []
        this.fps = 30

        // elVideo.ontimeupdate is not triggered often enough
        this.elVideo.requestVideoFrameCallback(this.onVideoFrameCallback.bind(this))

        this.init(folder)
        window.VOLOG = this //dirty yeah, but for debugging only
    }

    async init(folder) {
        this.geometries = await this.fetchMeshes(folder)
        this.elVideo.src = folder + '/' + this.options.texture
        // this.elVideo.playbackRate = 0.1
        var texture = this.texture = new three__WEBPACK_IMPORTED_MODULE_0__.VideoTexture(this.elVideo)
        texture.minFilter = three__WEBPACK_IMPORTED_MODULE_0__.NearestFilter

        if(this.options.autoplay)
            this.elVideo.play()

        this.material = new three__WEBPACK_IMPORTED_MODULE_0__.MeshPhongMaterial({
            side: three__WEBPACK_IMPORTED_MODULE_0__.DoubleSide,
            flatShading: true,
            map: texture,
        })

        //init mesh with 1st geometry
        this.mesh = new three__WEBPACK_IMPORTED_MODULE_0__.Mesh(this.geometries[0], this.material)

        this.add(this.mesh)
    }

    async fetchMeshes(folder) {
        let geometries = []
        let header = await new _VologramHeaderReader_js__WEBPACK_IMPORTED_MODULE_2__.VologramHeaderReader().init(folder + '/header.vols')
        //TODO must handle multiple files not only number 0
        //Load all the geometry in memory. Dirty but OK, as Volograms currently last 5sec max
        let body = new _VologramBodyReader_js__WEBPACK_IMPORTED_MODULE_3__.VologramBodyReader(folder + '/sequence_0.vols', header.version, this.onProgress)
        let reader = await body.fetch()
        for (let i = 0; i < header.frameCount; i++) {
            body.customReadNext(reader, header.hasNormal(), header.isTextured())
            let geo = this.createGeometry(body)
            geometries.push(geo)
        }
        return geometries
    }

    /**
     * Loop system (was before in update())
     * this is better to use requestVideoFrameCallback.metadata.mediaTime has it's more stable (always the same for one frame),
     * rather that this.elVideo.currentTime which depends of when it was trigger. Because the time between each frame is not exactly 1/30
     * this is better to "always fall" at the "center" (or same offset) of a frame as we are not sure if a little before is previous frame or current (idem after)
     * Alternative to get precise frame number is to encode it in the video
     */
    onVideoFrameCallback(now, metadata) {
        var frameIdx = this.getFrameIdx(metadata.mediaTime)

        if (this.prevFrameIdx !== frameIdx) {
            if (frameIdx >= this.geometries.length) return console.error("out frame:" + frameIdx + " time: " + this.elVideo.currentTime)
            this.mesh.geometry = this.geometries[frameIdx]
            // if(this.prevFrameIdx !== undefined)
            //     this.geometries[this.prevFrameIdx].dispose()
            this.prevFrameIdx = frameIdx
        }

        this.elVideo.requestVideoFrameCallback(this.onVideoFrameCallback.bind(this))
    }
    
    update(delta) {
        //currently not used anymore but maybe in the future
    }

    /**
     * For some video, the first is 0 and other 0.02322
     * Need add at least 0.00001 for 0 based te be in correct frame
     * @param time
     * @returns {number}
     */
    getFrameIdx(time) { //eg [0.667-0.700[=20
        return Math.floor(time * this.fps + 0.0001) //30fps
    }

    /**
     * Create geometry from .vol body information
     * @param {VologramBodyReader} body
     * @returns {THREE.BufferGeometry}
     */
    createGeometry(body) {
        let vertices = []
        let uvs = []
        // as this is done at init, we do not care to optimize it,
        // but would be better to not copy the data, only using pointer
        // we prefer here code readability over optimization
        body.verticesData.forEach(xyz => vertices.push(xyz.x, xyz.y, xyz.z))
        body.uvsData.forEach(xy => uvs.push(xy.x, xy.y))

        let geometry = new three__WEBPACK_IMPORTED_MODULE_0__.BufferGeometry()
        geometry.setIndex(body.indicesData)
        geometry.setAttribute('position', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute(vertices, 3))
        geometry.setAttribute('uv', new three__WEBPACK_IMPORTED_MODULE_0__.Float32BufferAttribute(uvs, 2))
        return geometry
    }
}

/***/ }),

/***/ "./node_modules/volograms-js/src/VologramBodyReader.js":
/*!*************************************************************!*\
  !*** ./node_modules/volograms-js/src/VologramBodyReader.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VologramBodyReader": () => (/* binding */ VologramBodyReader)
/* harmony export */ });
/* harmony import */ var _BinaryReader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BinaryReader.js */ "./node_modules/volograms-js/src/BinaryReader.js");
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ "./node_modules/volograms-js/src/utils.js");



class VologramBodyReader {

    constructor(url, version, onProgress = () => {}) {
        this._url = url
        this._version = version

        this.frameNumber = -1
        this.lastKeyFrameNumber = undefined
        this._previousFrame = -1
        this.meshDataSize = undefined
        this.keyFrame = undefined
        this._verticesSize = undefined

        this.verticesData = []
        this.normalsData = []
        this.indicesData = []
        this.uvsData = []
        this.textureData = []

        this.onProgress = onProgress
    }

    isKeyFrame() {
        return this.keyFrame === 1
    }

    async fetch() {
        let response = await (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.fetchOnProgress)(this._url, this.onProgress)
        // let response = await fetch(this._url); let arraybuffer = await(response.arrayBuffer())
        return new _BinaryReader_js__WEBPACK_IMPORTED_MODULE_0__.BinaryReader(response.response)
    }

    customReadNext(reader, hasNormals, textured) {
        this.frameNumber = reader.readInt32()
        this.meshDataSize = reader.readInt32()
        this.keyFrame = reader.readByte()
        this.frameHeaderCheck()
        this.readFrameData(reader, hasNormals, textured)
    }

    ////VologramFrame.cs:ParseBody

    readFrameData(reader, hasNormals, textured) {
        this.readVerticesData(reader)

        if (hasNormals)
            this.readNormalsData(reader)

        // New UVs from that frame
        if (this.keyFrame === 1 || this.keyFrame === 2) {
            this.lastKeyFrameNumber = this.frameNumber
            this.readIndicesData(reader)
            this.readUvsData(reader)
        }

        if (textured)
            this.readTextureData(reader)

        this._frameMeshDataSize = reader.readInt32()
        this.frameDataSizeCheck()
    }

    readVerticesData(reader) {
        this._verticesSize = reader.readInt32()
        this.verticesData = []
        // read Vector3 - 3 float - 3x4=12 byte each Vector3
        for (let i = 0; i < this._verticesSize / 12; i++) { //probably something more effecient than that
            this.verticesData.push({
                x: reader.readSingle(),
                y: reader.readSingle(),
                z: reader.readSingle()
            })
        }
    }

    readNormalsData(reader) {
        this._normalSize = reader.readInt32()
        if (this._normalSize <= 0) throw new Error(`Invalid normals length value (${this._normalSize})`)
        if (this._normalSize !== this._verticesSize) throw new Error(`The number of normals (size:${this._normalSize}) does not match the number of vertices (size:${this._verticesSize}`)
        // for(let i=0;i<this._normalSize/4;i++) this.normalsData.push(reader.readSingle())
        this.normalsData = []
        for (let i = 0; i < this._normalSize / 12; i++) {
            this.normalsData.push({
                x: reader.readSingle(),
                y: reader.readSingle(),
                z: reader.readSingle()
            })
        }
    }

    readIndicesData(reader) {
        this._indicesSize = reader.readInt32()
        if (this._indicesSize <= 0) throw new Error(`Invalid indices length value (${this._indicesSize})`)
        this.indicesData = []

        let verticesCount = this._verticesSize / 4
        if (verticesCount / 3 < 65535) {
            this.usingShortIndices = true
            for (let i = 0; i < this._indicesSize / 2; i++) { //2=SIZE_C_SHORT
                this.indicesData.push(reader.readShort()) //this.indicesDataS
            }
        } else {
            this.usingShortIndices = false
            for (let i = 0; i < this._indicesSize / 4; i++) { //4=SIZE_C_INT
                this.indicesData.push(reader.readInt32())
            }
        }
    }

    readUvsData(reader) {
        this._uvsSize = reader.readInt32()
        if (this._uvsSize <= 0) throw new Error("Invalid uvs length value (" + this._uvsSize + ")")
        if (this._uvsSize / 2 !== this._verticesSize / 3) throw new Error(`The number of UVs does not match the number of vertices: ${this._uvsSize}(_uvsSize)/2 !== ${this._verticesSize}(_verticesSize)/3`)
        this.uvsData = []

        for (let i = 0; i < this._uvsSize / 8; i++) {
            this.uvsData.push({
                x: reader.readSingle(),
                y: reader.readSingle()
            })
        }
    }

    readTextureData(reader) { //TODO try it!
        this._textureSize = reader.readInt32()
        this.textureData = []

        if (this._textureSize <= 0) throw new Error(`Invalid texture size value (${this._textureSize})`)
        for (let i = 0; i < this._textureSize; i++) {
            this.textureData.push(reader.readByte())
        }
    }

    frameHeaderCheck() {
        if (this.frameNumber < 0) throw new Error(`Invalid frameNumber (${this.frameNumber})`)
        if (this.meshDataSize < 1) throw new Error(`Invalid meshDataSize (${this.meshDataSize})`)
        if (this.keyFrame > 2) throw new Error(`Invalid keyFrame (${this.keyFrame})`)
    }

    frameDataSizeCheck() {
        if (this._frameMeshDataSize !== this.meshDataSize)
            throw new Error(`Total size before ${this.meshDataSize} and after ${this._frameMeshDataSize} body do not match`)
    }
}

/***/ }),

/***/ "./node_modules/volograms-js/src/VologramHeaderReader.js":
/*!***************************************************************!*\
  !*** ./node_modules/volograms-js/src/VologramHeaderReader.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "VologramHeaderReader": () => (/* binding */ VologramHeaderReader)
/* harmony export */ });
/* harmony import */ var _BinaryReader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./BinaryReader.js */ "./node_modules/volograms-js/src/BinaryReader.js");


// VologramHeaderReader.cs
class VologramHeaderReader {

    async init(url) { //asynced constructor
        let response = await fetch(url)
        let reader = new _BinaryReader_js__WEBPACK_IMPORTED_MODULE_0__.BinaryReader(await (response.arrayBuffer()))

        this.format = reader.readString()
        this.version = reader.readInt32()
        this.compression = reader.readInt32()
        this.meshName = reader.readString()
        this.material = reader.readString()
        this.shader = reader.readString()
        this.topology = reader.readInt32()
        this.frameCount = reader.readInt32()

        if (this.version >= 11) {
            this.normals = reader.readByte()
            this.textured = reader.readByte()
            this.textureWidth = reader.readInt16()
            this.textureHeight = reader.readInt16()
            this.textureFormat = reader.readInt16()

            if (this.version >= 12) {
                this.translation = [reader.readSingle(), reader.readSingle(), reader.readSingle()]
                //data.dataView.getFloat32(75, true) //position 74 in C#
                this.rotation = [reader.readSingle(), reader.readSingle(), reader.readSingle(), reader.readSingle()]
                // this.scale0 = data.dataView.getFloat32(90, true)
                this.scale = reader.readSingle()
            }
        }
        return this
    }

    hasNormal() {
        return this.normals === 1
    }

    isTextured() {
        return this.textured === 1
    }
}

/***/ }),

/***/ "./node_modules/volograms-js/src/utils.js":
/*!************************************************!*\
  !*** ./node_modules/volograms-js/src/utils.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "createElement": () => (/* binding */ createElement),
/* harmony export */   "fetchOnProgress": () => (/* binding */ fetchOnProgress)
/* harmony export */ });

function createElement(html) {
    var elDiv = document.createElement('div') //it creates a stupid parent div, fix it
    elDiv.innerHTML = html
    return elDiv.children[0]
}

//could have similar interface then fetch: let response = await fetch(url); let arraybuffer = await(response.arrayBuffer())
function fetchOnProgress(url, onProgress, responseType = 'arraybuffer') {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.responseType = responseType
        xhr.addEventListener('progress', e => onProgress(e.loaded / e.total))
        xhr.addEventListener('loadend', () => resolve(xhr)) //or' load'
        xhr.addEventListener('error', () => reject(xhr))
        xhr.addEventListener('abort', () => reject(xhr))
        xhr.open('GET', url)
        xhr.send()
        window.XHR = xhr
    })
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var volograms_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! volograms-js */ "./node_modules/volograms-js/src/Vologram.js");


AFRAME.registerComponent('vologram', {
    init: function () {
        const src = this.el.getAttribute('src')
        const el = this.el

        const n = src.lastIndexOf('/');
        const folder = src.substring(0, n)
        const texture = src.substring(n + 1);

        const onProgress = value => {
            el.emit('progress', {value, el})
        }

        this.mesh = new volograms_js__WEBPACK_IMPORTED_MODULE_0__.Vologram(folder, onProgress, {texture})

        el.setObject3D('mesh', this.mesh);
    },
    remove: function () {
        this.el.removeObject3D('vologram')
    }
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7O0FDTnNDOztBQUV0QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQ0FBaUMsVUFBVTtBQUMzQzs7QUFFQSx3QkFBd0Isa0RBQVEsc0JBQXNCLFFBQVE7O0FBRTlEO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLENBQUMsRSIsInNvdXJjZXMiOlsid2VicGFjazovL2FmcmFtZS12b2xvZ3JhbXMvZXh0ZXJuYWwgdmFyIFwiVEhSRUVcIiIsIndlYnBhY2s6Ly9hZnJhbWUtdm9sb2dyYW1zLy4vbm9kZV9tb2R1bGVzL3ZvbG9ncmFtcy1qcy9zcmMvQmluYXJ5UmVhZGVyLmpzIiwid2VicGFjazovL2FmcmFtZS12b2xvZ3JhbXMvLi9ub2RlX21vZHVsZXMvdm9sb2dyYW1zLWpzL3NyYy9Wb2xvZ3JhbS5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtdm9sb2dyYW1zLy4vbm9kZV9tb2R1bGVzL3ZvbG9ncmFtcy1qcy9zcmMvVm9sb2dyYW1Cb2R5UmVhZGVyLmpzIiwid2VicGFjazovL2FmcmFtZS12b2xvZ3JhbXMvLi9ub2RlX21vZHVsZXMvdm9sb2dyYW1zLWpzL3NyYy9Wb2xvZ3JhbUhlYWRlclJlYWRlci5qcyIsIndlYnBhY2s6Ly9hZnJhbWUtdm9sb2dyYW1zLy4vbm9kZV9tb2R1bGVzL3ZvbG9ncmFtcy1qcy9zcmMvdXRpbHMuanMiLCJ3ZWJwYWNrOi8vYWZyYW1lLXZvbG9ncmFtcy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9hZnJhbWUtdm9sb2dyYW1zL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9hZnJhbWUtdm9sb2dyYW1zL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vYWZyYW1lLXZvbG9ncmFtcy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2FmcmFtZS12b2xvZ3JhbXMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBUSFJFRTsiLCIvLyBjb25zdCB7IElPQnVmZmVyIH0gPSByZXF1aXJlKCdpb2J1ZmZlcicpIC8vbnBtIGkgaW9idWZmZXJcbi8vbGV0IGlvYnVmZmVyID0gbmV3IElPQnVmZmVyKGFycmF5QnVmZmVyKVxuXG5leHBvcnQgY2xhc3MgQmluYXJ5UmVhZGVyIHtcbiAgICAvKiogKi9cbiAgICBjb25zdHJ1Y3RvcihhcnJheUJ1ZmZlcikge1xuICAgICAgICB0aGlzLmFycmF5ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpXG4gICAgICAgIHRoaXMuZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoYXJyYXlCdWZmZXIpXG4gICAgICAgIHRoaXMuY3VyPTBcbiAgICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGFycmF5QnVmZmVyXG4gICAgfVxuXG4gICAgcmVhZFN0cmluZygpe1xuICAgICAgICBsZXQgdmFsID0gJydcbiAgICAgICAgbGV0IHNpemUgPSB0aGlzLmFycmF5W3RoaXMuY3VyXVxuICAgICAgICB0aGlzLmN1cisrXG5cbiAgICAgICAgZm9yKGxldCBpID0gMDsgaTxzaXplOyBpKyssIHRoaXMuY3VyKyspIHtcbiAgICAgICAgICAgIGxldCBjYXNjaWkgPSB0aGlzLmFycmF5W3RoaXMuY3VyXVxuICAgICAgICAgICAgbGV0IGNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGNhc2NpaSlcbiAgICAgICAgICAgIHZhbCArPSBjaGFyXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsXG4gICAgfVxuXG5cbiAgICAvLyAgICAgICAgLy8gbGV0IGJsb2IgPSBhd2FpdChyZXNwb25zZS5ibG9iKCkpXG4gICAgLy8gICAgICAgICAvLyBsZXQgdmVyc2lvbiA9IG5ldyBVaW50MTZBcnJheShhcnJheUJ1ZmZlciwgNCwgMSkvLyBsZXQgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoYXJyYXlCdWZmZXIpXG4gICAgcmVhZEludDMyKCkge1xuICAgICAgICBsZXQgdmFsID0gIHRoaXMuZGF0YVZpZXcuZ2V0SW50MzIodGhpcy5jdXIsdHJ1ZSlcbiAgICAgICAgdGhpcy5jdXIgKz0gNCAvL21vdmUgcG9pbnRlciA0IGJ5dGVzIGZ1cnRoZXJcbiAgICAgICAgLy8gbGV0IHZhbCA9IDBcbiAgICAgICAgLy8gZm9yKGxldCBpPTA7IGk8NDsgaSsrLCB0aGlzLmN1cisrKSB7XG4gICAgICAgIC8vICAgICB2YWwgKz10aGlzLmFycmF5W3RoaXMuY3VyXTw8aSAvLyAqIE1hdGgucG93KDIsaSo4KSAvL1RPRE8gY2hlY2sgdGhlIHBvdyBvciB1c2UgPDwgaW5zdGVhZFxuICAgICAgICAvLyB9XG4gICAgICAgIHJldHVybiB2YWxcbiAgICB9XG5cbiAgICByZWFkSW50MTYoKSB7XG4gICAgICAgIGxldCB2YWwgPSB0aGlzLmRhdGFWaWV3LmdldEludDMyKHRoaXMuY3VyLCB0cnVlKVxuICAgICAgICB0aGlzLmN1ciArPSAyXG4gICAgICAgIHJldHVybiB2YWxcbiAgICB9XG5cbiAgICByZWFkQnl0ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXJyYXlbdGhpcy5jdXIrK11cbiAgICB9XG5cbiAgICAvLyAvLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80MjY5OTE2Mi9qYXZhc2NyaXB0LWNvbnZlcnQtYXJyYXktb2YtNC1ieXRlcy1pbnRvLWEtZmxvYXQtdmFsdWUtZnJvbS1tb2RidXN0Y3AtcmVhZFxuICAgIC8vIHN0YXRpYyByZWFkU2luZ2xlKGRhdGEpIHtcbiAgICAvL1xuICAgIC8vICAgICAvLyhuZXcgRGF0YVZpZXcoYXJyYXlCdWZmZXIpKS5nZXRGbG9hdDMyKDc1LCB0cnVlKVxuXG4gICAgLy8gICAgIHZhciBkYXRhNCA9ICBbdGhpcy5hcnJheVt0aGlzLmN1cisrXSwgdGhpcy5hcnJheVt0aGlzLmN1cisrXSwgdGhpcy5hcnJheVt0aGlzLmN1cisrXSwgdGhpcy5hcnJheVt0aGlzLmN1cisrXV1cbiAgICAvL1xuICAgIC8vICAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDQpO1xuICAgIC8vICAgICB2YXIgdmlldyA9IG5ldyBEYXRhVmlldyhidWYpO1xuICAgIC8vXG4gICAgLy8gICAgIGRhdGE0LmZvckVhY2goKGIsIGkpID0+IHtcbiAgICAvLyAgICAgICAgIHZpZXcuc2V0VWludDgoaSwgYilcbiAgICAvLyAgICAgfSlcbiAgICAvL1xuICAgIC8vICAgICAvLyBSZWFkIHRoZSBiaXRzIGFzIGEgZmxvYXQ7IG5vdGUgdGhhdCBieSBkb2luZyB0aGlzLCB3ZSdyZSBpbXBsaWNpdGx5XG4gICAgLy8gICAgIC8vIGNvbnZlcnRpbmcgaXQgZnJvbSBhIDMyLWJpdCBmbG9hdCBpbnRvIEphdmFTY3JpcHQncyBuYXRpdmUgNjQtYml0IGRvdWJsZVxuICAgIC8vICAgICByZXR1cm4gdmlldy5nZXRGbG9hdDMyKDAsIHRydWUpO1xuICAgIC8vIH1cblxuICAgIHJlYWRTaW5nbGUoKXtcbiAgICAgICAgbGV0IHZhbCA9ICB0aGlzLmRhdGFWaWV3LmdldEZsb2F0MzIodGhpcy5jdXIsIHRydWUpIC8vc2VlIElPQnVmZmVyLnRzIHJlYWRGbG9hdDMyXG4gICAgICAgIHRoaXMuY3VyICs9IDRcbiAgICAgICAgcmV0dXJuIHZhbFxuICAgIH1cblxuICAgIHJlYWRTaG9ydCgpIHtcbiAgICAgICAgbGV0IHZhbCA9IHRoaXMuZGF0YVZpZXcuZ2V0SW50MTYodGhpcy5jdXIsIHRydWUpXG4gICAgICAgIHRoaXMuY3VyICs9IDJcbiAgICAgICAgcmV0dXJuIHZhbFxuICAgIH1cblxuICAgIGlzRU9GKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jdXIgPT09IHRoaXMuZGF0YVZpZXcuYnl0ZUxlbmd0aFxuICAgIH1cbn0iLCJpbXBvcnQgKiBhcyBUSFJFRSBmcm9tICd0aHJlZSdcbmltcG9ydCB7Y3JlYXRlRWxlbWVudH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcbmltcG9ydCB7Vm9sb2dyYW1IZWFkZXJSZWFkZXJ9IGZyb20gXCIuL1ZvbG9ncmFtSGVhZGVyUmVhZGVyLmpzXCI7XG5pbXBvcnQge1ZvbG9ncmFtQm9keVJlYWRlcn0gZnJvbSBcIi4vVm9sb2dyYW1Cb2R5UmVhZGVyLmpzXCI7XG5cbi8vVm9sb2dyYW1GcmFtZS5jcyBBTkQgVm9sb2dyYW1Bc3NldExvYWRlci5jc1xuZXhwb3J0IGNsYXNzIFZvbG9ncmFtIGV4dGVuZHMgVEhSRUUuR3JvdXAge1xuXG4gICAgY29uc3RydWN0b3IoZm9sZGVyLCBvblByb2dyZXNzID0gKCkgPT4ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzdXBlcigpXG4gICAgICAgIHRoaXMub25Qcm9ncmVzcyA9IG9uUHJvZ3Jlc3NcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge3RleHR1cmU6ICd0ZXh0dXJlXzEwMjRfaDI2NC5tcDQnLCBhdXRvcGxheTogdHJ1ZSwgLi4ub3B0aW9uc31cblxuICAgICAgICB0aGlzLmVsVmlkZW8gPSBjcmVhdGVFbGVtZW50KGA8dmlkZW8gd2lkdGg9JzQwMCcgaGVpZ2h0PSc4MCcgbXV0ZWQgY29udHJvbHMgbG9vcCBwbGF5c2lubGluZSBwcmVsb2FkPSdhdXRvJyBjcm9zc29yaWdpbj0nYW5vbnltb3VzJz5gKVxuICAgICAgICB0aGlzLmdlb21ldHJpZXMgPSBbXVxuICAgICAgICB0aGlzLmZwcyA9IDMwXG5cbiAgICAgICAgLy8gZWxWaWRlby5vbnRpbWV1cGRhdGUgaXMgbm90IHRyaWdnZXJlZCBvZnRlbiBlbm91Z2hcbiAgICAgICAgdGhpcy5lbFZpZGVvLnJlcXVlc3RWaWRlb0ZyYW1lQ2FsbGJhY2sodGhpcy5vblZpZGVvRnJhbWVDYWxsYmFjay5iaW5kKHRoaXMpKVxuXG4gICAgICAgIHRoaXMuaW5pdChmb2xkZXIpXG4gICAgICAgIHdpbmRvdy5WT0xPRyA9IHRoaXMgLy9kaXJ0eSB5ZWFoLCBidXQgZm9yIGRlYnVnZ2luZyBvbmx5XG4gICAgfVxuXG4gICAgYXN5bmMgaW5pdChmb2xkZXIpIHtcbiAgICAgICAgdGhpcy5nZW9tZXRyaWVzID0gYXdhaXQgdGhpcy5mZXRjaE1lc2hlcyhmb2xkZXIpXG4gICAgICAgIHRoaXMuZWxWaWRlby5zcmMgPSBmb2xkZXIgKyAnLycgKyB0aGlzLm9wdGlvbnMudGV4dHVyZVxuICAgICAgICAvLyB0aGlzLmVsVmlkZW8ucGxheWJhY2tSYXRlID0gMC4xXG4gICAgICAgIHZhciB0ZXh0dXJlID0gdGhpcy50ZXh0dXJlID0gbmV3IFRIUkVFLlZpZGVvVGV4dHVyZSh0aGlzLmVsVmlkZW8pXG4gICAgICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTmVhcmVzdEZpbHRlclxuXG4gICAgICAgIGlmKHRoaXMub3B0aW9ucy5hdXRvcGxheSlcbiAgICAgICAgICAgIHRoaXMuZWxWaWRlby5wbGF5KClcblxuICAgICAgICB0aGlzLm1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hQaG9uZ01hdGVyaWFsKHtcbiAgICAgICAgICAgIHNpZGU6IFRIUkVFLkRvdWJsZVNpZGUsXG4gICAgICAgICAgICBmbGF0U2hhZGluZzogdHJ1ZSxcbiAgICAgICAgICAgIG1hcDogdGV4dHVyZSxcbiAgICAgICAgfSlcblxuICAgICAgICAvL2luaXQgbWVzaCB3aXRoIDFzdCBnZW9tZXRyeVxuICAgICAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJpZXNbMF0sIHRoaXMubWF0ZXJpYWwpXG5cbiAgICAgICAgdGhpcy5hZGQodGhpcy5tZXNoKVxuICAgIH1cblxuICAgIGFzeW5jIGZldGNoTWVzaGVzKGZvbGRlcikge1xuICAgICAgICBsZXQgZ2VvbWV0cmllcyA9IFtdXG4gICAgICAgIGxldCBoZWFkZXIgPSBhd2FpdCBuZXcgVm9sb2dyYW1IZWFkZXJSZWFkZXIoKS5pbml0KGZvbGRlciArICcvaGVhZGVyLnZvbHMnKVxuICAgICAgICAvL1RPRE8gbXVzdCBoYW5kbGUgbXVsdGlwbGUgZmlsZXMgbm90IG9ubHkgbnVtYmVyIDBcbiAgICAgICAgLy9Mb2FkIGFsbCB0aGUgZ2VvbWV0cnkgaW4gbWVtb3J5LiBEaXJ0eSBidXQgT0ssIGFzIFZvbG9ncmFtcyBjdXJyZW50bHkgbGFzdCA1c2VjIG1heFxuICAgICAgICBsZXQgYm9keSA9IG5ldyBWb2xvZ3JhbUJvZHlSZWFkZXIoZm9sZGVyICsgJy9zZXF1ZW5jZV8wLnZvbHMnLCBoZWFkZXIudmVyc2lvbiwgdGhpcy5vblByb2dyZXNzKVxuICAgICAgICBsZXQgcmVhZGVyID0gYXdhaXQgYm9keS5mZXRjaCgpXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGVhZGVyLmZyYW1lQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgYm9keS5jdXN0b21SZWFkTmV4dChyZWFkZXIsIGhlYWRlci5oYXNOb3JtYWwoKSwgaGVhZGVyLmlzVGV4dHVyZWQoKSlcbiAgICAgICAgICAgIGxldCBnZW8gPSB0aGlzLmNyZWF0ZUdlb21ldHJ5KGJvZHkpXG4gICAgICAgICAgICBnZW9tZXRyaWVzLnB1c2goZ2VvKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZW9tZXRyaWVzXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9vcCBzeXN0ZW0gKHdhcyBiZWZvcmUgaW4gdXBkYXRlKCkpXG4gICAgICogdGhpcyBpcyBiZXR0ZXIgdG8gdXNlIHJlcXVlc3RWaWRlb0ZyYW1lQ2FsbGJhY2subWV0YWRhdGEubWVkaWFUaW1lIGhhcyBpdCdzIG1vcmUgc3RhYmxlIChhbHdheXMgdGhlIHNhbWUgZm9yIG9uZSBmcmFtZSksXG4gICAgICogcmF0aGVyIHRoYXQgdGhpcy5lbFZpZGVvLmN1cnJlbnRUaW1lIHdoaWNoIGRlcGVuZHMgb2Ygd2hlbiBpdCB3YXMgdHJpZ2dlci4gQmVjYXVzZSB0aGUgdGltZSBiZXR3ZWVuIGVhY2ggZnJhbWUgaXMgbm90IGV4YWN0bHkgMS8zMFxuICAgICAqIHRoaXMgaXMgYmV0dGVyIHRvIFwiYWx3YXlzIGZhbGxcIiBhdCB0aGUgXCJjZW50ZXJcIiAob3Igc2FtZSBvZmZzZXQpIG9mIGEgZnJhbWUgYXMgd2UgYXJlIG5vdCBzdXJlIGlmIGEgbGl0dGxlIGJlZm9yZSBpcyBwcmV2aW91cyBmcmFtZSBvciBjdXJyZW50IChpZGVtIGFmdGVyKVxuICAgICAqIEFsdGVybmF0aXZlIHRvIGdldCBwcmVjaXNlIGZyYW1lIG51bWJlciBpcyB0byBlbmNvZGUgaXQgaW4gdGhlIHZpZGVvXG4gICAgICovXG4gICAgb25WaWRlb0ZyYW1lQ2FsbGJhY2sobm93LCBtZXRhZGF0YSkge1xuICAgICAgICB2YXIgZnJhbWVJZHggPSB0aGlzLmdldEZyYW1lSWR4KG1ldGFkYXRhLm1lZGlhVGltZSlcblxuICAgICAgICBpZiAodGhpcy5wcmV2RnJhbWVJZHggIT09IGZyYW1lSWR4KSB7XG4gICAgICAgICAgICBpZiAoZnJhbWVJZHggPj0gdGhpcy5nZW9tZXRyaWVzLmxlbmd0aCkgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJvdXQgZnJhbWU6XCIgKyBmcmFtZUlkeCArIFwiIHRpbWU6IFwiICsgdGhpcy5lbFZpZGVvLmN1cnJlbnRUaW1lKVxuICAgICAgICAgICAgdGhpcy5tZXNoLmdlb21ldHJ5ID0gdGhpcy5nZW9tZXRyaWVzW2ZyYW1lSWR4XVxuICAgICAgICAgICAgLy8gaWYodGhpcy5wcmV2RnJhbWVJZHggIT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmdlb21ldHJpZXNbdGhpcy5wcmV2RnJhbWVJZHhdLmRpc3Bvc2UoKVxuICAgICAgICAgICAgdGhpcy5wcmV2RnJhbWVJZHggPSBmcmFtZUlkeFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbFZpZGVvLnJlcXVlc3RWaWRlb0ZyYW1lQ2FsbGJhY2sodGhpcy5vblZpZGVvRnJhbWVDYWxsYmFjay5iaW5kKHRoaXMpKVxuICAgIH1cbiAgICBcbiAgICB1cGRhdGUoZGVsdGEpIHtcbiAgICAgICAgLy9jdXJyZW50bHkgbm90IHVzZWQgYW55bW9yZSBidXQgbWF5YmUgaW4gdGhlIGZ1dHVyZVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZvciBzb21lIHZpZGVvLCB0aGUgZmlyc3QgaXMgMCBhbmQgb3RoZXIgMC4wMjMyMlxuICAgICAqIE5lZWQgYWRkIGF0IGxlYXN0IDAuMDAwMDEgZm9yIDAgYmFzZWQgdGUgYmUgaW4gY29ycmVjdCBmcmFtZVxuICAgICAqIEBwYXJhbSB0aW1lXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBnZXRGcmFtZUlkeCh0aW1lKSB7IC8vZWcgWzAuNjY3LTAuNzAwWz0yMFxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih0aW1lICogdGhpcy5mcHMgKyAwLjAwMDEpIC8vMzBmcHNcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgZ2VvbWV0cnkgZnJvbSAudm9sIGJvZHkgaW5mb3JtYXRpb25cbiAgICAgKiBAcGFyYW0ge1ZvbG9ncmFtQm9keVJlYWRlcn0gYm9keVxuICAgICAqIEByZXR1cm5zIHtUSFJFRS5CdWZmZXJHZW9tZXRyeX1cbiAgICAgKi9cbiAgICBjcmVhdGVHZW9tZXRyeShib2R5KSB7XG4gICAgICAgIGxldCB2ZXJ0aWNlcyA9IFtdXG4gICAgICAgIGxldCB1dnMgPSBbXVxuICAgICAgICAvLyBhcyB0aGlzIGlzIGRvbmUgYXQgaW5pdCwgd2UgZG8gbm90IGNhcmUgdG8gb3B0aW1pemUgaXQsXG4gICAgICAgIC8vIGJ1dCB3b3VsZCBiZSBiZXR0ZXIgdG8gbm90IGNvcHkgdGhlIGRhdGEsIG9ubHkgdXNpbmcgcG9pbnRlclxuICAgICAgICAvLyB3ZSBwcmVmZXIgaGVyZSBjb2RlIHJlYWRhYmlsaXR5IG92ZXIgb3B0aW1pemF0aW9uXG4gICAgICAgIGJvZHkudmVydGljZXNEYXRhLmZvckVhY2goeHl6ID0+IHZlcnRpY2VzLnB1c2goeHl6LngsIHh5ei55LCB4eXoueikpXG4gICAgICAgIGJvZHkudXZzRGF0YS5mb3JFYWNoKHh5ID0+IHV2cy5wdXNoKHh5LngsIHh5LnkpKVxuXG4gICAgICAgIGxldCBnZW9tZXRyeSA9IG5ldyBUSFJFRS5CdWZmZXJHZW9tZXRyeSgpXG4gICAgICAgIGdlb21ldHJ5LnNldEluZGV4KGJvZHkuaW5kaWNlc0RhdGEpXG4gICAgICAgIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgncG9zaXRpb24nLCBuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSh2ZXJ0aWNlcywgMykpXG4gICAgICAgIGdlb21ldHJ5LnNldEF0dHJpYnV0ZSgndXYnLCBuZXcgVEhSRUUuRmxvYXQzMkJ1ZmZlckF0dHJpYnV0ZSh1dnMsIDIpKVxuICAgICAgICByZXR1cm4gZ2VvbWV0cnlcbiAgICB9XG59IiwiaW1wb3J0IHtCaW5hcnlSZWFkZXJ9IGZyb20gXCIuL0JpbmFyeVJlYWRlci5qc1wiXG5pbXBvcnQge2ZldGNoT25Qcm9ncmVzc30gZnJvbSBcIi4vdXRpbHMuanNcIlxuXG5leHBvcnQgY2xhc3MgVm9sb2dyYW1Cb2R5UmVhZGVyIHtcblxuICAgIGNvbnN0cnVjdG9yKHVybCwgdmVyc2lvbiwgb25Qcm9ncmVzcyA9ICgpID0+IHt9KSB7XG4gICAgICAgIHRoaXMuX3VybCA9IHVybFxuICAgICAgICB0aGlzLl92ZXJzaW9uID0gdmVyc2lvblxuXG4gICAgICAgIHRoaXMuZnJhbWVOdW1iZXIgPSAtMVxuICAgICAgICB0aGlzLmxhc3RLZXlGcmFtZU51bWJlciA9IHVuZGVmaW5lZFxuICAgICAgICB0aGlzLl9wcmV2aW91c0ZyYW1lID0gLTFcbiAgICAgICAgdGhpcy5tZXNoRGF0YVNpemUgPSB1bmRlZmluZWRcbiAgICAgICAgdGhpcy5rZXlGcmFtZSA9IHVuZGVmaW5lZFxuICAgICAgICB0aGlzLl92ZXJ0aWNlc1NpemUgPSB1bmRlZmluZWRcblxuICAgICAgICB0aGlzLnZlcnRpY2VzRGF0YSA9IFtdXG4gICAgICAgIHRoaXMubm9ybWFsc0RhdGEgPSBbXVxuICAgICAgICB0aGlzLmluZGljZXNEYXRhID0gW11cbiAgICAgICAgdGhpcy51dnNEYXRhID0gW11cbiAgICAgICAgdGhpcy50ZXh0dXJlRGF0YSA9IFtdXG5cbiAgICAgICAgdGhpcy5vblByb2dyZXNzID0gb25Qcm9ncmVzc1xuICAgIH1cblxuICAgIGlzS2V5RnJhbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmtleUZyYW1lID09PSAxXG4gICAgfVxuXG4gICAgYXN5bmMgZmV0Y2goKSB7XG4gICAgICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGZldGNoT25Qcm9ncmVzcyh0aGlzLl91cmwsIHRoaXMub25Qcm9ncmVzcylcbiAgICAgICAgLy8gbGV0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godGhpcy5fdXJsKTsgbGV0IGFycmF5YnVmZmVyID0gYXdhaXQocmVzcG9uc2UuYXJyYXlCdWZmZXIoKSlcbiAgICAgICAgcmV0dXJuIG5ldyBCaW5hcnlSZWFkZXIocmVzcG9uc2UucmVzcG9uc2UpXG4gICAgfVxuXG4gICAgY3VzdG9tUmVhZE5leHQocmVhZGVyLCBoYXNOb3JtYWxzLCB0ZXh0dXJlZCkge1xuICAgICAgICB0aGlzLmZyYW1lTnVtYmVyID0gcmVhZGVyLnJlYWRJbnQzMigpXG4gICAgICAgIHRoaXMubWVzaERhdGFTaXplID0gcmVhZGVyLnJlYWRJbnQzMigpXG4gICAgICAgIHRoaXMua2V5RnJhbWUgPSByZWFkZXIucmVhZEJ5dGUoKVxuICAgICAgICB0aGlzLmZyYW1lSGVhZGVyQ2hlY2soKVxuICAgICAgICB0aGlzLnJlYWRGcmFtZURhdGEocmVhZGVyLCBoYXNOb3JtYWxzLCB0ZXh0dXJlZClcbiAgICB9XG5cbiAgICAvLy8vVm9sb2dyYW1GcmFtZS5jczpQYXJzZUJvZHlcblxuICAgIHJlYWRGcmFtZURhdGEocmVhZGVyLCBoYXNOb3JtYWxzLCB0ZXh0dXJlZCkge1xuICAgICAgICB0aGlzLnJlYWRWZXJ0aWNlc0RhdGEocmVhZGVyKVxuXG4gICAgICAgIGlmIChoYXNOb3JtYWxzKVxuICAgICAgICAgICAgdGhpcy5yZWFkTm9ybWFsc0RhdGEocmVhZGVyKVxuXG4gICAgICAgIC8vIE5ldyBVVnMgZnJvbSB0aGF0IGZyYW1lXG4gICAgICAgIGlmICh0aGlzLmtleUZyYW1lID09PSAxIHx8IHRoaXMua2V5RnJhbWUgPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdEtleUZyYW1lTnVtYmVyID0gdGhpcy5mcmFtZU51bWJlclxuICAgICAgICAgICAgdGhpcy5yZWFkSW5kaWNlc0RhdGEocmVhZGVyKVxuICAgICAgICAgICAgdGhpcy5yZWFkVXZzRGF0YShyZWFkZXIpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGV4dHVyZWQpXG4gICAgICAgICAgICB0aGlzLnJlYWRUZXh0dXJlRGF0YShyZWFkZXIpXG5cbiAgICAgICAgdGhpcy5fZnJhbWVNZXNoRGF0YVNpemUgPSByZWFkZXIucmVhZEludDMyKClcbiAgICAgICAgdGhpcy5mcmFtZURhdGFTaXplQ2hlY2soKVxuICAgIH1cblxuICAgIHJlYWRWZXJ0aWNlc0RhdGEocmVhZGVyKSB7XG4gICAgICAgIHRoaXMuX3ZlcnRpY2VzU2l6ZSA9IHJlYWRlci5yZWFkSW50MzIoKVxuICAgICAgICB0aGlzLnZlcnRpY2VzRGF0YSA9IFtdXG4gICAgICAgIC8vIHJlYWQgVmVjdG9yMyAtIDMgZmxvYXQgLSAzeDQ9MTIgYnl0ZSBlYWNoIFZlY3RvcjNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl92ZXJ0aWNlc1NpemUgLyAxMjsgaSsrKSB7IC8vcHJvYmFibHkgc29tZXRoaW5nIG1vcmUgZWZmZWNpZW50IHRoYW4gdGhhdFxuICAgICAgICAgICAgdGhpcy52ZXJ0aWNlc0RhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgeDogcmVhZGVyLnJlYWRTaW5nbGUoKSxcbiAgICAgICAgICAgICAgICB5OiByZWFkZXIucmVhZFNpbmdsZSgpLFxuICAgICAgICAgICAgICAgIHo6IHJlYWRlci5yZWFkU2luZ2xlKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkTm9ybWFsc0RhdGEocmVhZGVyKSB7XG4gICAgICAgIHRoaXMuX25vcm1hbFNpemUgPSByZWFkZXIucmVhZEludDMyKClcbiAgICAgICAgaWYgKHRoaXMuX25vcm1hbFNpemUgPD0gMCkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG5vcm1hbHMgbGVuZ3RoIHZhbHVlICgke3RoaXMuX25vcm1hbFNpemV9KWApXG4gICAgICAgIGlmICh0aGlzLl9ub3JtYWxTaXplICE9PSB0aGlzLl92ZXJ0aWNlc1NpemUpIHRocm93IG5ldyBFcnJvcihgVGhlIG51bWJlciBvZiBub3JtYWxzIChzaXplOiR7dGhpcy5fbm9ybWFsU2l6ZX0pIGRvZXMgbm90IG1hdGNoIHRoZSBudW1iZXIgb2YgdmVydGljZXMgKHNpemU6JHt0aGlzLl92ZXJ0aWNlc1NpemV9YClcbiAgICAgICAgLy8gZm9yKGxldCBpPTA7aTx0aGlzLl9ub3JtYWxTaXplLzQ7aSsrKSB0aGlzLm5vcm1hbHNEYXRhLnB1c2gocmVhZGVyLnJlYWRTaW5nbGUoKSlcbiAgICAgICAgdGhpcy5ub3JtYWxzRGF0YSA9IFtdXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fbm9ybWFsU2l6ZSAvIDEyOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMubm9ybWFsc0RhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgeDogcmVhZGVyLnJlYWRTaW5nbGUoKSxcbiAgICAgICAgICAgICAgICB5OiByZWFkZXIucmVhZFNpbmdsZSgpLFxuICAgICAgICAgICAgICAgIHo6IHJlYWRlci5yZWFkU2luZ2xlKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkSW5kaWNlc0RhdGEocmVhZGVyKSB7XG4gICAgICAgIHRoaXMuX2luZGljZXNTaXplID0gcmVhZGVyLnJlYWRJbnQzMigpXG4gICAgICAgIGlmICh0aGlzLl9pbmRpY2VzU2l6ZSA8PSAwKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgaW5kaWNlcyBsZW5ndGggdmFsdWUgKCR7dGhpcy5faW5kaWNlc1NpemV9KWApXG4gICAgICAgIHRoaXMuaW5kaWNlc0RhdGEgPSBbXVxuXG4gICAgICAgIGxldCB2ZXJ0aWNlc0NvdW50ID0gdGhpcy5fdmVydGljZXNTaXplIC8gNFxuICAgICAgICBpZiAodmVydGljZXNDb3VudCAvIDMgPCA2NTUzNSkge1xuICAgICAgICAgICAgdGhpcy51c2luZ1Nob3J0SW5kaWNlcyA9IHRydWVcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5faW5kaWNlc1NpemUgLyAyOyBpKyspIHsgLy8yPVNJWkVfQ19TSE9SVFxuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlc0RhdGEucHVzaChyZWFkZXIucmVhZFNob3J0KCkpIC8vdGhpcy5pbmRpY2VzRGF0YVNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXNpbmdTaG9ydEluZGljZXMgPSBmYWxzZVxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9pbmRpY2VzU2l6ZSAvIDQ7IGkrKykgeyAvLzQ9U0laRV9DX0lOVFxuICAgICAgICAgICAgICAgIHRoaXMuaW5kaWNlc0RhdGEucHVzaChyZWFkZXIucmVhZEludDMyKCkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWFkVXZzRGF0YShyZWFkZXIpIHtcbiAgICAgICAgdGhpcy5fdXZzU2l6ZSA9IHJlYWRlci5yZWFkSW50MzIoKVxuICAgICAgICBpZiAodGhpcy5fdXZzU2l6ZSA8PSAwKSB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHV2cyBsZW5ndGggdmFsdWUgKFwiICsgdGhpcy5fdXZzU2l6ZSArIFwiKVwiKVxuICAgICAgICBpZiAodGhpcy5fdXZzU2l6ZSAvIDIgIT09IHRoaXMuX3ZlcnRpY2VzU2l6ZSAvIDMpIHRocm93IG5ldyBFcnJvcihgVGhlIG51bWJlciBvZiBVVnMgZG9lcyBub3QgbWF0Y2ggdGhlIG51bWJlciBvZiB2ZXJ0aWNlczogJHt0aGlzLl91dnNTaXplfShfdXZzU2l6ZSkvMiAhPT0gJHt0aGlzLl92ZXJ0aWNlc1NpemV9KF92ZXJ0aWNlc1NpemUpLzNgKVxuICAgICAgICB0aGlzLnV2c0RhdGEgPSBbXVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdXZzU2l6ZSAvIDg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy51dnNEYXRhLnB1c2goe1xuICAgICAgICAgICAgICAgIHg6IHJlYWRlci5yZWFkU2luZ2xlKCksXG4gICAgICAgICAgICAgICAgeTogcmVhZGVyLnJlYWRTaW5nbGUoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlYWRUZXh0dXJlRGF0YShyZWFkZXIpIHsgLy9UT0RPIHRyeSBpdCFcbiAgICAgICAgdGhpcy5fdGV4dHVyZVNpemUgPSByZWFkZXIucmVhZEludDMyKClcbiAgICAgICAgdGhpcy50ZXh0dXJlRGF0YSA9IFtdXG5cbiAgICAgICAgaWYgKHRoaXMuX3RleHR1cmVTaXplIDw9IDApIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB0ZXh0dXJlIHNpemUgdmFsdWUgKCR7dGhpcy5fdGV4dHVyZVNpemV9KWApXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fdGV4dHVyZVNpemU7IGkrKykge1xuICAgICAgICAgICAgdGhpcy50ZXh0dXJlRGF0YS5wdXNoKHJlYWRlci5yZWFkQnl0ZSgpKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnJhbWVIZWFkZXJDaGVjaygpIHtcbiAgICAgICAgaWYgKHRoaXMuZnJhbWVOdW1iZXIgPCAwKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZnJhbWVOdW1iZXIgKCR7dGhpcy5mcmFtZU51bWJlcn0pYClcbiAgICAgICAgaWYgKHRoaXMubWVzaERhdGFTaXplIDwgMSkgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIG1lc2hEYXRhU2l6ZSAoJHt0aGlzLm1lc2hEYXRhU2l6ZX0pYClcbiAgICAgICAgaWYgKHRoaXMua2V5RnJhbWUgPiAyKSB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQga2V5RnJhbWUgKCR7dGhpcy5rZXlGcmFtZX0pYClcbiAgICB9XG5cbiAgICBmcmFtZURhdGFTaXplQ2hlY2soKSB7XG4gICAgICAgIGlmICh0aGlzLl9mcmFtZU1lc2hEYXRhU2l6ZSAhPT0gdGhpcy5tZXNoRGF0YVNpemUpXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRvdGFsIHNpemUgYmVmb3JlICR7dGhpcy5tZXNoRGF0YVNpemV9IGFuZCBhZnRlciAke3RoaXMuX2ZyYW1lTWVzaERhdGFTaXplfSBib2R5IGRvIG5vdCBtYXRjaGApXG4gICAgfVxufSIsImltcG9ydCB7QmluYXJ5UmVhZGVyfSBmcm9tIFwiLi9CaW5hcnlSZWFkZXIuanNcIlxuXG4vLyBWb2xvZ3JhbUhlYWRlclJlYWRlci5jc1xuZXhwb3J0IGNsYXNzIFZvbG9ncmFtSGVhZGVyUmVhZGVyIHtcblxuICAgIGFzeW5jIGluaXQodXJsKSB7IC8vYXN5bmNlZCBjb25zdHJ1Y3RvclxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpXG4gICAgICAgIGxldCByZWFkZXIgPSBuZXcgQmluYXJ5UmVhZGVyKGF3YWl0IChyZXNwb25zZS5hcnJheUJ1ZmZlcigpKSlcblxuICAgICAgICB0aGlzLmZvcm1hdCA9IHJlYWRlci5yZWFkU3RyaW5nKClcbiAgICAgICAgdGhpcy52ZXJzaW9uID0gcmVhZGVyLnJlYWRJbnQzMigpXG4gICAgICAgIHRoaXMuY29tcHJlc3Npb24gPSByZWFkZXIucmVhZEludDMyKClcbiAgICAgICAgdGhpcy5tZXNoTmFtZSA9IHJlYWRlci5yZWFkU3RyaW5nKClcbiAgICAgICAgdGhpcy5tYXRlcmlhbCA9IHJlYWRlci5yZWFkU3RyaW5nKClcbiAgICAgICAgdGhpcy5zaGFkZXIgPSByZWFkZXIucmVhZFN0cmluZygpXG4gICAgICAgIHRoaXMudG9wb2xvZ3kgPSByZWFkZXIucmVhZEludDMyKClcbiAgICAgICAgdGhpcy5mcmFtZUNvdW50ID0gcmVhZGVyLnJlYWRJbnQzMigpXG5cbiAgICAgICAgaWYgKHRoaXMudmVyc2lvbiA+PSAxMSkge1xuICAgICAgICAgICAgdGhpcy5ub3JtYWxzID0gcmVhZGVyLnJlYWRCeXRlKClcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZWQgPSByZWFkZXIucmVhZEJ5dGUoKVxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlV2lkdGggPSByZWFkZXIucmVhZEludDE2KClcbiAgICAgICAgICAgIHRoaXMudGV4dHVyZUhlaWdodCA9IHJlYWRlci5yZWFkSW50MTYoKVxuICAgICAgICAgICAgdGhpcy50ZXh0dXJlRm9ybWF0ID0gcmVhZGVyLnJlYWRJbnQxNigpXG5cbiAgICAgICAgICAgIGlmICh0aGlzLnZlcnNpb24gPj0gMTIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0aW9uID0gW3JlYWRlci5yZWFkU2luZ2xlKCksIHJlYWRlci5yZWFkU2luZ2xlKCksIHJlYWRlci5yZWFkU2luZ2xlKCldXG4gICAgICAgICAgICAgICAgLy9kYXRhLmRhdGFWaWV3LmdldEZsb2F0MzIoNzUsIHRydWUpIC8vcG9zaXRpb24gNzQgaW4gQyNcbiAgICAgICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gW3JlYWRlci5yZWFkU2luZ2xlKCksIHJlYWRlci5yZWFkU2luZ2xlKCksIHJlYWRlci5yZWFkU2luZ2xlKCksIHJlYWRlci5yZWFkU2luZ2xlKCldXG4gICAgICAgICAgICAgICAgLy8gdGhpcy5zY2FsZTAgPSBkYXRhLmRhdGFWaWV3LmdldEZsb2F0MzIoOTAsIHRydWUpXG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZSA9IHJlYWRlci5yZWFkU2luZ2xlKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpc1xuICAgIH1cblxuICAgIGhhc05vcm1hbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9ybWFscyA9PT0gMVxuICAgIH1cblxuICAgIGlzVGV4dHVyZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHR1cmVkID09PSAxXG4gICAgfVxufSIsIlxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoaHRtbCkge1xuICAgIHZhciBlbERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpIC8vaXQgY3JlYXRlcyBhIHN0dXBpZCBwYXJlbnQgZGl2LCBmaXggaXRcbiAgICBlbERpdi5pbm5lckhUTUwgPSBodG1sXG4gICAgcmV0dXJuIGVsRGl2LmNoaWxkcmVuWzBdXG59XG5cbi8vY291bGQgaGF2ZSBzaW1pbGFyIGludGVyZmFjZSB0aGVuIGZldGNoOiBsZXQgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpOyBsZXQgYXJyYXlidWZmZXIgPSBhd2FpdChyZXNwb25zZS5hcnJheUJ1ZmZlcigpKVxuZXhwb3J0IGZ1bmN0aW9uIGZldGNoT25Qcm9ncmVzcyh1cmwsIG9uUHJvZ3Jlc3MsIHJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gcmVzcG9uc2VUeXBlXG4gICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIGUgPT4gb25Qcm9ncmVzcyhlLmxvYWRlZCAvIGUudG90YWwpKVxuICAgICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVuZCcsICgpID0+IHJlc29sdmUoeGhyKSkgLy9vcicgbG9hZCdcbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4gcmVqZWN0KHhocikpXG4gICAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdhYm9ydCcsICgpID0+IHJlamVjdCh4aHIpKVxuICAgICAgICB4aHIub3BlbignR0VUJywgdXJsKVxuICAgICAgICB4aHIuc2VuZCgpXG4gICAgICAgIHdpbmRvdy5YSFIgPSB4aHJcbiAgICB9KVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQge1ZvbG9ncmFtfSBmcm9tIFwidm9sb2dyYW1zLWpzXCI7XG5cbkFGUkFNRS5yZWdpc3RlckNvbXBvbmVudCgndm9sb2dyYW0nLCB7XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBzcmMgPSB0aGlzLmVsLmdldEF0dHJpYnV0ZSgnc3JjJylcbiAgICAgICAgY29uc3QgZWwgPSB0aGlzLmVsXG5cbiAgICAgICAgY29uc3QgbiA9IHNyYy5sYXN0SW5kZXhPZignLycpO1xuICAgICAgICBjb25zdCBmb2xkZXIgPSBzcmMuc3Vic3RyaW5nKDAsIG4pXG4gICAgICAgIGNvbnN0IHRleHR1cmUgPSBzcmMuc3Vic3RyaW5nKG4gKyAxKTtcblxuICAgICAgICBjb25zdCBvblByb2dyZXNzID0gdmFsdWUgPT4ge1xuICAgICAgICAgICAgZWwuZW1pdCgncHJvZ3Jlc3MnLCB7dmFsdWUsIGVsfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWVzaCA9IG5ldyBWb2xvZ3JhbShmb2xkZXIsIG9uUHJvZ3Jlc3MsIHt0ZXh0dXJlfSlcblxuICAgICAgICBlbC5zZXRPYmplY3QzRCgnbWVzaCcsIHRoaXMubWVzaCk7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbC5yZW1vdmVPYmplY3QzRCgndm9sb2dyYW0nKVxuICAgIH1cbn0pOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==