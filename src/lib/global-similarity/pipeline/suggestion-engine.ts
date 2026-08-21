import {
  ExternalProjectResult,
  StructuredProjectRepresentation,
} from '../types'

/**
 * Generates tailored, practical differentiation suggestions based on
 * detected similarities and project characteristics.
 */
export function generateDifferentiationSuggestions(
  project: StructuredProjectRepresentation,
  topMatches: ExternalProjectResult[]
): string[] {
  const suggestions: string[] = []
  const highestMatch = topMatches[0]
  const topTech = project.technologies.slice(0, 3).join(', ')

  if (highestMatch && highestMatch.similarityScore >= 60) {
    suggestions.push(
      `Your project exhibits notable overlap with "${highestMatch.title}" (${highestMatch.similarityScore}% on ${highestMatch.source}). Consider pivoting your primary novelty claim towards specialized constraints such as low-resource hardware deployment or hybrid sensor fusion.`
    )
  }

  // Technology specific suggestions
  const techLower = project.technologies.map(t => t.toLowerCase())

  if (techLower.some(t => /cv|vision|opencv|cnn|yolo|image/i.test(t))) {
    suggestions.push(
      `Differentiate computer vision workflows by introducing temporal sequence tracking (e.g. YOLOv8 + ByteTrack) or lightweight attention mechanisms instead of static frame-by-frame classification.`
    )
  }

  if (techLower.some(t => /iot|raspberry|arduino|sensor|mqtt/i.test(t))) {
    suggestions.push(
      `Integrate fault-tolerant edge buffering with MQTT QoS protocols to ensure uninterrupted data capture during intermittent connectivity outages.`
    )
  }

  if (techLower.some(t => /nlp|bert|transformer|llm/i.test(t))) {
    suggestions.push(
      `Incorporate vernacular / regional language support (e.g., IndicBERT, Bhashini APIs) to serve under-represented Indian demographic groups.`
    )
  }

  // Domain specific differentiation
  suggestions.push(
    `Introduce a verifiable quantitative evaluation metric (e.g. power consumption vs latency trade-off, cost per inference, or field usability score) to benchmark against existing literature.`
  )

  suggestions.push(
    `Package your methodology as an open, reproducible modular pipeline with well-documented APIs or Dockerized microservices for multi-institution adoption.`
  )

  return suggestions.slice(0, 4)
}
