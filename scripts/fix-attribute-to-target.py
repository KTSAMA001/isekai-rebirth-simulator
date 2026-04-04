"""
修复数据一致性：effects 中的 "attribute" 应为 "target"
注意：diceCheck 中的 "attribute" 是正确的，不要改
"""
import json, glob, os

os.chdir(os.path.join(os.path.dirname(__file__), '..'))

total_fixed = 0
for f in sorted(glob.glob('data/sword-and-magic/events/*.json')):
    fname = f.split('/')[-1]
    events = json.load(open(f))
    file_fixed = 0

    for e in events:
        # 修复事件顶级 effects
        for eff in e.get('effects', []):
            if 'attribute' in eff and 'target' not in eff:
                eff['target'] = eff.pop('attribute')
                file_fixed += 1

        # 修复 branches 中的 effects 和 failureEffects
        for b in e.get('branches', []):
            for eff in b.get('effects', []):
                if 'attribute' in eff and 'target' not in eff:
                    eff['target'] = eff.pop('attribute')
                    file_fixed += 1
            for eff in b.get('failureEffects', []):
                if 'attribute' in eff and 'target' not in eff:
                    eff['target'] = eff.pop('attribute')
                    file_fixed += 1

    if file_fixed > 0:
        with open(f, 'w') as fh:
            json.dump(events, fh, ensure_ascii=False, indent=2)
            fh.write('\n')
        print(f'{fname}: 修复了 {file_fixed} 个 attribute → target')
        total_fixed += file_fixed

print(f'\n总计修复: {total_fixed}')
