// Simple service to fetch the local JSON data
const ApiService = {
  async fetchAll(url) {
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      console.error('API fetch error', e);
      return null;
    }
  }
};
