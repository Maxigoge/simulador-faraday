from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate, Flowable, Frame, KeepTogether, NextPageTemplate, PageBreak, PageTemplate,
    Paragraph, Spacer, Table, TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "guia_exposicion_simulador_faraday.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)

NAVY = colors.HexColor("#132A3A")
BLUE = colors.HexColor("#157A8A")
CYAN = colors.HexColor("#DDF3F3")
ORANGE = colors.HexColor("#EA7A3B")
CREAM = colors.HexColor("#FAF7F0")
INK = colors.HexColor("#24313A")
MUTED = colors.HexColor("#5B6972")
LINE = colors.HexColor("#D8E0E2")
GREEN = colors.HexColor("#DDEFE5")
RED = colors.HexColor("#FBE7E2")
WHITE = colors.white


pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))


class AccentLine(Flowable):
    def __init__(self, width=3.2 * cm):
        super().__init__()
        self.width = width
        self.height = 5

    def draw(self):
        self.canv.setStrokeColor(ORANGE)
        self.canv.setLineWidth(3)
        self.canv.line(0, 2, self.width, 2)


class FaradaySketch(Flowable):
    def __init__(self, kind):
        super().__init__()
        self.kind = kind
        self.width = 16.8 * cm
        self.height = 3.15 * cm

    def draw(self):
        c = self.canv
        c.saveState()
        c.setStrokeColor(NAVY)
        c.setFillColor(CYAN)
        c.roundRect(0, 0, self.width, self.height, 8, stroke=1, fill=1)
        c.setFont("Arial-Bold", 10)
        c.setFillColor(NAVY)
        if self.kind == 1:
            c.drawString(12, self.height - 18, "P1: la bobina entra al campo")
            c.setFillColor(colors.HexColor("#BBDDDD"))
            c.rect(self.width * .52, 12, self.width * .44, self.height - 36, stroke=0, fill=1)
            c.setStrokeColor(ORANGE); c.setLineWidth(2)
            c.rect(self.width * .36, 30, 70, 42, stroke=1, fill=0)
            c.line(self.width * .27, 51, self.width * .35, 51)
            c.line(self.width * .33, 56, self.width * .35, 51)
            c.line(self.width * .33, 46, self.width * .35, 51)
            c.setFillColor(NAVY); c.setFont("Arial", 9)
            c.drawString(12, 14, "Cambia la porción de la espira atravesada por B")
        elif self.kind == 2:
            c.drawString(12, self.height - 18, "P2: el área disminuye")
            c.setStrokeColor(ORANGE); c.setLineWidth(2)
            c.rect(120, 15, 100, 45, stroke=1, fill=0)
            c.line(220, 10, 220, 65)
            c.line(220, 38, 185, 38)
            c.line(193, 43, 185, 38); c.line(193, 33, 185, 38)
            c.setFillColor(NAVY); c.setFont("Arial", 9)
            c.drawString(250, 34, "B constante + A cambia  ->  cambia el flujo")
        else:
            c.drawString(12, self.height - 18, "P3: cambia la intensidad de B")
            c.setStrokeColor(ORANGE); c.setLineWidth(2)
            c.rect(120, 15, 105, 45, stroke=1, fill=0)
            c.setFillColor(NAVY); c.setFont("Arial-Bold", 14)
            for x in [139, 165, 191, 217]:
                c.drawString(x, 30, "x")
            c.setFont("Arial", 9)
            c.drawString(250, 34, "Bobina quieta + B variable  ->  fem y corriente")
        c.restoreState()


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="BodyX", fontName="Arial", fontSize=10.1, leading=14.2,
                          textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="SmallX", fontName="Arial", fontSize=8.6, leading=11.5,
                          textColor=MUTED))
styles.add(ParagraphStyle(name="TitleX", fontName="Arial-Bold", fontSize=27, leading=31,
                          textColor=NAVY, spaceAfter=8))
styles.add(ParagraphStyle(name="H1X", fontName="Arial-Bold", fontSize=20, leading=23,
                          textColor=NAVY, spaceAfter=8))
styles.add(ParagraphStyle(name="H2X", fontName="Arial-Bold", fontSize=13, leading=16,
                          textColor=BLUE, spaceBefore=7, spaceAfter=5))
styles.add(ParagraphStyle(name="FormulaX", fontName="Arial-Bold", fontSize=13.5, leading=18,
                          alignment=TA_CENTER, textColor=NAVY, spaceAfter=2))
