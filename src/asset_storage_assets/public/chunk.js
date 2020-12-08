const CHUNKSIZE = 500 * 1000;

async function videoId(bytes) {
    const encoder = new TextEncoder();
    const data = encoder.encode(bytes);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(... new Uint8Array(digest)));
}

/**
//  * Split the video into 500kb chunks, calling the async function
//  * uploadF to upload each chunk and returning the format to send to bigmap.
//  */
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