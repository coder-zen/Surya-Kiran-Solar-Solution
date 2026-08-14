import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../config/api";
import { cdnImage, IMG } from "../../utils/cloudinaryImage";
import SectionHeading from "../common/SectionHeading";
import LazyVisible from "../common/LazyVisible";

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

  /*
   * The database is the single source of truth — there is deliberately no
   * hardcoded fallback. Sample pins previously stood in whenever the API failed
   * or returned nothing, which made a broken backend and an empty portfolio
   * both look like a working map of installations that don't exist.
   *
   * A pin needs real GeoJSON coordinates to place, so anything lacking them is
   * skipped rather than crashing the map on `coordinates[1]` of undefined.
   */
  const pins = (projects || []).filter((p) => p?.location?.coordinates?.length === 2);

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

          {/* Same overlay treatment as the loading state, so the map frame
              itself never changes shape between states. */}
          {!isLoading && isError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
              <p className="text-gray-400">Couldn't load the project map. Please try again later.</p>
            </div>
          )}

          {!isLoading && !isError && pins.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
              <p className="text-gray-400">No projects to show on the map yet.</p>
            </div>
          )}

          {/* Held back until the section nears the viewport. Leaflet used to
              initialise and pull tiles on page load, ~12,000px below the fold
              on a phone, which cost main-thread time nobody benefited from. */}
          <LazyVisible className="h-full w-full" placeholder={<div className="h-full w-full bg-gray-100" />}>
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
          </LazyVisible>
        </div>
      </div>
    </section>
  );
};

export default ProjectMap;
