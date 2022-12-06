# Setup

Install dependencies via yarn or npm

Run build: `yarn run build`

Index the data:

- Indexing chats run: `yarn prod index_chats`
- Indexing video speech: `yarn prod convert`

Then finally you can start searching: `yarn prod search 'stronger internet'`

#### Available commands: `convert`, `index_chats`, `search`

1. Convert speech-to-text, `convert`
2. Indexing chats, `index_chats`
3. Searching, `search`

# Recording data indexing

At Lessonspace, we record the contents of every session in a JSON file format, that may or may not have audio and video recorded too. This is currently used for playback, but it would be really neat to be able to search through recordings and jump to specific locations.

This project will focus on ingesting data from a JSON recording, indexing it, and providing a simple method of searching through it. You can use any languages and tool you wish, and for the cloud part, can use GCP or AWS as needed. If you need a paid account, let us know and we'll provide one.

## The sample recordings

You'll be working with two sample records. One of them doesn't have any AV and or past content and is just two chat messages. The other, is a real recording from one of our employees in Hungary - so it should have some good data in it. You can view the Hello World recoding [here](https://playback.room.sh/?room=644292cb-2952-4eb0-838f-36ae41520e2f&server=https%3A%2F%2Fzah.room.sh&user=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6ImFiZWMyMTNiLTExODUtNDI0Ni1iYmUyLTZlMmY2MmM1MWYxMSIsImd1ZXN0IjpmYWxzZSwicmVhZE9ubHkiOnRydWUsImNhbkxlYWQiOmZhbHNlLCJhbGxvd0ludml0ZSI6ZmFsc2UsIm1ldGEiOnsibmFtZSI6IlBsYXliYWNrIFVzZXIifX0.ZiKGQ9WfeUJA5BrUTALaTj8ztYpPJD59gzSA8C6Fw74&payload=https%3A%2F%2Fapi.thelessonspace.com%2Fv2%2Fspaces%2F644292cb-2952-4eb0-838f-36ae41520e2f%2F4706c86f-91e8-459e-baf9-ed2fe3ed82a3%2F&disabledFeatures=av%2Cinvite) and the real recording [here](https://playback.room.sh/?room=c21d6420-28a7-4746-aa98-022b7446ffdc&server=https://ew2.room.sh&user=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6ImVkMjVhY2ZiLWViYjQtNDdhMy04MWQzLThlYjE1NjI5NmE0MyIsImd1ZXN0IjpmYWxzZSwicmVhZE9ubHkiOnRydWUsImNhbkxlYWQiOmZhbHNlLCJhbGxvd0ludml0ZSI6ZmFsc2UsIm1ldGEiOnsibmFtZSI6IlBsYXliYWNrIFVzZXIifX0.n23lzwKjYJ8wHVRl8ceIjBdIOaV-YXgUTB5G30eDlEM&payload=https%3A%2F%2Fapi.thelessonspace.com%2Fv2%2Fspaces%2Fc21d6420-28a7-4746-aa98-022b7446ffdc%2F7df4e513-3dd8-48db-b095-0f01367c299b%2F&disabledFeatures=av%2Cinvite). The raw JSON payloads as well as video files for the real recording are included in this folder.

- The Room ID for the test data is `644292cb-2952-4eb0-838f-36ae41520e2f` and the Session ID is `4706c86f-91e8-459e-baf9-ed2fe3ed82a3`
- The Room ID for the real data is `c21d6420-28a7-4746-aa98-022b7446ffdc` and the Session ID is `7df4e513-3dd8-48db-b095-0f01367c299b`

**_NB: The sample recording JSON included has been modified a bit from the source material. Some more chat messages have been added, and the JSON has been formatted to make it easier to view with an editor._**

## Ingesting the data

### The file format

The root JSON file format is quite simple; it consists of a version header and a list of frames which make up the actual data. Each frame has a timestamp and a type linked to it.

```json
{
	"version": 1,
	"frames": [
		...
	]
}
```

A single frame can have different types, but for this project we're only looking at chat messages and AV:

```json
{
	"type": "av|delta (for chat)",
	"timestamp": <milliseconds from the unix epoch>
}
```

**_You'll see that the file will start with multiple deltas, all with the same timestamp. These are the 'initial deltas', and represent the room's state as of session open. You'll want to ignore these entirely, since they represent past data that would have theoretically been indexed when it happened._**

#### The Chat Payload

Chat payloads will have a `type` of `delta, with `event.path[0] === 'chat'`. The messages themeselves can be found as objects under the `event.delta.insert` array. (if you're curious, this is part of a more general delta format that we use, inspired by Quill. You can read a bit more about it [here](https://quilljs.com/docs/delta/)).

There, the actual text of the message is found under `data.text`.

```json
{
	"type": "delta",
	"event": {
		"path": ["chat"],
		"source": "array",
		"delta": [
			{
				"insert": [
					{
						"type": "file",
						"author": "Test McTestface",
						"authorId": 61161,
						"data": {
							"text": "hello world",
							"files": []
						},
						"timestamp": "2021-04-21T18:17:14.726Z"
					}
				]
			}
		],
		"timestamp": 1619029034926
	},
	"timestamp": 1619029034926
}
```

Pulled out of this, the useful data would be something like:

```
timestamp: 1619029034926
author: Test McTestface
authorId: 61161
message: hello world
```

#### The AV Payload

AV payloads will have a `type` of `av`, and the URL of the video is available under `file`. You can see that in this case, the URL corresponds to the file included of `user-1txWuEPcJDp9AHLn9sFw-frame-1618316326349829.mp4`. When processing, you should be able to extract this from the URL to reference the local file.

```json
{
	"type": "av",
	"file": "https://s3.eu-west-2.amazonaws.com/room.sh-video-ew2/c21d6420-28a7-4746-aa98-022b7446ffdc/user-1txWuEPcJDp9AHLn9sFw-frame-1618316326349829.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIMRAVPHWIDFNNHUQ%2F20210420%2Feu-west-2%2Fs3%2Faws4_request&X-Amz-Date=20210420T093550Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=f8b368e2e4f57f71530e5044b168c6a2781dda5baca78da6f89a7586376202f8",
	"user": "1txWuEPcJDp9AHLn9sFw",
	"timestamp": 1618316326349
}
```

Where things get interesting is you'll now want to send this data through a speech to text service to get back a transcript. I've extracted a small sample of audio under `small-speech-sample.ogg`. You'll likely need to transcode these to ogg-opus audio only files before sending them through something like GCP.

The sample was generated using ffmpeg (you can adapt this to do the transcoding; -t just limits the time):
`ffmpeg -i user-7RVImgH37By6cVu6FKeo-frame-1618317575469933.mp4 -t 50 -vn -f ogg -acodec libopus -ac 1 small-speech-sample.ogg`

Running `gcloud ml speech recognize --language-code=en --encoding=ogg-opus --sample-rate=48000 --include-word-time-offsets small-speech-sample.ogg` will give you something like:

```json
{
  "results": [
    {
      "alternatives": [
        {
          "confidence": 0.85151094,
          "transcript": "play story I switch to Stronger internet that should be good",
          "words": [
            {
              "endTime": "1.800s",
              "startTime": "1.300s",
              "word": "play"
            },
            {
              "endTime": "2.400s",
              "startTime": "1.800s",
              "word": "story"
            },
            {
              "endTime": "2.500s",
              "startTime": "2.400s",
              "word": "I"
            },
            {
              "endTime": "2.900s",
              "startTime": "2.500s",
              "word": "switch"
            },
            {
              "endTime": "3.100s",
              "startTime": "2.900s",
              "word": "to"
            },
            {
              "endTime": "3.400s",
              "startTime": "3.100s",
              "word": "Stronger"
            },
            {
              "endTime": "4.200s",
              "startTime": "3.400s",
              "word": "internet"
            },
            {
              "endTime": "4.500s",
              "startTime": "4.200s",
              "word": "that"
            },
            {
              "endTime": "4.700s",
              "startTime": "4.500s",
              "word": "should"
            },
            {
              "endTime": "4.800s",
              "startTime": "4.700s",
              "word": "be"
            },
            {
              "endTime": "5.100s",
              "startTime": "4.800s",
              "word": "good"
            }
          ]
        }
      ]
    },
```

You can consider the absolute timestamp of a word to be the timestamp of the `av` entry + the `startTime` offset from the recognition results. The useful data to extract here can vary... Ideally, it'd be possible to have the metadata of a word's time associated with it, while still being able to search in context. If this sounds tricky, it's probably because it is :) I'll let you come up with a compromise (or attempt to solve the problem!)

## Indexing the data

To be useful, the data needs to be indexed in some form. There are a few options for this, ranging from overkill (ElasticSearch) to possibly too simple (a text file with a transcript) and everything in between. Some good starting points might be to look at SQLite, Sanic, PostgreSQL's full text search and just Googling 'indexing transcripts with time'. The choice of specific tool to use is up to you!

This is a prototype, not a production application, so optimize for fastest dev-time!

## Searching the data

You'll need to provide a simple way of search for a string and seeing results. Ideally, the search output could look something like this:

```
python search.py 'world'
2 results:
# Room: 644292cb-2952-4eb0-838f-36ae41520e2f
# Session: 4706c86f-91e8-459e-baf9-ed2fe3ed82a3
# Timestamp: 1619029034926
# Message: hello world

# Room: c21d6420-28a7-4746-aa98-022b7446ffdc
# Session: 7df4e513-3dd8-48db-b095-0f01367c299b
# Timestamp: 1618320347329
# Message: Good luck world!
```
