import { Router } from "express";
import { AppError, invalidDtoIn, unsupportedKeys } from "@sportslot/api-format";

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

export function createCourtRouter({ db }) {
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

  return router;
}
