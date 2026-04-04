import json, glob, os

os.chdir(os.path.join(os.path.dirname(__file__), '..'))

risk = dice = mandatory = waste = total_events = total_branches = 0
for f in sorted(glob.glob('data/sword-and-magic/events/*.json')):
    events = json.load(open(f))
    for e in events:
        total_events += 1
        branches = e.get('branches', [])
        total_branches += len(branches)
        if len(branches) == 0 and len(e.get('effects', [])) > 0:
            mandatory += 1
        elif len(branches) == 1 and len(branches[0].get('effects', [])) > 0:
            mandatory += 1
        if len(branches) >= 2:
            efx_strs = set()
            for b in branches:
                efx_strs.add(str(sorted([(e2.get('type',''), e2.get('target',e2.get('flag','')), e2.get('value',0)) for e2 in b.get('effects', [])])))
            if len(efx_strs) == 1:
                waste += 1
        for b in branches:
            if 'riskCheck' in b: risk += 1
            if 'diceCheck' in b: dice += 1

print(f'总事件: {total_events}')
print(f'总分支: {total_branches}')
print(f'riskCheck 残留: {risk}')
print(f'diceCheck 总数: {dice}')
print(f'必选事件(无真实选择): {mandatory}')
print(f'废选事件(效果相同): {waste}')
