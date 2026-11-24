"""Deriva as paletas por papel (16 papéis) das quatro variantes a partir de marca.json.

Uso: python derivar_paletas.py ../clientes/dekkai
Saída: <pasta>/paletas.json e relatório de validação no terminal.

Regra geral: o matiz vem da marca; luminosidade (L) e croma (C) vêm da receita
da variante. Água e verde mantêm a convenção cartográfica (azulado e esverdeado),
apenas puxados 30% na direção do matiz da cor primária.
"""
import json, sys, pathlib
from cor import hex_oklch, oklch_hex, contraste, delta_e


def puxar(h_base, h_alvo, fator=0.3):
    d = ((h_alvo - h_base + 180) % 360) - 180
    return (h_base + d * fator) % 360


# Receitas: papel -> (L, C, referência de matiz)
# referências: neu (neutra clara), pri (primária), sec, acc (acento), agua, verde
RECEITAS = {
    "claro": {
        "fundo": (0.970, 0.010, "neu"), "agua": (0.885, 0.030, "agua"),
        "verde": (0.930, 0.028, "verde"), "uso_especial": (0.955, 0.012, "neu"),
        "edificacoes": (0.860, 0.014, "neu"), "via_menor": (0.995, 0.004, "neu"),
        "via_principal": (1.000, 0.000, "neu"), "rodovia": (0.925, 0.045, "acc"),
        "contorno_via": (0.890, 0.012, "neu"), "ferrovia": (0.780, 0.010, "neu"),
        "limites": (0.640, 0.035, "pri"), "rotulo_forte": "pri",
        "rotulo_medio": (0.470, 0.035, "pri"), "rotulo_fraco": (0.600, 0.015, "neu"),
        "halo": (0.970, 0.010, "neu"),
    },
    "colorido": {
        "fundo": (0.925, 0.032, "neu"), "agua": (0.790, 0.065, "agua"),
        "verde": (0.845, 0.060, "verde"), "uso_especial": (0.905, 0.030, "neu"),
        "edificacoes": (0.790, 0.035, "neu"), "via_menor": (0.975, 0.012, "neu"),
        "via_principal": (0.995, 0.006, "neu"), "rodovia": (0.840, 0.100, "acc"),
        "contorno_via": (0.815, 0.030, "neu"), "ferrovia": (0.700, 0.020, "neu"),
        "limites": "sec", "rotulo_forte": "pri",
        "rotulo_medio": (0.420, 0.050, "sec"), "rotulo_fraco": (0.520, 0.025, "neu"),
        "halo": (0.945, 0.030, "neu"),
    },
    "escuro": {
        "fundo": (0.215, 0.022, "pri"), "agua": (0.165, 0.030, "agua"),
        "verde": (0.245, 0.035, "verde"), "uso_especial": (0.230, 0.020, "pri"),
        "edificacoes": (0.330, 0.018, "pri"), "via_menor": (0.300, 0.015, "pri"),
        "via_principal": (0.370, 0.018, "pri"), "rodovia": (0.500, 0.070, "acc"),
        "contorno_via": (0.190, 0.020, "pri"), "ferrovia": (0.360, 0.010, "pri"),
        "limites": (0.520, 0.035, "neu"), "rotulo_forte": "neu",
        "rotulo_medio": (0.780, 0.025, "neu"), "rotulo_fraco": (0.640, 0.012, "neu"),
        "halo": (0.215, 0.022, "pri"),
    },
}
# Satélite reaproveita a escura para vias e rótulos; o raster recebe ajustes próprios.
RECEITAS["satelite"] = {**RECEITAS["escuro"],
    "rodovia": (0.720, 0.090, "acc"), "via_principal": (0.850, 0.010, "neu"),
    "contorno_via": (0.200, 0.020, "pri"), "limites": (0.880, 0.030, "neu"),
    "halo": (0.200, 0.030, "pri"), "fundo": "pri", "agua": (0.150, 0.030, "agua")}

POIS_HUES = {"blue": 250, "green": 150, "lapis": 270, "pink": 0,
             "red": 25, "slategray": 240, "tangerine": 55, "turquoise": 195}
POIS_LC = {"claro": (0.560, 0.070), "colorido": (0.520, 0.110),
           "escuro": (0.720, 0.070), "satelite": (0.800, 0.080)}


def derivar(marca):
    cores = dict(marca["cores"])
    # marcas com menos cores: secundária herda a primária; acento herda a secundária
    cores.setdefault("secundaria", cores["primaria"])
    cores.setdefault("acento", cores["secundaria"])
    ref_hex = {"neu": cores["neutra_clara"], "pri": cores["primaria"],
               "sec": cores["secundaria"], "acc": cores["acento"]}
    hue = {k: hex_oklch(v)[2] for k, v in ref_hex.items()}
    hue["agua"] = puxar(225, hue["pri"])
    hue["verde"] = puxar(145, hue["pri"])
    saida = {}
    for var, rec in RECEITAS.items():
        p = {}
        for papel, r in rec.items():
            p[papel] = ref_hex[r] if isinstance(r, str) else oklch_hex(r[0], r[1], hue[r[2]])
        L, C = POIS_LC[var]
        p["pois"] = {k: oklch_hex(L, C, h) for k, h in POIS_HUES.items()}
        saida[var] = p
    return saida


TESTES_TEXTO = [("rotulo_forte", 4.5), ("rotulo_medio", 4.5), ("rotulo_fraco", 3.0)]
TESTES_FEICAO = [("agua", 0.05, None), ("verde", 0.03, None),
                 ("uso_especial", 0.008, 0.06), ("via_principal", 0.04, None)]


def validar(paletas):
    ok_total = True
    for var, p in paletas.items():
        linhas = []
        for papel, minimo in TESTES_TEXTO:
            r = contraste(p[papel], p["halo"])
            ok = r >= minimo; ok_total &= ok
            linhas.append(f"  {'OK ' if ok else 'FALHA'} {papel} x halo = {r:.1f}:1 (mín {minimo})")
        d = delta_e(p["halo"], p["fundo"])
        if var != "satelite":
            ok = d <= 0.08; ok_total &= ok
            linhas.append(f"  {'OK ' if ok else 'FALHA'} halo x fundo ΔE = {d:.3f} (máx 0.08)")
            for papel, mn, mx in TESTES_FEICAO:
                d = delta_e(p[papel], p["fundo"])
                if papel == "via_principal":  # em mapas claros a via se lê pelo contorno
                    d = max(d, delta_e(p["contorno_via"], p["fundo"]))
                ok = d >= mn and (mx is None or d <= mx); ok_total &= ok
                faixa = f"≥{mn}" + (f" e ≤{mx}" if mx else "")
                linhas.append(f"  {'OK ' if ok else 'FALHA'} fundo x {papel} ΔE = {d:.3f} ({faixa})")
        print(f"[{var}]\n" + "\n".join(linhas))
    return ok_total


if __name__ == "__main__":
    pasta = pathlib.Path(sys.argv[1])
    marca = json.loads((pasta / "marca.json").read_text(encoding="utf-8"))
    paletas = derivar(marca)
    aprovado = validar(paletas)
    (pasta / "paletas.json").write_text(json.dumps(paletas, indent=2, ensure_ascii=False), encoding="utf-8")
    print("\nResultado:", "APROVADO" if aprovado else "REVISAR")
