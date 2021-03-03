export let videoDevice = [];
navigator.mediaDevices.enumerateDevices()
.then(devices => {
    for(let d of devices) {
        if(d.kind == 'videoinput') {
            videoDevice.push(d.deviceId);
        }
    }
});

export const startVideo = (videoDom, videoWidth, videoHeight, deviceId) => {
    videoDom.setAttribute('id', 'video_dom');
    videoDom.setAttribute('muted', '');
    videoDom.setAttribute('autoplay', '');
    document.body.appendChild(videoDom);
    if(document.querySelector('#error_p')) {
        document.body.removeChild(document.querySelector('#error_p'));
    }
    return new Promise(resolve => {
        const func = () => navigator.mediaDevices.getUserMedia({
            video: {
                width: videoWidth,
                height: videoHeight,
                deviceId: deviceId
            },
            audio: false
        });
        Promise.reject()
        .catch(() => func())
        .catch(() => func())
        .catch(() => func())
        .catch(() => func())
        .catch(() => func())
        .catch(e => {
            alert(e);
            const p = document.createElement('p');
            p.setAttribute('id', 'error_p');
            p.innerText = 'カメラにアクセスできません';
            document.body.appendChild(p);
        })
        .then(stream => {
            let track = stream.getTracks();
            let actualHeight = track[0].getSettings().height;
            let actualWidth = track[0].getSettings().width;
            console.log(`height: ${actualHeight}\nwidth: ${actualWidth}`);

            videoDom.srcObject = stream;
            videoDom.play();
            resolve();
        });
    });
};
