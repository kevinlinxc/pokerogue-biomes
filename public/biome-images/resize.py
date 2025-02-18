from pathlib import Path

from PIL import Image

# crop all images by some amount in x and y direction
x_crop = 2 
y_crop = 0

# get all images in the directory
images = Path("public/images").glob("*.png")

# loop through all images, make new ones with the same name in public\images\cropped
import os

os.makedirs("public/images/cropped", exist_ok=True)
for img_path in images:
    img = Image.open(img_path)
    img = img.crop((x_crop, y_crop, img.width - x_crop, img.height - y_crop))
    img.save(f"public/images/cropped/{img_path.name}")

