export type DataTypes = "delta" | "av";

export interface RoomSession {
	sessionId: string;
	roomId: string;
}
export type RoomFileSession = RoomSession & {
	file: string;
};

export type ChatDataInterface = RoomSession & {
	author: string;
	authorId: number;
	message: string;
	timestamp: string;
};

export type ChatInterface = RoomSession & {
	type: DataTypes;
	event: {
		path: string[];
		source: string;
		delta: [
			{
				insert: {
					type: string;
					author: string;
					authorId: number;
					data: {
						text: string;
						files: string[];
					};
					timestamp: string;
				}[];
			}
		];
	};
	timestamp: number;
};

export type AVInterface = RoomSession & {
	type: DataTypes;
	file: string;
	user: string;
	timestamp: number;
};

export type RecordingInterface = ChatInterface & AVInterface;
