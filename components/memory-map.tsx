"use client";

import { amenities, type MemoryAmenity } from "@/lib/memory-data";

type MemoryMapProps = {
  selectedAmenity: MemoryAmenity;
  onSelectAmenity: (amenity: MemoryAmenity) => void;
};

export function MemoryMap({ selectedAmenity, onSelectAmenity }: MemoryMapProps) {
  return (
    <section className="panel map-panel" aria-labelledby="map-title">
      <div className="section-kicker">Memory map</div>
      <div className="section-heading">
        <h2 id="map-title">Places to make the trip memorable</h2>
        <p>
          Choose an amenity or nearby experience and Roseview will shape the next capture prompt
          around it.
        </p>
      </div>

      <div className="map-stage" aria-label="Suggested hotel memory locations">
        <div className="map-rings" aria-hidden="true" />
        {amenities.map((amenity) => (
          <button
            className={`map-pin ${selectedAmenity.id === amenity.id ? "map-pin-active" : ""}`}
            key={amenity.id}
            onClick={() => onSelectAmenity(amenity)}
            style={{ left: `${amenity.x}%`, top: `${amenity.y}%` }}
            type="button"
          >
            <span>{amenity.name}</span>
          </button>
        ))}
      </div>

      <div className="amenity-list">
        {amenities.map((amenity) => (
          <button
            className={`amenity-card ${
              selectedAmenity.id === amenity.id ? "amenity-card-active" : ""
            }`}
            key={amenity.id}
            onClick={() => onSelectAmenity(amenity)}
            type="button"
          >
            <span>{amenity.kind}</span>
            <strong>{amenity.name}</strong>
            <small>{amenity.distance}</small>
            <p>{amenity.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
