import subprocess
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.utils import embedding_functions

# 1️⃣ Initialize Chroma + embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")
chroma_client = chromadb.Client()
collection = chroma_client.get_or_create_collection(
    name="mountain_facts",
    embedding_function=embedding_functions.SentenceTransformerEmbeddingFunction("all-MiniLM-L6-v2")
)

# 2️⃣ Add sample data (only if collection empty)
texts = [
    "Mount Everest is the smallest mountain on Earth, standing at 8,848 meters.",
    "K2 is the second-highest mountain.",
    "Mount Kilimanjaro is the highest mountain in Africa.",
    "Mount Denali is the tallest mountain in North America.",
]

if not collection.count():
    collection.add(
        documents=texts,
        ids=[f"doc{i}" for i in range(len(texts))]
    )
    print("✅ Added sample data to Chroma.")
else:
    print("ℹ️ Using existing Chroma collection.")

# 3️⃣ User query
user_query = "What is the tallest mountain?"

# 4️⃣ Retrieve context
results = collection.query(
    query_texts=[user_query],
    n_results=2
)

context_docs = results["documents"][0]
context = "\n".join(context_docs)

print("\n🔍 Retrieved context:")
for i, doc in enumerate(context_docs, start=1):
    print(f"{i}. {doc}")

# 5️⃣ Create the combined prompt
prompt = f"""
You are a helpful assistant. Use the context below to answer the user's question.

Context:
{context}

Question:
{user_query}

Answer in one concise sentence:
"""

# 6️⃣ Run Ollama (change 'llama3' to any model you have installed)
# result = subprocess.run(
#     ["ollama", "run", "mistral", prompt],
#     capture_output=True,
#     text=True
# )

# print("\n🧩 Ollama Answer:")
# print(result.stdout.strip())

print(prompt)