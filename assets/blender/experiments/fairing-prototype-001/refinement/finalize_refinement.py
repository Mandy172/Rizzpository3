"""Set a practical fairing pivot, export, and render the required validation states."""
import bpy,bmesh,os,json,math
from mathutils import Vector,Matrix
DIR=os.path.dirname(__file__); BLEND=os.path.join(DIR,'fairing-prototype-001-refined.blend'); GLB=os.path.join(DIR,'fairing-prototype-001-refined.glb'); REND=os.path.join(DIR,'renders');os.makedirs(REND,exist_ok=True)
root=bpy.data.objects['Motorcycle_Model']; panel=bpy.data.objects['Fairing_Left_Lower']; shell=bpy.data.objects['Bodywork_MainShell'];backup=bpy.data.objects['Bodywork_MainShell_Backup']
def descendants(r):
 out=[r];q=list(r.children)
 while q:
  o=q.pop();out.append(o);q.extend(o.children)
 return out
def eval_tri(o):
 e=o.evaluated_get(bpy.context.evaluated_depsgraph_get());m=e.to_mesh();m.calc_loop_triangles();n=len(m.loop_triangles);e.to_mesh_clear();return n
def get_world_verts(o):return [o.matrix_world@v.co for v in o.data.vertices]
def boundary_edges(o):
 bm=bmesh.new();bm.from_mesh(o.data);out=[]
 for e in bm.edges:
  if len(e.link_faces)==1:out.append((o.matrix_world@e.verts[0].co,o.matrix_world@e.verts[1].co))
 bm.free();return out
def edge_key(edge):return tuple(sorted(tuple(round(float(c),6) for c in v) for v in edge))
def exact_keys(o):return {edge_key(e) for e in boundary_edges(o)}
# Choose a practical pivot at a real vertex on the upper near-side end of the panel.
# No separate mounting/fastener object is present at this panel in the source hierarchy.
verts=get_world_verts(panel)
pivot=Vector((-0.317078,1.231279,2.110205))
nearest=min((v-pivot).length for v in verts)
if nearest>1e-4:raise RuntimeError(f'Chosen pivot is not on panel mesh; nearest vertex {nearest}')
pivot=min(verts,key=lambda v:(v-pivot).length).copy()
world_before=verts[:]; original_matrix=panel.matrix_world.copy(); local_pivot=original_matrix.inverted()@pivot
# Shift mesh coordinates and compensate object transform: the evaluated world surface must not move.
for v in panel.data.vertices:v.co-=local_pivot
panel.matrix_world=original_matrix@Matrix.Translation(local_pivot)
panel.data.update()
world_after=get_world_verts(panel)
max_world_displacement=max((a-b).length for a,b in zip(world_before,world_after))
if max_world_displacement>1e-6:raise RuntimeError(f'Changing origin moved panel geometry by {max_world_displacement}')
panel['pivot_note']='Practical pivot at upper near-side boundary vertex; no authored mounting point identified in source mesh.'
panel['pivot_world_xyz']=[float(v) for v in pivot]

# Geometry counts and exact boundary test; unchanged 1e-6 coordinate quantization.
panel_edges=boundary_edges(panel); shell_edges=boundary_edges(shell); pb={edge_key(e) for e in panel_edges}; sb={edge_key(e) for e in shell_edges}; pn=len(panel_edges);sn=len(shell_edges);matches=len(pb&sb)
# Match each panel edge to the closest source-shell boundary segment without rounding.
# Report the actual endpoint error (the pivot rebase stores vertex coordinates as float32).
edge_errors=[]; used_shell_edges=set()
for a,b in panel_edges:
 best=(float('inf'),None)
 for j,(c,d) in enumerate(shell_edges):
  err=min(max((a-c).length,(b-d).length),max((a-d).length,(b-c).length))
  if err<best[0]:best=(err,j)
 edge_errors.append((best[0],best[1]))
 if best[1] is not None:used_shell_edges.add(best[1])
