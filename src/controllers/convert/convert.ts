import sequelize from "sequelize";
import Speech from "./speech.class";
import ReadContents from "../../utils/ReadContents";

import video2Audio from "./video2Auto";
import {
	AVInterface,
	ChatInterface,
	RecordingInterface,
} from "../../interfaces/recording.interface";
import ReadFileContents from "../../utils/ReadFileContents";
import Transcript from "../../models/transcripts.model";
import dbConfig from "../../config/db.config";
import { toMilli } from "../../utils/time";

async function processData(
	input: (AVInterface | ChatInterface)[],
	index: number
) {
	const totalSize = input.length;
	const data = input[index] as never as RecordingInterface;

	await video2Audio(data, index, totalSize);

	index++;

	if (index < totalSize) {
		await processData(input, index);
	}

	return true;
}

/** Do speech-to-text conversion */
export async function speechToText() {
	console.log(`Preparing for speech-to-text conversion \n`);
	const transact = await dbConfig.transaction();

	try {
		const readDirectory = new ReadFileContents("output");

		const speechToTxt = new Speech(
			readDirectory.readDir().filter((i) => i !== ".gitkeep")
		);

		const results = await speechToTxt.convert();

		// Save results to DB
		console.log("Total Transcripts:" + results.length);

		for (const result of results) {
			const words = result.words.map((word) => {
				return {
					word: word.word,
					offset_time: word.startTime.seconds,
				};
			});

			const split = result.source.split("-");

			await Transcript.create(
				{
					transcript: result.transcript,
					timestamp: split[split.length - 1],
					author: { author: "", authorId: 0 },
					session_id: result.sessionId,
					room_id: result.roomId,
					source: result.source,
					search_term: sequelize.fn("to_tsvector", result.transcript),
					meta_data: words,
				},
				{
					transaction: transact,
				}
			);
		}

		transact.afterCommit(() => {
			console.log("Done adding all transcriptions");
		});

		await transact.commit();
	} catch (error) {
		console.error(error);

		await transact.rollback();
	}
}

const convert = async () => {
	const files = new ReadContents("av");

	const results = await files.getContent<AVInterface>();

	console.log(`Number of files ${results.length} \n`);

	await processData(results, 0);

	await speechToText();
};

export default convert;
