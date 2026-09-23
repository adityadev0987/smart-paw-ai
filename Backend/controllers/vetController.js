export const getNearbyVets = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude.",
      });
    }

    if (latitude < -90 || latitude > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude.",
      });
    }

    if (longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude.",
      });
    }

    /*
     * Prefer Google Places when API key is available.
     * Google gives us much better rating, review count,
     * address and business information.
     */
    if (process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const googleVets = await getGoogleVets(latitude, longitude);

        return res.status(200).json({
          success: true,
          count: googleVets.length,
          source: "google",
          data: googleVets,
        });
      } catch (error) {
        console.error("Google Places failed:", error.message);

        /*
         * Do not immediately fail the user.
         * Fall back to OpenStreetMap.
         */
      }
    }

    /*
     * OpenStreetMap fallback.
     *
     * Try progressively larger areas:
     * 15 km -> 30 km -> 50 km
     *
     * This increases the chance of getting 3-5 clinics
     * when the local OSM coverage is limited.
     */
    const radii = [15000, 30000, 50000];

    let allVets = [];

    for (const radius of radii) {
      const query = `
        [out:json][timeout:5];

        (
          nwr["amenity"="veterinary"](around:${radius},${latitude},${longitude});
          nwr["healthcare"="veterinary"](around:${radius},${latitude},${longitude});
          nwr["healthcare:speciality"~"veterinary|animal"](around:${radius},${latitude},${longitude});
        );

        out center tags;
      `;

      try {
        const response = await fetchOverpass(query);

        if (!response || !response.ok) {
          continue;
        }

        const responseText = await response.text();

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          console.error("Overpass returned invalid JSON.");
          continue;
        }

        const vets = (result.elements || [])
          .map((place) =>
            mapOpenStreetMapVet(place, latitude, longitude),
          )
          .filter(Boolean);

        allVets = mergeUniqueVets(allVets, vets);

        /*
         * Once we have enough candidates, no need
         * to query larger radius.
         */
        if (allVets.length >= 5) {
          break;
        }
      } catch (error) {
        console.error(
          `OSM search failed for radius ${radius}:`,
          error.message,
        );
      }
    }

    const vets = rankVets(allVets).slice(0, 5);

    /*
     * If OSM found nothing, return a clean response
     * instead of making the frontend wait or crash.
     */
    return res.status(200).json({
      success: true,
      count: vets.length,
      source: "openstreetmap",
      data: vets,
    });
  } catch (error) {
    console.error("Nearby vet search error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Failed to find nearby veterinary clinics.",
    });
  }
};


/* =========================================================
   SEARCH VETS
========================================================= */

export const searchVets = async (req, res) => {
  try {
    const queryText = String(req.query.q || "").trim();
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lng);

    if (queryText.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Enter at least 2 characters to search for a clinic.",
      });
    }

    const hasLocation =
      Number.isFinite(latitude) && Number.isFinite(longitude);

    if (process.env.GOOGLE_PLACES_API_KEY) {
      try {
        const vets = await searchGoogleVets(
          queryText,
          hasLocation ? latitude : undefined,
          hasLocation ? longitude : undefined,
        );

        return res.status(200).json({
          success: true,
          count: vets.length,
          source: "google",
          data: vets,
        });
      } catch (error) {
        console.error("Google clinic search failed:", error.message);
      }
    }

    if (!hasLocation) {
      return res.status(200).json({
        success: true,
        count: 0,
        source: "openstreetmap",
        data: [],
      });
    }

    const escapedQuery = queryText.replace(/[\\"']/g, "\\$&");

    const query = `
      [out:json][timeout:5];

      (
        nwr["amenity"="veterinary"]["name"~"${escapedQuery}",i]
          (around:50000,${latitude},${longitude});

        nwr["healthcare"="veterinary"]["name"~"${escapedQuery}",i]
          (around:50000,${latitude},${longitude});
      );

      out center tags;
    `;

    const response = await fetchOverpass(query);

    if (!response || !response.ok) {
      return res.status(502).json({
        success: false,
        message:
          "The clinic search is temporarily unavailable. Please try again.",
      });
    }

    const responseText = await response.text();

    const result = JSON.parse(responseText);

    const vets = (result.elements || [])
      .map((place) =>
        mapOpenStreetMapVet(place, latitude, longitude),
      )
      .filter(Boolean);

    const uniqueVets = mergeUniqueVets([], vets);

    const rankedVets = rankVets(uniqueVets).slice(0, 10);

    return res.status(200).json({
      success: true,
      count: rankedVets.length,
      source: "openstreetmap",
      data: rankedVets,
    });
  } catch (error) {
    console.error("Vet search error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to search clinics right now. Please try again.",
    });
  }
};


/* =========================================================
   GOOGLE PLACES
========================================================= */

