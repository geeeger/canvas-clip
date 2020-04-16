"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function composition(hex, alpha, bg) {
    var alphaRadio = alpha / 255.0;
    var revertRadio = 1 - alphaRadio;
    return revertRadio * bg + alphaRadio * hex;
}
function rgba2rgb(rgba, background) {
    return {
        r: composition(rgba.r, rgba.a, background.r),
        g: composition(rgba.g, rgba.a, background.g),
        b: composition(rgba.b, rgba.a, background.b),
    };
}
function rgb2xyz(_a) {
    var r = _a.r, g = _a.g, b = _a.b;
    var sr = r / 255.0;
    var sg = g / 255.0;
    var sb = b / 255.0;
    sr = sr < 0.04045 ? sr / 12.92 : Math.pow((sr + 0.055) / 1.055, 2.4);
    sg = sg < 0.04045 ? sg / 12.92 : Math.pow((sg + 0.055) / 1.055, 2.4);
    sb = sb < 0.04045 ? sb / 12.92 : Math.pow((sb + 0.055) / 1.055, 2.4);
    return {
        x: 100 * (sr * 0.4124 + sg * 0.3576 + sb * 0.1805),
        y: 100 * (sr * 0.2126 + sg * 0.7152 + sb * 0.0722),
        z: 100 * (sr * 0.0193 + sg * 0.1192 + sb * 0.9505),
    };
}
var REF_X = 96.4221;
var REF_Y = 100.0;
var REF_Z = 82.5221;
function xyzRevise(x) {
    if (x > Math.pow(6.0 / 29.0, 3)) {
        x = Math.pow(x, 1.0 / 3.0);
    }
    else {
        x = (1.0 / 3.0) * (29.0 / 6.0) * x + 16.0 / 116.0;
    }
    return x;
}
function xyz2lab(_a) {
    var x = _a.x, y = _a.y, z = _a.z;
    var x1 = x / REF_X;
    var y1 = y / REF_Y;
    var z1 = z / REF_Z;
    x1 = xyzRevise(x1);
    y1 = xyzRevise(y1);
    z1 = xyzRevise(z1);
    return {
        l: 116.0 * y1 - 16.0,
        a: 500.0 * (x1 - y1),
        b: 200.0 * (y1 - z1),
    };
}
function calcColorDistance(lab2, lab1) {
    return Math.sqrt(Math.pow(lab2.l - lab1.l, 2) +
        Math.pow(lab2.a - lab1.a, 2) +
        Math.pow(lab2.b - lab1.b, 2));
}
function clip(source, width, height, targetPixiColor, colorDistance, backgroundColor) {
    if (backgroundColor === void 0) { backgroundColor = { r: 255, g: 255, b: 255 }; }
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(source, 0, 0);
    var imgData = ctx.getImageData(0, 0, width, height);
    var targetPixi = xyz2lab(rgb2xyz(rgba2rgb(targetPixiColor, backgroundColor)));
    for (var i = 3; i < (imgData === null || imgData === void 0 ? void 0 : imgData.data.length); i += 4) {
        var pixi = xyz2lab(rgb2xyz(rgba2rgb({
            r: imgData.data[i - 3],
            g: imgData.data[i - 2],
            b: imgData.data[i - 1],
            a: imgData.data[i],
        }, backgroundColor)));
        if (Math.abs(calcColorDistance(pixi, targetPixi)) <= colorDistance) {
            imgData.data[i - 3] = imgData.data[i - 2] = imgData.data[i - 1] = imgData.data[i] = 0;
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
}
exports.default = clip;
