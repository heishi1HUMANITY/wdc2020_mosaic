export const startVideo = (videoDom, videoWidth, videoHeight, facingMode = 'user') => {
    videoDom.setAttribute('id', 'video_dom');
    videoDom.setAttribute('muted', '');
    videoDom.setAttribute('autoplay', '');
    document.body.appendChild(videoDom);
    return new Promise(resolve => {
        navigator.mediaDevices.getUserMedia({
            video: {
                width: videoWidth,
                height: videoHeight,
                facingMode: facingMode
            },
            audio: false
        })
        .then(stream => {
            videoDom.srcObject = stream;
            video.play();
            resolve();
        })
        .catch(() => {
            const p = document.createElement('p');
            p.setAttribute('id', 'error_p');
            p.innerText = 'カメラにアクセスできません';
            document.body.appendChild(p);
        });
    });
};
