import { createFFmpeg } from "@ffmpeg/ffmpeg";

const ffmpegInstance = createFFmpeg({ log: false });
let ffmpegLoadingPromise = ffmpegInstance.load();

async function getFFmpeg() {
	if (ffmpegLoadingPromise) {
		await ffmpegLoadingPromise;
		ffmpegLoadingPromise = undefined;
	}

	return ffmpegInstance;
}

export default getFFmpeg;
