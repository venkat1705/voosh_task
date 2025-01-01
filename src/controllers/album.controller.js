import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";

export const addAlbum = async (req, res) => {
  const { artist_id, name, year, hidden } = req.body;

  try {
    if (!artist_id || !name || !year) {
      const missingField = !artist_id ? "artist_id" : !name ? "name" : "year";
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request: Missing ${missingField}`,
      });
    }

    const exisitingArtist = await Artist.findOne({ artist_id });

    if (!exisitingArtist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Resource Doesn't Exist.",
        error: null,
      });
    }

    const existingAlbum = await Album.findOne({ name });

    if (existingAlbum) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: "Album already exists.",
        error: null,
      });
    }

    await Album.create({
      artist_id: artist_id,
      name,
      year,
      hidden: hidden ? hidden : false,
    });

    return res.status(201).json({
      status: 201,
      data: null,
      message: "Album created successfully.",
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

export const retrieveAlbums = async (req, res) => {
  try {
    const { limit = 5, offset = 0, artist_id, hidden } = req.query;

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

    if (hidden !== undefined) {
      match["hidden"] = hidden === "true";
    }

    const albums = await Album.aggregate([
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
        $match: match,
      },
      {
        $skip: parseInt(offset, 10),
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);

    const formattedAlbums = albums.map((album) => ({
      album_id: album.album_id,
      artist_name: album.artist?.name || null,
      name: album.name,
      year: album.year,
      hidden: album.hidden,
    }));

    return res.status(200).json({
      status: 200,
      data: formattedAlbums,
      message: "Albums fetched successfully.",
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

export const retrieveAlbum = async (req, res) => {
  const { album_id } = req.params;

  try {
    if (!album_id) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request: Missing album_id",
        error: null,
      });
    }

    const album = await Album.aggregate([
      {
        $match: { album_id },
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
    ]);

    if (!album.length) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Album not found.",
        error: null,
      });
    }

    const formattedAlbum = {
      album_id: album[0].album_id,
      artist_name: album[0].artist?.name || null,
      name: album[0].name,
      year: album[0].year,
      hidden: album[0].hidden,
    };

    return res.status(200).json({
      status: 200,
      data: formattedAlbum,
      message: "Album retrieved successfully.",
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

export const updateAlbum = async (req, res) => {
  const { album_id } = req.params;
  const { name, year, hidden } = req.body;

  if (!album_id) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request: Missing album_id",
    });
  }

  try {
    const album = await Album.findOne({ album_id });

    if (!album) {
      return res.status(404).json({
        status: 404,
        message: "Resource Doesn't Exist.",
      });
    }

    await Album.findOneAndUpdate(
      { album_id },
      { $set: { name, year, hidden } }
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

export const deleteAlbum = async (req, res) => {
  const { album_id } = req.params;
  if (!album_id) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request: Missing album_id",
    });
  }

  try {
    const album = await Album.findOne({ album_id });

    if (!album) {
      return res.status(404).json({
        status: 404,
        message: "Resource Doesn't Exist.",
      });
    }

    await Album.findOneAndDelete({ album_id });

    return res.status(200).json({
      status: 200,
      data: {
        album_id: album_id,
      },
      message: `Album ${album?.name} deleted successfully`,
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
