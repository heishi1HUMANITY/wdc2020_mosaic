// Style & MDC
import { MDCSlider } from '@material/slider';
let sliderScore;
let score = 0.3;
new Promise(async resolve => {
    require('destyle.css');
    require('./style.scss');
    require('../node_modules/@material/checkbox/dist/mdc.checkbox.css');
    require('../node_modules/@material/slider/dist/mdc.slider.css');
    await tool.sleep(1000);
    resolve();
})
.then(() => {
    sliderScore = new MDCSlider(document.querySelector('#score_slider'));
    sliderScore.listen('MDCSlider:input', () => {
        score = sliderScore.value * 0.1;
    });
});
let slideIsDown = false;
const triangle = document.querySelector('#triangle');
document.querySelectorAll('.menu_line').forEach(line => line.setAttribute('style', 'visibility: hidden;'));
document.querySelector('#slide_button').addEventListener('click', () => {
    console.log('hoge');
    if(slideIsDown){
        document.querySelector('#menu').setAttribute('style', 'height: 0; padding: 0;');
        document.querySelectorAll('.menu_line').forEach(line => line.setAttribute('style', 'visibility: hidden;'));
        triangle.removeAttribute('style');
    }else{
        document.querySelector('#menu').removeAttribute('style');
        document.querySelectorAll('.menu_line').forEach(line => line.removeAttribute('style'));
        triangle.setAttribute('style', 'top: auto; bottom: 5px; transform: rotate(180deg) translateX(50%);');
    }
    slideIsDown = !slideIsDown;
});
const shutter = document.querySelector('#shutter');
const switcher = document.querySelector('#switcher');
if(innerWidth > innerHeight) {
    shutter.setAttribute('style', 'left: auto; right: 16px; top: 50%; transform: translateY(-50%);');
    switcher.setAttribute('style', 'left: auto; right: 16px');
}

import * as faceapi from 'face-api.js';
import * as tool from './tool.js';
import { realtimeFacedetection } from './detection.js';
import { startVideo } from './video.js';
import { drawSomething, drawSomethingWithoutMyFace } from './mosaic.js'
import { detectAllFaces } from 'face-api.js';

const overlayCanvas = document.querySelector('#overlay_canvas');
overlayCanvas.setAttribute('width', innerWidth);
overlayCanvas.setAttribute('height', innerHeight);
const ctx = overlayCanvas.getContext('2d');
ctx.strokeStyle = 'green';
const video = document.createElement('video');
let facingMode = 'user';
let videoWidth = innerWidth, videoHeight = innerHeight;
if(tool.isAndroid() && innerWidth < innerHeight) {
    videoWidth = innerHeight, videoHeight = innerWidth;
}
let continueDetection = true;

// initializer
Promise.all([
    startVideo(video, videoWidth, videoHeight, facingMode),
    faceapi.nets.tinyFaceDetector.load('./models'),
    faceapi.nets.faceLandmark68Net.load('./models'),
    faceapi.nets.faceRecognitionNet.load('./models'),
    faceapi.nets.ssdMobilenetv1.load('./models')
]).then(async () => {
    await tool.sleep(1000);
    let res;
    while(continueDetection) {
        res = await realtimeFacedetection(video, size=160, score=score);
        await drawSomething(video, res, ctx, 'line');
        await tool.sleep(1);
    }
});

