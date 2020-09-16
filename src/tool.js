export const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));
export const isAndroid = () => {
    const ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('android') != -1 ? true : false;
};