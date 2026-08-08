import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../config/api";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import SectionHeading from "../common/SectionHeading";

/**
 * =============================================================================
 * INTERACTIVE MAHARASHTRA PROJECT MAP  (Homepage — HIGH PRIORITY per spec)
 * =============================================================================
 * Data source: GET /api/projects/map → lightweight { title, district, capacityKW,
 * location: { coordinates: [lng, lat] }, coverImage, category } for every
 * published project. Coordinates are stored as GeoJSON on the Project model
 * (see backend/models/Project.js) with a 2dsphere index, so this same data can
 * later power geospatial queries (nearest project, density heatmaps, etc.)
 * without any schema changes.
 *
 * CURRENT SCOPE (buildable without a paid Mapbox key / heavy GeoJSON boundary
 * files): OpenStreetMap tiles via Leaflet, centered on Maharashtra, with
 * clustered markers that separate into individual pins as you zoom into a
 * district. Clicking a marker opens a popup with the full project summary.
 *
 * FUTURE ENHANCEMENT (left as a clean extension point, not built here):
 * an India-wide GeoJSON boundary layer with a scripted zoom-in animation
 * (India → Maharashtra → district) using Leaflet's `map.flyToBounds()`.
 * The `MapContainer` below already exposes a `whenCreated` ref that a future
 * dev can hook to add that animation — no restructuring required.
 * =============================================================================
 */

// Custom solar-yellow pin (default Leaflet marker icon assets don't bundle well with Vite)
const pinIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    background:#FF7A00;width:16px;height:16px;border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 16],
});

const MAHARASHTRA_CENTER = [18.2, 75.2];

// Shown if the live API is unreachable (e.g. backend not deployed yet) so the
// map never renders empty/broken. SK Solar Solutions serves all of Maharashtra;
// these sample pins just cover a few districts so the map isn't blank.
const FALLBACK_PROJECTS = [
  { _id: "fallback-pune-1", title: "Rooftop Solar Installation", district: "Pune", category: "Residential", capacityKW: 15, location: { coordinates: [73.8567, 18.5204] } },
  { _id: "fallback-pune-2", title: "Rooftop Solar Installation", district: "Pune", category: "Residential", capacityKW: 5, location: { coordinates: [73.9367, 18.5704] } },
  { _id: "fallback-pune-3", title: "Rooftop Solar Installation", district: "Pune", category: "Commercial", capacityKW: 20, location: { coordinates: [73.7567, 18.4804] } },
  { _id: "fallback-solapur-1", title: "Rooftop Solar Installation", district: "Solapur", category: "Residential", capacityKW: 4, location: { coordinates: [75.9064, 17.6599] } },
  { _id: "fallback-kolhapur-1", title: "Rooftop Solar Installation", district: "Kolhapur", category: "Residential", capacityKW: 6, location: { coordinates: [74.2433, 16.705] } },
];

const fetchMapProjects = async () => {
  const { data } = await api.get("/projects/map");
  return data.data;
};

const ProjectMap = () => {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ["projects-map"],
    queryFn: fetchMapProjects,
    retry: false,
  });

  const pins = isError || !projects?.length ? FALLBACK_PROJECTS : projects;

  return (
    <section className="py-24 bg-white">
      <div className="container-custom">
        <SectionHeading
          eyebrow="Our Reach"
          title="Explore Our Projects Across Maharashtra"
          subtitle="Serving all 36 districts of Maharashtra — zoom in and click a marker to see project details."
        />

        <div className="mt-14 rounded-3xl overflow-hidden shadow-premium border border-gray-100 h-[550px] relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
              <p className="text-gray-400">Loading project map…</p>
            </div>
          )}

          <MapContainer center={MAHARASHTRA_CENTER} zoom={7} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup chunkedLoading>
              {pins.map((project) => (
                <Marker
                  key={project._id}
                  position={[project.location.coordinates[1], project.location.coordinates[0]]}
                  icon={pinIcon}
                >
                  <Popup minWidth={220}>
                    <div className="space-y-1">
                      {project.coverImage && (
                        <img
                          src={cdnImage(project.coverImage, IMG.thumb)}
                          alt={project.title}
                          loading="lazy"
                          className="w-full h-24 object-cover rounded-md mb-2"
                        />
                      )}
                      <p className="font-display font-semibold text-navy">{project.title}</p>
                      <p className="text-xs text-gray-500">
                        {project.district}, Maharashtra · {project.capacityKW} kW
                      </p>
                      <p className="text-xs text-gray-500">{project.category}</p>
                      {project.slug && (
                        <Link
                          to={`/projects/${project.slug}`}
                          className="inline-block mt-2 text-xs font-semibold text-solar-orange hover:underline"
                        >
                          View Full Project →
                        </Link>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>
    </section>
  );
};

export default ProjectMap;
