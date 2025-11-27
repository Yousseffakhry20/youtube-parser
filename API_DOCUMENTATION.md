# YouTube Parser API Documentation

This API allows you to fetch videos from a YouTube channel, save them to a database, categorize them, and retrieve the categories with their corresponding videos.

## Setup

1. Ensure you have a YouTube API key from Google Cloud Console
2. Add the API key to your `.env` file:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   PORT=4000
   ```

## Endpoints

### 1. Fetch Channel Videos

```
GET /api/channel/videos?channelUrl={CHANNEL_URL}
```

**Description**: Fetches all videos from a specified YouTube channel, saves them to the database, categorizes them, and returns the categories with their videos.

**Parameters**:

- `channelUrl` (required): The URL of the YouTube channel (supports both channel ID and @username formats)

**Response**:

```json
{
  "categories": [
    {
      "id": "string",
      "name": "string",
      "videos": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "publishedAt": "string",
          "channelId": "string",
          "channelTitle": "string",
          "categoryId": "string",
          "tags": ["string"],
          "createdAt": "date"
        }
      ]
    }
  ]
}
```

### 2. Get All Videos

```
GET /api/videos
```

**Description**: Retrieves all videos stored in the database.

**Response**:

```json
{
  "videos": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "publishedAt": "string",
      "channelId": "string",
      "channelTitle": "string",
      "categoryId": "string",
      "tags": ["string"],
      "createdAt": "date"
    }
  ]
}
```

## Example Usage

To fetch videos from a channel:

```
GET http://localhost:4000/api/channel/videos?channelUrl=https://www.youtube.com/@GoogleDevelopers
```

Or with a channel ID:

```
GET http://localhost:4000/api/channel/videos?channelUrl=https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw
```

## Supported URL Formats

The API supports the following YouTube channel URL formats:

- Channel ID format: `https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw`
- Username format: `https://www.youtube.com/@username`

## Implementation Details

### Two-Step Process

The API implements a two-step process for fetching videos:

1. **Channel Resolution**:

   - For @username URLs, the API resolves the username to a channel ID using YouTube's API
   - For channel ID URLs, the API uses the provided ID directly

2. **Video Fetching**:
   - First, it fetches the channel's contentDetails to get the uploads playlist ID
   - Then, it fetches all playlist items from the uploads playlist
   - Finally, it retrieves detailed information for each video

### Categorization

Videos are categorized based on YouTube's category system. The categories include:

- Film & Animation
- Autos & Vehicles
- Music
- Pets & Animals
- Sports
- Travel & Events
- Gaming
- People & Blogs
- Comedy
- Entertainment
- News & Politics
- Howto & Style
- Education
- Science & Technology
- Nonprofits & Activism
- And more...

## Error Handling

The API includes comprehensive error handling for:

- Invalid or missing channel URLs
- Channels that cannot be found
- Issues with YouTube API calls
- Network or server errors

Errors are returned in a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```
