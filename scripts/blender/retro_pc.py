"""Retro desktop PC opening sequence for the portfolio (Blender 5.x, headless).

Flat emission colours + Freestyle ink outline, transparent background.
A 1990s beige-box set (case, CRT monitor, keyboard) turns towards the camera,
then the camera pushes straight into the monitor until the screen colour fills
the whole frame.

Usage (see README.md):
  blender -b -P scripts/blender/retro_pc.py -- --variant desktop --out public/seq/desktop
"""

import argparse
import math
import os
import sys

import bpy
import mathutils

# ---------------------------------------------------------------- palette
BODY = "#fffdf8"  # off-white body
INK = "#121212"  # outline + screen colour (SEQUENCE.screenColor)
ACCENT = "#ff6b2c"  # small accents

# ---------------------------------------------------------------- variants
VARIANTS = {
    "desktop": dict(
        width=1600, height=900, frames=96, layout="wide",
        line=8.0, hero_dist=1.85, hero_elev=13, yaw0=30,
        hero_target=(-0.02, 0.0, 0.20), focal=50,
    ),
    "mobile": dict(
        width=800, height=1200, frames=60, layout="stack",
        line=6.5, hero_dist=1.64, hero_elev=20, yaw0=30,
        hero_target=(0.02, -0.07, 0.27), focal=50,
    ),
}


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--variant", choices=VARIANTS, default="desktop")
    p.add_argument("--out", required=True, help="output directory")
    p.add_argument("--frames", type=int, help="frame count (default per variant)")
    p.add_argument("--quality", type=int, default=70, help="WebP quality 0-100")
    p.add_argument("--only", type=int, nargs="*", help="render only these 1-based frames")
    p.add_argument("--format", choices=["WEBP", "PNG"], default="WEBP")
    p.add_argument("--samples", type=int, default=16, help="EEVEE render samples")
    p.add_argument("--save-blend", help="also save the .blend here")
    return p.parse_args(argv)


# ---------------------------------------------------------------- helpers
def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(h):
    h = h.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return (srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b), 1.0)


_mats = {}


def mat(hex_):
    """Flat emission material: shows the exact colour, no lighting."""
    if hex_ in _mats:
        return _mats[hex_]
    m = bpy.data.materials.new("flat" + hex_)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = hex_rgba(hex_)
    em.inputs["Strength"].default_value = 1.0
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    m.diffuse_color = hex_rgba(hex_)
    _mats[hex_] = m
    return m


def loft(name, a, b, material, loc=(0, 0, 0), col=None):
    """Hexahedron between two rectangles. a/b = (y, width, height, z_centre).
    A plain box has a == b except for y."""
    ya, wa, ha, za = a
    yb, wb, hb, zb = b
    v = []
    for y, w, h, z in (a, b):
        for sx, sz in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
            v.append((sx * w / 2, y, z + sz * h / 2))
    faces = [(0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)]
    me = bpy.data.meshes.new(name)
    me.from_pydata(v, [], faces)
    me.update()
    ob = bpy.data.objects.new(name, me)
    ob.data.materials.append(material)
    ob.location = loc
    (col or bpy.context.scene.collection).objects.link(ob)
    # make normals point outwards (needed for silhouette detection)
    import bmesh
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    return ob


def box(name, size, loc, material, col=None, parent=None):
    """size = (w, d, h) centred at loc; front faces -Y."""
    w, d, h = size
    ob = loft(name, (-d / 2, w, h, 0), (d / 2, w, h, 0), material, loc, col)
    if parent:
        ob.parent = parent
    return ob


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(e)
    e.location = loc
    if parent:
        e.parent = parent
    return e