styles.add(ParagraphStyle(name="CalloutX", fontName="Arial", fontSize=9.4, leading=13,
                          textColor=INK))
styles.add(ParagraphStyle(name="CoverTag", fontName="Arial-Bold", fontSize=10, leading=13,
                          textColor=ORANGE, alignment=TA_CENTER, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverTitle", fontName="Arial-Bold", fontSize=31, leading=36,
                          textColor=WHITE, alignment=TA_CENTER, spaceAfter=13))
styles.add(ParagraphStyle(name="CoverSub", fontName="Arial", fontSize=13, leading=18,
                          textColor=colors.HexColor("#D8E9ED"), alignment=TA_CENTER))


def p(text, style="BodyX"):
    return Paragraph(text, styles[style])


def heading(title, kicker=None):
    out = []
    if kicker:
        out += [p(kicker.upper(), "CoverTag")]
    out += [p(title, "H1X"), AccentLine(), Spacer(1, 8)]
    return out


def box(title, body, color=CYAN):
    data = [[p(title, "H2X")], [p(body, "CalloutX")]]
    t = Table(data, colWidths=[16.6 * cm], hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), color),
        ("BOX", (0, 0), (-1, -1), .7, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, 0), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def formula(text, note=None):
    rows = [[p(text, "FormulaX")]]
    if note:
        rows.append([p(note, "SmallX")])
    t = Table(rows, colWidths=[16.6 * cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("BOX", (0, 0), (-1, -1), .8, ORANGE),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def step_table(rows):
    data = [[p("N°", "SmallX"), p("Qué hago", "SmallX"), p("Cuenta / resultado", "SmallX")]]
    for number, action, result in rows:
        data.append([p(str(number), "H2X"), p(action, "CalloutX"), p(result, "CalloutX")])
    t = Table(data, colWidths=[1.1 * cm, 6.7 * cm, 8.8 * cm], repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("GRID", (0, 0), (-1, -1), .45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, CREAM]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def page_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canvas.setStrokeColor(LINE)
    canvas.line(2 * cm, 1.45 * cm, A4[0] - 2 * cm, 1.45 * cm)
    canvas.setFont("Arial", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(2 * cm, .9 * cm, "Guía de exposición - Simulador de Faraday")
    canvas.drawRightString(A4[0] - 2 * cm, .9 * cm, f"{doc.page}")
    canvas.restoreState()


def cover_bg(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, A4[0], A4[1], stroke=0, fill=1)
    canvas.setFillColor(BLUE)
    canvas.circle(A4[0] * .12, A4[1] * .83, 80, stroke=0, fill=1)
    canvas.setFillColor(ORANGE)
    canvas.circle(A4[0] * .9, A4[1] * .15, 110, stroke=0, fill=1)
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUT), pagesize=A4,
    leftMargin=2.2 * cm, rightMargin=2.2 * cm,
    topMargin=1.8 * cm, bottomMargin=1.8 * cm,
    title="Guía de exposición - Simulador de Faraday",
    author="Simulador Faraday - Física II",
)
cover_frame = Frame(2.2 * cm, 4.7 * cm, A4[0] - 4.4 * cm, A4[1] - 9.4 * cm,
                    leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
body_frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height,
                   leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
doc.addPageTemplates([
    PageTemplate(id="cover", frames=[cover_frame], onPage=cover_bg),
    PageTemplate(id="body", frames=[body_frame], onPage=page_bg, autoNextPageTemplate="body"),
])

story = []

# Portada
story += [Spacer(1, 2.4 * cm), p("FÍSICA II · INDUCCIÓN ELECTROMAGNÉTICA", "CoverTag")]
story += [p("Guía para exponer<br/>el simulador de Faraday", "CoverTitle")]
story += [p("Tres ejercicios explicados desde cero, con resolución paso a paso,<br/>unidades, ideas para decir en voz alta y preguntas típicas.", "CoverSub")]
story += [Spacer(1, 1.2 * cm), p("Objetivo: entender la lógica, no memorizar cuentas sueltas.", "CoverTag")]
story += [NextPageTemplate("body"), PageBreak()]

# 2 - Base conceptual
story += heading("1. La idea central en una sola página", "Antes de los ejercicios")
story += [p("La <b>inducción electromagnética</b> ocurre cuando cambia el flujo magnético que atraviesa una espira. Ese cambio genera una fuerza electromotriz o <b>fem</b>. Si el circuito está cerrado, la fem puede producir corriente.")]
story += [formula("Φ = B · A · cos(θ)", "Flujo magnético. En los tres ejercicios el campo es perpendicular al plano, por eso θ = 0 y cos(θ) = 1.")]
story += [Spacer(1, 8), formula("|ε| = N · |ΔΦ| / Δt", "Ley de Faraday en módulo y para una variación promedio. N es la cantidad de vueltas.")]
story += [p("Tres caminos para cambiar Φ", "H2X")]
three = Table([
    [p("Cambia B", "H2X"), p("Cambia A", "H2X"), p("Cambia θ", "H2X")],
    [p("El campo aumenta o disminuye.<br/><b>Ejercicio 3</b>", "SmallX"),
     p("La superficie útil cambia o entra al campo.<br/><b>Ejercicios 1 y 2</b>", "SmallX"),
     p("La espira gira.<br/>No aparece en estos ejercicios.", "SmallX")]
], colWidths=[5.53 * cm] * 3)
three.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), CYAN), ("BOX", (0, 0), (-1, -1), .6, LINE),
    ("INNERGRID", (0, 0), (-1, -1), .4, LINE), ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 9), ("RIGHTPADDING", (0, 0), (-1, -1), 9),
    ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
