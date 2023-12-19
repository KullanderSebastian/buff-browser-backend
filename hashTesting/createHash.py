import hashlib

def calculate_hash(attributes):
    data = "|".join(map(str, attributes))

    sha256_hash = hashlib.sha256(data.encode()).hexdigest()

    return sha256_hash