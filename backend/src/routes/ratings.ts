import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database";
import { Rating } from "../types";

const router = Router();

// Create rating
router.post("/", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const rating: Partial<Rating> = {
      rating: req.body.rating,
      comment: req.body.comment,
      fromUserId: new ObjectId(req.body.fromUserId),
      createdAt: new Date(),
    };

    // Rating can be for outfit or user
    if (req.body.outfitId) {
      rating.outfitId = new ObjectId(req.body.outfitId);

      // Update outfit rating
      const ratings = await db
        .collection("ratings")
        .find({ outfitId: rating.outfitId })
        .toArray();

      const totalRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) + req.body.rating;
      const count = ratings.length + 1;
      const avgRating = totalRating / count;

      await db.collection("outfits").updateOne(
        { _id: rating.outfitId },
        {
          $set: {
            rating: avgRating,
            totalRatings: count,
          },
        }
      );
    }

    if (req.body.toUserId) {
      rating.toUserId = new ObjectId(req.body.toUserId);

      // Update user rating
      const ratings = await db
        .collection("ratings")
        .find({ toUserId: rating.toUserId })
        .toArray();

      const totalRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) + req.body.rating;
      const count = ratings.length + 1;
      const avgRating = totalRating / count;

      await db.collection("users").updateOne(
        { _id: rating.toUserId },
        {
          $set: {
            rating: avgRating,
            totalRatings: count,
          },
        }
      );
    }

    if (req.body.rentalId) {
      rating.rentalId = new ObjectId(req.body.rentalId);
    }

    const result = await db.collection("ratings").insertOne(rating);
    const createdRating = await db
      .collection("ratings")
      .findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      data: {
        ...createdRating,
        id: createdRating?._id.toString(),
      },
    });
  } catch (error) {
    console.error("Create rating error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create rating",
    });
  }
});

// Get ratings for outfit
router.get("/outfit/:outfitId", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const ratings = await db
      .collection("ratings")
      .find({ outfitId: new ObjectId(req.params.outfitId) })
      .sort({ createdAt: -1 })
      .toArray();

    const ratingsWithId = ratings.map((rating) => ({
      ...rating,
      id: rating._id.toString(),
    }));

    res.json({
      success: true,
      data: ratingsWithId,
    });
  } catch (error) {
    console.error("Get outfit ratings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get outfit ratings",
    });
  }
});

// Get ratings for user
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const ratings = await db
      .collection("ratings")
      .find({ toUserId: new ObjectId(req.params.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    const ratingsWithId = ratings.map((rating) => ({
      ...rating,
      id: rating._id.toString(),
    }));

    res.json({
      success: true,
      data: ratingsWithId,
    });
  } catch (error) {
    console.error("Get user ratings error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user ratings",
    });
  }
});

// Update rating
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const { rating, comment } = req.body;
    const updates: any = {};

    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;

    const result = await db
      .collection("ratings")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Rating not found",
      });
    }

    const updatedRating = await db.collection("ratings").findOne({
      _id: new ObjectId(req.params.id),
    });

    // Recalculate average ratings if rating value changed
    if (rating !== undefined && updatedRating) {
      if (updatedRating.outfitId) {
        const ratings = await db
          .collection("ratings")
          .find({ outfitId: updatedRating.outfitId })
          .toArray();

        const avgRating =
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        await db
          .collection("outfits")
          .updateOne(
            { _id: updatedRating.outfitId },
            { $set: { rating: avgRating } }
          );
      }

      if (updatedRating.toUserId) {
        const ratings = await db
          .collection("ratings")
          .find({ toUserId: updatedRating.toUserId })
          .toArray();

        const avgRating =
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

        await db
          .collection("users")
          .updateOne(
            { _id: updatedRating.toUserId },
            { $set: { rating: avgRating } }
          );
      }
    }

    res.json({
      success: true,
      data: {
        ...updatedRating,
        id: updatedRating?._id.toString(),
      },
    });
  } catch (error) {
    console.error("Update rating error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update rating",
    });
  }
});

// Delete rating
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const rating = await db.collection("ratings").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: "Rating not found",
      });
    }

    await db
      .collection("ratings")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    // Recalculate averages
    if (rating.outfitId) {
      const ratings = await db
        .collection("ratings")
        .find({ outfitId: rating.outfitId })
        .toArray();

      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      await db.collection("outfits").updateOne(
        { _id: rating.outfitId },
        {
          $set: {
            rating: avgRating,
            totalRatings: ratings.length,
          },
        }
      );
    }

    if (rating.toUserId) {
      const ratings = await db
        .collection("ratings")
        .find({ toUserId: rating.toUserId })
        .toArray();

      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

      await db.collection("users").updateOne(
        { _id: rating.toUserId },
        {
          $set: {
            rating: avgRating,
            totalRatings: ratings.length,
          },
        }
      );
    }

    res.json({
      success: true,
      data: { message: "Rating deleted successfully" },
    });
  } catch (error) {
    console.error("Delete rating error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete rating",
    });
  }
});

export default router;
