import { NextResponse } from "next/server";
import connectDB from "@/backend/lib/db";
import User from "@/backend/models/user";
import Property from "@/backend/models/property";
import ApiError from "@/backend/utils/apierror";
import {
  getSecurityHeaders,
  securityLog,
  sanitizeInput,
} from "@/backend/lib/security";

// ==========================================
// ✅ ReDoS PROTECTION HELPER
// ==========================================
const escapeRegex = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ==========================================
// ✅ ALLOWED FILTERS (Whitelist)
// ==========================================
const ALLOWED_PROPERTY_TYPES = [
  "house",
  "apartment",
  "villa",
  "penthouse",
  "plot",
  "commercial",
  "office",
  "shop",
  "warehouse",
  "farmhouse",
  "flat",
  "studio",
];

const ALLOWED_PRICE_TYPES = ["sale", "rent"];
const ALLOWED_SORT_FIELDS = ["createdAt", "price", "title", "viewsCount"];
const ALLOWED_SORT_ORDERS = ["asc", "desc"];

// ==========================================
// ✅ MAIN HANDLER
// ==========================================
const getProperties = async (request) => {
  const startTime = Date.now();
  const requestId =
    crypto.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // ==========================================
    // 1. PAGINATION & SORTING
    // ==========================================
    let page = parseInt(searchParams.get("page")) || 1;
    let limit = parseInt(searchParams.get("limit")) || 10;

    page = Math.max(1, Math.min(1000, page));
    limit = Math.max(1, Math.min(100, limit));
    const skip = (page - 1) * limit;

    const sortField = ALLOWED_SORT_FIELDS.includes(searchParams.get("sortBy"))
      ? searchParams.get("sortBy")
      : "createdAt";
    const sortOrder = ALLOWED_SORT_ORDERS.includes(
      searchParams.get("sortOrder"),
    )
      ? searchParams.get("sortOrder")
      : "desc";

    // ==========================================
    // 2. FILTERS EXTRACT & SANITIZE
    // ==========================================
    const rawCity = searchParams.get("city") || "";
    const rawPropertyType = searchParams.get("propertyType") || "";
    const rawPriceType = searchParams.get("priceType") || "";
    const rawStatus = searchParams.get("status") || "";    // ✅ No default
    const rawSearch = searchParams.get("search") || "";
    const rawIsFeatured = searchParams.get("isFeatured");

    const city = sanitizeInput(rawCity).trim();
    const search = sanitizeInput(rawSearch).trim();

    const propertyType = ALLOWED_PROPERTY_TYPES.includes(
      rawPropertyType.toLowerCase(),
    )
      ? rawPropertyType.toLowerCase()
      : "";
    const priceType = ALLOWED_PRICE_TYPES.includes(rawPriceType.toLowerCase())
      ? rawPriceType.toLowerCase()
      : "";

    // ✅ STATUS: 'all' or empty => no filter; else must be valid
    const validStatuses = [
      "available",
      "sold",
      "rented",
      "pending",
      "unavailable",
    ];
    let status = rawStatus ? rawStatus.toLowerCase() : "";
    if (status && status !== "all" && !validStatuses.includes(status)) {
      status = ""; // invalid -> ignore
    }
    // Now status is either '' (no filter), 'all' (no filter), or a valid status

    // ==========================================
    // 3. BUILD SECURE QUERY
    // ==========================================
    const query = {
      isPublished: true, // Public: only published properties
    };

    if (city && city.length <= 100) {
      query.city = { $regex: `^${escapeRegex(city)}$`, $options: "i" };
    }
    if (propertyType) {
      query.propertyType = propertyType;
    }
    if (priceType) {
      query.priceType = priceType;
    }
    // ✅ Only add status filter if a specific status is provided (not 'all' and not empty)
    if (status && status !== "all") {
      query.status = status;
    }
    if (rawIsFeatured === "true") {
      query.isFeatured = true;
    }

    // ✅ SECURE TEXT SEARCH
    if (search && search.length <= 200) {
      const safeSearchRegex = { $regex: escapeRegex(search), $options: "i" };
      query.$or = [
        { title: safeSearchRegex },
        { description: safeSearchRegex },
        { location: safeSearchRegex },
        { propertyCode: safeSearchRegex },
      ];
    } else if (search && search.length > 200) {
      securityLog("SUSPICIOUS_SEARCH_QUERY", {
        requestId,
        searchLength: search.length,
        ip: request.headers.get("x-forwarded-for") || "unknown",
      });
    }

    // ==========================================
    // 4. DATABASE FETCH
    // ==========================================
    const [totalProperties, properties] = await Promise.all([
      Property.countDocuments(query).lean(),
      Property.find(query)
        .select("-__v -tokenVersion")
        .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate("addedBy", "name avatar")
        .lean(),
    ]);

    // ==========================================
    // 5. TRANSFORM DATA
    // ==========================================
    const transformedProperties = properties.map((property) => ({
      _id: property._id,
      propertyCode: property.propertyCode,
      title: property.title,
      description: property.description,
      price: property.price,
      priceType: property.priceType,
      currency: property.currency,
      location: property.location,
      city: property.city,
      area: property.area,
      address: property.address,
      coordinates: {
        latitude: property.latitude,
        longitude: property.longitude,
      },
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      kitchens: property.kitchens,
      areaSize: property.areaSize,
      areaUnit: property.areaUnit,
      floors: property.floors,
      yearBuilt: property.yearBuilt,
      features: property.features || [],
      amenities: property.amenities || [],
      images: property.images || [],
      thumbnail: property.thumbnail,
      status: property.status,
      isFeatured: property.isFeatured,
      contact: {
        name: property.contactName,
        phone: property.contactPhone,
        email: property.contactEmail,
      },
      addedBy: property.addedBy,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      viewsCount: property.viewsCount || 0,
      leadsCount: property.leadsCount || 0,
    }));

    const totalPages = Math.ceil(totalProperties / limit);
    const pagination = {
      currentPage: page,
      totalPages,
      totalItems: totalProperties,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    // ==========================================
    // 6. RESPONSE
    // ==========================================
    return NextResponse.json(
      {
        success: true,
        message: "Properties fetched successfully",
        total: totalProperties,
        data: transformedProperties,
        pagination: pagination,
      },
      {
        status: 200,
        headers: {
          ...getSecurityHeaders(),
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          "X-Request-Id": requestId,
          "X-Response-Time": `${Date.now() - startTime}ms`,
        },
      },
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    securityLog("GET_PROPERTIES_ERROR", {
      requestId,
      error: error.message,
      duration,
    });

    const statusCode = error.statusCode || 500;
    const message = error.message;

    return NextResponse.json(
      {
        success: false,
        message:
          process.env.NODE_ENV === "production"
            ? "Something went wrong"
            : message,
      },
      {
        status: statusCode,
        headers: {
          ...getSecurityHeaders(),
          "Cache-Control": "no-store",
          "X-Request-Id": requestId,
        },
      },
    );
  }
};

// ==========================================
// ✅ EXPORT GET
// ==========================================
export const GET = getProperties;

// ==========================================
// ✅ BLOCK OTHER METHODS
// ==========================================
const methodNotAllowed = () => {
  return NextResponse.json(
    { success: false, message: "Method not allowed on this endpoint" },
    { status: 405, headers: { ...getSecurityHeaders(), Allow: "GET" } },
  );
};

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const DELETE = methodNotAllowed;
export const PATCH = methodNotAllowed;