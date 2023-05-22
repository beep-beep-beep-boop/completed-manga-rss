# Completed Manga Rss

This project creates a rss feed from manga that have recently completed translation. It gets the data from mangaupdates.com. It includes a filter to not display certian genres in the rss feed.

# Usage

`deno run --allow-net main.ts`

server will listen on port 9000 and refresh the rss feed every hour. (edit main.ts to change options)

## Running With Docker

```
docker build -t completed-manga-rss .
docker run -d --restart always -p <listen port>:9000 completed-manga-rss
```