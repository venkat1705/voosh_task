import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { Track } from "../models/track.model.js";

export const addTrack = async (req, res) => {
  const { artist_id, album_id, name, duration, hidden } = req.body;

  try {
    if (!artist_id || !album_id || !name || !duration) {
      const missingField = !artist_id
        ? "artist_id"
        : !album_id
        ? "album_id"
        : !name
        ? "name"
        : "duration";
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request: Missing ${missingField}`,
      });
    }

    const [exisitingArtist, exisitingAlbum, existingTrack] = await Promise.all([
      Artist.findOne({ artist_id }),
      Album.findOne({ album_id }),
      Track.findOne({
        name: { $regex: `^${name}$`, $options: "i" },
      }),
    ]);

    if (existingTrack) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: "Track already exists.",
        error: null,
      });
    }

    if (!exisitingArtist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Resource Doesn't Exist.",
        error: null,
      });
    }
    if (!exisitingAlbum) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Resource Doesn't Exist.",
        error: null,
      });
    }

    await Track.create({
      artist_id: artist_id,
      album_id: album_id,
      name,
      duration,
      hidden: hidden ? hidden : false,
    });

    return res.status(201).json({
      status: 201,
      data: null,
      message: "Track created successfully.",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const retrieveTracks = async (req, res) => {
  try {
    const { limit = 5, offset = 0, artist_id, album_id, hidden } = req.query;

    if (isNaN(limit) || isNaN(offset)) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad request: 'limit' and 'offset' must be numbers.",
        error: null,
      });
    }

    const match = {};

    if (artist_id) {
      match["artist_id"] = artist_id;
    }
    if (album_id) {
      match["album_id"] = album_id;
    }
    if (hidden) {
      match["hidden"] = hidden === "true";
    }

    const tracks = await Track.aggregate([
      {
        $lookup: {
          from: "artists",
          localField: "artist_id",
          foreignField: "artist_id",
          as: "artist",
        },
      },
      {
        $unwind: {
          path: "$artist",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "albums",
          localField: "album_id",
          foreignField: "album_id",
          as: "album",
        },
      },
      {
        $unwind: {
          path: "$album",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: match,
      },
      {
        $skip: parseInt(offset, 10),
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);

    const formattedTracks = tracks.map((track) => ({
      track_id: track.track_id,
      artist_name: track.artist?.name || null,
      album_name: track.album?.name || null,
      name: track.name,
      duration: track.duration,
      hidden: track.hidden,
    }));

    return res.status(200).json({
      status: 200,
      data: formattedTracks,
      message: "Tracks fetched successfully.",
      error: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const retrieveTrack = async (req, res) => {
  const { track_id } = req.params;

  try {
    if (!track_id) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request: Missing track_id",
        error: null,
      });
    }

    const track = await Track.aggregate([
      {
        $match: { track_id },
      },
      {
        $lookup: {
          from: "artists",
          localField: "artist_id",
          foreignField: "artist_id",
          as: "artist",
        },
      },
      {
        $unwind: {
          path: "$artist",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "albums",
          localField: "album_id",
          foreignField: "album_id",
          as: "album",
        },
      },
      {
        $unwind: {
          path: "$album",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!track.length) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Track not found.",
        error: null,
      });
    }

    const formattedTrack = {
      track_id: track[0].track_id,
      artist_name: track[0].artist?.name || null,
      album_name: track[0].album?.name || null,
      name: track[0].name,
      duration: track[0].duration,
      hidden: track[0].hidden,
    };

    return res.status(200).json({
      status: 200,
      data: formattedTrack,
      message: "Track fetched successfully.",
      error: null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const updateTrack = async (req, res) => {
  const { track_id } = req.params;
  const { name, duration, hidden } = req.body;

  if (!track_id) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request: Missing track_id",
    });
  }

  try {
    const track = await Track.findOne({ track_id });

    if (!track) {
      return res.status(404).json({
        status: 404,
        message: "Resource Doesn't Exist.",
      });
    }

    await Track.findOneAndUpdate(
      { track_id },
      { $set: { name, duration, hidden } }
    );

    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const deleteTrack = async (req, res) => {
  const { track_id } = req.params;
  if (!track_id) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request: Missing track_id",
    });
  }

  try {
    const track = await Track.findOne({ track_id });

    if (!track) {
      return res.status(404).json({
        status: 404,
        message: "Resource Doesn't Exist.",
      });
    }

    await Track.findOneAndDelete({ track_id });

    return res.status(200).json({
      status: 200,
      data: {
        track_id: track_id,
      },
      message: `Album ${track?.name} deleted successfully`,
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};