# ---------------------------------------------------------------- model
def build_front_details(rig, x0, y_front, z0, w, h, horizontal, set_col):
    """Floppy slot, two drive bays, power button + LED and a vent grille on a
    case front. (x0, z0) is the front-face centre, y_front its y coordinate."""
    body, ink, acc = mat(BODY), mat(INK), mat(ACCENT)
    t = 0.006  # how far details stand proud of the face
    yf = y_front - t / 2

    def part(name, size, dx, dz, m):
        b = box(name, (size[0], t, size[1]), (x0 + dx, yf, z0 + dz), m, set_col, rig)
        return b

    if not horizontal:  # tower: stacked bays, upper to lower
        bw = w * 0.78
        # two 5.25" drive bays
        for i, dz in enumerate((h * 0.34, h * 0.20)):
            part(f"bay{i}", (bw, 0.035), 0, dz, body)
            part(f"bayslot{i}", (bw * 0.78, 0.007), 0, dz + 0.004, ink)
            part(f"baybtn{i}", (0.014, 0.006), bw * 0.34, dz - 0.009, ink)
        # 3.5" floppy drive
        part("floppy", (bw * 0.62, 0.030), -bw * 0.08, h * 0.06, body)
        part("floppyslot", (bw * 0.46, 0.006), -bw * 0.08, h * 0.06 + 0.004, ink)
        part("floppytab", (0.012, 0.006), bw * 0.27, h * 0.06 - 0.007, acc)
        # power button and LED
        part("power", (0.034, 0.034), -w * 0.16, -h * 0.07, ink)
        part("powerled", (0.011, 0.011), w * 0.2, -h * 0.07, acc)
        # vent grille at the bottom
        for i in range(5):
            part(f"vent{i}", (bw * 0.7, 0.007), 0, -h * 0.30 - i * 0.024, ink)
    else:  # flat desktop case
        # drive bays side by side on the left, buttons right
        part("bay0", (w * 0.22, h * 0.52), -w * 0.30, 0, body)
        part("bayslot0", (w * 0.17, 0.007), -w * 0.30, 0.004, ink)
        part("bay1", (w * 0.22, h * 0.52), -w * 0.04, 0, body)
        part("bayslot1", (w * 0.17, 0.007), -w * 0.04, 0.004, ink)
        part("floppy", (w * 0.14, h * 0.50), w * 0.19, 0, body)
        part("floppyslot", (w * 0.10, 0.006), w * 0.19, 0.004, ink)
        part("floppytab", (0.011, 0.006), w * 0.19 + w * 0.045, -h * 0.17, acc)
        part("power", (0.026, 0.026), w * 0.36, 0.012, ink)
        part("powerled", (0.009, 0.009), w * 0.36, -0.020, acc)
        for i in range(3):
            part(f"vent{i}", (0.005, h * 0.46), -w * 0.46 + i * 0.016 + 0.010, 0, ink)


