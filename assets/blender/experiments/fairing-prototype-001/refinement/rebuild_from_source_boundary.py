"""Rebuild a refined panel split while keeping original open-boundary faces in the shell."""
import bpy,bmesh,json,os
from mathutils import Vector
DIR=os.path.dirname(__file__); OUT=os.path.join(DIR,'fairing-prototype-001-refined.blend'); GLB=os.path.join(DIR,'fairing-prototype-001-refined.glb')
root=bpy.data.objects['Motorcycle_Model']; oldpanel=bpy.data.objects['Fairing_Left_Lower']; oldshell=bpy.data.objects['Bodywork_MainShell']; backup=bpy.data.objects['Bodywork_MainShell_Backup']
parent=oldshell.parent
# Start the refinement from the preserved original shell backup, not from the separated result.
body=backup.copy();body.data=backup.data.copy();backup.users_collection[0].objects.link(body);body.parent=parent;body.matrix_world=backup.matrix_world.copy();body.name='Bodywork_MainShell';body.data.name='Bodywork_MainShell_Refined_Mesh';body.hide_render=False;body.hide_set(False)
# Remove only the two working objects in this disposable refinement copy.
bpy.data.objects.remove(oldpanel,do_unlink=True);bpy.data.objects.remove(oldshell,do_unlink=True)
# Bake the source mirror exactly as in the initial prototype; preserve EdgeSplit.
mir=next((m for m in body.modifiers if m.type=='MIRROR'),None)
if mir:
 bpy.context.view_layer.objects.active=body;body.select_set(True);bpy.ops.object.modifier_apply(modifier=mir.name)
# Define the original open edges before separation, using raw topology after Mirror and before EdgeSplit.
bm=bmesh.new();bm.from_mesh(body.data);bm.faces.ensure_lookup_table();bm.edges.ensure_lookup_table()
source_open_edges={e for e in bm.edges if len(e.link_faces)==1}
mid_y=(min((body.matrix_world@v.co).y for v in bm.verts)+max((body.matrix_world@v.co).y for v in bm.verts))*.5
poly=[(-1.80,.85),(.40,.85),(.45,2.00),(-1.60,2.15)]
def inside(x,z):
 c=False;j=len(poly)-1
 for i in range(len(poly)):
  xi,zi=poly[i];xj,zj=poly[j]
  if ((zi>z)!=(zj>z)) and x<(xj-xi)*(z-zi)/(zj-zi+1e-12)+xi:c=not c
  j=i
 return c
normal_matrix=body.matrix_world.to_3x3().inverted().transposed()
candidates=[]
for f in bm.faces:
 c=body.matrix_world@f.calc_center_median();n=(normal_matrix@f.normal).normalized()
 if f.material_index==0 and c.y<mid_y and n.y<-.35 and inside(c.x,c.z):candidates.append(f)
# Remove candidate faces that touch any pre-existing open source boundary edge.
source_edge_faces=set()
for e in source_open_edges:
 if e.link_faces:
  for f in e.link_faces:source_edge_faces.add(f)
excluded=[f for f in candidates if f in source_edge_faces]
remaining=set(candidates)-set(excluded)
# Find connected components of the filtered candidate region.
adj={f:set() for f in remaining}
for e in bm.edges:
 fs=[f for f in e.link_faces if f in remaining]
 for f in fs:adj[f].update(g for g in fs if g is not f)
components=[];seen=set()
for f in remaining:
 if f in seen:continue
 stack=[f];seen.add(f);comp=[]
 while stack:
  cur=stack.pop();comp.append(cur)
  for other in adj[cur]:
   if other not in seen:seen.add(other);stack.append(other)
 components.append(comp)
if not components:raise RuntimeError('Boundary-safe candidate region is empty')
component=max(components,key=len)
component_centers={tuple(round(float(v),6) for v in (body.matrix_world@f.calc_center_median())) for f in component}
# Remove all selection flags before writing the Mesh datablock.
for f in bm.faces:f.select=False
bm.to_mesh(body.data);bm.free();body.data.update()
# Separate the same exact component via stable face-center coordinates.
bpy.ops.object.select_all(action='DESELECT');body.select_set(True);bpy.context.view_layer.objects.active=body
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_mode(type='FACE');bpy.ops.mesh.select_all(action='DESELECT')
bme=bmesh.from_edit_mesh(body.data);bme.faces.ensure_lookup_table()
for f in bme.faces:
 c=body.matrix_world@f.calc_center_median()
 if tuple(round(float(v),6) for v in c) in component_centers:f.select=True
bmesh.update_edit_mesh(body.data,loop_triangles=False,destructive=False)
old=set(bpy.data.objects);bpy.ops.mesh.separate(type='SELECTED');bpy.ops.object.mode_set(mode='OBJECT')
new=[o for o in set(bpy.data.objects)-old if o.type=='MESH']
if len(new)!=1:raise RuntimeError(f'Expected one mesh from separation, got {len(new)}')
panel=new[0];panel.name='Fairing_Left_Lower';panel.data.name='Fairing_Left_Lower_Refined_Mesh';panel.parent=parent;panel.matrix_world=body.matrix_world.copy()
body.name='Bodywork_MainShell';body.data.name='Bodywork_MainShell_Refined_Mesh';panel['component_role']='refined lower left fairing; faces adjacent to source open boundaries retained in main shell';body['component_role']='remaining exterior shell'
# Boundary exact-match measure from data topology; no altered tolerance.
def boundary_keys(o):
 bm=bmesh.new();bm.from_mesh(o.data);ks=[]
 for e in bm.edges:
  if len(e.link_faces)==1:
   ks.append(tuple(sorted(tuple(round(float(x),6) for x in (o.matrix_world@v.co)) for v in e.verts)))
 bm.free();return set(ks),len(ks)
pb,pn=boundary_keys(panel);sb,sn=boundary_keys(body);matches=len(pb&sb)
report={'source_boundary_faces_excluded_from_panel':len(excluded),'candidate_face_count':len(candidates),'filtered_components':[len(c) for c in sorted(components,key=len,reverse=True)],'panel_faces':len(panel.data.polygons),'panel_vertices':len(panel.data.vertices),'panel_boundary_edges':pn,'shell_boundary_edges':sn,'exact_matching_boundary_edges':matches,'unmatched_boundary_edges':pn-matches,'panel_evaluated_triangles':0,'remaining_shell_evaluated_triangles':0}
def tris(o):
 ev=o.evaluated_get(bpy.context.evaluated_depsgraph_get());me=ev.to_mesh();me.calc_loop_triangles();n=len(me.loop_triangles);ev.to_mesh_clear();return n
report['panel_evaluated_triangles']=tris(panel);report['remaining_shell_evaluated_triangles']=tris(body)
# Export visible vehicle objects only; hidden original backup is not selected.
for o in bpy.data.objects:o.select_set(False)
for o in [root]+list(root.children):pass
stack=[root];vehicles=[]
while stack:
 o=stack.pop();vehicles.append(o);stack.extend(o.children)
for o in vehicles:
 if o is not backup and o.type in {'MESH','EMPTY'}:o.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=GLB,export_format='GLB',use_selection=True,export_apply=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT)
report['blend_path']=OUT;report['glb_path']=GLB
report['blend_bytes']=os.path.getsize(OUT);report['glb_bytes']=os.path.getsize(GLB)
open(os.path.join(DIR,'refined-partition-report.json'),'w').write(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
