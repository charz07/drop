import numpy as np

def cosine_similarity(vec_a: list, vec_b: list) -> float:
    a, b = np.array(vec_a), np.array(vec_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

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