import json, glob, os

os.chdir(os.path.join(os.path.dirname(__file__), '..'))

for f in sorted(glob.glob('data/sword-and-magic/events/*.json')):
    fname = f.split('/')[-1]
    events = json.load(open(f))
    for e in events:
        branches = e.get('branches', [])
        if len(branches) >= 2:
            efx_strs = set()
            for b in branches:
                efx_strs.add(str(sorted([(e2.get('type',''), e2.get('target',e2.get('flag','')), e2.get('value',0)) for e2 in b.get('effects', [])])))
            if len(efx_strs) == 1:
                print(f'{fname}: {e["id"]} - {e["title"]}')
                for b in branches:
                    print(f'  {b["id"]}: {[{k:v for k,v in ef.items() if k in ("type","target","value")} for ef in b.get("effects", [])]}')
