import { GoogleGenAI, Type } from "@google/genai";
import fs from 'fs';
import path from 'path';

let ai;

// Check if the API_KEY is set and is not the placeholder value
if (!process.env.API_KEY || process.env.API_KEY === 'your_gemini_api_key_here') {
  console.warn('-------------------------------------------------------------------');
  console.warn('WARNING: API_KEY is not set in server/.env file.');
  console.warn('The application will start, but AI features will not work.');
  console.warn('Please add your Google Gemini API key to server/.env');
  console.warn('-------------------------------------------------------------------');
  ai = null; // Set ai to null so the server doesn't crash
} else {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
}


const fileToGenerativePart = (filePath) => {
  const mimeType = path.extname(filePath) === '.png' ? 'image/png' : 'image/jpeg';
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
};

export const extractReceiptData = async (imagePath) => {
  if (!ai) throw new Error("Gemini API key not configured on the server.");
  try {
    const imagePart = fileToGenerativePart(imagePath);
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                imagePart,
                { text: "Analyze this receipt and extract the vendor name, total amount, and transaction date." }
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    vendorName: { type: Type.STRING, description: "The name of the vendor or store." },
                    transactionDate: { type: Type.STRING, description: "The date of the transaction in YYYY-MM-DD format." },
                    totalAmount: { type: Type.NUMBER, description: "The final total amount of the transaction." },
                },
                required: ["vendorName", "transactionDate", "totalAmount"]
            },
        },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error extracting receipt data from Gemini:", error);
    throw new Error("Failed to analyze receipt via Gemini.");
  }
};

export const suggestAccount = async (description, chartOfAccounts) => {
    if (!ai) throw new Error("Gemini API key not configured on the server.");
    if (!description.trim()) {
        return null;
    }

    const prompt = `
        Based on the transaction description "${description}", suggest the most appropriate expense or income account from the following Ethiopian Chart of Accounts. 

        Chart of Accounts:
        ${chartOfAccounts.map(acc => `Code: ${acc.code}, Name: ${acc.name}, Type: ${acc.type}`).join('\n')}

        Return your answer as a JSON object containing the suggested account's code. For example: { "suggestedCode": "5005" }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedCode: { type: Type.STRING, description: "The 4-digit code of the suggested account." },
                    },
                    required: ["suggestedCode"]
                }
            }
        });
        
        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        const { suggestedCode } = result;
        
        const suggestedAccount = chartOfAccounts.find(acc => acc.code === suggestedCode);
        
        return suggestedAccount || null;
    } catch (error) {
        console.error("Error suggesting account from Gemini:", error);
        return null;
    }
};

export const checkForDuplicateEntry = async (newEntry, existingEntries) => {
    if (!ai) return { isDuplicate: false, reason: "AI check skipped: API key not configured." };

    const prompt = `
        You are an expert accountant's assistant specializing in fraud detection. 
        Analyze the following new transaction against a list of existing transactions.
        Determine if the new transaction is a potential duplicate. 
        A duplicate might have a very similar amount (within 1% difference), the same or a very similar description/vendor, and be on the same or a very close date (within 3 days).
        
        New Transaction:
        - Date: ${newEntry.date}
        - Description: ${newEntry.description}
        - Amount: ${newEntry.amount}

        Existing Transactions (only consider entries within the last 90 days from the new transaction date):
        ${existingEntries.map(e => `- Date: ${e.date}, Description: ${e.description}, Amount: ${e.amount}, Status: ${e.status}`).join('\n')}

        Is the new transaction a potential duplicate of an existing one? Provide a brief reason for your decision.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isPotentialDuplicate: { type: Type.BOOLEAN },
                        reason: { type: Type.STRING, description: "A brief explanation if it's a duplicate, or a short confirmation that it's unique." }
                    },
                    required: ["isPotentialDuplicate", "reason"]
                }
            }
        });

        const jsonString = response.text.trim();
        const result = JSON.parse(jsonString);
        return { isDuplicate: result.isPotentialDuplicate, reason: result.reason };
    } catch (error) {
        console.error("Error checking for duplicates with Gemini:", error);
        return { isDuplicate: false, reason: "AI check could not be performed." };
    }
};

export const summarizeReport = async (reportName, reportData) => {
    if (!ai) throw new Error("Gemini API key not configured on the server.");
    const prompt = `
        You are a senior financial analyst providing insights to a finance manager.
        Here is a ${reportName}. Please provide a concise, easy-to-understand summary of this financial data. 
        Format your response in Markdown with 2-3 bullet points.
        Highlight key figures, important trends, and any potential areas of concern.

        Report Data:
        ${JSON.stringify(reportData, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing report with Gemini:", error);
        return "Could not generate AI summary.";
    }
};