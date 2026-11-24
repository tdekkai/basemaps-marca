# Critérios de validação (validar.py)

## Rótulos (critério formal: WCAG 2, razão de contraste)
WCAG 3 ainda é rascunho e o algoritmo de contraste dele não está definido;
a conformidade hoje é medida pela razão do WCAG 2. APCA entra só como segunda
opinião, sobretudo na variante escura, sem reprovar estilo.

| Par medido | Mínimo | Observação |
|---|---|---|
| rotulo_forte × halo | 4.5:1 | Nível AA para texto normal |
| rotulo_medio × halo | 4.5:1 | Idem |
| rotulo_fraco × halo | 3.0:1 | Abaixo do AA por escolha de design (ruas locais recuam); registrar na entrega |
| halo × fundo | ΔE OKLab ≤ 0.08 | Halo deve se fundir ao fundo, não virar caixa |
| Variante escura | relatar Lc APCA | Informativo |

## Feições do basemap (critério próprio, não WCAG)
O critério 1.4.11 (3:1 para elementos gráficos) não se aplica: o basemap deve
recuar para os dados temáticos aparecerem. Usa-se distância perceptual ΔE em OKLab.

| Par | Faixa de ΔE OKLab | Por quê |
|---|---|---|
| fundo × agua | ≥ 0.05 | Água precisa ser distinguível |
| fundo × verde | ≥ 0.03 | Parques perceptíveis, discretos |
| fundo × uso_especial | 0.01 a 0.04 | Variação mínima |
| fundo × via_principal | ≥ 0.04 | Malha viária legível |
| maior ΔE entre feições (variante claro) | ≤ 0.15 | Teto: deixa espaço para a camada temática |

## Daltonismo
Simular protanopia, deuteranopia e tritanopia (Machado et al., 2009) e repetir
os testes fundo × agua e fundo × verde. Os limiares são provisórios e serão
calibrados com os primeiros estilos aprovados visualmente.
