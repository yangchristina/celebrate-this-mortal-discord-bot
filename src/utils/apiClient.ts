import fetch from 'node-fetch';

interface Template {
  id: string;
  name: string;
  previewUrl: string;
}

interface CardCreationData {
  templateId: string;
  recipient: string;
  contributors: string[];
  deadline: string;
}

interface CardResponse {
  cardId: string;
  signingUrl: string;
}

interface SignatureResponse {
  cardId: string;
  totalSignatures: number;
}

interface CardDetailsResponse {
  cardId: string;
  revealUrl: string;
  templateName: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.ECARD_API_BASE_URL || 'https://celebratethismortal.com/api/discord') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch random card templates for voting
   */
  async getTemplates(count: number = 5): Promise<Template[]> {
    const url = `${this.baseUrl}/templates/random?count=${count}`;
    return this.fetchWithRetry(url);
  }

  /**
   * Create a new e-card and get signing link
   */
  async createCard(data: CardCreationData): Promise<CardResponse> {
    const url = `${this.baseUrl}/cards`;
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
    return this.fetchWithRetry(url, options);
  }

  /**
   * Get signature count for a card
   */
  async getSignatures(cardId: string): Promise<SignatureResponse> {
    const url = `${this.baseUrl}/cards/${cardId}/signatures`;
    return this.fetchWithRetry(url);
  }

  /**
   * Get final card details for reveal
   */
  async getCard(cardId: string): Promise<CardDetailsResponse> {
    const url = `${this.baseUrl}/cards/${cardId}`;
    return this.fetchWithRetry(url);
  }

  /**
   * Fetch with retry logic and exponential backoff
   */
  private async fetchWithRetry(url: string, options?: any, retries: number = 3): Promise<any> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed for ${url}:`, error);

        if (attempt === retries) {
          throw new Error(`Failed to fetch after ${retries + 1} attempts: ${error}`);
        }

        // Exponential backoff: wait 1s, 2s, 4s between retries
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
      }
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