story += [three, Spacer(1, 9)]
story += [box("Ley de Lenz: ¿qué significa el signo menos?", "La corriente inducida crea un campo que <b>se opone al cambio</b> que la originó. Para calcular solamente el valor pedido usamos módulos; el signo sirve para determinar el sentido.", GREEN)]
story += [p("Unidades que tenés que reconocer", "H2X")]
units = [
    ["Magnitud", "Símbolo", "Unidad", "Equivalencia útil"],
    ["Campo magnético", "B", "tesla (T)", "1 T = 1000 mT"],
    ["Área", "A", "m²", "1 cm² = 10⁻⁴ m²"],
    ["Flujo magnético", "Φ", "weber (Wb)", "1 mWb = 10⁻³ Wb"],
    ["fem", "ε", "volt (V)", "1 mV = 10⁻³ V"],
]
ut = Table([[p(str(x), "SmallX") for x in row] for row in units], colWidths=[4.4*cm, 2.2*cm, 4.2*cm, 5.8*cm])
ut.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), WHITE),
                        ("GRID", (0,0), (-1,-1), .4, LINE), ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, CREAM]),
                        ("LEFTPADDING", (0,0), (-1,-1), 7), ("TOPPADDING", (0,0), (-1,-1), 6),
                        ("BOTTOMPADDING", (0,0), (-1,-1), 6)]))
story += [ut, PageBreak()]

# 3 - Método de exposición
story += heading("2. Cómo explicar cualquier ejercicio", "Método de cinco pasos")
method = [
    ("1", "Contá qué cambia", "¿Cambia B, cambia A, cambia el ángulo o la espira entra/sale del campo?"),
    ("2", "Nombrá la ley", "Faraday relaciona el cambio de flujo con la fem. Lenz explica el sentido."),
    ("3", "Pasá todo al SI", "cm a m; mV a V; cm² a m². Hacelo antes de reemplazar."),
    ("4", "Despejá primero", "Escribí la fórmula con la incógnita sola y recién después poné números."),
    ("5", "Cerrá con una interpretación", "Decí qué significa el resultado y verificá su unidad."),
]
for n, title, body in method:
    row = Table([[p(n, "H1X"), p(f"<b>{title}</b><br/>{body}", "CalloutX")]], colWidths=[1.2*cm, 15.4*cm])
    row.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,-1), WHITE), ("BOX", (0,0), (-1,-1), .5, LINE),
                             ("VALIGN", (0,0), (-1,-1), "MIDDLE"), ("LEFTPADDING", (0,0), (-1,-1), 10),
                             ("TOPPADDING", (0,0), (-1,-1), 8), ("BOTTOMPADDING", (0,0), (-1,-1), 8)]))
    story += [row, Spacer(1, 6)]
