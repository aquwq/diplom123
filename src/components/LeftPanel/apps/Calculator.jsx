import React, { useState, useEffect } from "react";
import "./Calculator.css";

const Calculator = () => {
  const [input, setInput] = useState("0");
  const [lastOperand, setLastOperand] = useState(null); // Хранит последний введенный оператор и значение

  const handleClick = (value) => {
    if (input === "0" && !isNaN(value)) {
      setInput(value); // Заменяем начальный "0" на первую цифру
    } else {
      setInput(input + value); // Добавляем символ к текущему вводу
    }
  };

  const handleClear = () => {
    setInput("0");
    setLastOperand(null); // Сбрасываем последнюю запись
  };

  const handleDelete = () => {
    setInput(input.length > 1 ? input.slice(0, -1) : "0");
  };

  const handleEquals = () => {
    try {
      // Обработка процентов: если есть предыдущее число и введено %
      const processedInput = input.replace(/(\d+)%/g, (_, percent) => {
        if (lastOperand !== null) {
          const previousValue = parseFloat(lastOperand.number);
          return `(${previousValue} * (${percent} / 100))`; // Процент от предыдущего числа
        } else {
          return `(${percent} / 100)`; // Процент от текущего числа
        }
      });

      const result = eval(processedInput); // Вычисляем выражение
      setInput(String(result));
      setLastOperand({ operator: null, number: result.toString() }); // Обновляем последний operand после вычисления
    } catch {
      setInput("Ошибка");
    }
  };

  const handleKeyDown = (event) => {
    const key = event.key;

    if (!isNaN(key) || key === ".") {
      handleClick(key); // Числа и точка
    } else if (key === "+" || key === "-" || key === "*" || key === "/") {
      setLastOperand({ operator: key, number: input });
      setInput("0"); // Сброс ввода после оператора
    } else if (key === "Enter") {
      event.preventDefault();
      handleEquals(); // Равно
    } else if (key === "Backspace") {
      handleDelete(); // Удаление
    } else if (key.toLowerCase() === "c") {
      handleClear(); // Сброс
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [input, lastOperand]);

  return (
    <div className="calculator">
      <div className="calculator-display">{input}</div>
      <div className="calculator-buttons">
        <button onClick={handleClear} className="operator">AC</button>
        <button onClick={handleDelete} className="operator">DEL</button>
        <button onClick={() => handleClick("%")} className="operator">%</button>
        <button onClick={() => handleClick("/")} className="operator">÷</button>

        <button onClick={() => handleClick("7")}>7</button>
        <button onClick={() => handleClick("8")}>8</button>
        <button onClick={() => handleClick("9")}>9</button>
        <button onClick={() => handleClick("*")} className="operator">×</button>

        <button onClick={() => handleClick("4")}>4</button>
        <button onClick={() => handleClick("5")}>5</button>
        <button onClick={() => handleClick("6")}>6</button>
        <button onClick={() => handleClick("-")} className="operator">−</button>

        <button onClick={() => handleClick("1")}>1</button>
        <button onClick={() => handleClick("2")}>2</button>
        <button onClick={() => handleClick("3")}>3</button>
        <button onClick={() => handleClick("+")} className="operator">+</button>

        <button onClick={() => handleClick("0")} className="zero">0</button>
        <button onClick={() => handleClick(".")}>.</button>
        <button onClick={handleEquals} className="equals">=</button>
      </div>
    </div>
  );
};

export default Calculator;
