const makeMosic = async (w, h, x, y, src) => {
    const mosicLayer = document.createElement('canvas');
    mosicLayer.setAttribute('width', w);
    mosicLayer.setAttribute('height', h);
    const mosicCtx = mosicLayer.getContext('2d');
    mosicCtx.drawImage(src, -x, -y);
    const imgData = mosicCtx.getImageData(0, 0, w, h);
    let cR, cG, cB;
    for(let yPix = 0; yPix < h; yPix += 10) {
        for(let xPix = 0; xPix < w; xPix += 10) {
            cR = imgData[((yPix * (w * 4)) + (xPix * 4))];
            cG = imgData[((yPix * (w * 4)) + (xPix * 4)) + 1];
            cB = imgData[((yPix * (w * 4)) + (xPix * 4)) + 2];
            mosicCtx.fillStyle = `rgb(${cR}, ${cG}, ${cB})`;
            mosicCtx.fillRect(xPix, yPix, 10, 10);
        }
    }
    return mosicLayer;
}

export const drawSomething = async (src, res, ctx, type) => {
    ctx.clearRext(0,0, innerWidth, innerHeight);
    for(face of res) {
        let x = Math.floor(face.box.topLeft.x);
        let y = Math.floor(face.box.topLeft.y);
        let width = Math.floor(face.box.width);
        let height = Math.floor(face.box.height);
        switch(type) {
            case 'mosic':
                let img = await makeMosic(width, height, x, y, src);
                ctx.drawImage(img, x, y);
            case 'line':
                ctx.strokeRext(x, y, width, height);
        }
    }
    return;
};

export const drawSomethingWithoutMyFace = async (src, res, ctx, faceMatcher) => {
    for(face of res) {
        const fRes = faceMatcher.findBestMatch(face.descriptor);
        if(fRes.label == 'unknown') {
            let x = Math.floor(face.detection.box.topLeft.x);
            let y = Math.floor(face.detection.box.topLeft.y);
            let width = Math.floor(face.detection.box.width);
            let height = Math.floor(face.detection.box.height);
            let img = await makeMosic(width, height, x, y, src);
            ctx.drawImage(img, x, y);
        }
    }
    return;
};