export function formatKnowledgeForPrompt(
  knowledgeItems: Array<{ title: string; content: string; tags: string[] }>,
): string {
  if (knowledgeItems.length === 0) return ""

  const formattedKnowledge = knowledgeItems
    .map((item) => {
      const tags = item.tags.length > 0 ? `[Tags: ${item.tags.join(", ")}]` : ""
      return `## ${item.title} ${tags}\n${item.content}`
    })
    .join("\n\n---\n\n")

  return `\n\nKNOWLEDGE BASE:\n${formattedKnowledge}\n\nUse the above knowledge base information to enhance your responses when relevant. Reference specific information from the knowledge base when it applies to the user's question.`
}

export function extractRelevantKnowledge(
  query: string,
  knowledgeItems: Array<{ title: string; content: string; tags: string[] }>,
): Array<{ title: string; content: string; tags: string[] }> {
  const queryLower = query.toLowerCase()
  const queryWords = queryLower.split(/\s+/)

  return knowledgeItems
    .map((item) => {
      let relevanceScore = 0
      const itemText = `${item.title} ${item.content} ${item.tags.join(" ")}`.toLowerCase()

      // Check for exact phrase matches
      if (itemText.includes(queryLower)) {
        relevanceScore += 10
      }

      // Check for individual word matches
      queryWords.forEach((word) => {
        if (word.length > 2 && itemText.includes(word)) {
          relevanceScore += 1
        }
      })

      // Check tag matches
      item.tags.forEach((tag) => {
        if (queryWords.some((word) => tag.toLowerCase().includes(word))) {
          relevanceScore += 5
        }
      })

      return { ...item, relevanceScore }
    })
    .filter((item) => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5) // Top 5 most relevant items
    .map(({ relevanceScore, ...item }) => item)
}