story += [box("Frase comodín para empezar", '“En este ejercicio aparece una fem porque está cambiando el flujo magnético que atraviesa la espira. Primero identifico qué magnitud provoca ese cambio y después aplico Faraday.”', CYAN)]
story += [Spacer(1, 8), box("Conversión de áreas: el error más común", "No alcanza con mover la coma una vez: como el área está al cuadrado, el factor también se eleva al cuadrado.<br/><b>5 cm = 0,05 m</b>, <b>10 cm = 0,10 m</b>, entonces <b>5 cm × 10 cm = 0,005 m² = 50 cm²</b>.", RED)]
story += [p("Mapa rápido de los tres ejercicios", "H2X")]
story += [p("<b>P1:</b> entra al campo → cambia el flujo. &nbsp;&nbsp; <b>P2:</b> disminuye el área → cambia el flujo. &nbsp;&nbsp; <b>P3:</b> cambia B → aparece fem y corriente.")]
story += [PageBreak()]

# P1
story += heading("3. Ejercicio 1 - Bobina que entra al campo", "Faraday con variación de flujo")
story += [FaradaySketch(1), Spacer(1, 8)]
story += [p("<b>Datos:</b> N = 50 vueltas; a = 5 cm; b = 10 cm; B = 0,5 T; tiempo de entrada Δt = 0,25 s. Se pide la fem promedio.")]
story += [box("Qué pasa físicamente", "Al principio la bobina está fuera de la región magnética: Φ<sub>i</sub> = 0. Al terminar de entrar, el campo atraviesa toda su superficie: Φ<sub>f</sub> = B·A. Mientras cruza la frontera el flujo cambia y aparece fem. Cuando queda totalmente adentro, el flujo vuelve a ser constante y la fem es cero.")]
story += [p("Resolución paso a paso", "H2X")]
story += [step_table([
    (1, "Convertir los lados a metros.", "a = 5 cm = 0,05 m<br/>b = 10 cm = 0,10 m"),
    (2, "Calcular el área de cada espira.", "A = a·b = 0,05·0,10 = <b>0,005 m²</b> = 50 cm²"),
    (3, "Calcular el cambio de flujo por espira.", "ΔΦ = B·A - 0 = 0,5·0,005 = <b>0,0025 Wb</b> = 2,5 mWb"),
    (4, "Aplicar Faraday para N vueltas.", "|ε| = N·|ΔΦ|/Δt = 50·0,0025/0,25"),
    (5, "Resolver y colocar la unidad.", "<b>|ε| = 0,5 V = 500 mV</b>"),
])]
story += [Spacer(1, 9), formula("|ε| = 0,5 V", "Resultado final. El signo de Lenz indicaría el sentido, pero el ejercicio pide el módulo."), PageBreak()]

# P1 oral/web
story += heading("4. Ejercicio 1 - Cómo mostrarlo en la web", "Guion oral")
story += [p("Mientras movés los controles o señalás la animación, podés decir:")]
story += [box("Guion de 40 segundos", '“La bobina tiene 50 vueltas y entra desde una zona sin campo a otra con B igual a 0,5 tesla. Cada vuelta tiene un área de 0,005 metros cuadrados. Por eso, el flujo por vuelta cambia de cero a 0,0025 webers. Faraday dice que la fem total es la cantidad de vueltas por ese cambio de flujo, dividido por el tiempo de entrada. El resultado es 0,5 volt. La animación muestra que la fem aparece solamente mientras la bobina cruza la frontera: afuera y completamente adentro el flujo es constante.”', GREEN)]
story += [p("Qué representa cada resultado de la pantalla", "H2X")]
screen = [
    ["Pantalla", "Qué significa"],
    ["Fem inducida ε", "La tensión generada por el cambio de flujo: 0,5 V."],
    ["Tiempo de cruce Δt", "Cuánto tarda la bobina en entrar: b/v = 0,25 s."],
    ["Área A", "Superficie de cada vuelta: 50 cm² = 0,005 m²."],
    ["Variación de flujo ΔΦ", "Cambio de flujo por una espira: 2,5 mWb."],
]
st = Table([[p(x, "SmallX") for x in row] for row in screen], colWidths=[5.2*cm, 11.4*cm])
st.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), WHITE),
                        ("GRID", (0,0), (-1,-1), .5, LINE), ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, CREAM]),
                        ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 8),
                        ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7)]))
story += [st, Spacer(1, 8)]
story += [box("Si te preguntan por qué la fórmula de la web es ε = N·B·a·v", "Porque el área que entra por segundo es <b>a·v</b>. Entonces dΦ/dt = B·a·v y Faraday queda ε = N·B·a·v. Es la misma física que N·ΔΦ/Δt.", CYAN)]
story += [PageBreak()]

