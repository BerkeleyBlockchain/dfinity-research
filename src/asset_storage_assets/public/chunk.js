const CHUNKSIZE = 500 * 1000;

async function videoId(bytes) {
    const encoder = new TextEncoder();
    const data = encoder.encode(bytes);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(... new Uint8Array(digest)));
}

/**
 * Split the video into 500kb chunks, calling the async function
 * uploadF to upload each chunk and returning the format to send to bigmap.
*/
export async function uploadChunks(bytes, uploadF) {
    const id = await videoId(bytes);
    let uploaders = [];
    let chunks = [];
    for (let i = 0; i < bytes.length; i += CHUNKSIZE) {
        const url = id + '/' + i;
        chunks.push(url);
        uploaders.push(uploadF(url, bytes.substr(i, CHUNKSIZE)));
    }
    return { chunks, uploaders }
}

// Thanks StackOverflow :D
export function thumbnail(file) {
    console.log('loading', file);
    return new Promise((resolve, reject) => {
        // load the file to a video player
        const videoPlayer = document.createElement('video');
        videoPlayer.src = file;
        videoPlayer.load();
        videoPlayer.addEventListener('error', (ex) => {
            reject("error when loading video file", ex);
        });
        // load metadata of the video to get video duration and dimensions
        videoPlayer.addEventListener('loadedmetadata', () => {
            // seek to user defined timestamp (in seconds) if possible
            // delay seeking or else 'seeked' event won't fire on Safari
            setTimeout(() => videoPlayer.currentTime = 0, 200);
            // extract video thumbnail once seeking is complete
            videoPlayer.addEventListener('seeked', () => {
                // define a canvas to have the same dimension as the video
                const canvas = document.createElement("canvas");
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                // draw the video frame to canvas
                const ctx = canvas.getContext("2d");
                ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                resolve(ctx.canvas.toDataURL("image/jpeg", 0.75 /* quality */));
            });
        });
    });
}