near_edge_matches=sum(err<1e-6 for err,_ in edge_errors);max_edge_error=max((err for err,_ in edge_errors),default=0.0)
meshes=[o for o in descendants(root) if o.type=='MESH' and o is not backup]
report={'blender_version':bpy.app.version_string,'panel':'Fairing_Left_Lower','panel_faces':len(panel.data.polygons),'panel_vertices':len(panel.data.vertices),'panel_triangles':eval_tri(panel),
 'remaining_shell_faces':len(shell.data.polygons),'remaining_shell_triangles':eval_tri(shell),'mesh_objects_excluding_backup':len(meshes),'total_evaluated_motorcycle_triangles':sum(eval_tri(o) for o in meshes),
 'panel_boundary_edges':pn,'shell_boundary_edges':sn,'exact_6_decimal_key_matches_after_origin_rebase':matches,'exact_key_mismatches_after_origin_rebase':pn-matches,'boundary_edges_with_corresponding_shell_segments_within_1e-6':near_edge_matches,'maximum_endpoint_error_to_nearest_shell_edge_world_units':max_edge_error,'distinct_shell_edges_used_for_nearest_match':len(used_shell_edges),
 'panel_material_face_counts':{},'panel_uv_layers':[u.name for u in panel.data.uv_layers],
 'panel_pivot_world_xyz':[round(float(v),8) for v in pivot],'nearest_panel_vertex_distance':nearest,'pivot_is_practical_not_authored_mount':True,'max_world_displacement_during_origin_change':max_world_displacement}
for f in panel.data.polygons:
 m=panel.data.materials[f.material_index] if f.material_index<len(panel.data.materials) else None;n=m.name if m else 'None';report['panel_material_face_counts'][n]=report['panel_material_face_counts'].get(n,0)+1
# Verify no other object transform changes during independent tests.
other_mats={o.name:o.matrix_world.copy() for o in bpy.data.objects if o is not panel}
assembled_matrix=panel.matrix_world.copy()
# Export & save only assembled, final transform. Do not select hidden source backup.
for o in bpy.data.objects:o.select_set(False)
stack=[root];veh=[]
while stack:
 o=stack.pop();veh.append(o);stack.extend(o.children)
for o in veh:
 if o is not backup and o.type in {'MESH','EMPTY'}:o.select_set(True)
bpy.context.view_layer.objects.active=root
bpy.ops.export_scene.gltf(filepath=GLB,export_format='GLB',use_selection=True,export_apply=True)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
report['blend_path']=BLEND;report['blend_bytes']=os.path.getsize(BLEND);report['glb_path']=GLB;report['glb_bytes']=os.path.getsize(GLB)

# Configure renders identically to the existing Phase 1 validation camera/lighting.
vehicle=descendants(root)
for o in bpy.data.objects:
 if o not in vehicle:o.hide_render=True
pts=[p for o in vehicle if o.type=='MESH' for p in get_world_verts(o)]
low=Vector(tuple(min(p[i] for p in pts) for i in range(3)));high=Vector(tuple(max(p[i] for p in pts) for i in range(3)));target=(low+high)*.5;L=max(high-low)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE';scene.eevee.taa_render_samples=48;scene.render.resolution_x=1100;scene.render.resolution_y=780;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.view_settings.view_transform='AgX'
if scene.world is None:scene.world=bpy.data.worlds.new('Validation_World')
scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.045,.05,.065,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.28
for o in list(bpy.data.objects):
 if o.type=='LIGHT':bpy.data.objects.remove(o,do_unlink=True)
