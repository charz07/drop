import numpy as np

def cosine_similarity(vec_a: list, vec_b: list) -> float:
    a, b = np.array(vec_a), np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def build_preference_vector(ranked_brands: list[dict]) -> list[float]:
    # rank 1 = highest weight, rank 4 = lowest
    max_rank = max(b["rank"] for b in ranked_brands)
    weights = [max_rank + 1 - b["rank"] for b in ranked_brands]
    vectors = [np.array(b["vector"]) for b in ranked_brands]
    weighted = sum(w * v for w, v in zip(weights, vectors))
    return (weighted / sum(weights)).tolist()


def blend_vectors(query_vec: list[float], pref_vec: list[float], alpha: float = 0.4) -> list[float]:
    blended = (1 - alpha) * np.array(query_vec) + alpha * np.array(pref_vec)
    blended = blended / np.linalg.norm(blended)
    return blended.tolist()

def generate_drop(
    user_vector: list[float],
    brand_catalog: list[dict],
    already_received: list[str],
    n: int = 4
) -> list[dict]:
    scores = []
    for brand in brand_catalog:
        if brand["name"] in already_received:
            continue
        score = cosine_similarity(user_vector, brand["vector"])
        scores.append((brand, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return [
        {**brand, "match_score": round(score, 4)}
        for brand, score in scores[:n]
    ]