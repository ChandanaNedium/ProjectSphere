/**
 * Vector Mathematics & Cosine Similarity Engine
 *
 * Implements rigorous mathematical cosine similarity:
 * CosineSim(u, v) = (u . v) / (||u|| * ||v||)
 */

export function dotProduct(a: number[], b: number[]): number {
  let sum = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

export function magnitude(v: number[]): number {
  let sum = 0
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i]
  }
  return Math.sqrt(sum)
}

export function normalizeVector(v: number[]): number[] {
  const mag = magnitude(v)
  if (mag === 0) return v
  return v.map(x => x / mag)
}

/**
 * Calculates raw cosine similarity between two numeric vectors in [-1, 1],
 * mapped to [0, 1] for semantic scoring.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0
  const magA = magnitude(a)
  const magB = magnitude(b)
  if (magA === 0 || magB === 0) return 0

  const rawCosine = dotProduct(a, b) / (magA * magB)
  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, rawCosine))
}

/**
 * Common stop words to omit when extracting semantic tokens
 */
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren', 'arent', 'as', 'at', 'be', 'because', 'been', 'before',
  'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'couldn', 'did', 'didn', 'do', 'does', 'doesn', 'doing', 'don', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'hadn', 'has',
  'hasn', 'have', 'haven', 'having', 'he', 'her', 'here', 'hers', 'herself',
  'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'isn', 'it',
  'its', 'itself', 'just', 'll', 'm', 'ma', 'me', 'mightn', 'more', 'most',
  'mustn', 'my', 'myself', 'needn', 'no', 'nor', 'not', 'now', 'o', 'of', 'off',
  'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
  'own', 're', 's', 'same', 'shan', 'she', 'should', 'shouldn', 'so', 'some',
  'such', 't', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 've', 'very', 'was', 'wasn', 'we', 'were', 'weren',
  'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will',
  'with', 'won', 'would', 'wouldn', 'y', 'you', 'your', 'yours', 'yourself',
  'yourselves', 'system', 'project', 'paper', 'using', 'based', 'approach',
  'via', 'propose', 'proposed', 'novel', 'new', 'study', 'presents', 'present',
])

/**
 * Tokenize a text into cleaned lowercase tokens
 */
export function tokenizeText(text: string): string[] {
  if (!text) return []
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, ' ')
    .split(/[\s-_]+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t))
}

/**
 * Hash a string into a deterministic positive integer
 */
function hashString(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash)
}

/**
 * Generate subwords and char 3-grams for semantic fuzzy token capture
 */
function extractSubwords(token: string): string[] {
  const subwords: string[] = [token]
  if (token.length >= 4) {
    for (let i = 0; i <= token.length - 3; i++) {
      subwords.push(token.substring(i, i + 3))
    }
  }
  return subwords
}

/**
 * High-dimensional deterministic mathematical feature vector (dim = 384)
 * Combines word hashing, char 3-grams, and TF-IDF weighting.
 */
export function generateLocalVector(text: string, dimensions = 384): number[] {
  const vector = new Array(dimensions).fill(0)
  if (!text || text.trim().length === 0) return vector

  const tokens = tokenizeText(text)
  if (tokens.length === 0) return vector

  // Term frequency map
  const tfMap = new Map<string, number>()
  for (const token of tokens) {
    const subwords = extractSubwords(token)
    for (const sub of subwords) {
      tfMap.set(sub, (tfMap.get(sub) || 0) + 1)
    }
  }

  // Populate vector bins with sublinear TF weighting
  for (const [subword, count] of tfMap.entries()) {
    const weight = 1 + Math.log(count)
    const hashVal = hashString(subword)
    const index = hashVal % dimensions
    const sign = (hashVal >> 16) % 2 === 0 ? 1 : -1

    vector[index] += sign * weight
  }

  // Also include domain-specific bigrams for contextual relevance
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]}_${tokens[i + 1]}`
    const hashVal = hashString(bigram)
    const index = hashVal % dimensions
    const sign = (hashVal >> 16) % 2 === 0 ? 1 : -1
    vector[index] += sign * 1.5
  }

  return normalizeVector(vector)
}
