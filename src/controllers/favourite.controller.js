import { Album } from "../models/album.model.js";
import { Artist } from "../models/artist.model.js";
import { Favourite } from "../models/favourite.model.js";
import { Track } from "../models/track.model.js";

export const addFavourite = async (req, res) => {
  try {
    const { category, item_id } = req.body;

    if (!category || !item_id) {
      const missingField = !category ? "category" : "item_id";
      return res.status(400).json({
        status: 400,
        data: null,
        message: `Bad Request: Missing ${missingField}`,
      });
    }

    const categoryModelMap = {
      artist: { model: Artist, field: "artist_id" },
      album: { model: Album, field: "album_id" },
      track: { model: Track, field: "track_id" },
    };

    const categoryData = categoryModelMap[category];
    if (!categoryData) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Invalid, category should be artist,album,track",
      });
    }

    const existingItem = await categoryData.model.findOne({
      [categoryData.field]: item_id,
    });
    if (!existingItem) {
      return res.status(404).json({
        status: 404,
        data: null,
        message: "Resource Doesn't Exist.",
      });
    }

    await Favourite.create({ category, item_id });

    return res.status(201).json({
      status: 201,
      data: null,
      message: "Favorite added successfully.",
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

export const retrieveFavourites = async (req, res) => {
  const { limit = 5, offset = 0 } = req.query;
  const { category } = req.params;

  try {
    if (!category) {
      return res.status(400).json({
        status: 400,
        data: null,
        message: "Bad Request: Missing category",
        error: null,
      });
    }

    const favourites = await Favourite.aggregate([
      {
        $match: { category },
      },
      {
        $lookup: {
          from: `${category}s`,
          localField: "item_id",
          foreignField: "artist_id",
          as: category,
        },
      },
      {
        $unwind: {
          path: `$${category}`,
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $skip: parseInt(offset, 10),
      },
      {
        $limit: parseInt(limit, 10),
      },
    ]);

    const formattedFavourites = favourites.map((favourite) => ({
      favorite_id: favourite.favorite_id,
      category: favourite.category || null,
      item_id: favourite?.item_id,
      name: favourite?.[category]?.name,
      created_at: favourite.createdAt,
    }));

    return res.status(200).json({
      status: 200,
      data: formattedFavourites,
      message: "Favorites retrieved successfully.",
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

export const deleteFavourite = async (req, res) => {
  const { favorite_id } = req.params;
  if (!favorite_id) {
    return res.status(400).json({
      status: 400,
      message: "Bad Request: Missing favorite_id",
    });
  }

  try {
    const favorite = await Favourite.findOne({ favorite_id });

    if (!favorite) {
      return res.status(404).json({
        status: 404,
        message: "Resource Doesn't Exist.",
      });
    }

    await Favourite.findOneAndDelete({ favorite_id });

    return res.status(200).json({
      status: 200,
      data: null,
      message: `Favorite removed successfully`,
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
