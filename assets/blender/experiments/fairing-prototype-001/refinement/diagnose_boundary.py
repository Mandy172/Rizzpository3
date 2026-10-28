"""Trace panel boundary mismatches against remaining shell and preserved source backup."""
import bpy,bmesh,json,os,math
from mathutils import Vector
base=os.path.dirname(__file__)
blend=bpy.data.filepath
panel=bpy.data.objects['Fairing_Left_Lower']; shell=bpy.data.objects['Bodywork_MainShell']; backup=bpy.data.objects['Bodywork_MainShell_Backup']

def edge_records(obj,evaluated=False):
 if evaluated:
  dg=bpy.context.evaluated_depsgraph_get(); ev=obj.evaluated_get(dg); me=ev.to_mesh(); mw=ev.matrix_world.copy()
  verts=[mw@v.co for v in me.vertices]; edges=[tuple(e.vertices) for e in me.edges]
  tris=None
  ev.to_mesh_clear()
 else:
  me=obj.data; verts=[obj.matrix_world@v.co for v in me.vertices]; edges=[tuple(e.vertices) for e in me.edges]
 return verts,edges

def boundary_records(obj):
 bm=bmesh.new();bm.from_mesh(obj.data); verts=[obj.matrix_world@v.co for v in bm.verts]; out=[]
 for i,e in enumerate(bm.edges):
  if len(e.link_faces)==1:
   out.append({'edge_index':i,'verts':tuple(e.verts),'coords':tuple(obj.matrix_world@v.co for v in e.verts), 'face_index':e.link_faces[0].index, 'face_center':obj.matrix_world@e.link_faces[0].calc_center_median()})
 bm.free();return out

def keys(verts,edges,nd=6): return {tuple(sorted(tuple(round(float(c),nd) for c in verts[i]) for i in e)) for e in edges}
def closest_vertex(pt,verts):
 return min(((pt-v).length,i) for i,v in enumerate(verts)) if verts else (None,None)
def point_segment_dist(p,a,b):
 d=b-a; q=max(0.,min(1.,(p-a).dot(d)/(d.length_squared or 1.)))
 return (p-(a+d*q)).length,q

def chain_coverage(a,b,verts,edges,tol):
 d=b-a; L=d.length
 if L<1e-12:return 0.,[]
 intervals=[]; details=[]
 for ei,(i,j) in enumerate(edges):
  p,q=verts[i],verts[j]
  d1,t1=point_segment_dist(p,a,b); d2,t2=point_segment_dist(q,a,b)
  if d1<=tol and d2<=tol and max(t1,t2)>=-1e-6 and min(t1,t2)<=1+1e-6:
   lo=max(0.,min(t1,t2));hi=min(1.,max(t1,t2))
   if hi>lo+1e-8:intervals.append((lo,hi));details.append(ei)
 intervals.sort();merged=[]
 for lo,hi in intervals:
  if not merged or lo>merged[-1][1]+1e-5:merged.append([lo,hi])
  else:merged[-1][1]=max(merged[-1][1],hi)
 return sum(hi-lo for lo,hi in merged),details

# Use data topology for boundary definition and evaluate original backup to detect modifier/mirror differences.
pb=boundary_records(panel); sb=boundary_records(shell)
pv,pe=edge_records(panel); sv,se=edge_records(shell); bv,be=edge_records(backup,True)
shell_keys=keys(sv,se,6); source_keys=keys(bv,be,6)
shell_boundary_keys=keys([r for r in sv],[(e.vertices[0],e.vertices[1]) for e in []]) if False else set()
# edge metadata to identify original open-boundary edges in backup
backup_boundary=[]
dg=bpy.context.evaluated_depsgraph_get(); ev=backup.evaluated_get(dg); me=ev.to_mesh(); mw=ev.matrix_world.copy(); bm=bmesh.new();bm.from_mesh(me)
for e in bm.edges:
 if len(e.link_faces)==1:
  backup_boundary.append(tuple(sorted(tuple(round(float(c),6) for c in (mw@v.co)) for v in e.verts)))
bm.free();ev.to_mesh_clear();backup_boundary=set(backup_boundary)

mismatches=[]
for r in pb:
 a,b=r['coords']; k=tuple(sorted(tuple(round(float(c),6) for c in p) for p in (a,b)))
 if k in shell_keys: continue
 da,ia=closest_vertex(a,sv); db,ib=closest_vertex(b,sv)
 cov,chain=chain_coverage(a,b,sv,se,1e-5)
 exact_src=k in source_keys; src_boundary=k in backup_boundary
 # nearby face centroids on remaining shell and preserved source backup
 shell_face_centers=[]
 for f in shell.data.polygons:
  fc=shell.matrix_world@f.center; d=(fc-(a+b)*.5).length
  if d<0.08:shell_face_centers.append({'face':f.index,'distance':round(d,8),'material_index':f.material_index})
 shell_face_centers=sorted(shell_face_centers,key=lambda x:x['distance'])[:5]
 mismatches.append({'panel_boundary_edge_index':r['edge_index'],'panel_face_index':r['face_index'],
  'panel_face_center':[round(float(v),8) for v in r['face_center']],
  'endpoint_a':[round(float(v),8) for v in a],'endpoint_b':[round(float(v),8) for v in b],
  'length':round((b-a).length,9),'nearest_shell_endpoint_distances':[round(da,9),round(db,9)],
  'nearest_shell_vertex_indices':[ia,ib],'shell_collinear_edge_chain_coverage_fraction':round(cov,8),
  'chain_edge_indices':chain,'exact_edge_in_preserved_source_evaluated_mesh':exact_src,
  'exact_edge_was_original_source_boundary':src_boundary,'nearby_remaining_shell_faces':shell_face_centers})

# classify edge subdivision / vertex coincidence / source boundary evidence
counts={'mismatches':len(mismatches),'both_endpoints_coincident_with_shell_vertices_at_1e-5':0,'full_shell_chain_at_1e-5':0,'source_edge_present':0,'source_boundary_edge_present':0,'endpoint_pairs_noncoincident':0}
for r in mismatches:
 if max(r['nearest_shell_endpoint_distances'])<=1e-5:counts['both_endpoints_coincident_with_shell_vertices_at_1e-5']+=1
 if r['shell_collinear_edge_chain_coverage_fraction']>=.999:counts['full_shell_chain_at_1e-5']+=1
 if r['exact_edge_in_preserved_source_evaluated_mesh']:counts['source_edge_present']+=1
 if r['exact_edge_was_original_source_boundary']:counts['source_boundary_edge_present']+=1
 if max(r['nearest_shell_endpoint_distances'])>1e-5:counts['endpoint_pairs_noncoincident']+=1
report={'blender_version':bpy.app.version_string,'source_blend':blend,'panel_boundary_edges':len(pb),'shell_boundary_edges':len(sb),
 'direct_exact_panel_shell_edge_matches_1e-6':len(pb)-len(mismatches),'summary':counts,'mismatches':mismatches}
path=os.path.join(base,'boundary-diagnostic.json');open(path,'w').write(json.dumps(report,indent=2));print(json.dumps({'summary':report['summary'],'mismatches':mismatches},indent=2))
