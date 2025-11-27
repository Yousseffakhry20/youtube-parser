// Test script to verify the API works with multiple channel URLs
// This requires the server to be running on port 4000

async function testApi() {
  try {
    // Test with multiple YouTube channel URLs
    const channelUrls = [
      "https://www.youtube.com/@GoogleDevelopers",
      "https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw",
    ];

    console.log(`Testing API with multiple channel URLs:`);
    channelUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });

    const response = await fetch(
      `http://localhost:4000/api/channels/videos?channelUrls=${encodeURIComponent(
        channelUrls.join(",")
      )}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      return;
    }

    const data = await response.json();

    console.log("\nAPI Response:");
    console.log(`Found ${data.categories.length} categories`);
    console.log(
      `Total videos: ${data.categories.reduce(
        (sum, cat) => sum + cat.videos.length,
        0
      )}`
    );

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
