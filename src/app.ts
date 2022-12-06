import * as dotenv from "dotenv";
import path from "path";
import convert, { speechToText } from "./controllers/convert/convert";
import indexChats from "./controllers/indexChats";
import search from "./controllers/search/search";
import { CommandInterface } from "./interfaces/data.interface";

dotenv.config({
	path: path.join(__dirname, "../.env"),
});

// Commands
const args = process.argv;

if (!args[2]) {
	throw new Error(`
        Missing command argument, available options ("convert", "index_chats", "search"):
        
        1. Converting speech-to-text, "convert"
        2. Indexing chats, "index_chats"
        3. Searching, "search"
    `);
}

/**
 * Available commands: `convert`, `index_chats`, `search`
 *
 * 1. Converting speech-to-text, `convert`
 * 2. Indexing chats, `index_chats`
 * 3. Searching, `search`
 */
const command = args[2] as CommandInterface;

// Search command requires a search term
if (command.toLowerCase() === "search" && !args[3]) {
	throw new Error(`Search term is required`);
}

(async () => {
	switch (command) {
		case "convert":
			await convert();
			break;
		case "speech2text":
			await speechToText();
			break;
		case "index_chats":
			await indexChats();
			break;
		case "search":
			await search();
			break;
		default:
			throw new Error(`
		Invalid command, available options ("convert", "index_chats", "search"): 
	
		1. Converting speech-to-text, "convert"
		2. Indexing chats, "index_chats"
		3. Searching, "search"
	`);
	}
})();
