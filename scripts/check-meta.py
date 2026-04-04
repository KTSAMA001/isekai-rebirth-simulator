#!/usr/bin/env python3
import json, glob
attrs = set()
etypes = set()
flags = set()
for f in glob.glob('data/sword-and-magic/events/*.json'):
    for e in json.load(open(f)):
        for eff in (e.get('effects') or []):
            if eff.get('target'): attrs.add(eff['target'])
            etypes.add(eff.get('type',''))
        for b in (e.get('branches') or []):
            for eff in (b.get('effects') or []):
                if eff.get('target'): attrs.add(eff['target'])
                etypes.add(eff.get('type',''))
                if eff.get('type') == 'set_flag': flags.add(eff['target'])
        for eff in (e.get('effects') or []):
            if eff.get('type') == 'set_flag': flags.add(eff['target'])
print('attrs:', sorted(attrs))
print('etypes:', sorted(etypes))
print('flags:', sorted(flags))
