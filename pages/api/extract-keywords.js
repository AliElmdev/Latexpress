import fetch from "node-fetch"; // Ensure you have the fetch module available

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { annonce, summary } = req.body;

    if (!annonce || !summary) {
        return res.status(400).json({
            error: "Both job description (annonce) and resume (summary) are required",
        });
    }

    // Improved prompt to categorize the keywords
    const prompt = `Given the following job description and resume, identify the key skills and competencies that are mentioned in the job description but missing from the resume. 
Categorize the skills into three sections:
1. "Technical Skills": Hard skills like programming languages, software, or technical abilities.
2. "Relational Skills": Soft skills like teamwork, communication, or leadership.
3. "Personal Strengths": Attributes like adaptability, resilience, or problem-solving.

Return the result in a JSON format like this:
{
  "Technical Skills": ["skill1", "skill2"],
  "Relational Skills": ["skill3", "skill4"],
  "Personal Strengths": ["skill5", "skill6"]
}

Job Description:
${annonce}

Resume:
${summary}

Return only the first 10 keywords distributed among the three categories.`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const siteUrl = process.env.SITE_URL;
    const siteName = process.env.SITE_NAME;

    let attempt = 0;
    let categorizedKeywords = {};
    let lastError = null;

    while (attempt < 3) {
        attempt++;
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": siteUrl,
                    "X-Title": siteName,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat:free",
                    messages: [{ role: "user", content: prompt }],
                }),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                lastError = new Error(`API call failed: ${errorDetails}`);
                console.error(lastError);
                continue;
            }

            const data = await response.json();
            console.log("API Response:", data);

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                lastError = new Error("Unexpected response format from the API");
                console.error(lastError);
                continue;
            }

            const responseContent = data.choices[0].message.content;

            // Extract the JSON part of the response by searching for the first '{' and last '}'
            let jsonString = responseContent.trim();
            const firstBrace = jsonString.indexOf("{");
            const lastBrace = jsonString.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace !== -1) {
                jsonString = jsonString.substring(firstBrace, lastBrace + 1);
            }

            try {
                categorizedKeywords = JSON.parse(jsonString);
                break; // Successfully parsed, exit loop
            } catch (parseError) {
                lastError = new Error("Failed to parse extracted JSON from AI response");
                console.error(lastError, parseError);
            }
        } catch (error) {
            lastError = error;
            console.error("Attempt error:", error);
        }
    }

    if (Object.keys(categorizedKeywords).length === 0) {
        console.error("Failed to get valid categorized keywords after 3 attempts:", lastError);
        return res.status(200).json({ keywords: { "Technical Skills": [], "Relational Skills": [], "Personal Strengths": [] } });
    }

    res.status(200).json({ keywords: categorizedKeywords });
}