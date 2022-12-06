import { RoomSession } from "../interfaces/recording.interface";

export default function rename(fileName: string, roomSession: RoomSession) {
	const newName = fileName.replace("user-", "");

	return `${newName}__${roomSession.roomId}--${roomSession.sessionId}`;
}