// shutter
const saveWithoutMosaic = document.querySelector('#checkbox-1');
const noMosaic = document.querySelector('#checkbox-2');
const highAcc = document.querySelector('#checkbox-3');
shutter.addEventListener('click', async () => {
    let sound = new Audio('./audio/camera-shutter1.mp3');
    sound.play();
    video.pause();
    let imgCanvas = document.createElement('canvas');
    imgCanvas.setAttribute('height', innerHeight);
    imgCanvas.setAttribute('width', innerWidth);
    let imgCtx = imgCanvas.getContext('2d');
    imgCtx.drawImage(video, 0, 0);
    let a = document.createElement('a');
    let d = new Date;
    let size = highAcc.checked ? 608 : 160;
    if(saveWithoutMosaic) {
        a.href = imgCanvas.toDataURL('image/png');
        a.download = `${d.getTime()}_nomosaic.png`;
        a.click();
    }
    if(noMosaic.checked) {
        let savedImg = JSON.parse(localStorage.getItem('myFace'));
        const description = [];
        for(let i = 0; i < Object.keys(savedImg).length; i++) {
            const tmpImg = await faceapi.fetchImage(savedImg[i]);
            const tmpDesc = await faceapi.detectSingleFace(tmpImg, new faceapi.TinyFaceDetectorOptions({inputSize: size, scoreThreshold: 0.3})).withFaceLandmarks().withFaceDescriptor();
            description.push(tmpDesc.descriptor);
        }
        const descriptor = new faceapi.LabeledFaceDescriptors('myFace', description);
        let res = await faceapi.detectAllFaces(imgCanvas, new faceapi.TinyFaceDetectorOptions({inputSize: size, scoreThreshold: score})).withFaceLandmarks().withFaceDescriptors();
        let faceMatcher = new faceapi.FaceMatcher(descriptor, 0.3);
        await drawSomethingWithoutMyFace(imgCanvas, res, imgCtx, faceMatcher);
        imgCanvas.setAttribute('style', 'position: absolute; top: 0; left: 0; transition: 1s all ease;');
        document.body.appendChild(imgCanvas);
        await tool.sleep(1000);
        imgCanvas.setAttribute('style', `position: absolute; top: ${innerHeight + 10}px; left: 0; transition: 1s all ease;`);
        a.href = imgCanvas.toDataURL('image/png');
        a.download = `${d.getTime()}.png`;
        a.click();
        await tool.sleep(1000);
        document.body.removeChild(imgCanvas);
        video.play();
        return;
    }else{
        let res = await faceapi.detectAllFaces(imgCanvas, new faceapi.TinyFaceDetectorOptions({inputSize: size, scoreThreshold: score}));
        await drawSomething(imgCanvas, res, imgCtx, 'mosic');
        imgCanvas.setAttribute('style', 'position: absokute; top: 0; left: 0; transition: 1s all ease');
        document.body.appendChild(imgCanvas);
        tool.sleep(1000);
        imgCanvas.setAttribute('style', `position: absolute; top: ${innerHeight + 10}px, left: 0; transition: 1s all ease`);
        a.href = imgCanvas.toDataURL('image/png');
        a.download = `${d.getTime()}.png`;
        a.click();
        await tool.sleep(1000);
        document.body.removeChild(imgCanvas);
        video.play();
    }
});

// cameraChangeEvent
switcher.addEventListener('click', async () => {
    continueDetection = false;
    video.pause();
    document.removeChild(video);
    facingMode = facingMode == 'user' ? 'environment' : 'user';
    await tool.sleep(1000);
    await startVideo(video, videoWidth, videoHeight, facingMode);
    continueDetection = true;
    let res;
    while(continueDetection) {
        res = await realtimeFacedetection(video, size=160, score=score);
        await drawSomething(video, res, ctx, 'line');
        await tool.sleep(1);
    }
});

// restyleEvent
window.addEventListener('resize', async () => {
    continueDetection = false;
    video.pause();
    document.removeChild(video);
    videoWidth = innerWidth, videoHeight = innerHeight;
    if(tool.isAndroid() && innerWidth < innerHeight) {
        videoWidth = innerHeight; videoHeight = innerWidth;
    }
    if(innerWidth > innerHeight) {
        shutter.setAttribute('style', 'left: auto; right: 16px; top: 50%; transform: translateY(-50%);');
        switcher.setAttribute('style', 'left: auto; right: 16px');
    }else{
        shutter.removeAttribute('style');
        switcher.removeAttribute('style');
    }
    overlayCanvas.setAttribute('width', innerWidth);
    overlayCanvas.setAttribute('height', innerHeight);
    await tool.sleep(1000);
    await(startVideo(video, videoWidth, videoHeight, facingMode));
    continueDetection = true;
    let res;
    while(continueDetection) {
        res = await realtimeFacedetection(video, size=160, score=score);
        await drawSomething(video, res, ctx, 'line');
        await tool.sleep(1);
    }
});

