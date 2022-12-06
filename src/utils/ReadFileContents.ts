import fs from "fs";
import path from "path";
import { RecordingInterface } from "../interfaces/recording.interface";

class ReadFileContents {
	private contents: RecordingInterface[] = [];
	private path: string;

	constructor(path: "data" | "output") {
		this.path = path;
	}

	private async readContents(file: string) {
		const sessionId = file.split(".")[0];
		let roomId = "";

		switch (sessionId) {
			case "4706c86f-91e8-459e-baf9-ed2fe3ed82a3":
				roomId = "644292cb-2952-4eb0-838f-36ae41520e2f";
				break;
			case "7df4e513-3dd8-48db-b095-0f01367c299b":
				roomId = "c21d6420-28a7-4746-aa98-022b7446ffdc";
				break;
		}

		const data = fs.readFileSync(
			path.join(__dirname, "../../assets", "data", file),
			{
				encoding: "utf8",
			}
		);

		const parseData = JSON.parse(data);

		const frames = (parseData.frames as RecordingInterface[])
			.filter((frame) => {
				if (
					frame.type === "av" ||
					(frame.type === "delta" && frame.event.path[0] === "chat")
				) {
					return true;
				}

				return false;
			})
			.map((frame) => ({
				...frame,
				sessionId,
				roomId,
			}));

		this.contents = [...this.contents, ...frames];
	}

	public readDir() {
		const directoryPath = path.join(__dirname, "../../assets", this.path);

		return fs.readdirSync(directoryPath, {
			encoding: "utf8",
		});
	}

	public async read() {
		const promise = this.readDir().map(async (file) => {
			this.readContents(file);
		});

		await Promise.all(promise);

		return this.contents;
	}
}

export default ReadFileContents;