# P2
story += heading("5. Ejercicio 2 - Espira cuya área disminuye", "Faraday con B constante")
story += [FaradaySketch(2), Spacer(1, 8)]
story += [p("<b>Datos:</b> una espira (N = 1), lado inicial L = 0,20 m, fem ε = 18 mV y rapidez de disminución del área |dA/dt| = 0,1 m²/s. Se pide B.")]
story += [box("Qué pasa físicamente", "El campo B no cambia, pero la superficie encerrada por el circuito se achica. Como Φ = B·A, al disminuir A también cambia el flujo y aparece fem.")]
story += [p("Resolución paso a paso", "H2X")]
story += [step_table([
    (1, "Convertir la fem a voltios.", "18 mV = <b>0,018 V</b>"),
    (2, "Elegir la forma de Faraday.", "|ε| = N·B·|dA/dt|; como N = 1: |ε| = B·|dA/dt|"),
    (3, "Despejar el campo B.", "B = |ε| / |dA/dt|"),
    (4, "Reemplazar los valores.", "B = 0,018 / 0,1"),
    (5, "Resolver y expresar el resultado.", "<b>B = 0,18 T = 180 mT</b>"),
])]
story += [Spacer(1, 8), formula("B = 0,18 T", "El signo negativo de dA/dt indica que el área disminuye; para hallar el módulo de B usamos valores absolutos.")]
story += [Spacer(1, 8), box("¿Por qué aparece L = 0,20 m si no se usa?", "Porque el problema ya entrega directamente dA/dt. El lado sirve como control: el área inicial es L² = 0,04 m², pero no hace falta para despejar B.", RED)]
story += [PageBreak()]

# P3
story += heading("6. Tercer ejercicio - Campo variable", "Faraday + ley de Ohm")
story += [FaradaySketch(3), Spacer(1, 8)]
story += [p("<b>Datos:</b> a = 5 cm; b = 8 cm; N = 75 vueltas; R = 8 Ω; corriente deseada I = 0,1 A. Se pide la rapidez |dB/dt|.")]
story += [box("Qué pasa físicamente", "La bobina está quieta y su área no cambia. Lo que varía es B. Ese cambio produce una fem por Faraday y, como el circuito tiene resistencia, la fem hace circular corriente según la ley de Ohm.")]
story += [p("Resolución paso a paso", "H2X")]
story += [step_table([
    (1, "Convertir y calcular el área.", "A = 0,05·0,08 = <b>0,004 m² = 40 cm²</b>"),
    (2, "Calcular la fem necesaria con Ohm.", "ε = I·R = 0,1·8 = <b>0,8 V</b>"),
    (3, "Aplicar Faraday cuando cambia B.", "|ε| = N·A·|dB/dt|"),
    (4, "Despejar la rapidez de cambio.", "|dB/dt| = |ε|/(N·A)"),
    (5, "Reemplazar y resolver.", "0,8/(75·0,004) = 0,8/0,3 = <b>2,67 T/s</b>"),
])]
story += [Spacer(1, 8), formula("|dB/dt| ≈ 2,67 T/s", "Significa que la intensidad del campo debe cambiar aproximadamente 2,67 teslas por cada segundo.")]
story += [Spacer(1, 8), box("Dos leyes, un puente", "Ohm permite pasar de la corriente pedida a la fem necesaria. Faraday conecta esa fem con la rapidez de cambio del campo. La fem ε es el puente entre ambas leyes.", GREEN)]
story += [PageBreak()]

# Comparación y exposición
story += heading("7. Comparación y guion para la exposición", "Cómo contar la web")
compare = [
    ["Ejercicio", "Qué cambia", "Fórmula útil", "Resultado"],
    ["P1", "La bobina entra al campo", "|ε| = N·|ΔΦ|/Δt", "0,5 V"],
    ["P2", "Disminuye el área A", "B = |ε|/|dA/dt|", "0,18 T"],
    ["P3", "Cambia el campo B", "|dB/dt| = I·R/(N·A)", "2,67 T/s"],
]
ct = Table([[p(x, "SmallX") for x in row] for row in compare], colWidths=[2.2*cm, 5.1*cm, 5.8*cm, 3.5*cm])
ct.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), NAVY), ("TEXTCOLOR", (0,0), (-1,0), WHITE),
                        ("GRID", (0,0), (-1,-1), .5, LINE), ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, CREAM]),
                        ("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 7),
                        ("TOPPADDING", (0,0), (-1,-1), 7), ("BOTTOMPADDING", (0,0), (-1,-1), 7)]))
