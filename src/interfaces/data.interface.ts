import { google } from "@google-cloud/speech/build/protos/protos";

/**
 * Available commands: `convert`, `index_chats`, `search`
 *
 * 1. Convert speech-to-text, `convert`
 * 2. Indexing chats, `index_chats`
 * 3. Searching, `search`
 */
export type CommandInterface =
	| "convert"
	| "indexing"
	| "search"
	| "speech2text"
	| "index_chats";

export interface Transcription {
	transcript: string;
	words: google.cloud.speech.v1.IWordInfo[];
	timestamp: google.protobuf.IDuration;
	sessionId: string;
	roomId: string;
	source: string;
}
