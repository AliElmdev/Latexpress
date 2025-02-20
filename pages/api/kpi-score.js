import fetch from "node-fetch"; // Ensure you have the fetch module available

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { annonce, competences } = req.body;

    if (!annonce || !competences) {
        return res.status(400).json({ error: "Missing annonce or competences in request body" });
    }

    // Updated prompt with professional scoring methodology instructions.
    const prompt = `
    Analyze this job announcement and resume competencies using the following structured, professional methodology and return only a single numeric score between 0 and 100 with no additional text:

    1. Keyword Matching (50%): Evaluate how well the resume matches key technical and soft skills mentioned in the job announcement.
    2. Experience Relevance (20%): Assess if the candidate’s experience aligns with the job requirements.
    3. Education & Certifications (10%): Consider whether the candidate holds the required degree and certifications.
    4. Soft Skills & Additional Criteria (10%): Evaluate other relevant soft skills and attributes.
    5. Industry & Domain Fit (10%): Determine if the candidate has domain-specific experience relevant to the job.

    Compute the final score using the weights above, where 100 indicates a perfect match and 0 indicates no match.

    Job Announcement:
    ${annonce}

    Resume Competencies:
    ${competences}
    `;

    // Environment variables
    const apiKey = process.env.OPENROUTER_API_KEY;
    const siteUrl = process.env.SITE_URL;
    const siteName = process.env.SITE_NAME;

    let attempt = 0;
    let score = NaN;
    let lastError = null;

    // Try up to 3 times to get a valid score
    while (attempt < 3) {
        try {
            attempt++;
            console.log(`Attempt ${attempt}`);
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
                    messages: [{
                        role: "user",
                        content: prompt,
                    }],
                }),
            });

            if (!response.ok) {
                const errorDetails = await response.text();
                lastError = new Error(`API call failed: ${errorDetails}`);
                console.error(lastError);
                continue;
            }

            const data = await response.json();

            // Ensure the response contains choices and message data
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                lastError = new Error("Unexpected response format from the API");
                console.error(lastError);
                continue;
            }

            let messageContent = data.choices[0].message.content.trim();
            console.log('API Response:', messageContent);

            // Remove markdown code block markers if present
            messageContent = messageContent.replace(/```json/g, '').replace(/```/g, '').trim();

            // Parse the score from the message content
            score = parseInt(messageContent, 10);
            console.log('Parsed Score:', score);

            // Check if score is valid (number between 0 and 100)
            if (!isNaN(score) && score >= 0 && score <= 100) {
                break; // valid score, exit loop
            } else {
                lastError = new Error("Invalid score format in API response");
                console.error(lastError);
            }
        } catch (error) {
            lastError = error;
            console.error("Attempt error:", error);
        }
    }

    // If score is still invalid after 3 attempts, return 0
    if (isNaN(score) || score < 0 || score > 100) {
        console.error("Failed to get a valid score after 3 attempts:", lastError);
        return res.status(200).json({ score: 0 });
    }

    // Return only the final score as a number
    res.status(200).json({ score });
}