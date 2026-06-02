const { ChromaClient } = require('chromadb');
const CHROMA_URL = process.env.CHROMA_URL || 'http://127.0.0.1:8000';
const OLLAMA_BASE_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';

const chromaClient = new ChromaClient({ path: CHROMA_URL });

function chunkText(text, size = 1000, overlap = 200) {
    if (!text) return [];
    let chunks = [];
    for (let i = 0; i < text.length; i += (size - overlap)) {
        chunks.push(text.substring(i, i + size));
        if (i + size >= text.length) break;
    }
    return chunks;
}

async function getOllamaEmbedding(text) {
    try {
        const res = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt: text })
        });
        if (!res.ok) throw new Error("Failed to connect to ollama embeddings");
        const data = await res.json();
        return data.embedding;
    } catch (err) {
        console.error("Ollama Embedding error:", err);
        return [];
    }
}

async function vectorizeAndStoreCV(candidateId, cvText) {
    if (!cvText || cvText.trim() === '') return;
    try {
        const chunks = chunkText(cvText, 1000, 200);
        if (chunks.length === 0) return;

        const embeddings = [];
        const validChunks = [];
        const ids = [];
        const metadatas = [];

        // Generate embeddings for each chunk
        for (let i = 0; i < chunks.length; i++) {
            const emb = await getOllamaEmbedding(chunks[i]);
            if (emb && emb.length > 0) {
                embeddings.push(emb);
                validChunks.push(chunks[i]);
                ids.push(`${candidateId}_chunk_${i}`);
                metadatas.push({ candidateId: candidateId.toString() });
            }
        }

        if (embeddings.length === 0) return;

        const collection = await chromaClient.getOrCreateCollection({ name: "candidates_cv" });

        // Delete old to avoid overlap
        try {
            await collection.delete({ where: { candidateId: candidateId.toString() } });
        } catch (e) { }

        await collection.add({
            ids,
            embeddings,
            metadatas,
            documents: validChunks
        });

        console.log(`Successfully vectorized CV for candidate ${candidateId}`);
    } catch (err) {
        console.error(`Failed to vectorize CV for candidate ${candidateId}:`, err);
    }
}

async function retrieveRelevantCVChunks(candidateId, query, maxResults = 3) {
    try {
        const queryEmbedding = await getOllamaEmbedding(query);
        if (!queryEmbedding || queryEmbedding.length === 0) return "";

        const collection = await chromaClient.getCollection({ name: "candidates_cv" });
        if (!collection) return "";

        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: maxResults,
            where: { candidateId: candidateId.toString() }
        });

        if (results.documents && results.documents.length > 0) {
            return results.documents[0].join('\n---\n');
        }
        return "";
    } catch (err) {
        console.error(`Failed to retrieve CV chunks for candidate ${candidateId}:`, err);
        return "";
    }
}

module.exports = {
    chromaClient,
    vectorizeAndStoreCV,
    retrieveRelevantCVChunks
};
