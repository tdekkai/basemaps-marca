// Perfil "tropical": estética de mapa de jogo de mundo aberto (água turquesa em faixas,
// terra cor de areia, manchas urbanas cinza-azuladas, vias creme, rótulos em caixa alta).
// Paleta original, só a atmosfera é inspirada em mapas de jogos; nenhum elemento é copiado.
import { layers, namedFlavor } from "@protomaps/basemaps";

export const T = {
  areia: "#d6cfb1", areiaEscura: "#c9c2a3", vegetacao: "#7fa596", vegetacaoDensa: "#6a9384",
  urbano: "#c3c7d0", predio: "#b4bac8", predioBorda: "#9ea5b6",
  aguaFunda: "#2a85a3", aguaRasa: "#4aa6c2", aguaCosta: "#7cc4d6",
  via: "#ece6d6", viaPrincipal: "#f6f1e4", rodovia: "#fbf7ec", contorno: "#aaa48f",
  ferrovia: "#9b9580", limites: "#5f6f6a",
  rotulo: "#ffffff", halo: "#1f5f74", rotuloAgua: "#d9f1f7",
};

function flavor() {
  const f = { ...namedFlavor("light") };
  const set = (cor, chaves) => chaves.forEach((k) => (f[k] = cor));
  set(T.areia, ["background", "earth", "pedestrian", "pier", "school", "hospital", "zoo", "military", "aerodrome", "beach", "sand", "glacier"]);
  set(T.areiaEscura, ["industrial", "runway"]);
  set(T.vegetacao, ["park_a", "wood_a", "scrub_a"]);
  set(T.vegetacaoDensa, ["park_b", "wood_b", "scrub_b"]);
  f.water = T.aguaFunda;
  f.buildings = T.predio;
  set(T.via, ["other", "minor_service", "minor_a", "minor_b", "bridges_other", "bridges_minor", "tunnel_other", "tunnel_minor"]);
  set(T.viaPrincipal, ["link", "major", "bridges_link", "bridges_major", "tunnel_link", "tunnel_major"]);
  set(T.rodovia, ["highway", "bridges_highway", "tunnel_highway"]);
  for (const k of Object.keys(f)) {
    if (k.includes("casing")) f[k] = T.contorno;
    if (k.endsWith("_halo")) f[k] = T.halo;
    if (k.endsWith("_label")) f[k] = T.rotulo;
  }
  f.ocean_label = T.rotuloAgua;
  f.railway = T.ferrovia;
  f.boundaries = T.limites;
  f.landcover = { ...f.landcover, forest: T.vegetacaoDensa, scrub: T.vegetacao, grassland: T.vegetacao,
    farmland: T.areiaEscura, barren: T.areia, urban_area: T.urbano, glacier: T.areia };
  return f;
}

export default function (fonte, lang) {
  let ls = layers(fonte, flavor(), { lang });

  // Faixas de água rasa junto à costa: linhas largas e desfocadas no contorno dos polígonos de água.
  const faixa = (id, cor, largura, opac) => ({
    id, type: "line", source: fonte, "source-layer": "water", filter: ["==", "$type", "Polygon"],
    paint: { "line-color": cor, "line-opacity": opac,
      "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 5, largura * 0.15, 10, largura, 15, largura * 6],
      "line-blur": ["interpolate", ["exponential", 1.6], ["zoom"], 5, largura * 0.15, 10, largura, 15, largura * 6] } });
  // Manchas urbanas: bairros residenciais, comerciais e industriais em cinza-azulado.
  const urbano = { id: "tropical_urbano", type: "fill", source: fonte, "source-layer": "landuse", minzoom: 9,
    filter: ["in", ["get", "kind"], ["literal", ["residential", "commercial", "retail", "industrial"]]],
    paint: { "fill-color": T.urbano, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0, 11, 0.9] } };

  const iAgua = ls.findIndex((l) => l.id === "water");
  ls.splice(iAgua + 1, 0, faixa("tropical_costa_rasa", T.aguaRasa, 6, 0.7), faixa("tropical_costa", T.aguaCosta, 2.2, 0.8));
  const iPark = ls.findIndex((l) => l.id === "landuse_park");
  ls.splice(iPark, 0, urbano);

  ls = ls.map((l) => {
    if (l.id === "buildings") {
      return { ...l, paint: { ...l.paint, "fill-color": T.predio, "fill-outline-color": T.predioBorda,
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14.5, 1] } };
    }
    if (l.type === "symbol" && l.layout && l.layout["text-field"]) {
      // Rótulos em caixa alta, espaçados, brancos com halo azul-petróleo.
      return { ...l, layout: { ...l.layout, "text-transform": "uppercase", "text-letter-spacing": 0.12,
        "text-font": ["Noto Sans Medium"] },
        paint: { ...l.paint, "text-halo-width": 1.6, "text-halo-blur": 0.4 } };
    }
    return l;
  });
  return { base: "light", layers: ls };
}
