import test from "node:test";
import assert from "node:assert/strict";
import { fetchPlaylist, parsePlaylistId } from "./spotify.js";

const id = "37i9dQZF1DXcBWIGoYBM5M";
const ok = (data) => ({ ok: true, json: async () => data });

test("accepts IDs, URIs, and localized share links; rejects other hosts and resources", () => {
  for (const value of [
    id,
    `spotify:playlist:${id}`,
    `https://open.spotify.com/playlist/${id}?si=abc`,
    `https://open.spotify.com/intl-tr/playlist/${id}`,
  ]) {
    assert.equal(parsePlaylistId(value), id);
  }
  for (const value of [
    "",
    "abc",
    `https://evil.test/playlist/${id}`,
    `https://open.spotify.com/track/${id}`,
    `https://open.spotify.com.evil.test/playlist/${id}`,
  ]) {
    assert.equal(parsePlaylistId(value), "");
  }
});

test("fetches every page on Spotify origin, preserving duplicates and unavailable items", async () => {
  const calls = [];
  const progress = [];
  const item = { name: "A <song>", artists: [{ name: "Artist" }, { name: "Guest" }] };
  const pages = [
    { items: [{ item }, { item: null }], next: "https://evil.test/steal" },
    { items: [{ track: item }], next: null },
  ];
  const result = await fetchPlaylist({
    input: id,
    token: " Bearer example ",
    onProgress: (count) => progress.push(count),
    fetchImpl: async (url, options) => {
      calls.push(url);
      assert.equal(options.headers.Authorization, "Bearer example");
      assert.equal(options.redirect, "error");
      assert.equal(options.credentials, "omit");
      return ok(pages.shift());
    },
  });
  assert.deepEqual(
    calls,
    [0, 2].map((offset) => `https://api.spotify.com/v1/playlists/${id}/items?limit=50&offset=${offset}`),
  );
  assert.deepEqual(progress, [2, 3]);
  assert.deepEqual(result.entries, [
    { name: "A <song>", artists: "Artist, Guest" },
    null,
    { name: "A <song>", artists: "Artist, Guest" },
  ]);
});

test("maps API errors without exposing response content or credentials", async () => {
  for (const [status, code] of [
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "notFound"],
    [429, "rateLimited"],
    [500, "requestFailed"],
  ]) {
    await assert.rejects(
      fetchPlaylist({ input: id, token: "example", fetchImpl: async () => ({ ok: false, status }) }),
      (error) => error.code === code,
    );
  }
});

test("fails the whole fetch when a later page fails; detects malformed pagination", async () => {
  let requests = 0;
  await assert.rejects(
    fetchPlaylist({
      input: id,
      token: "example",
      fetchImpl: async () =>
        ++requests === 1 ? ok({ items: [{ item: null }], next: "next" }) : { ok: false, status: 500 },
    }),
    { code: "requestFailed" },
  );
  await assert.rejects(
    fetchPlaylist({ input: id, token: "example", fetchImpl: async () => ok({ items: [], next: "next" }) }),
    { code: "requestFailed" },
  );
  await assert.rejects(fetchPlaylist({ input: id, token: "example", fetchImpl: async () => ok({}) }), {
    code: "requestFailed",
  });
});

test("validates before requesting and handles an empty playlist", async () => {
  const fail = () => {
    throw new Error("Should not request");
  };
  await assert.rejects(fetchPlaylist({ input: "invalid", token: "example", fetchImpl: fail }), {
    code: "invalidPlaylist",
  });
  await assert.rejects(fetchPlaylist({ input: id, token: " ", fetchImpl: fail }), { code: "missingToken" });
  assert.deepEqual(
    (await fetchPlaylist({ input: id, token: "example", fetchImpl: async () => ok({ items: [], next: null }) }))
      .entries,
    [],
  );
});

test("cancellation prevents further pagination", async () => {
  const controller = new AbortController();
  let requests = 0;
  await assert.rejects(
    fetchPlaylist({
      input: id,
      token: "example",
      signal: controller.signal,
      onProgress: () => controller.abort(),
      fetchImpl: async () => {
        requests++;
        return ok({ items: [{ item: null }], next: "next" });
      },
    }),
    { name: "AbortError" },
  );
  assert.equal(requests, 1);
});
