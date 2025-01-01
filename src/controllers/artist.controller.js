import { Artist } from "../models/artist.model.js";

export const addArtist = async (req, res) => {
  try {
    const { name, grammy, hidden } = req.body;

    if (!name || !grammy) {
      const missingField = !name ? "name" : "grammy";
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request, Reason: Missing ${missingField}`,
        error: null,
      });
    }

    const exisitingArtist = await Artist.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (exisitingArtist) {
      return res.status(409).json({
        status: 409,
        data: null,
        message: "Artist already exists.",
        error: null,
      });
    }

    await Artist.create({
      name,
      grammy,
      hidden: hidden ? hidden : false,
    });

    return res.status(201).json({
      status: 201,
      data: null,
      message: "Artist created successfully.",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const retrieveArtists = async (req, res) => {
  const { limit = 5, offset = 0 } = req.query;
  if (isNaN(limit) || isNaN(offset)) {
    return res.status(400).json({
      status: 400,
      data: null,
      message: "Bad request: 'limit' and 'offset' must be numbers.",
      error: null,
    });
  }
  try {
    const result = await Artist.find().skip(offset).limit(limit);
    return res.status(200).json({
      status: 200,
      data: result,
      message: "Artists retrieved successfully.",
      error: null,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const retrieveArtist = async (req, res) => {
  const { artist_id } = req.params;

  try {
    if (!artist_id) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request: Missing artist_id",
        error: null,
      });
    }

    const artist = await Artist.findOne({ artist_id });

    if (!artist) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Artist not found.",
        error: null,
      });
    }

    return res.status(200).json({
      status: 200,
      data: artist,
      message: "Artist retrieved successfully.",
      error: null,
    });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      status: 500,
      data: null,
      message: "Internal server error.",
      error: error.response?.data?.message || error.message || "Unknown error",
    });
  }
};

export const updateArtist = async (req, res) => {
  const { artist_id } = req.params;
  const { name, grammy, hidden } = req.body;

  if (!artist_id) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request: Missing artist_id",
    });
  }

  try {
    const artist = await Artist.findOne({ artist_id });

    if (!artist) {
      return res.status(404).json({
        status: 404,
        message: "Artist not found.",
      });
    }

    await Artist.findOneAndUpdate(
      { artist_id },
      { $set: { name, grammy, hidden } }
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
export const deleteArtist = async (req, res) => {
  const { artist_id } = req.params;
  if (!artist_id) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request: Missing artist_id",
    });
  }

  try {
    const artist = await Artist.findOne({ artist_id });

    if (!artist) {
      return res.status(404).json({
        status: 404,
        message: "Artist not found.",
      });
    }

    await Artist.findOneAndDelete({ artist_id });

    return res.status(200).json({
      status: 200,
      data: {
        artist_id: artist_id,
      },
      message: `Artist ${artist?.name} deleted successfully`,
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
