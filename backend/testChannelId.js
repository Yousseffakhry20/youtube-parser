// Test script to verify the API works with channel ID URLs
// This requires the server to be running on port 4000

async function testApi() {
  try {
    // Test with a sample YouTube channel URL with channel ID
    const channelUrl =
      "https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw";

    console.log(`Testing API with channel URL: ${channelUrl}`);

    const response = await fetch(
      `http://localhost:4000/api/channel/videos?channelUrl=${encodeURIComponent(
        channelUrl
      )}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      return;
    }

    const data = await response.json();

    console.log("API Response:");
    console.log(`Found ${data.categories.length} categories`);

    // Show a summary of the categories
    data.categories.forEach((category) => {
      console.log(`- ${category.name}: ${category.videos.length} videos`);
    });
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testApi();
