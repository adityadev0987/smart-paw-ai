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

    const query = `
[out:json][timeout:25];
nwr["amenity"="veterinary"](around:10000,${latitude},${longitude});
out center tags;
`;

    const response = await fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "application/json",
          "User-Agent":
            "SmartPawAI/1.0 (student project)",
        },
        body: new URLSearchParams({
          data: query,
        }).toString(),
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        "Overpass status:",
        response.status,
      );

      console.error(
        "Overpass response:",
        responseText,
      );

      return res.status(502).json({
        success: false,
        message: "Overpass API request failed.",
        upstreamStatus: response.status,
        upstreamResponse: responseText,
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

          latitude: placeLatitude,

          longitude: placeLongitude,

          distanceKm: Number(
            calculateDistance(
              latitude,
              longitude,
              placeLatitude,
              placeLongitude,
            ).toFixed(2),
          ),

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
      .sort(
        (a, b) =>
          a.distanceKm - b.distanceKm,
      );

    return res.status(200).json({
      success: true,
      count: vets.length,
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
    tags["addr:city"],
    tags["addr:state"],
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return (
    tags["addr:full"] ||
    "Location unavailable"
  );
}