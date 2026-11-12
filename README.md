# 🌾 Sekinchan Frenzy

**A Farm Frenzy–style paddy farming game set in the sawah of Sekinchan, Selangor.**

Fifteen petak. Three machines. One sluice gate. A flock of sparrows that has absolutely no respect for your medal time.

Plough, flood, plant, drain, harvest, sell, and do it faster than the clock. Everything you see is drawn in code and everything you hear is synthesised in your browser. No images. No audio files. No frameworks. No build step. One HTML file.

```
bajak → isi air → tanam → sederhana → kering → tuai → jerami → pasar → 💰
```

---

## Play it

| How | What to do |
|---|---|
| **Fastest** | Download `sekinchan-frenzy.html` and double-click it. |
| **Locally, split files** | Open `index.html` (it loads `style.css` and `game.js`). |
| **Online, free** | Drag this folder onto [vercel.com/drop](https://vercel.com/drop) while logged in to a Hobby account. |

Works on desktop (mouse + keyboard) and on phones (touch). Best on a phone held upright, with one thumb per pest.

---

## The 30-second tutorial

A bar above the field always tells you the **single most useful next action** and pulses the exact petak or button. If you are lost, read the bar. If you are still lost, the bar is still right.

1. **Bajak**: send the **Traktor**. It ploughs every empty, stubble or dead petak.
2. **Isi air**: tap each ploughed petak to flood it to **Basah**.
3. **Tanam**: send the **Mesin Tanam**. It only plants Basah petak.
4. Seedlings up? Tap to lower the water to **Sederhana**. Fastest growth, and pests hate it.
5. Padi turned gold? Tap to drain it to **Kering**.
6. **Tuai**: send the **Mesin Tuai**. It only cuts ripe padi that is Kering.
7. Tap the stubble to grab **Jerami** (straw).
8. Load the **lori** and sell at **Pasar Sekinchan**.

Then do it again, faster, while a rat watches you.

---

## Water is the whole game

Water does not evaporate. Each petak sits at one of three levels until **you** change it.

| Level | You need it for | Growth | Who shows up |
|---|---|---|---|
| **Basah** (wet, 100%) | Planting | Best for seedlings | Siput gondang, bena perang, pipit |
| **Sederhana** (medium, 50%) | Peace and quiet | Fastest once established | Nobody. Pests leave. |
| **Kering** (dry, 0%) | Harvesting | Slow | Tikus sawah, pipit |

How the water gets there:

- **Bangkenal**: the main canal down the left side. Its level rises and falls. When it is low, water only flows *slower*; it never stops.
- **Pintu air**: the sluice gate with the red wheel. Tap it to open or close.
- **Palong**: the raised concrete channel across the top. Gate open = endless water (`Penuh ∞`). Gate closed = a stored 0–100% that runs out.
- **Parit**: the drain along the front. Watch it speed up when you drain a petak.

The little gold drops in each petak's corner show its level: 3, 2 or 1.

---

## The machines

One tap sends a machine over **every** petak that needs it. It works each petak in three lanes (front, middle, back), U-turns at the edge, hops the batas, and carries on in a zig-zag. The field changes behind it, lane by lane.

| Machine | Job | Cost (Biasa) | Party trick |
|---|---|---|---|
| **Traktor** | Bajak (plough) | RM1 / petak | Three white bangau follow it, pecking at the fresh mud |
| **Mesin Tanam** | Tanam (transplant) | RM2 / petak | The seedling tray empties as it plants |
| **Mesin Tuai** | Tuai (harvest) | RM1 / petak | The reel turns and the grain tank fills with gold |

## The tools

| Tool | What it does |
|---|---|
| **Tangan** | Smart hand. Does the right thing for whatever you tap. Also hits pests. |
| **Basah / Sederhana / Kering** | Set an exact water level. |
| **Baja** (RM3) | Fertiliser. Padi grows 1.5× faster and gives **2 Padi**. |
| **Racun** (RM3) | Kills siput and bena perang, protects the petak for 20s. |

---

## The villains

Every pest shows a **red countdown ring**. When the ring fills, the petak is gone.

| Pest | Likes | How to deal with it |
|---|---|---|
| 🐦 **Burung pipit** (sparrow) | Any padi that is not Sederhana | Tap to shoo |
| 🐌 **Siput gondang** (golden apple snail) | Young seedlings in Basah | Tap to pick off, **+RM1** |
| 🐀 **Tikus sawah** (field rat) | Kering padi | Tap to catch, **+RM5** |
| 🦗 **Bena perang** (brown planthopper) | Basah, from level 3 | Racun, or lower to Sederhana. It **spreads** to neighbours. |

Pro tip: lowering a petak to Sederhana evicts whatever is on it. Water management is pest control.

## Pertahanan (defences)

| Item | Cost | Effect |
|---|---|---|
| **Orang-orang** (scarecrow, with terendak hat) | RM80 | Half as many birds |
| **Rumah burung hantu** (barn owl box) | RM100 | Half as many rats |
| **Pam air** (water pump) | RM120 | Faster water flow |
| **Dron** | RM180 | Fills its tank by hose, flies to the row that needs it most, and sprays baja or racun on the whole row (RM2 / petak) |

---

## Making money

| Item | Price | How you get it |
|---|---|---|
| Padi | RM6 | Harvest |
| Jerami | RM3 | Tap stubble |
| Beras | RM20 | **Kilang Padi**: 2 Padi → 1 Beras (5s, RM120 to build) |
| Cendawan Jerami | RM30 | **Bangsal Cendawan**: 3 Jerami → 1 Cendawan (6s, RM150) |
| Kuih Apam | RM55 | **Dapur Kuih**: 2 Beras → 1 Kuih Apam (6s, RM250) |

The **stor** holds 30. The **lori** carries 15, takes 8 seconds, and pays when it comes back. It leaves heaped with golden padi and returns empty, which is exactly how a good day should go.

---

## Levels

| # | Name | Goals | New trouble |
|---|---|---|---|
| 1 | **Musim Pertama** | 8 Padi | Birds |
| 2 | **Siput Gondang** | 12 Padi, 8 Jerami | Snails, a canal that rises and falls |
| 3 | **Kilang Padi** | 5 Beras, RM180 | Bena perang, your first workshop |
| 4 | **Cendawan Jerami** | 3 Cendawan, 5 Beras | Rats |
| 5 | **Pesta Menuai** | 4 Kuih Apam, RM500 | Everything, all at once |

Each level gives a **gold, silver or bronze** medal by time. Your best medal and unlocked levels are saved in the browser.

**Difficulty**

- **Santai** (Easy, default): slower pests, longer medal times, more starting money, smaller goals, faster growth, and the machines work for free.
- **Biasa** (Normal): the numbers in the table above, as written. The real frenzy.

---

## Controls

| Input | Action |
|---|---|
| Tap / click a petak | Use the selected tool |
| Tap a pest | Shoo, pick or catch it |
| Tap the pintu air | Open / close the gate |
| `Tab` + `Enter` / `Space` | Play the field by keyboard |
| `P` or `Esc` | Pause |

On phones, a fixed dock at the bottom holds the machines, gate, lorry and tools.

---

## How it is built

For the curious, and for future me.

- **One tilted plane, one canvas.** A CSS 3D plane (`rotateX(40deg)` under `perspective`) is used only for layout. Four invisible markers sit at its corners; every frame the game reads where they landed on screen and computes a **homography** from plane coordinates to canvas pixels. Everything in the field is then drawn on a `<canvas>`.
- **No trusting the browser's hit-testing.** Browsers mis-hit elements inside a perspective-tilted plane, so every tap is mapped back onto the flat plane with the **inverse homography** and matched to a petak by rectangle.
- **A dense, swaying field.** About 42 rice hills per petak, each a sprite pre-rendered once from tapered bezier leaves: seedling, tillering, mature, ripe (with drooping panicles and individual grains), stubble and dead. Wind is a per-hill skew driven by sine waves offset by position, so waves roll across the sawah.
- **Machines as simple 3D.** Boxes, wheels and discs with a top face and a front face, foreshortened for the 40° camera and depth-sorted against the padi rows so front crops can hide them.
- **Sound from nothing.** Web Audio only: filtered noise for water, sawtooth engines with LFO wobble, a pentatonic kampung loop on bell tones, random birdsong.
- **Kept light.** Fixed-size particle pool, typed arrays, no per-frame sorting of hundreds of objects.

### Files

| File | What it is |
|---|---|
| `sekinchan-frenzy.html` | The whole game in one self-contained file |
| `index.html` | Markup, including the animated SVG scenery banner |
| `style.css` | All styling and UI animation |
| `game.js` | Renderer, machines, game logic, audio and UI |

`sekinchan-frenzy.html` is the same game as the three split files, inlined.

---

## Glossary

| Malay | English |
|---|---|
| sawah | paddy field |
| petak | plot |
| batas | bund (the earth wall between plots) |
| bangkenal | main canal |
| pintu air | sluice gate |
| palong | raised water channel |
| parit | drain |
| bajak / tanam / tuai | plough / plant / harvest |
| jerami | straw |
| baja / racun | fertiliser / pesticide |
| kilang padi | rice mill |
| pasar | market |
| lori | lorry |
| bangau | egret |

---

## Known gaps

Honest notes, so nobody is surprised:

- Tested end to end in a headless browser on level 1 (Santai) at 1280 px desktop and 390 px touch. Levels 2–4 and Biasa have not had a full automated play-through.
- Medal times have not been tuned against real players.
- Sound was not checked in the automated tests (headless browsers have no speakers).
- Fonts (Baloo 2, Nunito) load from Google Fonts; offline, the game falls back to system fonts.

---

*Selamat menuai. May your padi be gold and your palong be `Penuh ∞`.*
