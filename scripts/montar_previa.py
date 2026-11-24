"""Monta a prévia HTML (abre direto no navegador) a partir de estilos/ e paletas.json.
Uso: python montar_previa.py ../clientes/dekkai [caminho-da-fonte-da-marca.ttf]
"""
import base64, json, sys, pathlib

pasta = pathlib.Path(sys.argv[1])
aqui = pathlib.Path(__file__).parent
fonte = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else aqui.parent / "assets" / "Audex-Regular.ttf"
marca = json.loads((pasta / "marca.json").read_text(encoding="utf-8"))
paletas = json.loads((pasta / "paletas.json").read_text(encoding="utf-8"))
estilos = {v: json.loads((pasta / "estilos" / f"style-{v}.json").read_text(encoding="utf-8"))
           for v in ("claro", "colorido", "escuro", "satelite")}
c = marca["cores"]
html = (aqui / "previa_template.html").read_text(encoding="utf-8")
for k, v in {
    "__CLIENTE__": marca["cliente"], "__NEU__": c["neutra_clara"], "__PRI__": c["primaria"],
    "__SEC__": c["secundaria"], "__ACC__": c["acento"],
    "__FONTE__": base64.b64encode(fonte.read_bytes()).decode() if fonte.exists() else "",
    "__ESTILOS__": json.dumps(estilos, separators=(",", ":"), ensure_ascii=False).replace("</", "<\\/"),
    "__PALETAS__": json.dumps(paletas, ensure_ascii=False),
}.items():
    html = html.replace(k, v)
saida = pasta / f"previa-{marca['cliente'].split()[0].lower()}.html"
saida.write_text(html, encoding="utf-8")
print(saida, f"{saida.stat().st_size/1024:.0f} KB")
