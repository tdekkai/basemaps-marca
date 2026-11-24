// Perfil "dekkai-light" (v2): estilo claro próprio da Dekkai, criado por Caio.
// Portado do protótipo index.html (Protomaps + MapLibre) sem mudar valores.
// Técnicas: (1) cores interpoladas por escala (nacional -> estadual -> cidade);
// (2) contornos de rua suavizados por zoom; (3) ênfase na cidade a partir do z12
// (quadras, prédios, áreas comerciais, pontos de comércio e serviço).
import { layers, namedFlavor } from "@protomaps/basemaps";

// Nível cidade: cores medidas no Google Maps em São Paulo com zoom alto ("claro-zoom").
const CLARO_ZOOM = { cores: {"background": "#f5f3f3", "earth": "#f5f3f3", "hospital": "#fce8e6", "industrial": "#f5f3f3", "school": "#f5f3f3", "pedestrian": "#f5f3f3", "zoo": "#f5f3f3", "military": "#f5f3f3", "aerodrome": "#f5f3f3", "glacier": "#ffffff", "pier": "#f5f3f3", "buildings": "#f5f3f3", "water": "#90daee", "park_a": "#d3f8e2", "park_b": "#c3f1d5", "wood_a": "#d3f8e2", "wood_b": "#c3f1d5", "scrub_a": "#e3f5ea", "scrub_b": "#c3f1d5", "sand": "#eeeed1", "beach": "#eeeed1", "runway": "#ffffff", "highway": "#ffffff", "major": "#ffffff", "link": "#ffffff", "other": "#ffffff", "minor_a": "#ffffff", "minor_b": "#ffffff", "minor_service": "#ffffff", "highway_casing_early": "#8aa5c0", "highway_casing_late": "#8aa5c0", "major_casing_early": "#c2cdda", "major_casing_late": "#c2cdda", "link_casing": "#c2cdda", "minor_casing": "#d8dee7", "minor_service_casing": "#d8dee7", "tunnel_highway": "#f5f3f3", "tunnel_major": "#f5f3f3", "tunnel_link": "#f5f3f3", "tunnel_minor": "#f5f3f3", "tunnel_other": "#f5f3f3", "tunnel_highway_casing": "#e6eaee", "tunnel_major_casing": "#e6eaee", "tunnel_link_casing": "#e6eaee", "tunnel_minor_casing": "#e6eaee", "tunnel_other_casing": "#e6eaee", "bridges_highway": "#ffffff", "bridges_major": "#ffffff", "bridges_link": "#ffffff", "bridges_minor": "#ffffff", "bridges_other": "#ffffff", "bridges_highway_casing": "#8aa5c0", "bridges_major_casing": "#c2cdda", "bridges_link_casing": "#c2cdda", "bridges_minor_casing": "#d8dee7", "bridges_other_casing": "#d8dee7", "railway": "#d5dee4", "boundaries": "#9aacb2"}, landcover: {"grassland": "#d3f8e2", "farmland": "#f5f3f3", "urban_area": "#f5f3f3", "barren": "#f5f3f3", "scrub": "#e3f5ea", "forest": "#c3f1d5", "glacier": "#ffffff"} };

export const DEKKAI_V2 = {
  cidade: { cores: { ...CLARO_ZOOM.cores, buildings: "#ebe8e8" }, landcover: { ...CLARO_ZOOM.landcover } },
  nacional: {
    cores: { water: "#4ab3e6", wood_a: "#dfe7df", wood_b: "#d6e3d6", park_a: "#e3e8e4", park_b: "#dbe7de", scrub_a: "#e3e8e3", scrub_b: "#dde6e0" },
    landcover: { grassland: "#e4e9e3", forest: "#dce6dc", scrub: "#e4e8e3", farmland: "#e6e8e3", barren: "#e8e8e6", urban_area: "#e2e2e2" },
  },
  estadual: {
    cores: { wood_a: "#a9d8a6", wood_b: "#7fc88b", park_a: "#b9e1b5", park_b: "#8fd29c", scrub_a: "#c6e2b6", scrub_b: "#a2d29a" },
    landcover: { grassland: "#bfe3b0", forest: "#86c98f", scrub: "#c8e3b4", farmland: "#dcebcd", barren: "#e8e8e6", urban_area: "#e0e0e0" },
  },
};
// Até z4,5 nacional (água azul); z6 a z8 estadual (verde); a partir de z10 cidade (cinza claro).
export const ZOOM_STOPS = { nacional: 4.5, estadualIni: 6, estadualFim: 8, cidade: 10 };
// Contornos: 0 = cor original, 1 = cor da terra.
export const CONTORNO = { zLonge: 11, longe: 0.85, zPerto: 16, perto: 0.45 };
export const CIDADE = {
  escurecerTerra: 0.035, predio: "#d9d5d0", predioBorda: "#c7c1ba", comercial: "#f3e4d8",
  lojas: ["supermarket", "convenience", "books", "beauty", "electronics", "clothes", "restaurant", "fast_food", "cafe", "bar"],
  corLoja: "#c4825a",
  servicos: ["school", "university", "library", "post_office", "townhall", "museum", "theatre", "station", "stadium"],
  corServico: "#7f93ab",
};

