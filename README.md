# basemaps-marca

Basemaps para MapLibre GL derivados da identidade visual de cada cliente, em quatro variantes:
**claro**, **colorido**, **escuro** e **satélite**. Tiles vetoriais do Protomaps (OpenStreetMap)
e imagem Sentinel-2 cloudless 2016 (EOX, CC BY 4.0).

## Usar um estilo pronto

Com o GitHub Pages ativo, cada estilo tem endereço fixo:

```js
const map = new maplibregl.Map({
  container: "map",
  style: "https://tdekkai.github.io/basemaps-marca/clientes/dekkai/estilos/style-claro.json",
});
```

O estilo usa o protocolo `pmtiles://`; registre-o antes de criar o mapa:

```js
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);
```

Prévias: `clientes/<cliente>/previa-<cliente>.html` (índice em `index.html`).

## Novo cliente

Instalação (uma vez): Python 3, Node 18+ e `npm install` na raiz.

1. Copie `clientes/_modelo` para `clientes/<cliente>` e preencha `marca.json`
   (`secundaria` e `acento` são opcionais).
2. `python scripts/derivar_paletas.py clientes/<cliente>` gera as paletas e valida o contraste.
3. `node scripts/gerar_estilos.mjs clientes/<cliente>` gera os quatro `style.json`.
4. `python scripts/montar_previa.py clientes/<cliente> [fonte.ttf]` gera a prévia HTML.

Ajuste fino: dicionário `RECEITAS` em `scripts/derivar_paletas.py` (luminosidade e croma por papel e variante).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `clientes/` | Um diretório por cliente: `marca.json`, `paletas.json`, `estilos/`, prévia |
| `scripts/` | Conversão de cor (OKLCH), derivação de paletas, geração de estilos, prévia |
| `references/` | Mapeamento papel → camadas do Protomaps e critérios de contraste |
| `assets/` | Fonte Audex (SIL OFL 1.1, licença em `assets/License.txt`) |

## Atribuição obrigatória

- `Protomaps © OpenStreetMap` em todas as variantes.
- Variante satélite: `Sentinel-2 cloudless 2016 - s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)`.

## Limitações conhecidas (v0.1)

- A fonte dos tiles é o PMTiles de demonstração do Protomaps; para entregas a clientes, trocar
  por um extrato próprio (`node scripts/gerar_estilos.mjs clientes/<cliente> <url.pmtiles>`).
- A imagem de satélite gratuita tem resolução de 10 m e é de 2016; serve à escala regional.
