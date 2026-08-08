const PATTERNS: string[] = [
  '212222', // 0
  '222122', // 1
  '222221', // 2
  '121223', // 3
  '121322', // 4
  '131222', // 5
  '122213', // 6
  '122312', // 7
  '132212', // 8
  '221213', // 9
  '221312', // 10
  '231212', // 11
  '112232', // 12
  '122132', // 13
  '122231', // 14
  '113222', // 15
  '123122', // 16
  '123221', // 17
  '223211', // 18
  '221132', // 19
  '221231', // 20
  '213212', // 21
  '223112', // 22
  '312131', // 23
  '311222', // 24
  '321122', // 25
  '321221', // 26
  '312212', // 27
  '322112', // 28
  '322211', // 29
  '212123', // 30
  '212321', // 31
  '232121', // 32
  '111323', // 33
  '131123', // 34
  '131321', // 35
  '112313', // 36
  '132113', // 37
  '132311', // 38
  '211313', // 39
  '231113', // 40
  '231311', // 41
  '112133', // 42
  '112331', // 43
  '132131', // 44
  '113123', // 45
  '113321', // 46
  '133121', // 47
  '313121', // 48
  '211331', // 49
  '231131', // 50
  '213113', // 51
  '213311', // 52
  '213131', // 53
  '311123', // 54
  '311321', // 55
  '331121', // 56
  '312113', // 57
  '312311', // 58
  '332111', // 59
  '314111', // 60
  '221411', // 61
  '431111', // 62
  '111224', // 63
  '111422', // 64
  '121124', // 65
  '121421', // 66
  '141122', // 67
  '141221', // 68
  '112214', // 69
  '112412', // 70
  '122114', // 71
  '122411', // 72
  '142112', // 73
  '142211', // 74
  '241211', // 75
  '221114', // 76
  '413111', // 77
  '241112', // 78
  '134111', // 79
  '111242', // 80
  '121142', // 81
  '121241', // 82
  '114212', // 83
  '124112', // 84
  '124211', // 85
  '411212', // 86
  '421112', // 87
  '421211', // 88
  '212141', // 89
  '214121', // 90
  '412121', // 91
  '111143', // 92
  '111341', // 93
  '131141', // 94
  '114113', // 95
  '114311', // 96
  '411113', // 97
  '411311', // 98
  '113141', // 99
  '114131', // 100
  '311141', // 101
  '411131', // 102
  '211412', // 103 Start A
  '211214', // 104 Start B
  '211232', // 105 Start C
  '2331112', // 106 Stop
];

const START_CODE_B = 104;
const STOP_CODE = 106;
const QUIET_ZONE_MODULES = 10;
const CODE_128_MODULUS = 103;

export interface Code128Bar {
  start: number;
  width: number;
}

export interface Code128Result {
  totalModules: number;
  bars: Code128Bar[];
  checksum: number;
}

function patternModules(
  pattern: string,
  startModule: number,
): {
  bars: Code128Bar[];
  nextModule: number;
} {
  const bars: Code128Bar[] = [];
  let cursor = startModule;
  let isBar = true;
  for (const widthChar of pattern) {
    const width = Number(widthChar);
    if (isBar) {
      bars.push({ start: cursor, width });
    }
    cursor += width;
    isBar = !isBar;
  }
  return { bars, nextModule: cursor };
}

export function encodeCode128(value: string): Code128Result {
  const data: number[] = [];
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    const symbolValue = char - 32;
    if (symbolValue < 0 || symbolValue > 94) {
      throw new Error(`Code 128 (Set B) cannot encode character "${value[i]}"`);
    }
    data.push(symbolValue);
  }

  let checksum = START_CODE_B;
  for (let i = 0; i < data.length; i++) {
    checksum += data[i] * (i + 1);
  }
  checksum %= CODE_128_MODULUS;

  const symbols = [START_CODE_B, ...data, checksum, STOP_CODE];

  const bars: Code128Bar[] = [];
  let moduleCursor = 0;

  moduleCursor += QUIET_ZONE_MODULES;

  for (const symbol of symbols) {
    const { bars: symbolBars, nextModule } = patternModules(
      PATTERNS[symbol],
      moduleCursor,
    );
    bars.push(...symbolBars);
    moduleCursor = nextModule;
  }

  moduleCursor += QUIET_ZONE_MODULES;

  return { totalModules: moduleCursor, bars, checksum };
}

export function code128ToSvg(
  value: string,
  widthPx: number,
  heightPx: number,
): string {
  const { totalModules, bars } = encodeCode128(value);
  const moduleWidth = widthPx / totalModules;
  const rects = bars
    .map(
      (bar) =>
        `<rect x="${(bar.start * moduleWidth).toFixed(2)}" y="0" width="${Math.max(bar.width * moduleWidth, 0.5).toFixed(2)}" height="${heightPx.toFixed(2)}" fill="#000000" />`,
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx.toFixed(2)}" height="${heightPx.toFixed(2)}" viewBox="0 0 ${widthPx.toFixed(2)} ${heightPx.toFixed(2)}">${rects}</svg>`;
}
