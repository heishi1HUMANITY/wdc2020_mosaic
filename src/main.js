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
import { startVideo, videoDevice } from './video.js';
import { drawSomething, drawSomethingWithoutMyFace } from './mosaic.js';
import { setMyFace, removeMyFace } from './set';

console.log(videoDevice);

const overlayCanvas = document.querySelector('#overlay_canvas');
overlayCanvas.setAttribute('width', innerWidth);
overlayCanvas.setAttribute('height', innerHeight);
const ctx = overlayCanvas.getContext('2d');
const video = document.createElement('video');
let deviceIndex = 0;
let videoWidth = innerWidth, videoHeight = innerHeight;
if(tool.isAndroid() && innerWidth < innerHeight) {
    videoWidth = innerHeight, videoHeight = innerWidth;
}
let continueDetection = true;

// initializer
Promise.all([
    startVideo(video, videoWidth, videoHeight, videoDevice[deviceIndex]),
    faceapi.nets.tinyFaceDetector.load('../models'),
    faceapi.nets.faceLandmark68Net.load('../models'),
    faceapi.nets.faceRecognitionNet.load('../models'),
    faceapi.nets.ssdMobilenetv1.load('../models')
]).then(async () => {
    await tool.sleep(1000);
    let res;
    while(continueDetection) {
        res = await realtimeFacedetection(video, 160, .3);
        await drawSomething(video, res, ctx, 'line', true);
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
    if(saveWithoutMosaic.checked) {
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
        video.play();
        imgCanvas.setAttribute('style', `position: absolute; top: ${innerHeight + 10}px; left: 0; transition: 1s all ease;`);
        a.href = imgCanvas.toDataURL('image/png');
        a.download = `${d.getTime()}.png`;
        a.click();
        await tool.sleep(3000);
        document.body.removeChild(imgCanvas);
        return;
    }else{
        let res = await faceapi.detectAllFaces(imgCanvas, new faceapi.TinyFaceDetectorOptions({inputSize: size, scoreThreshold: score}));
        await drawSomething(imgCanvas, res, imgCtx, 'mosic', false);
        imgCanvas.setAttribute('style', 'position: absolute; top: 0; left: 0; transition: 1s all ease');
        document.body.appendChild(imgCanvas);
        await tool.sleep(1000);
        video.play();
        imgCanvas.setAttribute('style', `position: absolute; top: ${innerHeight + 10}px; left: 0; transition: 1s all ease`);
        a.href = imgCanvas.toDataURL('image/png');
        a.download = `${d.getTime()}.png`;
        a.click();
        await tool.sleep(3000);
        document.body.removeChild(imgCanvas);
    }
});

// cameraChangeEvent
switcher.addEventListener('click', async () => {
    continueDetection = false;
    video.pause();
    deviceIndex++;
    if(deviceIndex >= videoDevice.length) {
        deviceIndex = 0;
    }
    await tool.sleep(1000);
    document.body.removeChild(video);
    await startVideo(video, videoWidth, videoHeight, videoDevice[deviceIndex]);
    await tool.sleep(1000);
    continueDetection = true;
    let res;
    while(continueDetection) {
        res = await realtimeFacedetection(video, 160, score);
        await drawSomething(video, res, ctx, 'line', true);
        await tool.sleep(1);
    }
});

// restyleEvent
window.addEventListener('resize', async () => {
    continueDetection = false;
    video.pause();
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
    document.body.removeChild(video);
    await startVideo(video, videoWidth, videoHeight, videoDevice[deviceIndex]);
    await tool.sleep(1000);
    continueDetection = true;
    let res;
    while(continueDetection) {
        res = await realtimeFacedetection(video, 160, score);
        await drawSomething(video, res, ctx, 'line', true);
        await tool.sleep(1);
    }
});

// setMyFace
noMosaic.addEventListener('input', () => {
    if(noMosaic.checked) {
        setMyFace(switcher, shutter, video);
    }
});

document.querySelector('#add_face').addEventListener('click', () => {
    setMyFace(switcher, shutter, video);
});

document.querySelector('#remove_face').addEventListener('click', () => {
    removeMyFace();
});