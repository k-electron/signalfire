# Vertical 09: Procedural Audio

All sound in the game is generated in real time. There are no licensed tracks or recorded samples. The defining idea: **the music is made from the player's typing.**

## Goals

- **Typing makes the music.** Every correct keystroke plays a note. Clean, steady typing sounds like a song; errors sound like static (P9).
- **Always pleasant.** Any sequence of correct keys must sound musical, whether the player types slowly or fast.
- **Supports learning.** Sound reinforces hands, fingers, and rhythm without demanding attention.
- **Never fatiguing.** A player hears this for 15–20 minutes a day for a month.
- **Visual-first.** The game is fully playable muted. Audio deepens it; it never carries information that isn't also visible.

## How typing becomes music

### The harmonic frame

Each zone has a key, a scale, and a short chord progression (4 chords, 2 beats each) that loops under the level. A quiet clock keeps time at the zone's base tempo.

### Keystroke notes

Every correct keystroke plays a note immediately (no waiting for the beat, which would feel laggy).

- **Pitch:** chosen from the **current chord's tones**, so every note fits the harmony no matter when it lands.
- **Which tone:** set by the finger. Left-hand fingers play the lower register, right-hand fingers the upper register. Pinky to index on each hand climbs through the chord tones.
- **Row:** top-row keys play an octave up from home; bottom-row keys an octave down. Reaches are audible.
- **Thumb (Space):** a soft low pulse, like a heartbeat between words.
- **Panning:** left-hand notes sit slightly left in the stereo field, right-hand notes slightly right. In the Twin Suns zone, the pan widens to reinforce opposite-hand Shift.
- **Variation:** repeated presses of the same key vary slightly in velocity and tone so drills don't sound mechanical.

The result is that a word sounds like a short melodic phrase, and a familiar word sounds the same each time, which helps the player feel words as units.

### Layers earned by Signal lock

The backing track builds as the combo grows.

| Combo tier | Layer added |
|---|---|
| ×1 | Soft pad holding the chord; keystroke notes |
| ×2 | Bass pulse on the chord root |
| ×4 | Light percussion (soft kick, shaker) |
| ×6 | Arpeggio following the chord |
| ×8 | Counter-melody and shimmer |

When the combo drops, layers fade out over a beat (not cut abruptly), so the player hears the loss without a jarring stop.

### Overdrive

- The filter on all layers opens fully.
- The progression lifts a whole step.
- A wide choir-like pad enters.
- When Overdrive ends, everything settles back over two beats.

### Errors and Static

| Event | Sound |
|---|---|
| Error | Short burst of crushed noise; the pad wobbles out of tune for about 300 ms |
| Static hit | Louder crackle; a hiss layer creeps in |
| Static notes on screen | A faint hiss that rises the longer they sit |
| Shield at zero | Low muffling over the mix until the shield recovers |

Errors are noticeable but brief. Silence never punishes the player.

### Completion moments

| Event | Sound |
|---|---|
| Word complete | Quick arpeggiated chord stab, length scaled to the word |
| Enemy destroyed | Pitched explosion that fits the chord |
| Beacon rescued | Rising three-note chime |
| Boss phase cleared | Stinger and drum fill |
| Level complete | Cadence resolving to the home chord |

## Zone soundscapes

| Zone | Sector | Scale | Base tempo | Palette |
|---|---|---|---|---|
| 0 | Home Row Station | C major pentatonic | 84 BPM | Warm pads, music-box plucks, station hum |
| 1 | The Drift | A minor pentatonic | 90 BPM | Airy pads, soft plucks, distant chimes |
| 2 | Ember Reach | D Dorian | 100 BPM | Warm saw pads, mallet tones, crackling embers |
| 3 | The High Spires | E Lydian | 104 BPM | Glassy bells, shimmering reverb, wind |
| 4 | The Undertow | F# natural minor | 96 BPM | Deep sub bass, muffled filters, sonar pings |
| 5 | Twin Suns | G Mixolydian | 110 BPM | Bright brass-like synths, wide stereo ping-pong |
| 6 | The Riverlight | B♭ major pentatonic | 120 BPM | Driving arpeggios, flowing pads, the fastest zone |
| 7 | The Counting Stars | B minor | 108 BPM | Clockwork ticks, music-box bells, precise rhythms |
| 8 | The Glyph Wastes | D harmonic minor | 98 BPM | Plucked ancient strings, low drones, dust |
| 9 | The Silent Core | None | None | Silence; only keystroke clicks until repairs restore sound |

### The Silent Core

The final zone starts silent. No pad, no clock, no notes; keystrokes make only dry clicks. Each repaired crack restores one sound element. In the final boss, every motif from every zone returns, and the finale resolves into Zone 0's warm C major.

## Bosses

Each Warden has a short motif (4–6 notes) in its zone's scale, played by a distorted voice.

- **Phase 1:** motif plays occasionally under the zone track.
- **Phase 2:** motif plays every two bars; percussion intensifies.
- **Phase 3:** motif and zone track compete; the player's notes overpower the motif as they deal damage.
- **Defeat:** the motif is played once more, cleanly, in the zone's voice, as if redeemed.

## Characters

- **Dash** speaks in synthesized blips: one short pitched tone per letter of its dialogue, rising for excitement and falling for worry. As Dash's vocabulary grows, its blips gain more tonal variety.
- **Commander Okafor and Pim** have distinct blip voices (lower and steadier for the Commander, quick and bright for Pim).
- **The Hush** has no blips. Its text appears in silence.

## Hub and interface sounds

| Moment | Sound |
|---|---|
| Hub ambience | Station hum that gains layers as sectors are restored; by the end it's a full, gentle theme |
| Menu move | Soft tick |
| Menu select | Bright click |
| Screen transition | Short airy whoosh |
| Star earned | Ascending pentatonic chime, one per star |
| Medal earned | Metallic stamp |
| Rank up | Short fanfare |
| Keyling rescued | Unique two-note call per Keyling |
| Mod earned | Mechanical assembly sound and chime |

## Synthesis palette

Built entirely from basic synthesis in the browser:

| Element | Technique |
|---|---|
| Pads | Detuned saw or triangle oscillators through a low-pass filter, slow attack |
| Plucks and mallets | Short envelopes on sine or triangle waves; simple FM for bell tones |
| Bass | Sine or square with low-pass filter |
| Percussion | Filtered noise bursts (shakers, hats) and pitched sine drops (kicks) |
| Static | White noise with bit reduction and random filter sweeps |
| Space | Shared reverb and delay sends |

## Mix and settings

- A master compressor and limiter prevent clipping when many notes fire at once.
- Polyphony is capped; the oldest notes release first.
- Keystroke notes sit in front; backing layers sit lower so the player always hears their own typing.
- Volume controls: master, music, effects, voices.
- Audio pauses when the tab is hidden.
- Audio starts only after the player's first interaction (browsers require this).

## Fatigue prevention

- Each zone has two or three progression variations that rotate between levels.
- Velocity, tone, and stereo position vary slightly per note.
- No sound repeats identically more than four times in a row.
- Levels end before musical loops become obvious (2–4 minutes).

## Open questions

- Prototype the chord-tone mapping early. It may need tuning so fast typing doesn't produce a muddy wall of notes (one option: thin out notes above a certain speed, keeping every keystroke audible as a softer tick).
- Should players be able to choose a "calm" audio mix with fewer layers?
