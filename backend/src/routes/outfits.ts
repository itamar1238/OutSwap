import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database";
import { Outfit, OutfitSearchParams } from "../types";

const router = Router();

// Create outfit
router.post("/", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const outfit: Partial<Outfit> = {
      ...req.body,
      ownerId: new ObjectId(req.body.ownerId),
      createdAt: new Date(),
      updatedAt: new Date(),
      rating: 0,
      totalRatings: 0,
      available: true,
    };

    // Handle location coordinates if provided
    if (req.body.location) {
      outfit.location = {
        ...req.body.location,
        coordinates: req.body.location.coordinates || undefined,
      };
    }

    const result = await db.collection("outfits").insertOne(outfit);

    const createdOutfit = await db
      .collection("outfits")
      .findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      data: {
        ...createdOutfit,
        id: createdOutfit?._id.toString(),
      },
    });
  } catch (error) {
    console.error("Create outfit error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create outfit",
    });
  }
});

// Search outfits
router.post("/search", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const params: OutfitSearchParams = req.body;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = { available: true };

    // Text search
    if (params.query) {
      query.$text = { $search: params.query };
    }

    // Category filter
    if (params.category) {
      query.category = params.category;
    }

    // Size filter
    if (params.size) {
      query.size = params.size;
    }

    // Price range filter
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      query.pricePerDay = {};
      if (params.minPrice !== undefined) {
        query.pricePerDay.$gte = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        query.pricePerDay.$lte = params.maxPrice;
      }
    }

    // Location/proximity filter
    if (params.location?.coordinates && params.radius) {
      query["location.coordinates"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: params.location.coordinates,
          },
          $maxDistance: params.radius,
        },
      };
    }

    // Build sort
    let sort: any = {};
    switch (params.sortBy) {
      case "price-low":
        sort.pricePerDay = 1;
        break;
      case "price-high":
        sort.pricePerDay = -1;
        break;
      case "rating-high":
        sort.rating = -1;
        break;
      case "newest":
        sort.createdAt = -1;
        break;
      case "proximity":
        // Proximity sorting is handled by $near in query
        break;
      default:
        sort.createdAt = -1;
    }

    const [outfits, total] = await Promise.all([
      db
        .collection("outfits")
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection("outfits").countDocuments(query),
    ]);

    // Add id field for frontend compatibility
    const outfitsWithId = outfits.map((outfit) => ({
      ...outfit,
      id: outfit._id.toString(),
    }));

    res.json({
      success: true,
      data: {
        data: outfitsWithId,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search outfits error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search outfits",
    });
  }
});

// Get outfit by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const outfit = await db.collection("outfits").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: "Outfit not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...outfit,
        id: outfit._id.toString(),
      },
    });
  } catch (error) {
    console.error("Get outfit error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get outfit",
    });
  }
});

// Get outfits by owner
router.get("/owner/:ownerId", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const outfits = await db
      .collection("outfits")
      .find({ ownerId: new ObjectId(req.params.ownerId) })
      .sort({ createdAt: -1 })
      .toArray();

    const outfitsWithId = outfits.map((outfit) => ({
      ...outfit,
      id: outfit._id.toString(),
    }));

    res.json({
      success: true,
      data: outfitsWithId,
    });
  } catch (error) {
    console.error("Get owner outfits error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get owner outfits",
    });
  }
});

// Update outfit
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { id, _id, createdAt, ownerId, rating, totalRatings, ...updates } =
      req.body;

    const result = await db.collection("outfits").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Outfit not found",
      });
    }

    const updatedOutfit = await db.collection("outfits").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({
      success: true,
      data: {
        ...updatedOutfit,
        id: updatedOutfit?._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update outfit error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update outfit",
    });
  }
});

// Delete outfit
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const result = await db.collection("outfits").deleteOne({
      _id: new ObjectId(req.params.id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Outfit not found",
      });
    }

    res.json({
      success: true,
      data: { message: "Outfit deleted successfully" },
    });
  } catch (error) {
    console.error("Delete outfit error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete outfit",
    });
  }
});

// Get nearby outfits
router.get(
  "/nearby/:latitude/:longitude",
  async (req: Request, res: Response) => {
    try {
      const db = getDatabase();
      const latitude = parseFloat(req.params.latitude);
      const longitude = parseFloat(req.params.longitude);
      const radius = parseInt(req.query.radius as string) || 8046.72; // Default 5 miles in meters

      const outfits = await db
        .collection("outfits")
        .find({
          available: true,
          "location.coordinates": {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              $maxDistance: radius,
            },
          },
        })
        .limit(50)
        .toArray();

      const outfitsWithId = outfits.map((outfit) => ({
        ...outfit,
        id: outfit._id.toString(),
      }));

      res.json({
        success: true,
        data: outfitsWithId,
      });
    } catch (error) {
      console.error("Get nearby outfits error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to get nearby outfits",
      });
    }
  }
);

export default router;
