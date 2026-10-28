"""Render final refinement states using the same evaluated framing and rig as Phase 1 validation."""
import bpy,os,math,bmesh
from mathutils import Vector,Matrix
D=os.path.dirname(__file__);OUT=os.path.join(D,'renders');os.makedirs(OUT,exist_ok=True)
root=bpy.data.objects['Motorcycle_Model'];panel=bpy.data.objects['Fairing_Left_Lower'];shell=bpy.data.objects['Bodywork_MainShell'];backup=bpy.data.objects['Bodywork_MainShell_Backup']
def desc(r):
 a=[r];q=list(r.children)
 while q:
  x=q.pop();a.append(x);q.extend(x.children)
 return a
def evaluated_points(o):
 dg=bpy.context.evaluated_depsgraph_get();e=o.evaluated_get(dg);m=e.to_mesh()
 try:return [e.matrix_world@v.co for v in m.vertices]
 finally:e.to_mesh_clear()
vehicle=desc(root)
for o in bpy.data.objects:
 if o not in vehicle:o.hide_render=True
meshes=[o for o in vehicle if o.type=='MESH'];pts=[p for o in meshes for p in evaluated_points(o)]
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
def render(name,position,look,scale):
 cam.location=position;cd.ortho_scale=scale;aim(cam,look);scene.render.filepath=os.path.join(OUT,name+'.png');bpy.ops.render.render(write_still=True);print('RENDERED',name,flush=True)
original=panel.matrix_world.copy();pivot=panel.matrix_world.translation.copy()
render('refined_assembled_side',target+Vector((0,-L*1.8,L*.12)),target,L*1.20)
panel.hide_render=True;render('panel_hidden',target+Vector((0,-L*1.8,L*.12)),target,L*1.20);panel.hide_render=False
panel.matrix_world=original.copy();panel.matrix_world.translation+=Vector((0,-.04,0));render('panel_moved_outward',target+Vector((L*.65,-L*.70,L*.45)),target,L*1.22)
panel.matrix_world=Matrix.Translation(pivot)@Matrix.Rotation(math.radians(6),4,'Z')@Matrix.Translation(-pivot)@original
render('panel_rotated_6deg',target+Vector((L*.65,-L*.70,L*.45)),target,L*1.22)
panel.matrix_world=original.copy()
# Closer rendered view plus a separate technical edge overlay.
close=Vector((-.55,1.50,1.55));cam.location=close+Vector((0,-2.6,.18));cd.ortho_scale=2.2;aim(cam,close)
scene.render.filepath=os.path.join(OUT,'panel_closeup_assembled.png');bpy.ops.render.render(write_still=True);print('RENDERED panel_closeup_assembled',flush=True)
# Overlay the panel's geometric boundary for topology inspection (not part of saved model/GLB).
def bnd(o):
 bm=bmesh.new();bm.from_mesh(o.data);out=[]
 for e in bm.edges:
  if len(e.link_faces)==1:out.append((o.matrix_world@e.verts[0].co,o.matrix_world@e.verts[1].co))
 bm.free();return out
curve=bpy.data.curves.new('TEMP_boundary_overlay','CURVE');curve.dimensions='3D';curve.bevel_depth=.0014;curve.bevel_resolution=1
for a,b in bnd(panel):
 sp=curve.splines.new('POLY');sp.points.add(1)
 for i,p in enumerate((a,b)):sp.points[i].co=(p.x,p.y-.002,p.z,1)
over=bpy.data.objects.new('TEMP_boundary_overlay',curve);scene.collection.objects.link(over)
mat=bpy.data.materials.new('TEMP_boundary_overlay_orange');mat.diffuse_color=(1,.22,.015,1);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(1,.15,.005,1);bs.inputs['Emission Color'].default_value=(1,.15,.005,1);bs.inputs['Emission Strength'].default_value=1.5;curve.materials.append(mat)
scene.render.filepath=os.path.join(OUT,'boundary_closeup_overlay.png');bpy.ops.render.render(write_still=True);print('RENDERED boundary_closeup_overlay',flush=True)
print('CAMERA_TARGET',tuple(target),'MAX_LENGTH',L,'RESOLUTION',(scene.render.resolution_x,scene.render.resolution_y))
