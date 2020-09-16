import * as faceapi from 'face-api.js';
export const realtimeFacedetection = async (video, size = 160, score = 0.3) => {
    let res = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({inputSize: size, scoreThreshold: score}));
    return res;
};