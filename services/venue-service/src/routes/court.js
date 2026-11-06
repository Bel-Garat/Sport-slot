import { Router } from "express";
import {
  AppError,
  invalidDtoIn,
  unsupportedKeys,
  notAuthenticated,
  notAuthorized,
} from "@sportslot/api-format";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parsePageNumber(value, defaultValue, minimum) {
  if (value === undefined) return defaultValue;

  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < minimum) {
    return null;
  }

  return number;
}

export function createCourtRouter({
  db,
  gatewaySecret = process.env.GATEWAY_SECRET,
}) {
  const router = Router();

  router.get("/list", async (req, res) => {
    const { venueId } = req.query;

    const missingKeyMap = {};
    const invalidTypeKeyMap = {};
    const invalidValueKeyMap = {};

    if (venueId === undefined) {
      missingKeyMap.venueId = "venueId je povinný.";
    } else if (typeof venueId !== "string") {
      invalidTypeKeyMap.venueId = "venueId musí být řetězec.";
    } else if (!UUID_PATTERN.test(venueId)) {
      invalidValueKeyMap.venueId = "venueId musí být platné UUID.";
    }

    const pageIndex = parsePageNumber(req.query.pageIndex, 0, 0);
    const pageSize = parsePageNumber(req.query.pageSize, 20, 1);

    if (pageIndex === null) {
      invalidValueKeyMap.pageIndex = "pageIndex musí být celé číslo od 0.";
    }

    if (pageSize === null) {
      invalidValueKeyMap.pageSize = "pageSize musí být kladné celé číslo.";
    }

    if (
      Object.keys(missingKeyMap).length ||
      Object.keys(invalidTypeKeyMap).length ||
      Object.keys(invalidValueKeyMap).length
    ) {
      throw invalidDtoIn({
        missingKeyMap,
        invalidTypeKeyMap,
        invalidValueKeyMap,
      });
    }

    const skip = pageIndex * pageSize;

    if (!Number.isSafeInteger(skip)) {
      throw invalidDtoIn({
        invalidValueKeyMap: {
          pageIndex: "Požadovaná stránka je příliš vysoká.",
        },
      });
    }

    const venue = await db.venue.findUnique({
      where: { id: venueId },
      select: { id: true },
    });

    if (!venue) {
      throw new AppError("venueDoesNotExist", "Sportoviště nenalezeno.", 404, {
        venueId,
      });
    }

    const where = { venueId };

    const [total, itemList] = await Promise.all([
      db.court.count({ where }),
      db.court.findMany({
        where,
        orderBy: [{ name: "asc" }, { id: "asc" }],
        skip,
        take: pageSize,
        select: {
          id: true,
          venueId: true,
          name: true,
          sport: true,
          surface: true,
          indoor: true,
        },
      }),
    ]);

    res.json({
      itemList,
      pageInfo: {
        pageIndex,
        pageSize,
        total,
      },
      uuAppErrorMap: unsupportedKeys(req, req.query, [
        "venueId",
        "pageIndex",
        "pageSize",
      ]),
    });
  });


router.post("/create", async (req, res) => {
  // 1. Only the trusted gateway may forward authenticated requests.
  if (typeof gatewaySecret !== "string" || gatewaySecret.length < 32) {
    throw new AppError(
      "gatewayUnavailable",
      "Ověření gateway není nakonfigurováno.",
      503,
    );
  }

  if (req.get("x-gateway-secret") !== gatewaySecret) {
    throw notAuthenticated();
  }

  const userId = req.get("x-user-id");
  const roles = (req.get("x-user-roles") ?? "").split(",");

  if (!userId || !UUID_PATTERN.test(userId)) {
    throw notAuthenticated();
  }

  if (!roles.includes("PLAYER") || !roles.includes("MANAGER")) {
    throw notAuthorized();
  }

  // 2. Validate the request body.
  const dtoIn = req.body;

  if (!dtoIn || typeof dtoIn !== "object" || Array.isArray(dtoIn)) {
    throw invalidDtoIn({
      invalidTypeKeyMap: {
        dtoIn: "Tělo požadavku musí být JSON objekt.",
      },
    });
  }

  const requiredKeys = [
    "venueId",
    "name",
    "sport",
    "surface",
    "indoor",
  ];

  const missingKeyMap = {};
  const invalidTypeKeyMap = {};
  const invalidValueKeyMap = {};

  for (const key of requiredKeys) {
    if (!Object.hasOwn(dtoIn, key)) {
      missingKeyMap[key] = `${key} je povinný.`;
    }
  }

  const { venueId, name, sport, surface, indoor } = dtoIn;

  if (venueId !== undefined) {
    if (typeof venueId !== "string") {
      invalidTypeKeyMap.venueId = "venueId musí být řetězec.";
    } else if (!UUID_PATTERN.test(venueId)) {
      invalidValueKeyMap.venueId = "venueId musí být platné UUID.";
    }
  }

  for (const [key, maxLength] of [
    ["name", 50],
    ["sport", 50],
    ["surface", 100],
  ]) {
    const value = dtoIn[key];

    if (value === undefined) continue;

    if (typeof value !== "string") {
      invalidTypeKeyMap[key] = `${key} musí být řetězec.`;
    } else if (
      value.length < 1 ||
      value.length > maxLength ||
      !/\S/.test(value)
    ) {
      invalidValueKeyMap[key] =
        `${key} musí obsahovat 1 až ${maxLength} znaků a nesmí být prázdný.`;
    }
  }

  if (indoor !== undefined && typeof indoor !== "boolean") {
    invalidTypeKeyMap.indoor = "indoor musí být boolean.";
  }

  if (
    Object.keys(missingKeyMap).length ||
    Object.keys(invalidTypeKeyMap).length ||
    Object.keys(invalidValueKeyMap).length
  ) {
    throw invalidDtoIn({
      missingKeyMap,
      invalidTypeKeyMap,
      invalidValueKeyMap,
    });
  }

  // 3. Check that the venue exists and belongs to this manager.
  const venue = await db.venue.findUnique({
    where: { id: venueId },
    select: { id: true, managerId: true },
  });

  if (!venue) {
    throw new AppError(
      "venueDoesNotExist",
      "Sportoviště nenalezeno.",
      404,
      { venueId },
    );
  }

  if (venue.managerId !== userId) {
    throw notAuthorized();
  }

  // 4. Create the court. PostgreSQL enforces unique (venueId, name).
  let court;

  try {
    court = await db.court.create({
      data: {
        venueId,
        name,
        sport,
        surface,
        indoor,
      },
      select: {
        id: true,
        venueId: true,
        name: true,
        sport: true,
        surface: true,
        indoor: true,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      throw new AppError(
        "courtAlreadyExists",
        "Kurt s tímto názvem už existuje.",
        409,
        { venueId, name },
      );
    }

    throw error;
  }

  // 5. Return the documented response format.
  res.status(200).json({
    ...court,
    uuAppErrorMap: unsupportedKeys(req, dtoIn, requiredKeys),
  });
});

  return router;
}
