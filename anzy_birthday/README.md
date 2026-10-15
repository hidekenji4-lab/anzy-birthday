# Anzy’s Birthday Adventure ✦

A cheerful, friend-focused, playable birthday website built with **Python (Flask) + HTML + CSS + JavaScript**. Python serves the website; the animations and interactions run in the visitor's browser.

## Run in Visual Studio Code (Windows, macOS, or Linux)

1. Install **Python 3.10 or newer** and **Visual Studio Code**.
2. Extract this folder and choose **File → Open Folder** in VS Code. Select `anzy_birthday`.
3. Open the terminal using **Terminal → New Terminal**.
4. Run:

   ```bash
   python -m pip install -r requirements.txt
   python app.py
   ```

5. Open **http://127.0.0.1:5000** in your browser.

If `python` doesn't work on Windows, try `py` instead:

```powershell
py -m pip install -r requirements.txt
py app.py
```

## What's interactive?

- An opening magic letter with confetti
- Five blooming, clickable flowers that reveal Anzy's compliments
- A star-catching mini-game
- A custom birthday cake with decorations, candle lighting, candle blowing, and a private floating wish
- A three-tap present and a fun, heartfelt (not romantic) birthday letter
- A sparkly final surprise with fireworks and replay
- Secret moon, butterfly, and lucky star buttons, unlocking a hidden birthday badge
- Optional background music and responsive mobile/tablet/desktop layouts

## Add your own song

The built-in button already plays a gentle, generated melody, no MP3 required. To use your own music, place a file called **`music.mp3`** inside the `static` folder, then restart the Python server and reload the page. The site will automatically use it instead.

Only use music you're allowed to share if publishing the site.

## Edit the messages

Open `templates/index.html` to change the main birthday letter and visible greetings. Open `static/script.js` to edit the `flowerNotes`, `starNotes`, and `mascotLines` arrays.

## Quick offline preview

Double-click **`preview.html`** to explore the birthday experience immediately, even without installing Python. Keep the `static` folder next to `preview.html` when previewing. For your actual VS Code Python project, run `app.py` as instructed above.

## Share the website online

The Flask app works on any host supporting Python web apps (e.g., Render). Your recipient **cannot open a localhost link** from their own device. You'll need to deploy the site first. The included Flask app object is named `app` in `app.py`; a typical production start command is `gunicorn app:app` after installing Gunicorn on the server.

If using a host that requires `gunicorn`, add it to `requirements.txt` before deploying. Never use Flask's `debug=True` development server on the public internet.

## Files

```
anzy_birthday/
  app.py
  requirements.txt
  README.md
  preview.html      (standalone browser preview)
  templates/
    index.html
  static/
    styles.css
    script.js
    favicon.svg
    cats/           (12 guest-provided cute cats, transparent PNGs)
    music.mp3       (optional, user-supplied)
```

Wish input stays in memory only and is not saved or sent to a server.

## Tone of the birthday card

This edition is intentionally friendly, lighthearted, and non-romantic. It celebrates Anzy’s cheerful personality and generosity with playful jokes, good wishes, and birthday surprises.


## NEW: Nine cute cat stickers

Your 9 uploaded cat pictures are included in `static/cats/` as lightweight PNG cutouts.
They appear across the 7 birthday scenes. Tap the cats to trigger a playful message,
a wiggle, and small confetti bursts. The floating cat helper changes between scenes.
No extra downloads or third-party image links are necessary.

The cat artwork was supplied by the project author. If you intend to publish the
site, check the original artists' permissions for public reuse.

`preview.html` can be opened directly for a quick visual preview; for custom MP3
support and deployment, run the Python Flask app instead.

## Cat + comfort update (v3)

All 12 provided cat doodles are included as transparent PNG sticker images, including the angry cat, laptop cat, and sleeping cat. The three new cats also appear in the **“For the harder days too”** cards after the birthday letter. Tap these cards to reveal longer encouraging notes.

The **“need a boost?”** button in the top bar opens a gentle message at any time, even before Anzy begins the adventure. On small phones this button is represented by a flower icon, to keep the header uncluttered. Tap **“another tiny reminder”** to see a different supportive message. This works entirely offline and does not collect or save anything.

The cat cutouts are transparent and float with a subtle pastel halo, not a white rectangle. All the earlier interactive scenes and the optional background song remain available.

## V4: Garden layout + restored photo-card backgrounds

- Returned the original creamy-white, rounded scrapbook frames behind the little
  interactive cat stickers. The images are kept as PNGs and remain crisp inside
  those frames; this is intentional to match the earlier birthday design.
- Moved the flower cat outside the garden scene and next to its message below the
  five flowers. It won't overlap the blooms, their hit areas, or the garden moon.
- Kept **Tiny Comfort Corner** in the letter section and **Need a boost?** in the
  header, including the three new cats and encouragement messages.
