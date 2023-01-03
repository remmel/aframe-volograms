import {Vologram} from "volograms-js";

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

        this.mesh = new Vologram(folder, onProgress, {texture})

        el.setObject3D('mesh', this.mesh);
    },
    remove: function () {
        this.el.removeObject3D('vologram')
    }
});