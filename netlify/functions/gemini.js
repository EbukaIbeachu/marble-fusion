const { GoogleGenAI, Type } = require("@google/genai");

exports.handler = async function(event, context) {
  const { prompt } = JSON.parse(event.body || '{}');
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  // Debug: Return the API key value for troubleshooting (remove after testing)
  if (event.queryStringParameters && event.queryStringParameters.debug === '1') {
    return {
      statusCode: 200,
      body: JSON.stringify({ debugApiKey: apiKey })
    };
  }

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not set in environment." })
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a unique marble bead design based on this concept: "${prompt}".`,
      config: {
        systemInstruction: `You are an expert high-fashion jewelry designer and colorist.\nYour goal is to create sophisticated marble bead recipes based on abstract descriptions, moods, or natural phenomena.\nA recipe consists of a palette of colors with specific visual weights (percentages) and physical parameters for the fusion simulation.`,
        responseMimeType: "application/json"
      }
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ result: response })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
