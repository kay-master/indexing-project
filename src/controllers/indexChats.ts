import sequelize from "sequelize";
import dbConfig from "../config/db.config";
import { ChatInterface } from "../interfaces/recording.interface";
import Transcript from "../models/transcripts.model";
import ReadContents from "../utils/ReadContents";
import { toUnixTime } from "../utils/time";

const indexChats = async () => {
	const transact = await dbConfig.transaction();

	try {
		const files = new ReadContents("delta");

		const results = await files.getContent<ChatInterface>();

		console.log(`Number of chat source ${results.length} \n`);

		// Clean data
		for (const result of results) {
			for (const info of result.event.delta) {
				if (info["insert"]) {
					for (const chat of info["insert"]) {
						await Transcript.create(
							{
								transcript: chat.data.text,
								timestamp: toUnixTime(chat.timestamp).toString(),
								author: { author: chat.author, authorId: chat.authorId },
								session_id: result.sessionId,
								room_id: result.roomId,
								search_term: sequelize.fn("to_tsvector", chat.data.text),
								source: "chat",
							},
							{
								transaction: transact,
							}
						);
					}
				}
			}
		}

		transact.afterCommit(() => {
			console.log("Done adding all transcriptions");
		});

		await transact.commit();

		console.log("Added transcriptions into DB");
	} catch (error) {
		console.error(error);

		await transact.rollback();
	}
};

export default indexChats;
