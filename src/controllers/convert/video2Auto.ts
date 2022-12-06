import fs from "fs";
import { fetchFile } from "@ffmpeg/ffmpeg";

import { RecordingInterface } from "../../interfaces/recording.interface";
import getFFmpeg from "../../utils/ffmpeg";
import rename from "../../utils/rename";

/**
 * Convert video to audio using ffmpeg
 */
async function video2Audio(
	fileRecording: RecordingInterface,
	currentIndex: number,
	totalFiles: number
) {
	try {
		const ffmpeg = await getFFmpeg();

		const fileOutput =
			rename(fileRecording.file.split(".")[0], {
				sessionId: fileRecording.sessionId,
				roomId: fileRecording.roomId,
			}) + ".ogg";

		console.log(
			`Processing file (${currentIndex + 1}): ${fileRecording.file}`,
			"\n"
		);

		ffmpeg.FS(
			"writeFile",
			fileRecording.file,
			await fetchFile(`assets/files/${fileRecording.file}`)
		);

		await ffmpeg.run(
			"-i",
			fileRecording.file,
			"-t",
			"50",
			"-vn",
			"-f",
			"ogg",
			"-acodec",
			"libopus",
			"-ac",
			"1",
			fileOutput
		);

		await fs.promises.writeFile(
			`assets/output/${fileOutput}`,
			ffmpeg.FS("readFile", fileOutput)
		);

		if (currentIndex + 1 === totalFiles) {
			ffmpeg.exit();
		}

		return true;
	} catch (error) {
		console.error(error);

		return false;
	}
}

export default video2Audio;
