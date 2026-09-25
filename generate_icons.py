import os
from PIL import Image, ImageDraw

sizes = [72, 96, 128, 144, 192, 384, 512]
output_dir = r"g:\AetherWave\public\icons"
os.makedirs(output_dir, exist_ok=True)

# Brand colors
BG_COLOR = (27, 94, 59)       # #1B5E3B Forest Green
ACCENT_COLOR = (232, 220, 200) # #E8DCC8 Sand
TERRACOTTA = (194, 102, 45)   # #C2662D Terracotta

for size in sizes:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw rounded circle / shield background
    margin = size * 0.05
    draw.ellipse([margin, margin, size - margin, size - margin], fill=BG_COLOR)
    
    # Draw central stylized AetherWeave leaf / shield emblem
    cx, cy = size / 2, size / 2
    r = size * 0.28
    
    # Inner sand circle
    draw.ellipse([cx - r * 0.8, cy - r * 0.8, cx + r * 0.8, cy + r * 0.8], fill=ACCENT_COLOR)
    
    # Central terracotta core
    draw.ellipse([cx - r * 0.4, cy - r * 0.4, cx + r * 0.4, cy + r * 0.4], fill=TERRACOTTA)
    
    out_path = os.path.join(output_dir, f"icon-{size}x{size}.png")
    img.save(out_path, "PNG")
    print(f"Generated {out_path}")

print("All PWA icons generated successfully!")
