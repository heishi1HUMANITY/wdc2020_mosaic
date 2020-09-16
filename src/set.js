import * as faceapi from 'face-api.js'
import * as tool from './tool.js';

export const setMyFace = (switcher, shutter, video) => {
    let menu = document.querySelector('#menu');
    document.body.removeChild(menu);
    document.body.removeChild(switcher);
    document.body.removeChild(shutter);
    let tmpShutter = document.createElement('img');
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
    tmpShutter.addEventListener('click', async () => {
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
                tmp[i] = storedImg[i];
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
        }
        let tmp = document.createElement('p');
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
    })
};

export const removeMyFace = () => {
    try{
        localStorage.removeItem('myFace');
    }catch(e){
        console.error(e);
    }
};