def build_scene(layout):
    sc = bpy.context.scene
    set_col = bpy.data.collections.new("Set")
    bars_col = bpy.data.collections.new("Bars")
    sc.collection.children.link(set_col)
    sc.collection.children.link(bars_col)
    body, ink, acc = mat(BODY), mat(INK), mat(ACCENT)
    rig = empty("Rig")  # the whole set turns around this

    # --- case ---------------------------------------------------------
    if layout == "wide":
        # tower standing left of the monitor
        tw, td, th = 0.20, 0.44, 0.46
        tx, ty = -0.36, 0.06
        tower = loft("tower", (-td / 2, tw, th, 0), (td / 2, tw, th, 0), body,
                     (tx, ty, th / 2), set_col)
        tower.parent = rig
        # stepped front plate (slightly wider than the case)
        plate = box("towerplate", (tw + 0.016, 0.012, th + 0.016),
                    (tx, ty - td / 2 - 0.006, th / 2), body, set_col, rig)
        build_front_details(rig, tx, ty - td / 2 - 0.012, th / 2, tw, th, False, set_col)
        mon_x, mon_base_z = 0.14, 0.0
    else:
        # flat desktop case under the monitor
        cw, cd, ch = 0.50, 0.40, 0.11
        cy = 0.03
        case = loft("case", (-cd / 2, cw, ch, 0), (cd / 2, cw, ch, 0), body,
                    (0, cy, ch / 2), set_col)
        case.parent = rig
        box("caseplate", (cw + 0.014, 0.012, ch + 0.012), (0, cy - cd / 2 - 0.006, ch / 2),
            body, set_col, rig)
        build_front_details(rig, 0, cy - cd / 2 - 0.012, ch / 2, cw, ch, True, set_col)
        mon_x, mon_base_z = 0.0, ch

    # --- CRT monitor --------------------------------------------------
    # screen faces -Y. Layers from the front: bezel plate, front shell, deep rear taper.
    sw, sh = 0.30, 0.225  # screen (4:3)
    bw_, bh_ = 0.44, 0.385
    stand_top = mon_base_z + 0.075
    mz = stand_top + bh_ / 2 + 0.004  # centre of the bezel
    sz = mz + 0.020  # screen sits a little high, buttons strip below
    my = 0.0  # y of the bezel's front face is my - 0.055
    front_y = my - 0.055

    bezel = box("bezel", (bw_, 0.11, bh_), (mon_x, my, mz), body, set_col, rig)
    # screen surround: shallow raised ring around the glass
    box("surround", (sw + 0.050, 0.010, sh + 0.050), (mon_x, front_y - 0.005, sz), body, set_col, rig)
    # the glass: a single flat colour, slightly proud of the surround
    screen = box("screen", (sw, 0.006, sh), (mon_x, front_y - 0.013, sz), ink, set_col, rig)
    # rear tube housing
    loft("backshell", (my + 0.055, bw_ * 0.86, bh_ * 0.86, 0), (my + 0.34, 0.20, 0.17, -0.02),
         body, (mon_x, 0, mz), set_col).parent = rig
    # vent slots on top of the rear shell
    for i in range(5):
        box(f"mvent{i}", (0.10, 0.012, 0.004), (mon_x, 0.08 + i * 0.04, mz + bh_ * 0.43 - 0.021 + i * -0.0045),
            ink, set_col, rig)
    # control strip: small button row + power LED, under the screen
    by = front_y - 0.012
    bz = sz - sh / 2 - 0.040
    for i in range(4):
        box(f"mbtn{i}", (0.022, 0.006, 0.012), (mon_x - 0.17 + i * 0.035, by + 0.003, bz), ink, set_col, rig)
    box("mled", (0.010, 0.006, 0.010), (mon_x + 0.16, by + 0.003, bz), acc, set_col, rig)
    # neck + base
    box("neck", (0.16, 0.12, 0.04), (mon_x, 0.0, mon_base_z + 0.055), body, set_col, rig)
    box("base", (0.30, 0.24, 0.020), (mon_x, 0.0, mon_base_z + 0.010), body, set_col, rig)

    # --- keyboard -----------------------------------------------------
    kw, kd, kh = 0.40, 0.145, 0.018
    ky = -0.265 if layout == "wide" else -0.34
    kx = mon_x
    kz = 0.009 if layout == "wide" else 0.009
    kb = empty("kbd", (kx, ky, kz), rig)
    kb.rotation_euler = (math.radians(-5), 0, 0)
    box("kbase", (kw, kd, kh), (0, 0, 0), body, set_col, kb)
    # keys: 4 rows + space bar, each key a tiny raised block
    rows = [(13, 0.0), (13, 0.0), (12, 0.0), (11, 0.0)]
    pitch = (kw - 0.05) / 13
    keyh = 0.007
    zrow0 = kd / 2 - 0.022
    keys = []
    for r, (n, off) in enumerate(rows):
        row_w = n * pitch
        for i in range(n):
            kxx = -row_w / 2 + pitch * (i + 0.5)
            kzz = zrow0 - r * (pitch * 0.96) - 0.0
            keys.append((kxx, kzz))
    # keys: small ink blocks on the white base (no outline on keys)
    kobs = []
    for i, (kxx, kzz) in enumerate(keys):
        kobs.append(box(f"key{i}", (pitch * 0.62, pitch * 0.62, keyh),
                        (kxx, kzz, kh / 2 + keyh / 2), ink, bars_col, kb))
    kobs.append(box("space", (0.17, pitch * 0.62, keyh),
                    (0, zrow0 - 4 * (pitch * 0.96), kh / 2 + keyh / 2), ink, bars_col, kb))
    # accent: two keys in orange
    for k in kobs[:2]:
        k.data.materials[0] = acc

    # --- fake code lines on the glass (excluded from outline) ---------
    bars = []
    lines = [(0.00, 0.080, BODY), (0.02, 0.130, BODY), (0.02, 0.060, ACCENT), (0.04, 0.105, BODY), (0.00, 0.050, BODY)]
    left = mon_x - sw / 2 + 0.030
    top = sz + sh / 2 - 0.035
    for i, (indent, ln, colour) in enumerate(lines):
        # pivot at the left end so the bar can retract to the left
        piv = bpy.data.objects.new(f"barpiv{i}", None)
        bars_col.objects.link(piv)
        piv.location = (left + indent, front_y - 0.0185, top - i * 0.034)
        piv.parent = rig
        b = box(f"bar{i}", (ln, 0.004, 0.012), (ln / 2, 0, 0), mat(colour), bars_col, piv)
        bars.append(piv)
    return dict(rig=rig, screen=screen, bars=bars, sets=set_col, barcol=bars_col,
                screen_pos=mathutils.Vector((mon_x, front_y - 0.016, sz)),
                screen_size=(sw, sh))


