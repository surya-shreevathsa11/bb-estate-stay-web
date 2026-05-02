"""One-off helper: circular SVG favicon from logo JPEG (embedded base64)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "src" / "assets" / "bb-estate-stay-logo.jpeg"
OUT = ROOT / "public" / "favicon.svg"


def main() -> None:
    import base64

    b64 = base64.b64encode(LOGO.read_bytes()).decode("ascii")
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
  <defs>
    <clipPath id="circleClip"><circle cx="16" cy="16" r="16"/></clipPath>
  </defs>
  <image width="32" height="32" preserveAspectRatio="xMidYMid slice" clip-path="url(#circleClip)" href="data:image/jpeg;base64,{b64}"/>
</svg>'''
    OUT.write_text(svg, encoding="utf-8")
    print(f"Wrote {OUT} ({len(svg)} bytes)")


if __name__ == "__main__":
    main()
