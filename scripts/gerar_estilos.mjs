// Gera os style.json (MapLibre) das quatro variantes a partir de paletas.json.
// Uso: node gerar_estilos.mjs ../clientes/dekkai [url-pmtiles]
import { layers, namedFlavor } from "@protomaps/basemaps";
import fs from "node:fs";
import path from "node:path";

const pasta = process.argv[2];
const PMTILES = process.argv[3] || "https://demo-bucket.protomaps.com/v4.pmtiles";
const SATELITE = {
  tiles: ["https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg"],
  attribution: 'Sentinel-2 cloudless 2016 - <a href="https://s2maps.eu">s2maps.eu</a> by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 &amp; 2017)',
};
const ATRIB_OSM = '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>';
const marca = JSON.parse(fs.readFileSync(path.join(pasta, "marca.json"), "utf8"));
const paletas = JSON.parse(fs.readFileSync(path.join(pasta, "paletas.json"), "utf8"));

// Papel -> posições do Flavor (ver references/papeis-camadas.md)
const PAPEIS = {
  fundo: ["background", "earth"],
  verde: ["park_a", "park_b", "wood_a", "wood_b", "scrub_a", "scrub_b"],
  uso_especial: ["hospital", "school", "industrial", "aerodrome", "military", "zoo",
    "pedestrian", "pier", "runway", "glacier", "sand", "beach"],
  agua: ["water"],
  edificacoes: ["buildings"],
  via_menor: ["other", "minor_service", "minor_a", "minor_b", "bridges_other",
    "bridges_minor", "tunnel_other", "tunnel_minor"],
  via_principal: ["link", "major", "bridges_link", "bridges_major", "tunnel_link", "tunnel_major"],
  rodovia: ["highway", "bridges_highway", "tunnel_highway"],
  ferrovia: ["railway"],
  limites: ["boundaries"],
  rotulo_forte: ["city_label"],
  rotulo_medio: ["subplace_label", "state_label", "country_label", "roads_label_major", "ocean_label"],
  rotulo_fraco: ["roads_label_minor", "address_label"],
};
const BASE = { claro: "white", colorido: "light", escuro: "dark", satelite: "dark" };

function flavorDe(variante) {
  const p = paletas[variante];
  const f = { ...namedFlavor(BASE[variante]) };
  for (const [papel, slots] of Object.entries(PAPEIS)) for (const s of slots) f[s] = p[papel];
  for (const k of Object.keys(f)) {
    if (k.endsWith("_casing") || k.endsWith("_casing_early") || k.endsWith("_casing_late")) f[k] = p.contorno_via;
    if (k.endsWith("_halo")) f[k] = p.halo;
  }
  f.pois = p.pois;
  f.landcover = {
    forest: p.verde, scrub: p.verde, grassland: p.verde, farmland: p.uso_especial,
    barren: p.uso_especial, urban_area: p.edificacoes, glacier: p.uso_especial,
  };
  return f;
}

function estilo(variante) {
  const flavor = flavorDe(variante);
  const sprite = `https://protomaps.github.io/basemaps-assets/sprites/v4/${variante === "claro" || variante === "colorido" ? "light" : "dark"}`;
  const sources = { protomaps: { type: "vector", url: `pmtiles://${PMTILES}`, attribution: ATRIB_OSM } };
  let ls = layers("protomaps", flavor, { lang: "pt" });

  if (variante === "satelite") {
    sources.satelite = { type: "raster", tiles: SATELITE.tiles, tileSize: 256, maxzoom: 15, attribution: SATELITE.attribution };
    const manter = /^(roads_(highway|major|link)|roads_(bridges|tunnels)_(highway|major|link)|boundaries|places_|roads_labels|roads_shields|water_label|earth_label)/;
    const vetor = ls.filter((l) => manter.test(l.id));
    const p = paletas.satelite;
    ls = [
      { id: "satelite", type: "raster", source: "satelite",
        paint: { "raster-saturation": -0.35, "raster-contrast": 0.08, "raster-brightness-max": 0.85 } },
      { id: "tint_terra", type: "fill", source: "protomaps", "source-layer": "earth",
        paint: { "fill-color": p.fundo, "fill-opacity": 0.28 } },
      { id: "tint_agua", type: "fill", source: "protomaps", "source-layer": "water",
        filter: ["==", "$type", "Polygon"], paint: { "fill-color": p.agua, "fill-opacity": 0.45 } },
      ...vetor,
    ];
  }
  return {
    version: 8, name: `${marca.cliente} ${variante}`,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite, sources, layers: ls,
  };
}

const saida = path.join(pasta, "estilos");
fs.mkdirSync(saida, { recursive: true });
for (const v of Object.keys(BASE)) {
  const s = estilo(v);
  fs.writeFileSync(path.join(saida, `style-${v}.json`), JSON.stringify(s, null, 1));
  console.log(`style-${v}.json: ${s.layers.length} camadas`);
}