# ---------------------------------------------------------------- animation maths
def smoother(x):
    x = max(0.0, min(1.0, x))
    return x * x * x * (x * (x * 6 - 15) + 10)


def setup_render(cfg, args):
    sc = bpy.context.scene
    r = sc.render
    r.engine = "BLENDER_EEVEE"
    r.resolution_x, r.resolution_y = cfg["width"], cfg["height"]
    r.resolution_percentage = 100
    r.film_transparent = True
    r.dither_intensity = 0.0  # no noise: flat colours stay exactly flat
    sc.eevee.taa_render_samples = args.samples
    # exact flat colours
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0
    sc.view_settings.gamma = 1
    sc.display_settings.display_device = "sRGB"
    sc.world = bpy.data.worlds.new("w") if sc.world is None else sc.world
    sc.world.use_nodes = True
    for n in sc.world.node_tree.nodes:
        if n.type == "BACKGROUND":
            n.inputs["Strength"].default_value = 0.0
    # Freestyle ink outline
    r.use_freestyle = True
    r.line_thickness_mode = "ABSOLUTE"
    r.line_thickness = cfg["line"]
    vl = sc.view_layers[0]
    vl.use_freestyle = True
    fs = vl.freestyle_settings
    fs.crease_angle = math.radians(120)
    for ls in list(fs.linesets):
        fs.linesets.remove(ls)
    ls = fs.linesets.new("ink")
    ls.select_by_visibility = True
    ls.visibility = "VISIBLE"
    ls.select_by_edge_types = True
    ls.select_silhouette = True
    ls.select_border = True
    ls.select_crease = True
    ls.select_contour = False
    ls.select_material_boundary = True
    ls.select_by_collection = True
    ls.collection = bpy.data.collections["Set"]
    ls.collection_negation = "INCLUSIVE"
    ls.linestyle.color = hex_rgba(INK)[:3]
    ls.linestyle.thickness = 1.0
    ls.linestyle.caps = "ROUND"
    ls.linestyle.alpha = 1.0
    ls.linestyle.thickness_position = "CENTER"
    # camera
    cam_d = bpy.data.cameras.new("cam")
    cam_d.lens = cfg["focal"]
    cam_d.sensor_fit = "AUTO"
    cam_d.clip_start = 0.01
    cam_d.clip_end = 20
    cam = bpy.data.objects.new("cam", cam_d)
    sc.collection.objects.link(cam)
    sc.camera = cam
    return cam


