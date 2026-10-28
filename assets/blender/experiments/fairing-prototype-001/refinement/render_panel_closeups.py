import bpy,os,math
from mathutils import Vector,Matrix
D=os.path.dirname(__file__);O=os.path.join(D,'renders');root=bpy.data.objects['Motorcycle_Model'];panel=bpy.data.objects['Fairing_Left_Lower']
def desc(r):
 a=[r];q=list(r.children)
 while q:
  o=q.pop();a.append(o);q.extend(o.children)
 return a
def pts(o):
 e=o.evaluated_get(bpy.context.evaluated_depsgraph_get());m=e.to_mesh()
 try:return [e.matrix_world@v.co for v in m.vertices]
 finally:e.to_mesh_clear()
veh=desc(root)
for o in bpy.data.objects:
 if o not in veh:o.hide_render=True
allp=[p for o in veh if o.type=='MESH' for p in pts(o)];lo=Vector(tuple(min(p[i] for p in allp) for i in range(3)));hi=Vector(tuple(max(p[i] for p in allp) for i in range(3)));t=(lo+hi)*.5;L=max(hi-lo)
s=bpy.context.scene;s.render.engine='BLENDER_EEVEE';s.eevee.taa_render_samples=48;s.render.resolution_x=1100;s.render.resolution_y=780;s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.view_settings.view_transform='AgX'
if s.world is None:s.world=bpy.data.worlds.new('Validation_World')
s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.045,.05,.065,1);s.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.28
for o in list(bpy.data.objects):
 if o.type=='LIGHT':bpy.data.objects.remove(o,do_unlink=True)
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
def light(name,loc,pow,size,color):
 d=bpy.data.lights.new(name,'AREA');d.energy=pow;d.shape='DISK';d.size=size;d.color=color;o=bpy.data.objects.new(name,d);s.collection.objects.link(o);o.location=loc;aim(o,t)
light('Validation_Key',t+Vector((L*.25,-L*.6,L*.8)),L*90,L*.75,(1,.86,.72));light('Validation_Fill',t+Vector((0,L*.65,L*.45)),L*55,L*.75,(.72,.82,1));light('Validation_Rim',t+Vector((-L*.55,0,L*.65)),L*100,L*.6,(1,.38,.2));light('Validation_Front',t+Vector((L*.8,0,L*.25)),L*40,L*.5,(1,1,1))
cd=bpy.data.cameras.new('PanelCloseupCam');cam=bpy.data.objects.new('PanelCloseupCam',cd);s.collection.objects.link(cam);s.camera=cam;cd.type='ORTHO';target=Vector((-.55,1.50,1.55));cam.location=target+Vector((0,-2.6,.18));cd.ortho_scale=2.2;aim(cam,target)
original=panel.matrix_world.copy();pivot=panel.matrix_world.translation.copy()
def render(name):s.render.filepath=os.path.join(O,name+'.png');bpy.ops.render.render(write_still=True);print('RENDERED',name,flush=True)
render('panel_closeup_assembled');panel.hide_render=True;render('panel_closeup_hidden');panel.hide_render=False
panel.matrix_world=original.copy();panel.matrix_world.translation+=Vector((0,-.04,0));render('panel_closeup_moved')
panel.matrix_world=Matrix.Translation(pivot)@Matrix.Rotation(math.radians(6),4,'Z')@Matrix.Translation(-pivot)@original;render('panel_closeup_rotated')
