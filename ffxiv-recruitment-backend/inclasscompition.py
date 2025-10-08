from flask import Flask, render_template_string
import pymongo

MONGO_URI = "mongodb+srv://duvallbm_db_user:LJGc5EfIU5l9f10u@statichelper.c15ms4l.mongodb.net/?retryWrites=true&w=majority&appName=StaticHelper"

app = Flask(__name__)

@app.route("/")
def gallery():
    client = pymongo.MongoClient(MONGO_URI)
    db = client["test"]
    collection = db["class_stuff"]

    cards = []
    for card in collection.find():
        url = (
            card.get("image") 
            or card.get("images", {}).get("large") 
            or card.get("images", {}).get("small")
        )
        if url:
            cards.append({"name": card.get("name", "Unknown"), "url": url + "/high.png"})
    client.close()

    html = """
    <h1>Pokémon TCG Gallery</h1>
    {% for card in cards %}
        <div style="display:inline-block; margin:10px; text-align:center;">
            <img src="{{ card.url }}" width="200"><br>
            {{ card.name }}
        </div>
    {% endfor %}
    """
    return render_template_string(html, cards=cards)

if __name__ == "__main__":
    app.run(debug=True)
