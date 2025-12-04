"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import type { FeatureCollection, Point } from 'geojson'
import { apiCall } from "@/lib/api"

mapboxgl.accessToken = "pk.eyJ1Ijoia2V5b3B0dGEiLCJhIjoiY21kNWxjdHRhMDB1aTJrcHFxdHEwOWFlNiJ9.8o8EW3fzmctHWsRnQdQEnQ"

export default function RWMap() {
  const mapContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/light-v10', // gunakan style dari Mapbox
      center: [107.6889, -6.9744],
      zoom: 13,
    })

    Promise.all([
      fetch('/data/rw_cipamokolan.geojson').then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lansia-locations`).then(res => res.json())
    ]).then(([geojson, lansiaPoints]) => {
      // === Tambahkan polygon RW sebagai peta dasar ===
      map.addSource('rw-cipamokolan', {
        type: 'geojson',
        data: geojson
      })

      map.addLayer({
        id: 'rw-fill',
        type: 'fill',
        source: 'rw-cipamokolan',
        paint: {
          'fill-color': '#ccc',
          'fill-opacity': 0.2,
        }
      })

      map.addLayer({
        id: 'rw-border',
        type: 'line',
        source: 'rw-cipamokolan',
        paint: {
          'line-color': '#666',
          'line-width': 1.5
        }
      })

      map.addLayer({
        id: 'rw-labels',
        type: 'symbol',
        source: 'rw-cipamokolan',
        layout: {
          'text-field': ['get', 'rw'],
          'text-font': ['Open Sans Bold'],
          'text-size': 14,
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#000',
          'text-halo-color': '#fff',
          'text-halo-width': 1.5
        }
      })

      // === Titik orang (tanpa nama / popup) ===
      const pointGeoJSON: FeatureCollection<Point> = {
        type: "FeatureCollection",
        features: lansiaPoints.map((item: any) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [item.longitude, item.latitude],
          },
          properties: {}
        }))
      }


      map.addSource("lansia-points", {
        type: "geojson",
        data: pointGeoJSON
      })


      map.addLayer({
        id: "lansia-dots",
        type: "circle",
        source: "lansia-points",
        paint: {
          "circle-radius": 5,
          "circle-color": "#EF4444",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 1
        }
      })
    })

    return () => map.remove()
  }, [])

  return <div ref={mapContainer} className="w-full h-[600px]" />
}