story += [ct, Spacer(1, 10)]
story += [p("Guion sugerido de 4 a 6 minutos", "H2X")]
script_rows = [
    ["Tiempo", "Qué mostrar", "Qué decir"],
    ["0:00-0:40", "Portada / teoría", "Definir flujo, Faraday y Lenz en palabras simples."],
    ["0:40-2:00", "Problema 1", "Mostrar que la fem solo existe al cruzar la frontera y resolver el área y el flujo."],
    ["2:00-3:10", "Problema 2", "Explicar que B es constante y cambia el área; despejar B."],
    ["3:10-4:30", "Problema 3", "Unir Ohm con Faraday para hallar dB/dt."],
    ["4:30-5:00", "Comparación", "Los tres producen fem porque cambia Φ, pero cambia una causa distinta."],
]
gt = Table([[p(x, "SmallX") for x in row] for row in script_rows], colWidths=[2.4*cm, 4.2*cm, 10*cm])
gt.setStyle(TableStyle([("BACKGROUND", (0,0), (-1,0), BLUE), ("TEXTCOLOR", (0,0), (-1,0), WHITE),
                        ("GRID", (0,0), (-1,-1), .45, LINE), ("VALIGN", (0,0), (-1,-1), "TOP"),
                        ("LEFTPADDING", (0,0), (-1,-1), 7), ("TOPPADDING", (0,0), (-1,-1), 6),
                        ("BOTTOMPADDING", (0,0), (-1,-1), 6)]))
story += [gt, Spacer(1, 9)]
story += [box("Cierre sugerido", '“Los tres ejercicios son aplicaciones de la misma idea: no importa si cambia el campo, el área o la parte de la espira dentro del campo; si cambia el flujo magnético, aparece una fem. La simulación permite ver esa relación y comprobar cómo responde el resultado al modificar cada dato.”', CYAN)]
story += [PageBreak()]

# Preguntas y repaso
story += heading("8. Preguntas típicas y repaso final", "Para defender la exposición")
qa = [
    ("¿Puede haber flujo y no haber fem?", "Sí. Si el flujo es constante, dΦ/dt = 0 y no se induce fem. Esto ocurre en P1 cuando la bobina está completamente dentro del campo."),
    ("¿Qué diferencia hay entre fem y corriente?", "La fem es una tensión inducida, medida en voltios. La corriente aparece si existe un circuito cerrado y depende también de la resistencia: I = ε/R."),
    ("¿Qué es ΔΦ?", "Es la diferencia Φfinal - Φinicial. Se mide en webers. En P1 vale 0,0025 Wb = 2,5 mWb por espira."),
    ("¿Para qué sirve N?", "Cada vuelta aporta fem. Si todas enlazan el mismo flujo, la fem total se multiplica por N."),
    ("¿Por qué usamos valor absoluto?", "Porque los ejercicios piden magnitudes. El signo de Faraday-Lenz se usa para determinar el sentido de la fem o la corriente."),
    ("¿Qué significa T/s?", "Es rapidez de cambio del campo: cuántos teslas aumenta o disminuye B por segundo."),
]
for q, a in qa:
    story += [KeepTogether([p(q, "H2X"), p(a, "BodyX")])]
story += [Spacer(1, 6), box("Lista de control antes de exponer", "□ Sé decir qué es el flujo. &nbsp; □ Distingo fem de corriente. &nbsp; □ Convierto cm a m y mV a V. &nbsp; □ Recuerdo los tres resultados. &nbsp; □ Puedo explicar qué cambia en cada animación. &nbsp; □ No confundo 40 cm² con 4 cm².", GREEN)]
story += [Spacer(1, 10), formula("P1: 0,5 V   |   P2: 0,18 T   |   P3: 2,67 T/s", "Los tres resultados que conviene recordar como referencia."), Spacer(1, 10)]
story += [p("Consejo final: practicá explicando cada ejercicio sin leer las fórmulas. Si podés contar qué cambia físicamente, la cuenta después sale de manera natural.", "BodyX")]

doc.build(story)
print(OUT)
