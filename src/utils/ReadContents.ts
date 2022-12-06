import {
	AVInterface,
	ChatInterface,
	DataTypes,
	RecordingInterface,
} from "../interfaces/recording.interface";
import ReadFileContents from "./ReadFileContents";

class ReadContents extends ReadFileContents {
	private target: DataTypes;

	constructor(target: DataTypes) {
		super("data");

		this.target = target;
	}

	public async getContent<T>(): Promise<
		T extends AVInterface ? AVInterface[] : ChatInterface[]
	> {
		const contents = await this.read();

		// Get data
		const data: (AVInterface | ChatInterface)[] = [];

		for (const content of contents) {
			if (this.target === "av" && content.type === "av") {
				const fileData = content.file.split("/");
				const videoURL = fileData[fileData.length - 1].split("?")[0];

				data.push({
					...content,
					file: videoURL,
				});
			} else if (this.target === "delta" && content.type === "delta") {
				data.push(content);
			}
		}

		return data as T extends AVInterface ? AVInterface[] : ChatInterface[];
	}
}

export default ReadContents;
