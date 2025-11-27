// Simple test script to verify the API works
// This requires the server to be running on port 4000

async function testApi() {
  try {
    // Test with a sample YouTube channel ID
    // This is the channel ID for Google Developers
    const channelId = "UC_x5XG1OV2P6uZZ5FSM9Ttw";

    console.log(`Testing API with channel ID: ${channelId}`);

    const response = await fetch(
      `http://localhost:4000/api/channel/videos?channelId=${channelId}`
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
