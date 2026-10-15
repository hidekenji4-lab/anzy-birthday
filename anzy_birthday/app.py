"""Anzy's little birthday universe. Start with: python app.py"""
from pathlib import Path

from flask import Flask, render_template

BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, template_folder="templates", static_folder="static")


@app.get("/")
def birthday():
    custom_music = (BASE_DIR / "static" / "music.mp3").is_file()
    return render_template("index.html", custom_music=custom_music)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
