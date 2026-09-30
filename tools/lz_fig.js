const KS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function lzb64(input) {
  if (input == null) return "";
  const res = _c(input, 6, a => KS.charAt(a));
  switch (res.length % 4) { case 0: return res; case 1: return res + "==="; case 2: return res + "=="; case 3: return res + "="; }
}
function _c(u, bits, gc) {
  let i, value, dict = {}, toCreate = {}, c = "", wc = "", w = "", enlargeIn = 2, dictSize = 3, numBits = 2, data = [], val = 0, pos = 0, ii;
  function push(b) { val = (val << 1) | b; if (pos == bits - 1) { pos = 0; data.push(gc(val)); val = 0; } else pos++; }
  function pushN(v, n) { for (let k = 0; k < n; k++) { push(v & 1); v = v >> 1; } }
  function emitW() {
    if (Object.prototype.hasOwnProperty.call(toCreate, w)) {
      if (w.charCodeAt(0) < 256) { for (i = 0; i < numBits; i++) push(0); pushN(w.charCodeAt(0), 8); }
      else { value = 1; for (i = 0; i < numBits; i++) { val = (val << 1) | value; if (pos == bits - 1) { pos = 0; data.push(gc(val)); val = 0; } else pos++; value = 0; } pushN(w.charCodeAt(0), 16); }
      enlargeIn--; if (enlargeIn == 0) { enlargeIn = Math.pow(2, numBits); numBits++; }
      delete toCreate[w];
    } else { pushN(dict[w], numBits); }
    enlargeIn--; if (enlargeIn == 0) { enlargeIn = Math.pow(2, numBits); numBits++; }
  }
  for (ii = 0; ii < u.length; ii++) {
    c = u.charAt(ii);
    if (!Object.prototype.hasOwnProperty.call(dict, c)) { dict[c] = dictSize++; toCreate[c] = true; }
    wc = w + c;
    if (Object.prototype.hasOwnProperty.call(dict, wc)) w = wc;
    else { emitW(); dict[wc] = dictSize++; w = String(c); }
  }
  if (w !== "") emitW();
  pushN(2, numBits);
  while (true) { val = (val << 1); if (pos == bits - 1) { data.push(gc(val)); break; } else pos++; }
  return data.join('');
}
return { lzb64 };