"""Run with Blender --background --factory-startup --disable-autoexec --python
scripts/prepare-glove-asset.py -- source.blend public/gallery/boxing-gloves.glb.

Source: Joachim Bornemann's CC0 Vintage boxing gloves; see gallery attribution.
Only sculpted geometry is exported: no leather textures or scene dependencies.
"""
import bpy
import sys
from pathlib import Path

source, destination = sys.argv[sys.argv.index("--") + 1:]
bpy.ops.wm.open_mainfile(filepath=str(Path(source).resolve()))
bpy.ops.object.select_all(action="DESELECT")
for obj in bpy.data.objects:
    if obj.type != "MESH":
        continue
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    obj.data.materials.clear()
    # Preserve the sculpted silhouette/folds at a fraction of the source density.
    modifier = obj.modifiers.new("Particle source simplification", "DECIMATE")
    modifier.ratio = 0.4
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj["source_author"] = "Joachim Bornemann"
    obj["license"] = "CC0-1.0"
    obj["source_url"] = "https://www.blendkit.com/asset-gallery-detail/7a526c99-4ea9-4955-822e-829bb962965f/"
    print("EXPORT_MESH", obj.name, len(obj.data.polygons))

bpy.ops.export_scene.gltf(
    filepath=str(Path(destination).resolve()), export_format="GLB",
    use_selection=True, export_materials="NONE", export_texcoords=False,
    export_normals=True, export_animations=False, export_cameras=False,
    export_lights=False, export_extras=True,
)
