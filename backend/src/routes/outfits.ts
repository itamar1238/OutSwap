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

    // Beautiful logging
    console.log("\x1b[36m╔════════════════════════════════════════╗\x1b[0m");
    console.log(
      "\x1b[36m║\x1b[0m      \x1b[1m🔍 OUTFIT SEARCH REQUEST\x1b[0m       \x1b[36m║\x1b[0m"
    );
    console.log("\x1b[36m╠════════════════════════════════════════╣\x1b[0m");
    if (params.query) {
      console.log(
        `\x1b[36m║\x1b[0m \x1b[33m📝 Query:\x1b[0m ${params.query.padEnd(
          27
        )} \x1b[36m║\x1b[0m`
      );
    }
    if (params.category) {
      console.log(
        `\x1b[36m║\x1b[0m \x1b[35m📂 Category:\x1b[0m ${params.category.padEnd(
          24
        )} \x1b[36m║\x1b[0m`
      );
    }
    if (params.size) {
      console.log(
        `\x1b[36m║\x1b[0m \x1b[34m👕 Size:\x1b[0m ${params.size.padEnd(
          28
        )} \x1b[36m║\x1b[0m`
      );
    }
    console.log(
      `\x1b[36m║\x1b[0m \x1b[32m📊 Sort:\x1b[0m ${params.sortBy.padEnd(
        28
      )} \x1b[36m║\x1b[0m`
    );
    console.log(
      `\x1b[36m║\x1b[0m \x1b[90m📄 Page:\x1b[0m ${page
        .toString()
        .padEnd(28)} \x1b[36m║\x1b[0m`
    );
    console.log("\x1b[36m╚════════════════════════════════════════╝\x1b[0m");

    let query: any = { available: true };
    let useRelevanceSort = false;

    // Smart search with relevance scoring
    if (params.query && params.query.trim()) {
      const searchTerm = params.query.trim();
      const titleRegex = new RegExp(searchTerm, "i"); // substring match in title
      const wordBoundaryRegex = new RegExp(`\\b${searchTerm}\\b`, "i"); // whole word match

      query.$or = [
        { title: titleRegex }, // Match anywhere in title
        { styleTags: { $in: [titleRegex] } }, // Match in style tags
        { description: wordBoundaryRegex }, // Only whole word matches in description
      ];

      // Use relevance-based sorting when searching
      useRelevanceSort = !params.sortBy || params.sortBy === "newest";

      console.log(`\x1b[33mApplying smart search for: "${searchTerm}"\x1b[0m`);
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

    let outfits: any[];
    let total: number;

    // If using search with relevance, fetch all matching results and sort by relevance
    if (useRelevanceSort && params.query) {
      const searchTerm = params.query.trim().toLowerCase();

      // Get all matching outfits (before pagination)
      const allMatching = await db.collection("outfits").find(query).toArray();

      // Calculate relevance score for each outfit
      const scoredOutfits = allMatching.map((outfit: any) => {
        let score = 0;
        const title = (outfit.title || "").toLowerCase();
        const description = (outfit.description || "").toLowerCase();
        const tags = (outfit.styleTags || []).map((t: string) =>
          t.toLowerCase()
        );

        // Exact title match (highest score)
        if (title === searchTerm) {
          score += 100;
        }
        // Title starts with search term
        else if (title.startsWith(searchTerm)) {
          score += 50;
        }
        // Title contains search term
        else if (title.includes(searchTerm)) {
          score += 30;
        }

        // Exact tag match
        if (tags.some((tag: string) => tag === searchTerm)) {
          score += 40;
        }
        // Tag contains search term
        else if (tags.some((tag: string) => tag.includes(searchTerm))) {
          score += 20;
        }

        // Whole word in description (lowest priority)
        const wordRegex = new RegExp(`\\b${searchTerm}\\b`, "i");
        if (wordRegex.test(description)) {
          score += 5;
        }

        return { ...outfit, _relevanceScore: score };
      });

      // Sort by relevance score
      scoredOutfits.sort((a, b) => b._relevanceScore - a._relevanceScore);

      // Apply pagination
      total = scoredOutfits.length;
      outfits = scoredOutfits.slice(skip, skip + limit);

      console.log(`\x1b[32mRelevance sorting: Found ${total} matches\x1b[0m`);
    } else {
      // Regular sorting (price, rating, newest)
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
        default:
          sort.createdAt = -1;
      }

      outfits = await db
        .collection("outfits")
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      total = await db.collection("outfits").countDocuments(query);
    }

    // Add id field for frontend compatibility
    const outfitsWithId = outfits.map((outfit) => ({
      ...outfit,
      id: outfit._id.toString(),
    }));

    const response = {
      success: true,
      data: {
        data: outfitsWithId,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    console.log("\x1b[32m╔════════════════════════════════════════╗\x1b[0m");
    console.log(
      "\x1b[32m║\x1b[0m        \x1b[1m✨ SEARCH SUCCESS\x1b[0m           \x1b[32m║\x1b[0m"
    );
    console.log("\x1b[32m╠════════════════════════════════════════╣\x1b[0m");
    console.log(
      `\x1b[32m║\x1b[0m \x1b[33m📦 Total Found:\x1b[0m ${total
        .toString()
        .padEnd(22)} \x1b[32m║\x1b[0m`
    );
    console.log(
      `\x1b[32m║\x1b[0m \x1b[36m📤 Returned:\x1b[0m ${outfitsWithId.length
        .toString()
        .padEnd(25)} \x1b[32m║\x1b[0m`
    );
    console.log(
      `\x1b[32m║\x1b[0m \x1b[35m📑 Pages:\x1b[0m ${Math.ceil(total / limit)
        .toString()
        .padEnd(28)} \x1b[32m║\x1b[0m`
    );
    console.log("\x1b[32m╚════════════════════════════════════════╝\x1b[0m");

    res.json(response);
  } catch (error) {
    console.log("\x1b[31m╔════════════════════════════════════════╗\x1b[0m");
    console.log(
      "\x1b[31m║\x1b[0m         \x1b[1m❌ SEARCH ERROR\x1b[0m            \x1b[31m║\x1b[0m"
    );
    console.log("\x1b[31m╠════════════════════════════════════════╣\x1b[0m");
    console.log(
      `\x1b[31m║\x1b[0m ${
        error instanceof Error
          ? error.message.substring(0, 38).padEnd(38)
          : "Unknown error".padEnd(38)
      } \x1b[31m║\x1b[0m`
    );
    console.log("\x1b[31m╚════════════════════════════════════════╝\x1b[0m");

    const errorResponse = {
      success: false,
      error: "Failed to search outfits",
    };
    res.status(500).json(errorResponse);
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
