export interface ConformToMaskConfig {
  guide: boolean; // Показывать placeholder
  previousConformedValue: string;
  placeholderChar: string;
  placeholder: string;
  currentCaretPosition: number;
  keepCharPositions: boolean;
}

export interface MaskConfig {
  mask: InputmaskMaskFoprmat; // Массив маски, по строке / RegExp на символ
  guide: boolean; // Показывать placeholder при вводе
  placeholderChar: string; // Символ placeholder
  pipe: InputmaskPipe; // Функция проверки значения
  keepCharPositions?: boolean; // режим NumLock, при удалении символов остаются пробелы
  showMask?: boolean; // Показать маску
}

export interface PipeConfig extends ConformToMaskConfig {
  rawValue?: string;
}

export interface InputmaskPreset {
  mask: (string | RegExp)[];
  pipe?: InputmaskPipe;
}

export interface PipeResult {
  value?: string;
  rejected?: boolean;
  indexesOfPipedChars?: number[];
}

export interface MaskConfig {
  mask: InputmaskMaskFoprmat; // Массив маски, по строке / RegExp на символ
  guide: boolean; // Показывать placeholder при вводе
  placeholderChar: string; // Символ placeholder
  pipe: InputmaskPipe; // Функция проверки значения
  keepCharPositions?: boolean; // режим NumLock, при удалении символов остаются пробелы
  showMask?: boolean; // Показать маску
}

export interface ConformToMaskConfig {
  guide: boolean; // Показывать placeholder
  previousConformedValue: string;
  placeholderChar: string;
  placeholder: string;
  currentCaretPosition: number;
  keepCharPositions: boolean;
}

export interface PipeConfig extends ConformToMaskConfig {
  rawValue?: string;
}

export interface InputmaskPreset {
  mask: (string | RegExp)[];
  pipe?: InputmaskPipe;
}

export type InputmaskPipe = (verifiedValue: string, config?: PipeConfig) => boolean | string | PipeResult;

export type InputmaskMaskFoprmat = (string | RegExp)[] | false;

export type PipeReturn = boolean | string | PipeResult;
