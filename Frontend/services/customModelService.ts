
export const customModelService = {
  getEndpoint: () => localStorage.getItem('custom_ai_endpoint') || '',
  setEndpoint: (url: string) => localStorage.setItem('custom_ai_endpoint', url),
  
  isCustomEnabled: () => localStorage.getItem('use_custom_ai') === 'true',
  setCustomEnabled: (enabled: boolean) => localStorage.setItem('use_custom_ai', String(enabled)),

  chat: async (message: string): Promise<string> => {
    const endpoint = customModelService.getEndpoint();
    if (!endpoint) throw new Error("No custom endpoint configured.");

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!response.ok) throw new Error("Custom model node unreachable.");
      
      const data = await response.json();
      return data.response || data.text || "No response content from custom node.";
    } catch (error) {
      console.error("Custom Model Error:", error);
      throw error;
    }
  }
};