async function getGoogleVets(latitude, longitude) {
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        "X-Goog-Api-Key":
          process.env.GOOGLE_PLACES_API_KEY,

        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.userRatingCount",
          "places.nationalPhoneNumber",
          "places.websiteUri",
          "places.googleMapsUri",
        ].join(","),
      },

      body: JSON.stringify({
        includedTypes: ["veterinary_care"],

        /*
         * Ask Google for more candidates.
         * We will rank them ourselves and return 5.
         */
        maxResultCount: 20,

        locationRestriction: {
          circle: {
            center: {
              latitude,
              longitude,
            },

            radius: 50000,
          },
        },
      }),

      signal: AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Google Places could not find nearby veterinary clinics.",
    );
  }

  const result = await response.json();

  const vets = (result.places || [])
    .map((place) => {
      const placeLatitude =
        place.location?.latitude;

      const placeLongitude =
        place.location?.longitude;

      if (
        placeLatitude === undefined ||
        placeLongitude === undefined
      ) {
        return null;
      }

      const distance = Number(
        calculateDistance(
          latitude,
          longitude,
          placeLatitude,
          placeLongitude,
        ).toFixed(2),
      );

      return {
        id: place.id,

        name:
          place.displayName?.text ||
          "Veterinary Clinic",

        location:
          place.formattedAddress ||
          "Address unavailable",

        address:
          place.formattedAddress ||
          "Address unavailable",

        latitude: placeLatitude,

        longitude: placeLongitude,

        distance,

        rating:
          place.rating || null,

        ratingCount:
          place.userRatingCount || 0,

        phone:
          place.nationalPhoneNumber || null,

        website:
          place.websiteUri || null,

        mapsUrl:
          place.googleMapsUri || null,

        services: ["Cats", "Dogs"],
      };
    })
    .filter(Boolean);

  /*
   * Rank using:
   * - rating
   * - review count
   * - distance
   *
   * Then return maximum 5.
   */
  return rankVets(vets).slice(0, 5);
}


/* =========================================================
   GOOGLE TEXT SEARCH
========================================================= */

async function searchGoogleVets(
  queryText,
  latitude,
  longitude,
) {
  const body = {
    textQuery: `${queryText} veterinary clinic cat dog`,

    pageSize: 10,
  };

  if (
    latitude !== undefined &&
    longitude !== undefined
  ) {
    body.locationBias = {
      circle: {
        center: {
          latitude,
          longitude,
        },

        radius: 50000,
      },
    };
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        "X-Goog-Api-Key":
          process.env.GOOGLE_PLACES_API_KEY,

        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.userRatingCount",
          "places.nationalPhoneNumber",
          "places.websiteUri",
          "places.googleMapsUri",
        ].join(","),
      },

      body: JSON.stringify(body),

      signal: AbortSignal.timeout(5000),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Google clinic search failed.",
    );
  }

  const result = await response.json();

  const vets = (result.places || [])
    .map((place) => {
      const placeLatitude =
        place.location?.latitude;

      const placeLongitude =
        place.location?.longitude;

      if (
        placeLatitude === undefined ||
        placeLongitude === undefined
      ) {
        return null;
      }

      return {
        id: place.id,

        name:
          place.displayName?.text ||
          "Veterinary Clinic",

        location:
          place.formattedAddress ||
          "Address not listed",

        address:
          place.formattedAddress ||
          "Address not listed",

        latitude: placeLatitude,

        longitude: placeLongitude,

        distance:
          latitude !== undefined &&
          longitude !== undefined
            ? Number(
                calculateDistance(
                  latitude,
                  longitude,
                  placeLatitude,
                  placeLongitude,
                ).toFixed(2),
              )
            : null,

        rating:
          place.rating || null,

        ratingCount:
          place.userRatingCount || 0,

        phone:
          place.nationalPhoneNumber || null,

        website:
          place.websiteUri || null,

        mapsUrl:
          place.googleMapsUri || null,

        services: ["Cats", "Dogs"],
      };
    })
    .filter(Boolean);

  return rankVets(vets);
}


/* =========================================================
   OPENSTREETMAP MAPPER
========================================================= */

function mapOpenStreetMapVet(
  place,
  latitude,
  longitude,
) {
  const placeLatitude =
    place.lat ?? place.center?.lat;

  const placeLongitude =
    place.lon ?? place.center?.lon;

  if (
    placeLatitude === undefined ||
    placeLongitude === undefined
  ) {
    return null;
  }

  const tags = place.tags || {};

  const address = buildLocation(tags);

  return {
    id: `${place.type}-${place.id}`,

    name:
      tags.name ||
      tags["name:en"] ||
      "Veterinary Clinic",

    location: address,

    address,

    latitude: placeLatitude,

    longitude: placeLongitude,

    distance: Number(
      calculateDistance(
        latitude,
        longitude,
        placeLatitude,
        placeLongitude,
      ).toFixed(2),
    ),

    rating: getRating(tags),

    ratingCount:
      Number(tags["rating:count"] || 0),

    services: ["Cats", "Dogs"],

    phone:
      tags.phone ||
      tags["contact:phone"] ||
      null,

    website:
      tags.website ||
      tags["contact:website"] ||
      null,

    openingHours:
      tags.opening_hours || null,

    mapsUrl:
      `https://www.google.com/maps/search/?api=1&query=${placeLatitude},${placeLongitude}`,
  };
}


