import numpy as np

def cosine_similarity(vec_a: list, vec_b: list) -> float:
    a, b = np.array(vec_a), np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def build_preference_vector(ranked_brands: list[dict], rejected_brands: list[dict] = None) -> list[float]:
    vectors, weights = [], []

    if ranked_brands:
        max_rank = max(b["rank"] for b in ranked_brands)
        for b in ranked_brands:
            vectors.append(np.array(b["vector"]))
            weights.append(float(max_rank + 1 - b["rank"]))

    if rejected_brands:
        neg_weight = float(max(weights)) if weights else 1.0
        for b in rejected_brands:
            vectors.append(np.array(b["vector"]))
            weights.append(-neg_weight)

    if not vectors:
        return None

    weighted_sum = sum(w * v for w, v in zip(weights, vectors))
    norm = np.linalg.norm(weighted_sum)
    if norm == 0:
        return None
    return (weighted_sum / norm).tolist()


def blend_vectors(query_vec: list[float], pref_vec: list[float], alpha: float = 0.4) -> list[float]:
    blended = (1 - alpha) * np.array(query_vec) + alpha * np.array(pref_vec)
    blended = blended / np.linalg.norm(blended)
    return blended.tolist()

def generate_drop(
    user_vector: list[float],
    brand_catalog: list[dict],
    already_received: list[str],
    rejected_ids: list[str] = None,
    n: int = 4
) -> list[dict]:
    excluded = set(rejected_ids or []) | set(already_received or [])
    scores = []
    for brand in brand_catalog:
        if brand["id"] in excluded:
            continue
        score = cosine_similarity(user_vector, brand["vector"])
        scores.append((brand, score))
    scores.sort(key=lambda x: x[1], reverse=True)
    return [
        {**brand, "match_score": round(score, 4)}
        for brand, score in scores[:n]
    ]