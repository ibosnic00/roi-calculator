export async function loadLocationData() {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}neighbourhood_configuration.json`);
    if (!response.ok) {
      throw new Error('Failed to load neighborhood configuration');
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading location data:', error);
    return {};
  }
} 