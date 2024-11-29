import math

def to_icon_line(
        color, degrees, thickness, length, opacity
    ):
    hex_color = f"#{color}";
    style = (
        f"fill:none;stroke-width:{thickness};"
        f"stroke:{hex_color};stroke-opacity:{opacity}"
    )
    radians = math.pi * (degrees / 180)
    y0 = -1*math.sin(radians-math.pi)*length/2;
    x0 = math.cos(radians-math.pi)*length/2;
    y1 = -1*math.sin(radians)*length/2;
    x1 = math.cos(radians)*length/2;
    return (
        f'<path d="M{x0} {y0}L{x1} {y1}" style="{style}"/>'
    )


def to_icon(properties):
    gray = "558"
    lines = [
        line for color, degrees in properties
        for line in [
            to_icon_line(gray, degrees, 3, 10, 1),
            to_icon_line(color, degrees, 2, 7, 0.9)
        ]
    ]
    core = ''.join([
        f'<g transform="translate(5 5)">{line}</g>'
        for line in lines[::2] + lines[::1]
    ])
    return f'<?xml version="1.0" encoding="UTF-8"?><svg id="svg5" width="25" height="25" version="1.1" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">{core}</svg>'


def to_line(color, degrees):
    return to_icon([(color, degrees)])


def to_lines(color1, degrees1, color2, degrees2):
    return to_icon([
        (color1, degrees1), (color2, degrees2)
    ])
