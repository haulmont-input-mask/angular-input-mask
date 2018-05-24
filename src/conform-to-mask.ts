import { convertMaskToPlaceholder } from './conver-mask-to-placeholder';
import { emptyString, placeholderChar as defaultPlaceholderChar } from './constants';
import { ConformToMaskConfig, InputmaskMaskFoprmat } from './interfaces';

export default function conformToMask(inputValue: string, mask: InputmaskMaskFoprmat, config: ConformToMaskConfig): string {
  // Конфигурация как согласовывать значение с маской
  const {
    guide = true,
    previousConformedValue = emptyString,
    placeholderChar = defaultPlaceholderChar,
    placeholder = convertMaskToPlaceholder(mask, placeholderChar),
    currentCaretPosition,
    keepCharPositions
  } = config;

  let rawValue = inputValue;

  // В приведенных ниже конфигурациях указано, что пользователь хочет, чтобы алгоритм работал в режиме * без руководства *
  const suppressGuide = guide === false && previousConformedValue !== undefined;

  // Вычислить длины один раз для производительности
  const rawValueLength = rawValue.length;
  const previousConformedValueLength = previousConformedValue.length;
  const placeholderLength = placeholder.length;
  const maskLength = (mask) ? mask.length : 0;

  // Это говорит нам количество отредактированных символов и направление, в котором они были отредактированы (+/-)
  const editDistance = rawValueLength - previousConformedValueLength;

  // В режиме * без руководства * нам нужно знать, пытается ли пользователь добавить символ или нет
  const isAddition = editDistance > 0;

  // Сообщает нам индекс первого изменения. Для (438) 394-4938 => (38) 394-4938 это будет 1
  const indexOfFirstChange = currentCaretPosition + (isAddition ? -editDistance : 0);

  // Нам также понадобится индекс последнего изменения, который мы можем получить следующим образом ...
  const indexOfLastChange = indexOfFirstChange + Math.abs(editDistance);

  // Если `conformToMask` настроен на сохранение позиций символов, то есть для маски 111,
  // предыдущего значения _2_ и необработанного значения 3_2_, новое согласованное значение
  // должно быть 32_, а не 3_2 (поведение по умолчанию).Это в случае добавления.
  // И в случае удаления, предыдущее значение _23, необработанное значение _3, новая согласованная строка должна быть __3,
  // а не _3_ (поведение по умолчанию)
  //
  // Следующий блок логики обрабатывает позиции символов для случая удаления. (Сохранение позиций символов для случая сложения еще больше,
  // поскольку оно обрабатывается по-разному.) Для этого мы хотим компенсировать все удаленные символы
  if (keepCharPositions === true && !isAddition) {
    // Мы будем хранить новый placeholder в этой переменной.
    let compensatingPlaceholderChars = emptyString;

    // Для каждого символа, который был удален из placeholder, мы добавляем символ-заполнитель
    for (let i = indexOfFirstChange; i < indexOfLastChange; i++) {
      if (placeholder[i] === placeholderChar) {
        compensatingPlaceholderChars += placeholderChar;
      }
    }

    // Теперь мы обманываем наш алгоритм, изменяя исходное значение, чтобы оно содержало дополнительные символы-заполнители.
    // Таким образом, когда мы начинаем укладывать символы снова в маске, он будет удерживать неизменённые символы в своих позициях.
    rawValue = (
      rawValue.slice(0, indexOfFirstChange) +
      compensatingPlaceholderChars +
      rawValue.slice(indexOfFirstChange, rawValueLength)
    );
  }

  // Преобразование строки «rawValue» в массив и пометка символов, были ли они добавлены или существовали в
  // предыдущем согласованном значении.
  // Идентификация новых и старых символов необходима для того, чтобы `matchToMask` работал, если он настроен на
  // сохранение позиций символов.
  const rawValueArr = rawValue
    .split(emptyString)
    .map((char, i) => ({ char, isNew: i >= indexOfFirstChange && i < indexOfLastChange }));

  // Цикл ниже удаляет маскирующие символы из пользовательского ввода. Например, для маски `00 (111)`, placeholder будет `00 (___)`.
  // Если пользовательский ввод равен `00 (234)`, цикл ниже удалит все символы, кроме `234` из` rawValueArr`.
  // Остальная часть алгоритма затем положила бы `234` в начало доступных символов в маске.
  for (let i = rawValueLength - 1; i >= 0; i--) {
    const { char } = rawValueArr[i];

    if (char !== placeholderChar) {
      const shouldOffset = i >= indexOfFirstChange && previousConformedValueLength === maskLength;

      if (char === placeholder[(shouldOffset) ? i - editDistance : i]) {
        rawValueArr.splice(i, 1);
      }
    }
  }

  // Это переменная, которую мы будем заполнять символами в алгоритме ниже
  let conformedValue = emptyString;
  let someCharsRejected = false;

  // Сначала заполняем placeholder
  placeholderLoop: for (let i = 0; i < placeholderLength; i++) {
    const charInPlaceholder = placeholder[i];

    // Позиция в маске заполнена placeholder-ом
    if (charInPlaceholder === placeholderChar) {
      // Для начала, проверяем введенные пользователем символы, которые мы ещё не разместили
      if (rawValueArr.length > 0) {
        // Будем продолжать поиск символа для вставки, пока у нас есть пользовательские символы ожидающие вставки
        // или пока не найдем символ для вставки
        while (rawValueArr.length > 0) {
          // Берём первый символ, из тех что ожидают размещения
          const { char: rawValueChar, isNew } = rawValueArr.shift();

          // Если символ, который мы получили от пользовательского ввода, является символом-заполнителем (что происходит
          // регулярно, потому что пользовательский ввод может быть чем-то вроде (540) 90 _-____, который включает
          // куча `_`, которые являются символами-заполнителями), и мы не находимся в режиме * no guide *
          // то мы сопоставляем этот символ-заполнитель с текущим местом в placeholder
          if (rawValueChar === placeholderChar && suppressGuide !== true) {
            conformedValue += placeholderChar;

            // Переходим к следующему символу placeholder
            continue placeholderLoop;

            // Иначе, если символ, который мы получили от пользовательского ввода, не является заполнителем, давайте
            // посмотрим, сможет ли его текущая позиция в маске принять его.
          } else if (mask[i]['test'](rawValueChar)) {
            // Мы сопоставляем символы по-разному, основываясь на том, сохраняем ли мы позицию символа или нет.
            // Если выполняется какое-либо условие из приведенных ниже, мы просто сопоставляем символ исходного значения
            // с позицией-заполнителем.
            if (
              keepCharPositions !== true ||
              isNew === false ||
              previousConformedValue === emptyString ||
              guide === false ||
              !isAddition
            ) {
              conformedValue += rawValueChar;
            } else {
              // Мы вводим этот блок кода, если мы пытаемся сохранить позиции символов, и ни одно
              // из приведенных выше условий не выполняется.
              // В этом случае нам нужно увидеть, есть ли подходящее место в маске, для текущего символа.
              // Если мы не сможем найти подходящее место в маске, мы пропускаем символ.
              //
              // Например, для маски `1111`, предыдущее согласованное значение` _2__`, необработанное значение `942_2__`.
              // Мы можем сопоставить `9`, с первой доступной позицией placeholder, но тогда больше нет слотов для` 4` и `2`.
              // Таким образом, мы отбрасываем их и получаем согласованное значение `92__`.
              const rawValueArrLength = rawValueArr.length;
              let indexOfNextAvailablePlaceholderChar = null;

              // Перейдем к оставшимся символам введенного значения. Мы ищем подходящее место, то есть символ-заполнитель или
              // не подходящее место, т. Е. Не-заполнитель, который не является новым. Если мы сначала увидим подходящее место,
              // мы сохраним его положение и выйдем из цикла.
              // Если сначала мы увидим не подходящее место, мы выйдем из цикла,
              // и наш `indexOfNextAvailablePlaceholderChar` останется как« null ».
              for (let wordNum = 0; i < rawValueArrLength; wordNum++) {
                const charData = rawValueArr[wordNum];

                if (charData.char !== placeholderChar && charData.isNew === false) {
                  break;
                }

                if (charData.char === placeholderChar) {
                  indexOfNextAvailablePlaceholderChar = wordNum;
                  break;
                }
              }

              // Если `indexOfNextAvailablePlaceholderChar` не` null`, это означает, что символ не заблокирован. Мы можем отобразить его.
              // И чтобы сохранить позиции символа, мы удаляем символ-заполнитель из остальных символов
              if (indexOfNextAvailablePlaceholderChar !== null) {
                conformedValue += rawValueChar;
                rawValueArr.splice(indexOfNextAvailablePlaceholderChar, 1);

                // Если `indexOfNextAvailablePlaceholderChar` === `null`, это означает, что символ заблокирован. Мы должны отбросить его.
              } else {
                i--;
              }
            }

            // Так как мы сопоставили эту позицию заполнителя. Мы переходим к следующему.
            continue placeholderLoop;
          } else {
            someCharsRejected = true;
          }
        }
      }

      // Мы достигаем этого момента, когда мы сопоставили все пользовательские символы ввода с позициями-заполнителями в маске.
      // В режиме * guide * мы добавляем левые символы в placeholder к `convedString`, но в режиме * no guide * мы не хотим этого делать.
      //
      // То есть для маски `(111)` и пользовательского ввода `2` мы хотим вернуть` (2`, а не `(2 __)`.
      if (suppressGuide === false) {
        conformedValue += placeholder.substr(i, placeholderLength);
      }

      break;

      // Иначе charInPlaceholder не является placeholderChar. То есть мы не можем заполнить его пользовательским вводом.
      // Поэтому мы просто сопоставляем его с конечным результатом
    } else {
      conformedValue += charInPlaceholder;
    }
  }

  // Для рассмотрения случая удаления в режиме * no guide * необходима следующая логика.
  //
  // Рассмотрим простую маску `(111) /// 1`. Что делать, если пользователь пытается удалить последний заполнитель
  // Что-то вроде `(589) ///`. Мы хотим, чтобы это соответствовало `(589`. Не` (589) /// `.
  // Вот почему логика ниже находит последний заполненный символ-заполнитель и удаляет все с этой точки.

  if (suppressGuide && isAddition === false) {
    let indexOfLastFilledPlaceholderChar = null;

    // Найти последнюю заполненную позицию заполнителя и подстроку оттуда
    for (let i = 0; i < conformedValue.length; i++) {
      if (placeholder[i] === placeholderChar) {
        indexOfLastFilledPlaceholderChar = i;
      }
    }

    if (indexOfLastFilledPlaceholderChar !== null) {
      // Присваиваем согласованной строке - подстроку от начала до позиции после последнего заполненного заполнителя
      conformedValue = conformedValue.substr(0, indexOfLastFilledPlaceholderChar + 1);
    } else {
      // Если мы не смогли найти `indexOfLastFilledPlaceholderChar`, это означает, что пользователь удалил первый символ в маске.
      // Поэтому мы возвращаем пустую строку.
      conformedValue = emptyString;
    }
  }

  // return { conformedValue, meta: { someCharsRejected } };
  return conformedValue;
}
