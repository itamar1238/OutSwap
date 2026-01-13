import { Request, Response, Router } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database";
import { Rental, RentalStatus } from "../types";

const router = Router();

// Helper function to calculate price
function calculateRentalPrice(
  startDate: Date,
  endDate: Date,
  pricePerHour: number,
  pricePerDay: number
): number {
  const hours = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  );
  const days = Math.ceil(hours / 24);

  const hourlyTotal = hours * pricePerHour;
  const dailyTotal = days * pricePerDay;

  return Math.min(hourlyTotal, dailyTotal);
}

// Create rental request
router.post("/", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    // Get outfit details for price calculation
    const outfit = await db.collection("outfits").findOne({
      _id: new ObjectId(req.body.outfitId),
    });

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: "Outfit not found",
      });
    }

    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);

    const totalPrice = calculateRentalPrice(
      startDate,
      endDate,
      outfit.pricePerHour,
      outfit.pricePerDay
    );

    const rental: Partial<Rental> = {
      outfitId: new ObjectId(req.body.outfitId),
      renterId: new ObjectId(req.body.renterId),
      ownerId: outfit.ownerId,
      startDate,
      endDate,
      totalPrice,
      status: RentalStatus.PENDING,
      notes: req.body.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("rentals").insertOne(rental);
    const createdRental = await db
      .collection("rentals")
      .findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      data: {
        ...createdRental,
        id: createdRental?._id.toString(),
      },
    });
  } catch (error) {
    console.error("Create rental error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create rental request",
    });
  }
});

// Confirm rental (owner action)
router.post("/:id/confirm", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const result = await db.collection("rentals").updateOne(
      { _id: new ObjectId(req.params.id), status: RentalStatus.PENDING },
      {
        $set: {
          status: RentalStatus.CONFIRMED,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Rental not found or not in pending status",
      });
    }

    const rental = await db.collection("rentals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({
      success: true,
      data: {
        ...rental,
        id: rental?._id.toString(),
      },
    });
  } catch (error) {
    console.error("Confirm rental error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to confirm rental",
    });
  }
});

// Mark rental as returned
router.post("/:id/return", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const result = await db.collection("rentals").updateOne(
      { _id: new ObjectId(req.params.id), status: RentalStatus.ACTIVE },
      {
        $set: {
          status: RentalStatus.RETURNED,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Rental not found or not in active status",
      });
    }

    const rental = await db.collection("rentals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({
      success: true,
      data: {
        ...rental,
        id: rental?._id.toString(),
      },
    });
  } catch (error) {
    console.error("Return rental error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to mark rental as returned",
    });
  }
});

// Cancel rental
router.post("/:id/cancel", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const result = await db.collection("rentals").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status: RentalStatus.CANCELLED,
          cancelReason: req.body.reason,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    const rental = await db.collection("rentals").findOne({
      _id: new ObjectId(req.params.id),
    });

    res.json({
      success: true,
      data: {
        ...rental,
        id: rental?._id.toString(),
      },
    });
  } catch (error) {
    console.error("Cancel rental error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to cancel rental",
    });
  }
});

// Get rentals by renter
router.get("/renter/:userId", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const rentals = await db
      .collection("rentals")
      .find({ renterId: new ObjectId(req.params.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    const rentalsWithId = rentals.map((rental) => ({
      ...rental,
      id: rental._id.toString(),
    }));

    res.json({
      success: true,
      data: rentalsWithId,
    });
  } catch (error) {
    console.error("Get renter rentals error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get renter rentals",
    });
  }
});

// Get rentals by owner (for their outfits)
router.get("/owner/:userId", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const rentals = await db
      .collection("rentals")
      .find({ ownerId: new ObjectId(req.params.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    const rentalsWithId = rentals.map((rental) => ({
      ...rental,
      id: rental._id.toString(),
    }));

    res.json({
      success: true,
      data: rentalsWithId,
    });
  } catch (error) {
    console.error("Get owner rentals error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get owner rentals",
    });
  }
});

// Get rental by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const db = getDatabase();

    const rental = await db.collection("rentals").findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!rental) {
      return res.status(404).json({
        success: false,
        error: "Rental not found",
      });
    }

    res.json({
      success: true,
      data: {
        ...rental,
        id: rental._id.toString(),
      },
    });
  } catch (error) {
    console.error("Get rental error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get rental",
    });
  }
});

export default router;
