// Simple test script to verify the API works with channel URLs
// This requires the server to be running on port 4000

async function testApi() {
  try {
    // Test with a sample YouTube channel URL
    const channelUrl =
      "https://www.googleapis.com/youtube/v3/channels/@AGMADSHAR7";

    console.log(`Testing API with channel URL: ${channelUrl}`);

    const response = await fetch(
      `http://localhost:4000/api/channel/videos?channelUrl=${encodeURIComponent(
        channelUrl
      )}`
    );
    const data = await response.json();

    console.log("API Response:");
    console.log(JSON.stringify(data, null, 2));

    // Also test getting all videos
    const allVideosResponse = await fetch(`http://localhost:4000/api/videos`);
    const allVideosData = await allVideosResponse.json();

    console.log("\nAll Videos:");
    console.log(JSON.stringify(allVideosData, null, 2));
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testApi();
