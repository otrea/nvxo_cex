# Builds assets/fonts/MaterialSymbolsSharp.ttf (static FILL0/wght400/GRAD0/opsz24, subset to the icons the
# screens use) and src/render/icons.json {name: codepoint}. Codepoints come from the font's own ligature table.
# usage: python3 tools/build-icons.py <material-symbols-sharp.woff2>
import json, sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
names = set()
def walk(n):
    if isinstance(n, dict):
        if isinstance(n.get('ic'), str): names.add(n['ic'])
        for v in n.values(): walk(v)
    elif isinstance(n, list):
        for v in n: walk(v)
for s in json.load(open(os.path.join(root, 'src/design/screens.json'))).values(): walk(s.get('tree') or s.get('patch'))
names |= {'check_circle', 'radio_button_unchecked', 'radio_button_checked', 'help'}  # used by the renderer itself

f = TTFont(sys.argv[1])
if 'fvar' in f:
    f = instancer.instantiateVariableFont(f, {'FILL': 0, 'wght': 400, 'GRAD': 0, 'opsz': 24})
cmap = f.getBestCmap(); rev = {}
for cp, g in cmap.items(): rev.setdefault(g, cp)
ch = {g: chr(cp) for cp, g in cmap.items()}
lig = {}
for lk in f['GSUB'].table.LookupList.Lookup:
    for st in lk.SubTable:
        st = getattr(st, 'ExtSubTable', st)
        if not hasattr(st, 'ligatures'): continue
        for first, ls in st.ligatures.items():
            for l in ls:
                word = ''.join(ch.get(g, '?') for g in [first] + l.Component)
                if l.LigGlyph in rev: lig.setdefault(word, rev[l.LigGlyph])
# old Material Icons names that Symbols renamed
ALIAS = {'add_circle_outline': 'add_circle', 'chat_bubble_outline': 'chat_bubble', 'error_outline': 'error', 'help_outline': 'help',
         'mail_outline': 'mail', 'notifications_none': 'notifications', 'bookmark_border': 'bookmark', 'star_border': 'star',
         'star_outline': 'star', 'remove_circle_outline': 'do_not_disturb_on', 'warning_amber': 'warning', 'info_outline': 'info'}
out, missing = {}, []
for n in sorted(names):
    cp = lig.get(n) or lig.get(ALIAS.get(n, ''))
    if cp: out[n] = cp
    else: missing.append(n)
opts = subset.Options(); opts.layout_features = []; opts.name_IDs = ['*']; opts.notdef_outline = True
sub = subset.Subsetter(opts); sub.populate(unicodes=sorted(set(out.values()))); sub.subset(f)
f.flavor = None
f.save(os.path.join(root, 'assets/fonts/MaterialSymbolsSharp.ttf'))
json.dump(out, open(os.path.join(root, 'src/render/icons.json'), 'w'), separators=(',', ':'))
print(len(out), 'icons, missing:', missing, 'size', os.path.getsize(os.path.join(root, 'assets/fonts/MaterialSymbolsSharp.ttf')))
