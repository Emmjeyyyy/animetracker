// src/services/jikanApi.js
// JikanApiService - wrapper around Jikan API (v4)

const BASE_URL = "https://api.jikan.moe/v4";

const JikanApiService = {
  /**
   * Helper: Fetch JSON with error handling
   */
  async fetchJson(endpoint) {
    const url = `${BASE_URL}${endpoint}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Jikan API error: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      console.error(`Error fetching from ${url}:`, err);
      return [];
    }
  },

  /**
   * Get Top Anime (all-time)
   * @param {number} limit
   */
  async getTopAnime(limit = 10) {
    return await this.fetchJson(`/top/anime?limit=${limit}`);
  },

  /**
   * Get Top Anime of Current Year (safe + fallback)
   * @param {number} limit
   */
  async getTopAnimeThisYear(limit = 10) {
    const year = new Date().getFullYear();
    const results = await this.fetchJson(
      `/anime?start_date=${year}-01-01&end_date=${year}-12-31&order_by=score&sort=desc&limit=${limit}`
    );

    // Fallback: seasonal if empty
    if (!results || results.length === 0) {
      console.warn("No yearly top anime found, falling back to seasonal...");
      return await this.getSeasonalAnime();
    }

    return results;
  },

  /**
   * Get Seasonal Anime (current season)
   */
  async getSeasonalAnime() {
    return await this.fetchJson("/seasons/now");
  },

  /**
   * Get Anime Recommendations
   */
  async getAnimeRecommendations() {
    const recommendations = await this.fetchJson("/recommendations/anime");
    // Extract unique anime entries from recommendations
    const uniqueAnime = new Set();
    const processedRecommendations = recommendations
      .flatMap(rec => [rec.entry[0], rec.entry[1]]) // Get both entries from each recommendation
      .filter(anime => {
        if (!anime || uniqueAnime.has(anime.mal_id)) return false;
        uniqueAnime.add(anime.mal_id);
        return true;
      });
    return processedRecommendations;
  },

  /**
   * Get Random Anime (using Jikan's random endpoint)
   * @param {number} count
   */
  async getRandomAnime(count = 10) {
    const promises = Array.from({ length: count }, () =>
      this.fetchJson("/random/anime")
    );

    try {
      const results = await Promise.all(promises);
      return results.map(r => (Array.isArray(r) ? r[0] : r));
    } catch (err) {
      console.error("Error fetching random anime:", err);
      return [];
    }
  },

  /**
   * Search Anime by title
   * @param {string} query
   * @param {number} limit
   */
  async searchAnime(query, limit = 10) {
    if (!query) return [];
    return await this.fetchJson(
      `/anime?q=${encodeURIComponent(query)}&order_by=score&sort=desc&limit=${limit}`
    );
  },

  /**
   * Normalize anime data for UI
   */
  transformAnimeData(anime) {
    if (!anime) return null;
    return {
      id: anime.mal_id,
      title: anime.title || "Unknown",
      image:
        anime.images?.jpg?.large_image_url ||
        anime.images?.jpg?.image_url ||
        "",
      url: anime.url || "#",
      score: anime.score || "N/A",
      year:
        anime.year ||
        (anime.aired?.from ? new Date(anime.aired.from).getFullYear() : null),
      type: anime.type || "Unknown",
      episodes: anime.episodes || "N/A",
      status: anime.status || "Unknown",
      synopsis: anime.synopsis || "No synopsis available",
    };
  }
};

export default JikanApiService;
