export function hash(key) {
    var hash = 0, i, chr;
    for (i = 0; i < key.length; i++) {
        chr = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}