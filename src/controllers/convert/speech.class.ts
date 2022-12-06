import googleSpeech, { SpeechClient } from "@google-cloud/speech";
import path from "path";
import fs from "fs";
import { RoomFileSession } from "../../interfaces/recording.interface";
import { Transcription } from "../../interfaces/data.interface";

class Speech {
	private files: string[];
	private client: SpeechClient;

	constructor(files: string[]) {
		this.files = files;

		this.client = new googleSpeech.SpeechClient();
	}

	private findSession(file: string) {
		const roomSession = file.split("__")[1];
		const split = roomSession.split("--");

		return {
			sessionId: split[1].split(".")[0],
			roomId: split[0],
		};
	}

	private async processAudio(fileData: RoomFileSession) {
		try {
			const URI = path.join(
				__dirname,
				"../../../assets",
				"output",
				fileData.file
			);

			// Detects speech in the audio file
			const [response] = await this.client.recognize({
				audio: {
					content: fs.readFileSync(URI).toString("base64"),
				},
				config: {
					encoding: "OGG_OPUS",
					sampleRateHertz: 48000,
					enableWordTimeOffsets: true,
					languageCode: "en-US",
				},
			});

			let combinedTranscriptions: Transcription[] = [];

			response.results.forEach((transcription) => {
				const sortUp = transcription.alternatives
					.map((alternative) => {
						return {
							transcript: alternative.transcript,
							words: alternative.words,
							timestamp: transcription.resultEndTime,
							sessionId: fileData.sessionId,
							roomId: fileData.roomId,
							source: "user-" + fileData.file.split("__")[0],
						};
					})
					.flat();

				combinedTranscriptions = [...combinedTranscriptions, ...sortUp];
			});

			return combinedTranscriptions;
		} catch (error) {
			console.error(error);

			return [];
		}
	}

	public async convert() {
		let results: Transcription[] = [];

		for (let i = 0; i < this.files.length; i++) {
			const file = this.files[i];
			const info = this.findSession(file);

			const data = await this.processAudio({
				...info,
				file,
			});

			results = [...results, ...data];
		}

		return results;
	}
}

export default Speech;
