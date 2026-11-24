# Papéis da marca → posições do Flavor (Protomaps @protomaps/basemaps 5.7.2)

O Flavor tem 74 cores simples + `pois` (8 cores) + `landcover` (7 cores, opcional).
O gerador nunca escreve cor direto numa posição: escreve num PAPEL, e o papel
preenche todas as posições do grupo. Isso reduz ~89 decisões a 16.

| Papel | Posições do Flavor | Função cartográfica |
|---|---|---|
| fundo | background, earth | Terra firme; é a cor dominante do mapa |
| verde | park_a, park_b, wood_a, wood_b, scrub_a, scrub_b, landcover.forest, landcover.grassland, landcover.scrub, landcover.farmland | Parques e vegetação; manter convenção esverdeada |
| uso_especial | hospital, school, industrial, aerodrome, military, zoo, pedestrian, pier, runway, glacier, sand, beach, landcover.barren, landcover.urban_area, landcover.glacier | Usos do solo; variação mínima em relação ao fundo |
| agua | water | Corpos d'água; manter convenção azulada |
| edificacoes | buildings | Edificações (renderizadas com opacidade 0.5 no estilo) |
| via_menor | other, minor_service, minor_a, minor_b, bridges_other, bridges_minor, tunnel_other, tunnel_minor | Ruas locais |
| via_principal | link, major, bridges_link, bridges_major, tunnel_link, tunnel_major | Avenidas e acessos |
| rodovia | highway, bridges_highway, tunnel_highway | Rodovias; único lugar onde a cor da marca pode aparecer nas vias |
| contorno_via | todas as posições *_casing (16) | Bordas das vias |
| ferrovia | railway | Ferrovias |
| limites | boundaries | Limites administrativos |
| rotulo_forte | city_label | Cidades; recebe a cor primária da marca |
| rotulo_medio | subplace_label, state_label, country_label, roads_label_major, ocean_label | Bairros, estados, vias principais, água |
| rotulo_fraco | roads_label_minor, address_label | Ruas locais e números |
| halo | todas as posições *_halo (6) | Halo dos rótulos; é o fundo efetivo do texto |
| pois | pois.{blue, green, lapis, pink, red, slategray, tangerine, turquoise} | Ícones de pontos de interesse |

## O que o Flavor NÃO controla (pós-processamento no gerar_estilos.js)

- Fonte: o pacote fixa "Noto Sans Regular/Medium/Italic" em `text-font`.
  `layers()` não expõe parâmetro de fonte; trocar pela fonte da marca exige
  substituir `text-font` nas 71 camadas geradas e servir glyphs próprios.
- Ícones: vêm do sprite (`sprites/v4/light` ou `dark`). Ícone na cor da marca
  exige sprite próprio.
- Larguras, opacidades e zoom de entrada das camadas: fixos no pacote.
  Ajustar só se a variante pedir (ex.: rótulos mais esparsos para dataviz).

## Preset de partida por variante

| Variante | Preset base | Motivo |
|---|---|---|
| claro | white | Feito para visualização de dados; fundo neutro |
| colorido | light | Mantém verde, água e uso do solo diferenciados |
| escuro | dark | Hierarquia de vias já calibrada para fundo escuro |
| satélite | dark (só rótulos e vias, `labelsOnly` + vias) | Sobreposição à imagem tratada |

## Atribuição obrigatória

`<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>`