def fit_end_distance(cfg, screen_size, margin=0.82):
    """Camera distance from the glass at which the visible rectangle is
    `margin` of the glass in both directions (so no bezel can show)."""
    w, h = cfg["width"], cfg["height"]
    sensor = 36.0
    if w >= h:
        hw = sensor / 2 / cfg["focal"]  # half-width per unit distance
        hh = hw * h / w
    else:
        hh = sensor / 2 / cfg["focal"]
        hw = hh * w / h
    return min(screen_size[0] * margin / 2 / hw, screen_size[1] * margin / 2 / hh)


def pose(t, cfg, m, cam):
    """Set rig, camera and bars for normalised time t in [0, 1]."""
    # 1) the set turns from yaw0 degrees towards frontal
    turn = smoother(t / 0.58)
    m["rig"].rotation_euler = (0, 0, math.radians(cfg["yaw0"]) * (1 - turn))
    bpy.context.view_layer.update()
    screen_w = m["screen"].matrix_world.translation.copy()
    # 2) camera pushes in; zoom is log-spaced so it reads as constant-rate
    z = smoother((t - 0.36) / (1.0 - 0.36))
    d0 = cfg["hero_dist"]
    d1 = fit_end_distance(cfg, m["screen_size"])
    d = d0 ** (1 - z) * d1 ** z
    el = math.radians(cfg["hero_elev"])
    hero_dir = mathutils.Vector((0, -math.cos(el), math.sin(el)))
    front_dir = mathutils.Vector((0, -1, 0))
    # direction blends from hero elevation to straight-on
    dirv = (hero_dir.lerp(front_dir, smoother(z * 1.15))).normalized()
    c0 = mathutils.Vector(cfg["hero_target"])
    target = c0.lerp(screen_w, smoother(z * 1.05))
    cam.location = target + dirv * d
    look = (target - cam.location).normalized()
    cam.rotation_euler = look.to_track_quat("-Z", "Y").to_euler()
    # 3) fake code retracts before the glass fills the frame
    for i, piv in enumerate(m["bars"]):
        k = smoother((t - 0.62 - i * 0.015) / 0.12)
        sx = max(0.0, 1.0 - k)
        piv.scale = (max(sx, 0.001), 1, 1)
        for ch in piv.children:
            ch.hide_render = sx <= 0.01
        piv.hide_render = sx <= 0.01


# ---------------------------------------------------------------- main
def main():
    args = parse_args()
    cfg = dict(VARIANTS[args.variant])
    n = args.frames or cfg["frames"]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    m = build_scene(cfg["layout"])
    cam = setup_render(cfg, args)
    sc = bpy.context.scene
    os.makedirs(args.out, exist_ok=True)
    ext = "webp" if args.format == "WEBP" else "png"
    r = sc.render
    r.image_settings.file_format = args.format
    r.image_settings.color_mode = "RGBA"
    if args.format == "WEBP":
        r.image_settings.quality = args.quality
    if args.save_blend:
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.save_blend))
    todo = args.only if args.only else range(1, n + 1)
    for i in todo:
        t = (i - 1) / (n - 1)
        pose(t, cfg, m, cam)
        if args.format == "WEBP":
            # end of the push: pure screen colour -> lossless, so it is exactly #121212
            r.image_settings.quality = 100 if t >= 0.84 else args.quality
        r.filepath = os.path.abspath(os.path.join(args.out, f"{i:04d}.{ext}"))
        bpy.ops.render.render(write_still=True)
        print(f"frame {i}/{n} t={t:.3f}", flush=True)


main()