/* =========================================================
   VET RANKING
========================================================= */

function rankVets(vets) {
  return [...vets].sort((a, b) => {
    const ratingA =
      Number(a.rating) || 0;

    const ratingB =
      Number(b.rating) || 0;

    const reviewsA =
      Number(a.ratingCount) || 0;

    const reviewsB =
      Number(b.ratingCount) || 0;

    const distanceA =
      Number(a.distance) || Infinity;

    const distanceB =
      Number(b.distance) || Infinity;

    /*
     * When both clinics have meaningful ratings,
     * rating is considered first.
     *
     * Review count breaks rating ties.
     *
     * Distance breaks remaining ties.
     */
    if (
      ratingA > 0 &&
      ratingB > 0 &&
      ratingA !== ratingB
    ) {
      return ratingB - ratingA;
    }

    if (
      reviewsA > 0 &&
      reviewsB > 0 &&
      reviewsA !== reviewsB
    ) {
      return reviewsB - reviewsA;
    }

    return distanceA - distanceB;
  });
}


/* =========================================================
   REMOVE DUPLICATES
========================================================= */

function mergeUniqueVets(
  existing,
  incoming,
) {
  const map = new Map();

  for (const vet of existing) {
    const key = getVetUniqueKey(vet);

    if (!map.has(key)) {
      map.set(key, vet);
    }
  }

  for (const vet of incoming) {
    const key = getVetUniqueKey(vet);

    const existingVet = map.get(key);

    /*
     * If duplicate exists, keep the one with
     * better information.
     */
    if (!existingVet) {
      map.set(key, vet);
      continue;
    }

    if (
      (!existingVet.rating && vet.rating) ||
      (!existingVet.address &&
        vet.address) ||
      (!existingVet.phone && vet.phone)
    ) {
      map.set(key, {
        ...existingVet,
        ...vet,
      });
    }
  }

  return Array.from(map.values());
}


function getVetUniqueKey(vet) {
  if (vet.id) {
    return vet.id;
  }

  const name =
    String(vet.name || "")
      .toLowerCase()
      .trim();

  const lat =
    Number(vet.latitude || 0).toFixed(4);

  const lng =
    Number(vet.longitude || 0).toFixed(4);

  return `${name}-${lat}-${lng}`;
}


/* =========================================================
   OVERPASS
========================================================= */

async function fetchOverpass(query) {
  const endpoints = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  /*
   * Try both endpoints in parallel.
   *
   * This prevents the first slow endpoint from forcing
   * the entire request to wait before trying the second one.
   */
  const requests = endpoints.map(
    async (endpoint) => {
      try {
        const response = await fetch(
          endpoint,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded; charset=UTF-8",

              Accept:
                "application/json",

              "User-Agent":
                "SmartPawAI/1.0 (student project)",
            },

            body: new URLSearchParams({
              data: query,
            }).toString(),

            signal:
              AbortSignal.timeout(5000),
          },
        );

        if (response.ok) {
          return response;
        }

        return null;
      } catch (error) {
        console.error(
          `Overpass request failed for ${endpoint}:`,
          error.message,
        );

        return null;
      }
    },
  );

  /*
   * Promise.any returns the first successful
   * response.
   */
  try {
    return await Promise.any(
      requests.map(async (request) => {
        const response = await request;

        if (!response) {
          throw new Error(
            "Overpass endpoint failed",
          );
        }

        return response;
      }),
    );
  } catch {
    return null;
  }
}


/* =========================================================
   RATING
========================================================= */

function getRating(tags) {
  const rating = Number(
    tags.rating ||
      tags.stars ||
      tags["contact:rating"],
  );

  return Number.isFinite(rating) &&
    rating > 0
    ? rating
    : null;
}


/* =========================================================
   DISTANCE
========================================================= */

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2,
) {
  const earthRadiusKm = 6371;

  const dLat = toRadians(
    lat2 - lat1,
  );

  const dLon = toRadians(
    lon2 - lon1,
  );

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a),
    );

  return earthRadiusKm * c;
}


function toRadians(value) {
  return (
    (value * Math.PI) / 180
  );
}


/* =========================================================
   ADDRESS
========================================================= */

function buildLocation(tags) {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:postcode"],
    tags["addr:city"],
    tags["addr:state"],
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return (
    tags["addr:full"] ||
    "Address not listed"
  );
}