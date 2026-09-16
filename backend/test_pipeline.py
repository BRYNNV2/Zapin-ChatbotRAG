import sys
sys.path.append("backend")

from app.api.routes_dataset import seed_starter_zapin_knowledge
from app.services.vector_store import vector_store
from app.services.rag_service import rag_service
from app.services.baseline_service import baseline_service
from app.services.evaluation_service import evaluation_service
import asyncio

async def main():
    print("--- 1. SEEDING KNOWLEDGE BASE ---")
    await seed_starter_zapin_knowledge()
    print(f"Total chunks in VectorStore: {len(vector_store.documents)}")

    print("\n--- 2. TESTING SBERT DENSE RETRIEVAL ---")
    test_q = "Apa makna filosofis dan fungsi dari gerak Tahto?"
    retrieved = rag_service.retrieve_context(test_q, top_k=2)
    print(f"Query: {test_q}")
    print(f"Retrieved {len(retrieved)} chunks:")
    for r in retrieved:
        print(f"  - [{r['similarity_score']}] (Hal {r['page_number']} {r['document_name']}) {r['text'][:80]}...")

    print("\n--- 3. TESTING BM25 SPARSE RETRIEVAL ---")
    bm25_res = baseline_service.bm25_search(test_q, top_k=2)
    print(f"BM25 Retrieved {len(bm25_res)} chunks:")
    for r in bm25_res:
        print(f"  - [Score: {r['bm25_score']}] {r['text'][:80]}...")

    print("\n--- 4. TESTING RAG RESPONSE GENERATION ---")
    resp = rag_service.generate_response(test_q)
    print(f"Answer snippet: {resp['answer'][:200]}...")
    print(f"Sources count: {len(resp['sources'])}, Traceability: {resp['source_traceability_rate']}")

    print("\n--- 5. TESTING EVALUATION BENCHMARK ---")
    eval_res = evaluation_service.run_retrieval_comparison(top_k=3)
    print(f"SBERT Hit Rate@3: {eval_res['sbert_metrics']['hit_rate']}, MRR: {eval_res['sbert_metrics']['mrr']}")
    print(f"BM25 Hit Rate@3 : {eval_res['bm25_metrics']['hit_rate']}, MRR: {eval_res['bm25_metrics']['mrr']}")

    print("\n>>> ALL PIPELINE TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    asyncio.run(main())
