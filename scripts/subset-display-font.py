#!/usr/bin/env python3
"""
Subset the self-hosted ZCOOL display font.

The full Chinese font is ~3.3 MB, which is a heavy first load for a page
whose only use of it is a short title. This script keeps the characters that
actually show up in a title and drops the rest:

  * Latin, digits and general punctuation
  * the 3755 most common simplified Chinese characters (GB2312 level 1,
    enumerated straight from Python's built-in codec - no word list needed)
  * CJK punctuation and fullwidth forms

Anything outside the subset (rare names, emoji, …) falls back to the next
font in the CSS stack (PingFang SC / Microsoft YaHei / Noto Sans CJK), which
is a graceful degradation rather than a broken glyph.

The subset that ships in the repository is built from a pinned upstream file
whose checksum is verified - the same stale-CDN problem that broke the 3D
scene must not reach the build pipeline. The build never needs the network:
the subset is committed.

Requirements:  pip install fonttools brotli

Usage:
    # from the committed full font
    python3 scripts/subset-display-font.py \
        apps/web/public/fonts/zcool-qingke-huangyou.woff \
        apps/web/public/fonts/zcool-qingke-huangyou.woff2

    # from the pinned upstream file (downloads + verifies it first)
    python3 scripts/subset-display-font.py --download \
        apps/web/public/fonts/zcool-qingke-huangyou.woff2
"""
import hashlib
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

# Pinned upstream copy of ZCOOL QingKe HuangYou (SIL Open Font License).
SOURCE_URL = (
    "https://fonts.gstatic.com/s/zcoolqingkehuangyou/v16/"
    "2Eb5L_R5IXJEWhD3AOhSvFC554MOOahI4mRIiA.woff"
)
SOURCE_SHA256 = "d4d43c0db542294fdfed8fe83a6ea3b586d215a2f3e049948370801961774e9a"

CHARSET_EXTRA = (
    "".join(chr(c) for c in range(0x20, 0x7F))          # ASCII
    + "".join(chr(c) for c in range(0xA0, 0x100))        # Latin-1 supplement
    + "".join(chr(c) for c in range(0x2000, 0x2070))     # general punctuation
    + "".join(chr(c) for c in range(0x20A0, 0x20C0))     # currency symbols
    + "".join(chr(c) for c in range(0x2100, 0x2150))     # letterlike symbols
    + "".join(chr(c) for c in range(0x2190, 0x21A0))     # arrows
    + "".join(chr(c) for c in range(0x2460, 0x24FF))     # enclosed alphanumerics
    + "".join(chr(c) for c in range(0x25A0, 0x2600))     # geometric shapes
    + "".join(chr(c) for c in range(0x3000, 0x3040))     # CJK punctuation
    + "".join(chr(c) for c in range(0xFF00, 0xFFF0))     # fullwidth forms
    + "　、。！？；：（）【】《》“”‘’—…·～￥"
)


def gb2312_level1() -> str:
    """The 3755 most common simplified Chinese characters.

    GB2312 rows 16..55 (0xB0..0xD7) are the level-1 "commonly used" set.
    Python ships the codec, so the characters can be enumerated without
    carrying a word list around.
    """
    chars = []
    for high in range(0xB0, 0xD8):
        for low in range(0xA1, 0xFF):
            try:
                chars.append(bytes([high, low]).decode("gb2312"))
            except UnicodeDecodeError:
                continue
    return "".join(chars)


def to_ranges(chars: str) -> str:
    """Compress a character set into `U+XXXX` ranges.

    pyftsubset's `--unicodes-file` expects ranges, not raw characters.
    """
    codepoints = sorted({ord(c) for c in chars})
    ranges = []
    start = previous = codepoints[0]
    for cp in codepoints[1:]:
        if cp == previous + 1:
            previous = cp
            continue
        ranges.append((start, previous))
        start = previous = cp
    ranges.append((start, previous))

    parts = []
    for low, high in ranges:
        parts.append(f"U+{low:04X}" if low == high else f"U+{low:04X}-{high:04X}")
    return ",".join(parts)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def download_source(destination: Path) -> Path:
    """Fetch the pinned upstream font and verify its checksum.

    A silent 404 or a swapped file must not reach the build, so the checksum
    is enforced rather than trusted.
    """
    print(f"downloading {SOURCE_URL}")
    with urllib.request.urlopen(SOURCE_URL, timeout=60) as response:
        payload = response.read()

    actual = hashlib.sha256(payload).hexdigest()
    if actual != SOURCE_SHA256:
        raise SystemExit(
            f"checksum mismatch for the upstream font\n  expected {SOURCE_SHA256}\n  actual   {actual}"
        )

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(payload)
    print(f"verified {destination} ({len(payload) / 1024:.0f} KB)")
    return destination


def main() -> int:
    args = [a for a in sys.argv[1:] if a != "--download"]
    download = "--download" in sys.argv[1:]

    if len(args) == 1:
        # --download <target>
        target = Path(args[0])
        with tempfile.TemporaryDirectory() as tmp:
            source = download_source(Path(tmp) / "source.woff")
            return subset(source, target)
    if len(args) == 2:
        source, target = Path(args[0]), Path(args[1])
        if not source.exists():
            if not download:
                print(f"source font not found: {source} (pass --download to fetch it)")
                return 1
            with tempfile.TemporaryDirectory() as tmp:
                downloaded = download_source(Path(tmp) / "source.woff")
                return subset(downloaded, target)
        return subset(source, target)

    print(__doc__)
    return 1


def subset(source: Path, target: Path) -> int:
    charset = CHARSET_EXTRA + gb2312_level1()
    unique = "".join(sorted(set(charset)))
    print(f"charset: {len(unique)} unique characters")

    target.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False, encoding="utf-8") as handle:
        handle.write(to_ranges(unique))
        chars_file = handle.name

    try:
        subprocess.run(
            [
                "pyftsubset",
                str(source),
                f"--output-file={target}",
                "--flavor=woff2",
                f"--unicodes-file={chars_file}",
                "--layout-features=*",
                "--name-IDs=*",
                "--name-legacy",
                "--notdef-outline",
                "--recommended-glyphs",
                "--drop-tables+=FFTM",
            ],
            check=True,
        )
    finally:
        Path(chars_file).unlink(missing_ok=True)

    before = source.stat().st_size
    after = target.stat().st_size
    print(
        f"{source.name}: {before / 1024:.0f} KB -> {target.name}: {after / 1024:.0f} KB "
        f"({100 - after * 100 // before}% smaller)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
