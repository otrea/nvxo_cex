// ---------- extensions (lib_5, loaded before part 4) ----------
BL.dots = function (p, a, o) { var n = o.n || 3, f = AL('h', { gap: 6, justify: 'center', name: 'page dots' }); for (var i = 0; i < n; i++) f.appendChild(rect(i === a ? 22 : 8, 8, i === a ? 'mint' : 'line', { r: 4 })); put(p, f, 'fill'); };
BL.__retab = function (frame, label, to) { var tb = frame.findOne(function (n) { return n.name.indexOf('tab ' + label) === 0; }); if (tb) { tb.setSharedPluginData('nvxo', 'to', to); tb.name = 'tab ' + label + ' → ' + to; } };
BL.__repair = function (f) {
  var top = f.children.some(function (c) { return c.name === 'header'; }) ? 106 : 50;
  var body = f.children.filter(function (c) { return c.name === 'content'; })[0];
  var foot = f.children.filter(function (c) { return c.name === 'footer'; })[0];
  var tb = f.children.filter(function (c) { return c.name === 'tab bar'; })[0];
  var sh = f.children.filter(function (c) { return c.name === 'sheet'; })[0];
  var hi = f.children.filter(function (c) { return c.name === 'home indicator'; })[0];
  var vc = body && body.y > top + 1;
  if (foot) { foot.primaryAxisSizingMode = 'AUTO'; }
  var tabH = tb ? 84 : 0, footH = foot ? foot.height : 0;
  if (body && !sh) {
    var need = top + body.height + (foot ? footH + 16 : 0) + (tabH || 34);
    var Hh = Math.max(852, Math.ceil(need)); f.resize(393, Hh);
    if (foot) foot.y = Hh - tabH - (tabH ? 12 : 34) - footH;
    if (vc) { var avail = (foot ? foot.y : Hh - tabH - 34) - top; body.y = top + Math.max(0, (avail - body.height) / 2 - 10); }
    if (tb) tb.y = Hh - 84;
  }
  if (sh) { sh.primaryAxisSizingMode = 'AUTO'; sh.y = f.height - sh.height; var sc = f.children.filter(function (c) { return c.name.indexOf('scrim') === 0; })[0]; if (sc) sc.resize(393, f.height); }
  if (hi) { hi.y = f.height - 13; f.appendChild(hi); }
};