export function misturar(hex, alvo, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const a = p(hex), b = p(alvo);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

export function camadasPorEscala(fonte, lang, cfg = DEKKAI_V2, base = "light") {
  const fb = namedFlavor(base);
  const flavorDe = (...partes) => {
    const f = { ...fb }; const lc = { ...fb.landcover };
    for (const p of partes) { Object.assign(f, p.cores); Object.assign(lc, p.landcover); }
    f.landcover = lc; return f;
  };
  const N = layers(fonte, flavorDe(cfg.cidade), { lang });
  const B = layers(fonte, flavorDe(cfg.cidade, cfg.nacional), { lang });
  const S = layers(fonte, flavorDe(cfg.cidade, cfg.estadual), { lang });
  const z = ZOOM_STOPS;
  return N.map((l, i) => {
    if (!l.paint) return l;
    const paint = { ...l.paint };
    for (const p of ["fill-color", "line-color", "background-color"]) {
      if (!(p in l.paint)) continue;
      const vn = l.paint[p], vb = B[i].paint[p], vs = S[i].paint[p];
      if (JSON.stringify(vn) === JSON.stringify(vb) && JSON.stringify(vn) === JSON.stringify(vs)) continue;
      const c = (v) => ["to-color", v];
      paint[p] = ["interpolate-lab", ["linear"], ["zoom"], z.nacional, c(vb), z.estadualIni, c(vs), z.estadualFim, c(vs), z.cidade, c(vn)];
    }
    return { ...l, paint };
  });
}

export function suavizarContornos(camadas, terra, c = CONTORNO) {
  return camadas.map((l) => {
    const cor = l.paint && l.paint["line-color"];
    if (!/casing/.test(l.id) || typeof cor !== "string" || !/^#[0-9a-f]{6}$/i.test(cor)) return l;
    return { ...l, paint: { ...l.paint, "line-color": ["interpolate-lab", ["linear"], ["zoom"],
      c.zLonge, misturar(cor, terra, c.longe), c.zPerto, misturar(cor, terra, c.perto)] } };
  });
}

export function enfaseCidade(camadas, fonte, C = CIDADE) {
  const out = camadas.map((l) => {
    if ((l.id === "earth" || l.id === "background") && l.paint) {
      const prop = l.id === "earth" ? "fill-color" : "background-color";
      const base = l.paint[prop];
      if (typeof base !== "string") return l;
      return { ...l, paint: { ...l.paint, [prop]: ["interpolate-lab", ["linear"], ["zoom"], 12, base, 14, misturar(base, "#000000", C.escurecerTerra)] } };
    }
    if (l.id === "buildings") {
      return { ...l, paint: { ...l.paint, "fill-color": C.predio, "fill-outline-color": C.predioBorda,
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 0.7, 15, 1] } };
    }
    return l;
  });
  const comercial = { id: "dekkai_comercial", type: "fill", source: fonte, "source-layer": "landuse",
    filter: ["in", ["get", "kind"], ["literal", ["commercial", "retail"]]], minzoom: 12,
    paint: { "fill-color": C.comercial, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 14, 1] } };
  const ponto = (id, kinds, cor) => ({ id, type: "circle", source: fonte, "source-layer": "pois", minzoom: 15,
    filter: ["all", ["in", ["get", "kind"], ["literal", kinds]], [">=", ["zoom"], ["get", "min_zoom"]]],
    paint: { "circle-color": cor, "circle-radius": ["interpolate", ["linear"], ["zoom"], 15, 2, 18, 4.5],
      "circle-stroke-color": "#ffffff", "circle-stroke-width": 1 } });
  const iPark = out.findIndex((l) => l.id === "landuse_park");
  out.splice(iPark + 1, 0, comercial);
  const iSym = out.findIndex((l) => l.type === "symbol");
  out.splice(iSym < 0 ? out.length : iSym, 0, ponto("dekkai_servicos", C.servicos, C.corServico), ponto("dekkai_lojas", C.lojas, C.corLoja));
  return out;
}

// Ponto de entrada usado por gerar_estilos.mjs
export default function (fonte, lang) {
  const terra = DEKKAI_V2.cidade.cores.earth;
  return { base: "light", layers: enfaseCidade(suavizarContornos(camadasPorEscala(fonte, lang), terra), fonte) };
}
