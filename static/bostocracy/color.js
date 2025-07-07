class Color {

  constructor(r,g,b,a=255) {
    this.rgba = [r,g,b,a];
    this.rgb = [r,g,b];
  }

  get hex() {
    const [r, g, b] = this.rgb
    const hex_int = (
      1 << 24 | r << 16 | g << 8 | b
    );
    return hex_int.toString(16).slice(1).toUpperCase();
  }

}

export { Color }