// setMyFace
noMosaic.addEventListener('input', () => {
    if(noMosaic.checked) {
        if(localStorage.getItem('myFace') == null) {
            let menu = document.querySelector('#menu');
            document.body.removeChild(menu);
            document.body.removeChild(switcher);
            document.body.removeChild(shutter);
            let tmpShutter = document.createElement(img);
            tmpShutter.setAttribute('src', './img/button.png');
            tmpShutter.setAttribute('class', 'shutter_style');
            tmpShutter.setAttribute('id', 'recog');
            if(innerWidth > innerHeight) {
                tmpShutter.setAttribute('style', 'left: auto; right: 16px; top: 50%; transform: translateY(-50%);');
            }
            document.body.appendChild(tmpShutter);
            let tmpMessage = document.createElement('p');
            tmpMessage.innerText = '検出する顔を登録します\n顔を写してください';
            tmpMessage.setAttribute('style', 'position: absolute; top: 10%; left: 50%; transform: translateX(-50%); color: white; text-align: center;');
            document.body.appendChild(tmpMessage);
            tmpShutter.appendChild('click', async () => {
                const myFaceCanvas = document.createElement('canvas');
                myFaceCanvas.setAttribute('height', innerHeight);
                myFaceCanvas.setAttribute('width', innerWidth);
                const myFaceCtx = myFaceCanvas.getContext('2d');
                myFaceCtx.drawImage(video, 0, 0);
                let myFaceRes = await faceapi.detectSingleFace(myFaceCanvas, new faceapi.TinyFaceDetectorOptions({inputSize: 608, scoreThreshold: 0.3})).withFaceLandmarks().withFaceDescriptor();
                if(!myFaceRes) {
                    let tmp = document.createElement('p');
                    tmp.innerText = '検出できませんでした';
                    tmp.setAttribute('style', 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2; color: white;');
                    document.body.appendChild(tmp);
                    await tool.sleep(3000);
                    document.bode.removeChild(tmp);
                    return;
                }
                let imgTmp = myFaceCanvas.toDataURL('image/png');
                if(localStorage.getItem('myFace') == null) {
                    let storedImg = {
                        0: imgTmp
                    };
                    localStorage.setItem('myFace', JSON.stringify(storedImg));
                }else{
                    let storedImg = JSON.parse(localStorage.getItem('myFace'));
                    let tmp = {};
                    let i;
                    for(i = 0; i < Object.keys(storedImg).length; i++) {
                        tmp[i] = storedImg;
                    }
                    tmp[i] = imgTmp;
                    try {
                        localStorage.setItem('myFace', JSON.stringify(tmp));
                    }catch(e) {
                        tmp = document.createElement('p');
                        tmp.innerText = '検出画像が最大です、追加できません';
                        tmp.setAttribute('style', 'position: absolute; top: 50%; left; 50%; transform: translate(-50%, -50%); z-index: 2; color: white');
                        document.body.appendChild(tmp);
                        await tool.sleep(3000);
                        document.body.removeChild(tmp);
                        document.body.removeChild(tmpShutter);
                        document.body.removeChild(tmpMessage);
                        document.body.appendChild(switcher);
                        document.body.appendChild(shutter);
                        document.body.appendChild(menu);
                        return; 
                    }
                    tmp = document.createElement('p');
                    tmp.innerText = '保存しました';
                    tmp.setAttribute('style', 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2; color: white');
                    document.body.appendChild(tmp);
                    await tool.sleep(3000);
                    document.body.removeChild(tmp);
                    document.body.removeChild(tmpShutter);
                    document.body.removeChild(tmpMessage);
                    document.body.appendChild(switcher);
                    document.body.appendChild(shutter);
                    document.body.appendChild(menu);
                    return;
                }
            })
        }
    }
})