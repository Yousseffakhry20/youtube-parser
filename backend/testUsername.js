// Test script to verify the API works with @username URLs
// This requires the server to be running on port 4000

async function testApi() {
  try {
    // Test with a sample YouTube channel URL with @username
    const channelUrl = "https://www.youtube.com/@GoogleDevelopers";

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

    // Also test getting all videos
    const allVideosResponse = await fetch(`http://localhost:4000/api/videos`);
    const allVideosData = await allVideosResponse.json();

    console.log("\nTotal Videos in Database:", allVideosData.videos.length);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testApi();
