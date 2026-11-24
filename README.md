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

Os estilos versionados apontam para a API do Protomaps com o marcador `SUA_CHAVE_PROTOMAPS`
(a chave não fica no repositório). Para gerar estilos já com a chave:
`PROTOMAPS_KEY=xxxx node scripts/gerar_estilos.mjs clientes/<cliente>`.
Para um extrato próprio, passe a URL: `node scripts/gerar_estilos.mjs clientes/<cliente> https://.../sp.pmtiles`
(nesse caso registre o protocolo `pmtiles://` no MapLibre).

Cada variante tem também `style-<variante>-sem-rotulos.json`, sem textos e ícones (QGIS, camadas temáticas densas).

## Perfis próprios

Uma variante pode usar um estilo feito à mão em vez da paleta derivada: `"perfis": {"claro": "dekkai_light"}`
no `marca.json` aponta para `scripts/perfis/dekkai_light.mjs`. O perfil `dekkai_light` (light-dekkai v2)
interpola cores por escala (nacional até z4,5, estadual z6 a z8, cidade a partir de z10), suaviza os contornos
de rua por zoom e dá ênfase à cidade a partir do z12 (quadras, prédios, áreas comerciais, pontos de comércio e serviço).

Prévias: `clientes/<cliente>/previa-<cliente>.html` (índice em `index.html`).

## Novo cliente

Instalação (uma vez): Python 3, Node 18+ e `npm install` na raiz.

1. Copie `clientes/_modelo` para `clientes/<cliente>` e preencha `marca.json`
   (`secundaria` e `acento` são opcionais). Ajustes por cliente vão em `ajustes`,
   ex.: `{"colorido": {"limites": "acc"}}` ou `{"escuro": {"rodovia": [0.58, 0.13, "acc"]}}`.
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
