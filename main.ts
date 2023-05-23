import { Feed, parseFeed } from "https://deno.land/x/rss@0.5.8/mod.ts";
import { FeedEntry } from "https://deno.land/x/rss@0.5.8/src/types/mod.ts";
import { serve } from "https://deno.land/std@0.186.0/http/server.ts";
import {hourly} from 'https://deno.land/x/deno_cron@v1.0.0/cron.ts';
import { Feed as OutFeed, Item} from "npm:feed@4.2.2";
import { Series } from "./series.ts";

const http_port = 9000;
const mangaupdates_api_endpoint = "https://api.mangaupdates.com";
const genre_filter = ["Ecchi", "Hentai", "Lolicon", "Shotacon", "Smut", "Adult", "Harem"];

async function get_feed_finished() : Promise<Array<FeedEntry> | null> {
    let http_response:Response;
    try {
        http_response = await fetch(`${mangaupdates_api_endpoint}/v1/releases/rss`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            }
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return null;
    }

    if (!http_response.ok) {
        console.log(`error in api request to /v1/releases/rss`)
        console.log(http_response)
        return null;
    }

    let feed : Feed;
    try {
        const xml = await http_response.text();
        feed = await parseFeed(xml);
    } catch (error) {
        console.log(`error parsing feed: ${error}`);
        return null;
    }

    const finished = feed.entries.reduce((acc, x) => {
        if (x.title?.value?.includes("(end)")) acc.push(x)
        return acc;
    }, new Array<FeedEntry>());

    return finished;
}

async function get_series(id: string) : Promise<Series | null> {
    let http_response:Response;
    try {
        http_response = await fetch(`${mangaupdates_api_endpoint}/v1/series/${id}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            }
        });
    } catch (error) {
        console.log(`error: ${error}`);
        return null;
    }

    if (!http_response.ok) {
        console.log(`error in api request to /series/${id}`)
        console.log(http_response)
        const body = await http_response.text();
        console.log(body);
        return null;
    }

    let series:Record<string, unknown>;
    try {
        series = await http_response.json();
    } catch (error) {
        console.log(`error: could not parse json: ${error}`);
        return null;
    }

    return (series as unknown) as Series;
}

function make_rss_entry(series: Series): Item {
    const content = `Genres: ${series.genres.reduce((acc: string, x) => {
        if (acc == "") return x.genre;
        else return `${acc}, ${x.genre}`;
    }, "")}<br>
    Chapters: ${series.latest_chapter}<br>
    Year: ${series.year}<br>
    Rating: ${series.bayesian_rating} (${series.rating_votes} votes)<br>
    Status: ${series.status}<br>
    Authors: ${series.authors.reduce((acc: string, x) => `${acc} ${x.name}`, "")}<br><br>
    ${series.description}`;

    return {
        title: `Completed - ${series.title}`,
        link: series.url,
        date: new Date(series.last_updated.timestamp * 1000),
        description: series.description,
        image: series.image.url.original,
        author: series.authors.map(x => {return {name: x.name}}),
        content: content,
    }
}

function filter_genres(series: Series) : boolean {
    for (const genre of series.genres) {
        if (genre_filter.includes(genre.genre)) {
            return true;
        }
    }
    return false;
}

let rss_feed : string;

async function update_feed() {
    console.log("updating feed...");
    const finished = await get_feed_finished();
    if (finished === null) {
        console.log(`error!!`);
        return;
    }

    const feed = new OutFeed({
        title: "Completed Manga",
        id: "completed manga",
        copyright: "none",
    });

    for (const entry of finished) {
        const desc = entry.description?.value;
        if (desc === undefined) {
            console.log("error: description was undefined");
            continue;
        }
        const id_regex = /(?<=\?id=).+?(?=\&)/;
        const id = id_regex.exec(desc);
        if (id?.[0] === undefined) {
            console.log("error: regex found no id matches");
            continue;
        }

        const series = await get_series(id?.[0]);
        if (series === null) continue;

        if (filter_genres(series)) continue;

        feed.addItem(make_rss_entry(series));
    }

    rss_feed = feed.rss2();
}

await update_feed();

hourly(() => {
    update_feed();
});

const http_handler = (request: Request): Response => {
    const response = new Response(rss_feed, {
        status: 200,
    });
    response.headers.append("Content-Type", "application/rss+xml")
    return response;
}

await serve(http_handler, { port: http_port });
