import json

path = 'data/sword-and-magic/events/elder.json'
events = json.load(open(path))

for e in events:
    if e['id'] == 'elder_star_gazing_final':
        # 分支1: 平静 → spr为主
        e['branches'][0]['effects'] = [
            {"type": "modify_attribute", "attribute": "spr", "value": 3},
            {"type": "modify_attribute", "attribute": "chr", "value": 1}
        ]
        # 分支2: 许愿 → luk为主
        e['branches'][1]['effects'] = [
            {"type": "modify_attribute", "attribute": "luk", "value": 3},
            {"type": "modify_attribute", "attribute": "spr", "value": 1}
        ]
        # 加第三分支
        e['branches'].append({
            "id": "stargazing_count",
            "title": "数星星",
            "description": "你开始数星星，数着数着就睡着了。",
            "effects": [
                {"type": "modify_attribute", "attribute": "int", "value": 2},
                {"type": "modify_attribute", "attribute": "spr", "value": 2}
            ],
            "successText": "你数到了第两千三百颗的时候，在温暖的夜风中安然入睡。梦里，每颗星星都是你经历过的故事。"
        })
        print('Fixed elder_star_gazing_final')
        break

with open(path, 'w') as f:
    json.dump(events, f, ensure_ascii=False, indent=2)
    f.write('\n')
