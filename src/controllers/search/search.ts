import sequelize from "sequelize";
import dbConfig from "../../config/db.config";
import Transcript from "../../models/transcripts.model";

const search = async () => {
	try {
		const searchTerm = process.argv[3];

		// const data = await Transcript.findAll({
		// 	where: {
		// 		search_term: sequelize.fn("to_tsquery", searchTerm),
		// 	},
		// 	attributes: [
		// 		"transcript",
		// 		"timestamp",
		// 		"session_id",
		// 		"room_id",
		// 		"source",
		// 		"author",
		// 	],
		// });

		const data: {
			room_id: string;
			session_id: string;
			transcript: string;
			timestamp: string;
			meta_data: string;
		}[] = await dbConfig.query(
			`SELECT 
			"transcript", "timestamp", "session_id", "room_id", "source", "author", "meta_data"
		FROM "transcripts" AS "Transcript" 
		WHERE 
		"Transcript"."search_term" @@ plainto_tsquery('${searchTerm}')
		`,
			{
				type: sequelize.QueryTypes.SELECT,
			}
		);

		console.log(`\nSearch term: ${searchTerm}`);

		console.log(`${data.length} result${data.length > 1 ? "s" : ""}:`);

		data.forEach((info) => {
			console.log(`# Room: ${info.room_id}`);
			console.log(`# Session: ${info.session_id}`);
			console.log(`# Timestamp: ${info.timestamp}`);
			console.log(`# Message: ${info.transcript}\n`);
		});
	} catch (error) {
		console.error(error);
	}
};

export default search;
