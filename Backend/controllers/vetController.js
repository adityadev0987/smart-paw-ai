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

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
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

    if (process.env.GOOGLE_PLACES_API_KEY) {
      const googleVets = await getGoogleVets(latitude, longitude);

      return res.status(200).json({
        success: true,
        count: googleVets.length,
        source: "google",
        data: googleVets,
      });
    }

    const query = `
[out:json][timeout:10];
nwr["amenity"="veterinary"](around:15000,${latitude},${longitude});
out center tags;
`;

    const response = await fetchOverpass(query);

    if (!response) {
      return res.status(503).json({
        success: false,
        message:
          "The clinic directory is taking too long to respond. Please try again shortly.",
      });
    }

    const responseText = await response.text();

    if (!response.ok) {
        console.error("Overpass status:", response.status);

      return res.status(502).json({
        success: false,
          message:
            "The clinic directory is temporarily unavailable. Please try again in a moment.",
      });
    }

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error(
        "Overpass returned invalid JSON:",
        responseText,
      );

      return res.status(502).json({
        success: false,
        message:
          "Overpass returned an invalid response.",
        upstreamResponse: responseText,
      });
    }

    const vets = result.elements
      .map((place) => {
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

        return {
          id: `${place.type}-${place.id}`,

          name:
            tags.name ||
            tags["name:en"] ||
            "Veterinary Clinic",

          location: buildLocation(tags),

          address: buildLocation(tags),

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

          ratingCount: Number(tags["rating:count"] || 0),

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
        };
      })
      .filter(Boolean)
      .sort(compareVets)
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      count: vets.length,
      source: "openstreetmap",
      data: vets,
    });
  } catch (error) {
    console.error(
      "Nearby vet search error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to find nearby veterinary clinics.",
    });
  }
};

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

    const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);

    if (process.env.GOOGLE_PLACES_API_KEY) {
      const vets = await searchGoogleVets(
        queryText,
        hasLocation ? latitude : undefined,
        hasLocation ? longitude : undefined,
      );

      return res.status(200).json({ success: true, count: vets.length, source: "google", data: vets });
    }

    if (!hasLocation) {
      return res.status(200).json({ success: true, count: 0, source: "openstreetmap", data: [] });
    }

    const escapedQuery = queryText.replace(/[\\"']/g, "\\$&");
    const query = `
[out:json][timeout:15];
nwr["amenity"="veterinary"]["name"~"${escapedQuery}",i](around:50000,${latitude},${longitude});
out center tags;
`;
    const response = await fetchOverpass(query);
    const responseText = await response.text();

    if (!response.ok) {
      return res.status(502).json({ success: false, message: "The clinic search is temporarily unavailable. Please try again." });
    }

    const result = JSON.parse(responseText);
    const vets = result.elements
      .map((place) => mapOpenStreetMapVet(place, latitude, longitude))
      .filter(Boolean)
      .sort(compareVets)
      .slice(0, 10);

    return res.status(200).json({ success: true, count: vets.length, source: "openstreetmap", data: vets });
  } catch (error) {
    console.error("Vet search error:", error);
    return res.status(500).json({ success: false, message: "Unable to search clinics right now. Please try again." });
  }
};

async function getGoogleVets(latitude, longitude) {
  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchNearby",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
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
      signal: AbortSignal.timeout(8000),
    },
  );

  if (!response.ok) {
    throw new Error("Google Places could not find nearby veterinary clinics.");
  }

  const result = await response.json();

  return (result.places || [])
    .map((place) => {
      const placeLatitude = place.location?.latitude;
      const placeLongitude = place.location?.longitude;

      if (placeLatitude === undefined || placeLongitude === undefined) {
        return null;
      }

      return {
        id: place.id,
        name: place.displayName?.text || "Veterinary Clinic",
        location: place.formattedAddress || "Address unavailable",
        address: place.formattedAddress || "Address unavailable",
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
        rating: place.rating || null,
        ratingCount: place.userRatingCount || 0,
        phone: place.nationalPhoneNumber || null,
        website: place.websiteUri || null,
        mapsUrl: place.googleMapsUri || null,
        services: ["Cats", "Dogs"],
      };
    })
    .filter(Boolean)
    .sort(compareVets)
    .slice(0, 5);
}

function compareVets(a, b) {
  const distanceDifference = (a.distance || Infinity) - (b.distance || Infinity);

  if (distanceDifference !== 0) {
    return distanceDifference;
  }

  return (b.rating || 0) - (a.rating || 0);
}

async function searchGoogleVets(queryText, latitude, longitude) {
  const body = {
    textQuery: `${queryText} veterinary clinic cat dog`,
    pageSize: 10,
  };

  if (latitude !== undefined && longitude !== undefined) {
    body.locationBias = {
      circle: {
        center: { latitude, longitude },
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
        "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY,
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
    },
  );

  if (!response.ok) {
    throw new Error("Google clinic search failed.");
  }

  const result = await response.json();

  return (result.places || [])
    .map((place) => {
      const placeLatitude = place.location?.latitude;
      const placeLongitude = place.location?.longitude;

      return {
        id: place.id,
        name: place.displayName?.text || "Veterinary Clinic",
        location: place.formattedAddress || "Address not listed",
        address: place.formattedAddress || "Address not listed",
        latitude: placeLatitude,
        longitude: placeLongitude,
        distance:
          latitude !== undefined && placeLatitude !== undefined
            ? Number(calculateDistance(latitude, longitude, placeLatitude, placeLongitude).toFixed(2))
            : null,
        rating: place.rating || null,
        ratingCount: place.userRatingCount || 0,
        phone: place.nationalPhoneNumber || null,
        website: place.websiteUri || null,
        mapsUrl: place.googleMapsUri || null,
        services: ["Cats", "Dogs"],
      };
    })
    .sort(compareVets);
}

function mapOpenStreetMapVet(place, latitude, longitude) {
  const placeLatitude = place.lat ?? place.center?.lat;
  const placeLongitude = place.lon ?? place.center?.lon;

  if (placeLatitude === undefined || placeLongitude === undefined) {
    return null;
  }

  const tags = place.tags || {};
  const address = buildLocation(tags);

  return {
    id: `${place.type}-${place.id}`,
    name: tags.name || tags["name:en"] || "Veterinary Clinic",
    location: address,
    address,
    latitude: placeLatitude,
    longitude: placeLongitude,
    distance: Number(calculateDistance(latitude, longitude, placeLatitude, placeLongitude).toFixed(2)),
    rating: getRating(tags),
    ratingCount: Number(tags["rating:count"] || 0),
    services: ["Cats", "Dogs"],
    phone: tags.phone || tags["contact:phone"] || null,
    website: tags.website || tags["contact:website"] || null,
    openingHours: tags.opening_hours || null,
  };
}

async function fetchOverpass(query) {
  const endpoints = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  let lastResponse;

  for (const endpoint of endpoints) {
    let response;

    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "application/json",
          "User-Agent": "SmartPawAI/1.0 (student project)",
        },
        body: new URLSearchParams({ data: query }).toString(),
        signal: AbortSignal.timeout(8000),
      });
    } catch (error) {
      console.error(`Overpass request failed for ${endpoint}:`, error.message);
      continue;
    }

    if (response.ok) {
      return response;
    }

    lastResponse = response;
  }

  return lastResponse;
}

function getRating(tags) {
  const rating = Number(
    tags.rating || tags.stars || tags["contact:rating"],
  );

  return Number.isFinite(rating) && rating > 0 ? rating : null;
}

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2,
) {
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

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
  return (value * Math.PI) / 180;
}

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