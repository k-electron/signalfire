# Horizontal 06: Persistence and Sync

How saved data is stored on the device, protected, and synced to the player's optional cloud account.

## Decisions

| Topic | Decision |
|---|---|
| Local store | IndexedDB through idb-keyval |
| Cloud | puter.js key-value store, only when signed in |
| What syncs | All documents plus the best run log per level and tier |
| On load (signed in) | Cloud state is the source of truth |
| Writes | At checkpoints, never mid-level |
| Conflicts | Field-level merge that never loses progress |
| Multiple tabs | One active tab; newer tab takes over |

## Local storage

- Every document from the Data Model horizontal is stored in IndexedDB as its own key, through idb-keyval.
- Run logs are stored one per key (`run:<runId>`) with an index document.
- All reads go through Zod validation and the core migration chain before use.
- Writes are asynchronous and never happen during a frame of gameplay.

### Checkpoints

Data is written at these moments:

| Checkpoint | Writes |
|---|---|
| Level, repair run, or systems check ends | progress, telemetry, meta, run log |
| Barrier broken, mod earned, rank up | progress, meta |
| Settings or profile changed | settings or profile (debounced 1 s) |
| Tab hidden or page closing | any unsaved changes |

Telemetry is aggregated at the level-end checkpoint (Telemetry vertical); raw keystroke events are never stored outside run logs.

### Backups

- Before each write, the previous version of the document is rotated into a backup slot. The last 3 versions of each document are kept.
- A backup is also taken before running any migration.
- If a document fails validation, the newest valid backup is restored (Data Model horizontal).

### Eviction protection

After the player earns their first star, the game calls `navigator.storage.persist()` to ask the browser to protect its data from eviction. A denial is recorded and not asked again; the settings screen suggests signing in for cloud backup.

## Cloud sync

### Storage layout in the player's Puter account

| Key | Contents |
|---|---|
| `signalfire/doc/<name>` | One document (profile, settings, progress, telemetry, meta) |
| `signalfire/run/<runId>` | One best-run log |
| `signalfire/runs-index` | Which best runs exist, by level and tier |

All documents fit well under puter.kv's 400 KB value limit; telemetry is the largest and is monitored in tests.

### Sync state

Stored locally in the `syncState` document:

| Field | Meaning |
|---|---|
| `deviceId` | Random ID for this browser |
| `account` | Puter user identifier when signed in |
| `base[doc]` | The document as it was at the last successful sync, with its `rev` |
| `dirty[doc]` | Whether the document has local changes not yet synced |
| `lastSyncAt` | Time of the last successful sync |

### On load

1. Load local documents.
2. If a cloud session exists, load the puter.js adapter and pull every cloud document.
3. Merge each document: cloud data as the starting point, with any unsynced local changes from this account merged in (see Merging).
4. Save the result locally and update `base`.

### At each checkpoint

For each dirty document:

1. Pull the cloud copy.
2. If the cloud `rev` equals `base.rev`, push the local document with `rev + 1`.
3. Otherwise, merge base, local, and cloud; save the merged document locally and push it with a higher `rev`.
4. Update `base` and clear `dirty`.

puter.kv has no conditional write, so two devices syncing at the same instant could overwrite each other. The window is small, and because merges only ever add progress, the next sync from either device restores anything lost.

### Merging

A three-way merge using the last synced `base`, so each device's changes are applied once.

| Field kind | Merge rule | Examples |
|---|---|---|
| Best values | Maximum | stars, best score, best WPM, best accuracy |
| Earned sets | Union | medals, mods, Keylings, achievements, codex, barriers broken, cosmetics |
| Counters | Base + both devices' increases | attempts, errors, lifetime characters, active time, commendations |
| Day summaries | Union by date; same date combines both devices' totals | `telemetry.days` |
| Smoothed values and recent windows | Take the device whose change is more recent | key `smoothedMs`, `recent` |
| Preferences | Newest change wins | settings, equipped cosmetics, call sign |
| Daily dispatches | Same date: keep the furthest progress per dispatch; different dates: keep the newer date | `meta.dispatches` |

Merge functions live in `src/core` and are built test-first (constitution C4), with a test for every row above.

### Offline and failures

- If offline, documents stay dirty; sync resumes on the browser's `online` event and on the next checkpoint.
- Failed syncs retry with backoff (5 s, 30 s, 2 min, then at each checkpoint).
- Sync never blocks play. The top bar shows the status (UI/UX vertical).

### Signing in and out

| Situation | Behavior |
|---|---|
| Sign in; account has no cloud data | Local data is uploaded |
| Sign in; account has cloud data; this device has its own local progress | The player is warned and the cloud copy replaces local data (UI/UX vertical). Local data is kept as a backup. |
| Sign in on a fresh device | Cloud data is downloaded |
| Sign out | Local data stays on the device; sync stops |

### Run logs in the cloud

- Only the best run per level and tier is uploaded.
- When a new best replaces an old one, the old cloud log is deleted.
- Ghosts on a new device download on demand when a level is opened.

## Multiple tabs

- Each tab requests a Web Lock named `signalfire-active` for its lifetime, using the `steal` option so the **newest tab takes over**.
- The tab that loses the lock stops its game loop, flushes unsaved changes, and shows: "Signalfire is open in another tab." with a button to take it back.
- All writes also run inside a `signalfire-write` lock.
- A BroadcastChannel message tells other tabs when the active tab changes or data is written.

## Sync machine (XState)

```
signedOut ──signIn──▶ pulling ──▶ idle ◀──────────────┐
                                    │ checkpoint        │
                                    ▼                   │
                                 syncing ──success──────┘
                                    │ failure
                                    ▼
                                 waiting (backoff) ──retry──▶ syncing
                                    ▲
                    offline ────────┘
```

## Privacy

- Cloud data lives only in the player's own Puter account.
- No other server receives player data, apart from the anonymous event counts listed in the CI/CD and Hosting horizontal.
- Settings offer "Download my data" (all documents and run logs as JSON) and "Delete my data" (local and, if signed in, cloud).

## Sources

- [puter.kv.set (limits)](https://docs.puter.com/KV/set/), [puter.kv.list](https://docs.puter.com/KV/list/), [KV per-call caps, PR #4106](https://github.com/HeyPuter/puter/pull/4106)
- [Puter auth](https://developer.puter.com/auth/)
- [idb-keyval](https://socket.dev/npm/package/idb-keyval/overview/^6.2.0) and [IndexedDB wrappers compared](https://rxdb.info/articles/indexeddb/best-indexeddb-wrapper.html)
- [localStorage vs IndexedDB](https://blog.openreplay.com/indexeddb-localstorage-sessionstorage/)
- [Storage eviction and persistence (Chrome)](https://developer.chrome.com/docs/web-platform/storage-buckets)
- [Web Locks API (MDN)](https://developer.mozilla.org/docs/Web/API/Web_Locks_API) and [cross-tab sync with Web Locks](https://sitepen.com/blog/cross-tab-synchronization-with-the-web-locks-api)
