import bpy,os,json,math,bmesh
from mathutils import Vector,Matrix
base=os.path.dirname(__file__);path=os.path.join(base,'fairing-prototype-001-refined.glb')
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.gltf(filepath=path)
objs=list(bpy.data.objects);meshes=[o for o in objs if o.type=='MESH'];panel=bpy.data.objects.get('Fairing_Left_Lower');shell=bpy.data.objects.get('Bodywork_MainShell')
if panel is None or shell is None:raise RuntimeError('Fairing or shell node missing after GLB import')
def tris(o):o.data.calc_loop_triangles();return len(o.data.loop_triangles)
from collections import Counter
def geometric_boundary_edges(o):
 # glTF splits vertex records at material/normal/UV seams. Reconstruct geometric
 # edge incidence by coordinate keys, counting coincident triangle edges.
 counts=Counter()
 for f in o.data.polygons:
  ids=list(f.vertices)
  for i,j in zip(ids,ids[1:]+ids[:1]):
   a=tuple(float(c) for c in (o.matrix_world@o.data.vertices[i].co))
   b=tuple(float(c) for c in (o.matrix_world@o.data.vertices[j].co))
   counts[tuple(sorted((a,b)))]+=1
 return [edge for edge,n in counts.items() if n==1]
pe=geometric_boundary_edges(panel);se=geometric_boundary_edges(shell)
def key(e):return tuple(sorted(tuple(round(float(c),6) for c in p) for p in e))
keys={key(e) for e in se};exact=sum(key(e) in keys for e in pe)
maxerr=0.;distinct=set()
for a0,b0 in pe:
 a=Vector(a0);b=Vector(b0);best=(float('inf'),None)
 for j,(c0,d0) in enumerate(se):
  c=Vector(c0);d=Vector(d0)
  e=min(max((a-c).length,(b-d).length),max((a-d).length,(b-c).length))
  if e<best[0]:best=(e,j)
 maxerr=max(maxerr,best[0]);distinct.add(best[1])
report={'file':path,'bytes':os.path.getsize(path),'scene_objects':len(objs),'mesh_objects':len(meshes),'triangles':sum(tris(o) for o in meshes),'faces':sum(len(o.data.polygons) for o in meshes),'vertices':sum(len(o.data.vertices) for o in meshes),
 'materials':len(bpy.data.materials),'material_names':sorted(m.name for m in bpy.data.materials),'image_textures':[(im.name,im.size[0],im.size[1]) for im in bpy.data.images],
 'panel_present_and_nonempty':bool(panel.data.polygons),'panel_faces':len(panel.data.polygons),'panel_triangles':tris(panel),'panel_parent':panel.parent.name if panel.parent else None,'shell_parent':shell.parent.name if shell.parent else None,
 'panel_uv_layers':[u.name for u in panel.data.uv_layers],'panel_material_face_counts':{},'panel_normals_finite':all(math.isfinite(c) for f in panel.data.polygons for c in f.normal),'backup_present':any('Backup' in o.name for o in objs),
 'panel_geometric_boundary_edges_after_duplicate_vertex_collapse_by_exact_world_coordinate_key':len(pe),'shell_geometric_boundary_edges_after_duplicate_vertex_collapse_by_exact_world_coordinate_key':len(se),'exact_6_decimal_key_matches':exact,'exact_6_decimal_key_mismatches':len(pe)-exact,'nearest_shell_edge_max_endpoint_error':maxerr,'distinct_nearest_shell_edges':len(distinct),
 'pivot_world_xyz':[round(float(v),9) for v in panel.matrix_world.translation]}
for f in panel.data.polygons:
 m=panel.data.materials[f.material_index] if f.material_index<len(panel.data.materials) else None;n=m.name if m else 'None';report['panel_material_face_counts'][n]=report['panel_material_face_counts'].get(n,0)+1
# Reimported node transform isolation checks. Translate and rotate only the panel, then restore it.
original=panel.matrix_world.copy();others={o.name:o.matrix_world.copy() for o in objs if o is not panel}
panel.matrix_world=original.copy();panel.matrix_world.translation+=Vector((0,-.04,0))
move_others_unchanged=all(all(abs(others[o.name][r][c]-o.matrix_world[r][c])<1e-8 for r in range(4) for c in range(4)) for o in objs if o.name in others)
panel.matrix_world=original.copy();pivot=panel.matrix_world.translation.copy();T=Matrix.Translation(pivot);Ti=Matrix.Translation(-pivot);panel.matrix_world=T@Matrix.Rotation(math.radians(6),4,'Z')@Ti@original
rotate_others_unchanged=all(all(abs(others[o.name][r][c]-o.matrix_world[r][c])<1e-8 for r in range(4) for c in range(4)) for o in objs if o.name in others)
panel.matrix_world=original
report['reimport_move_other_nodes_unchanged']=move_others_unchanged;report['reimport_rotation_other_nodes_unchanged']=rotate_others_unchanged;report['panel_transform_restored_after_test']=all(abs(panel.matrix_world[r][c]-original[r][c])<1e-8 for r in range(4) for c in range(4))
open(os.path.join(base,'glb-reimport-report.json'),'w').write(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
