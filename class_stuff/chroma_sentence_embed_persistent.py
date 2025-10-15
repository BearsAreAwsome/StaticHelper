from sentence_transformers import SentenceTransformer
import chromadb
import os

# 1. Initialize embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# 2. Set persistent storage directory for Chroma
persist_dir = "../class_stuff/chroma_storage"
os.makedirs(persist_dir, exist_ok=True)

# 3. Initialize persistent Chroma client
client = chromadb.PersistentClient(path=persist_dir)

# 4. Get or create a collection
collection = client.get_or_create_collection(name="example_embeddings")

# 5. Define (or extend) your dataset
texts = [
    "The quick brown fox jumps over the lazy dog.",
"A fast animal leaps across a sleepy canine.",
"Mount Everest is the tallest mountain in the world.",
"The deepest ocean trench is the Mariana Trench.",
"Artificial intelligence enables machines to learn from data.",
"It's Jigglypuff from above!"
]

# 6. Get all existing IDs in the collection
existing_docs = collection.get(include=[])  # returns {"ids": [...]} only
existing_ids = set(existing_docs.get("ids", []))

# 7. Compute which ones are new
new_data = []
for i, text in enumerate(texts):
    doc_id = f"doc_{i}"
    if doc_id not in existing_ids:
        new_data.append((doc_id, text))

# 8. Add only new items
if new_data:
    new_ids = [doc_id for doc_id, _ in new_data]
    new_texts = [text for _, text in new_data]
    new_embeddings = model.encode(new_texts).tolist()

    collection.add(
        ids=new_ids,
        embeddings=new_embeddings,
        documents=new_texts
    )
    print(f"✅ Added {len(new_data)} new document(s).")
else:
    print("✅ No new documents to add — collection up to date.")

# 9. Query the database
query = "Who is that Pokemon?"
query_embedding = model.encode([query]).tolist()

results = collection.query(
    query_embeddings=query_embedding,
    n_results=3
)

print("\n🔍 Query Results:")
for doc, dist in zip(results['documents'][0], results['distances'][0]):
    print(f"• {doc}  (distance={dist:.4f})")

print(f"\n📁 Data persisted at: {persist_dir}")