def aim(o,t):o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,power,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(name,d);scene.collection.objects.link(o);o.location=loc;aim(o,target)
area('Validation_Key',target+Vector((L*.25,-L*.6,L*.8)),L*90,L*.75,(1,.86,.72));area('Validation_Fill',target+Vector((0,L*.65,L*.45)),L*55,L*.75,(.72,.82,1));area('Validation_Rim',target+Vector((-L*.55,0,L*.65)),L*100,L*.6,(1,.38,.2));area('Validation_Front',target+Vector((L*.8,0,L*.25)),L*40,L*.5,(1,1,1))
cd=bpy.data.cameras.new('Validation_Camera');cam=bpy.data.objects.new('Validation_Camera',cd);scene.collection.objects.link(cam);scene.camera=cam;cd.type='ORTHO'
def set_view(name,position,look,scale):cam.location=position;cd.ortho_scale=scale;aim(cam,look);scene.render.filepath=os.path.join(REND,name+'.png');bpy.ops.render.render(write_still=True);print('RENDERED',name,flush=True)
# Refined assembled side, same dimensions, target, lighting, exposure, camera and ortho scale as original side.
set_view('refined_assembled_side',target+Vector((0,-L*1.8,L*.12)),target,L*1.20)
# Hide the panel and render the exact same side camera.
panel.hide_render=True;set_view('panel_hidden',target+Vector((0,-L*1.8,L*.12)),target,L*1.20);panel.hide_render=False
# Move outward (negative Y, toward the near-side camera) without touching other object matrices.
panel.matrix_world=assembled_matrix.copy();panel.matrix_world.translation+=Vector((0,-.04,0))
if not all(all(abs(other_mats[o.name][r][c]-o.matrix_world[r][c])<1e-8 for r in range(4) for c in range(4)) for o in bpy.data.objects if o.name in other_mats):raise RuntimeError('A non-panel transform changed during panel move test')
set_view('panel_moved_outward',target+Vector((L*.65,-L*.70,L*.45)),target,L*1.22)
panel.matrix_world=assembled_matrix.copy()
# Rotate 6 degrees about global vertical through the practical pivot; other objects stay fixed.
rot=Matrix.Rotation(math.radians(6.0),4,'Z');T=Matrix.Translation(pivot);Ti=Matrix.Translation(-pivot)
panel.matrix_world=T@rot@Ti@assembled_matrix
if not all(all(abs(other_mats[o.name][r][c]-o.matrix_world[r][c])<1e-8 for r in range(4) for c in range(4)) for o in bpy.data.objects if o.name in other_mats):raise RuntimeError('A non-panel transform changed during panel rotation test')
set_view('panel_rotated_6deg',target+Vector((L*.65,-L*.70,L*.45)),target,L*1.22)
panel.matrix_world=assembled_matrix.copy()
# Close-up boundary diagnostic: orange curves trace the exact shared panel/shell edges.
cam.location=Vector((-.55, -1.1, 1.55)); close_target=Vector((-.55,1.50,1.55));cd.ortho_scale=2.2;aim(cam,close_target)
curve=bpy.data.curves.new('TEMP_boundary_overlay','CURVE');curve.dimensions='3D';curve.bevel_depth=.0025;curve.bevel_resolution=1
for a,b in panel_edges:
 sp=curve.splines.new('POLY');sp.points.add(1)
 for i,co in enumerate((a,b)):sp.points[i].co=(co[0],co[1]-.002,co[2],1)
over=bpy.data.objects.new('TEMP_boundary_overlay',curve);scene.collection.objects.link(over)
mat=bpy.data.materials.new('TEMP_boundary_overlay_orange');mat.diffuse_color=(1,.22,.015,1);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(1,.15,.005,1);bs.inputs['Emission Color'].default_value=(1,.15,.005,1);bs.inputs['Emission Strength'].default_value=1.5;curve.materials.append(mat)
scene.render.filepath=os.path.join(REND,'boundary_closeup_overlay.png');bpy.ops.render.render(write_still=True);print('RENDERED boundary_closeup_overlay',flush=True)
report.update({'non_panel_transforms_unchanged_during_move_and_rotation':True,'panel_transform_restored_after_tests':all(abs(panel.matrix_world[r][c]-assembled_matrix[r][c])<1e-8 for r in range(4) for c in range(4)),'move_distance_world_units':.04,'rotation_degrees':6.0,'pivot_behavior_tested_in_blend':True,'render_paths':[os.path.join(REND,x+'.png') for x in ('refined_assembled_side','panel_hidden','panel_moved_outward','panel_rotated_6deg','boundary_closeup_overlay')]})
open(os.path.join(DIR,'refinement-report.json'),'w').write(json.dumps(report,indent=2));print('FINAL_REPORT',json.dumps(report,indent=2))
