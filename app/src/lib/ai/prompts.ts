export function summarizePrompt(chapterTitle: string, chapterContent: string): string {
  return `You are a study assistant. Summarize the following chapter concisely.

Chapter: ${chapterTitle}

Content:
${chapterContent}

Provide:
1. A brief overview (2-3 sentences)
2. Key concepts (bulleted list)
3. Important takeaways
4. Connections to related topics

Format your response in clean markdown.`;
}

export function explainPrompt(selectedText: string, chapterContext: string): string {
  return `You are a study assistant helping a student understand a passage from their course material.

The student highlighted this text and wants an explanation:
"${selectedText}"

Surrounding chapter context:
${chapterContext.slice(0, 3000)}

Provide a clear, educational explanation that:
1. Explains the concept in simple terms
2. Gives a practical example if applicable
3. Explains why this concept matters

Keep the explanation focused and concise (200-400 words). Use markdown formatting.`;
}

export function askPrompt(question: string, chapterTitle: string, chapterContent: string): string {
  return `You are a study assistant. Answer the student's question using ONLY the provided chapter content. Do not make up information not present in the source material.

Chapter: ${chapterTitle}

Chapter Content:
${chapterContent.slice(0, 6000)}

Student's Question: ${question}

Answer the question accurately based on the chapter content. If the answer is not in the chapter, say so. Use markdown formatting. Cite relevant sections when possible.`;
}
