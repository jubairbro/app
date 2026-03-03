import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

const Calculator = () => {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = useCallback((num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === "0" ? num : display + num);
    }
  }, [display, isNewNumber]);

  const handleOperator = useCallback((op: string) => {
    if (!isNewNumber && equation) {
      try {
        // eslint-disable-next-line no-eval
        const result = eval(equation + display);
        setEquation(result + " " + op + " ");
        setDisplay(String(result));
      } catch (e) {
        setDisplay("Error");
      }
    } else {
      setEquation(display + " " + op + " ");
    }
    setIsNewNumber(true);
  }, [display, equation, isNewNumber]);

  const calculate = useCallback(() => {
    if (!equation) return;
    try {
      // eslint-disable-next-line no-eval
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation("");
      setIsNewNumber(true);
    } catch (e) {
      setDisplay("Error");
      setEquation("");
      setIsNewNumber(true);
    }
  }, [display, equation]);

  const clear = useCallback(() => {
    setDisplay("0");
    setEquation("");
    setIsNewNumber(true);
  }, []);

  const handleBackspace = useCallback(() => {
    if (isNewNumber) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  }, [display, isNewNumber]);

  const handlePercentage = useCallback(() => {
    try {
      const val = parseFloat(display);
      setDisplay(String(val / 100));
      setIsNewNumber(true);
    } catch (e) {
      setDisplay("Error");
    }
  }, [display]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) {
        e.preventDefault();
        handleNumber(key);
      } else if (['+', '-', '*', '/'].includes(key)) {
        e.preventDefault();
        handleOperator(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        clear();
      } else if (key === '%') {
        e.preventDefault();
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, calculate, handleBackspace, clear, handlePercentage]);

  return (
    <div className="w-72 bg-card p-5 rounded-2xl shadow-2xl border border-border/50">
      <div className="mb-6 text-right bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="text-sm text-muted-foreground h-5 font-mono tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
          {equation.replace('*', '×').replace('/', '÷')}
        </div>
        <div className="text-4xl font-bold truncate mt-1 font-mono tracking-tight">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Button variant="destructive" onClick={clear} className="col-span-2 font-bold text-lg h-12">AC</Button>
        <Button variant="secondary" onClick={handlePercentage} className="font-bold text-lg h-12">%</Button>
        <Button variant="secondary" onClick={() => handleOperator("/")} className="font-bold text-xl h-12">÷</Button>
        
        <Button variant="outline" onClick={() => handleNumber("7")} className="text-xl h-12">7</Button>
        <Button variant="outline" onClick={() => handleNumber("8")} className="text-xl h-12">8</Button>
        <Button variant="outline" onClick={() => handleNumber("9")} className="text-xl h-12">9</Button>
        <Button variant="secondary" onClick={() => handleOperator("*")} className="font-bold text-xl h-12">×</Button>
        
        <Button variant="outline" onClick={() => handleNumber("4")} className="text-xl h-12">4</Button>
        <Button variant="outline" onClick={() => handleNumber("5")} className="text-xl h-12">5</Button>
        <Button variant="outline" onClick={() => handleNumber("6")} className="text-xl h-12">6</Button>
        <Button variant="secondary" onClick={() => handleOperator("-")} className="font-bold text-xl h-12">-</Button>
        
        <Button variant="outline" onClick={() => handleNumber("1")} className="text-xl h-12">1</Button>
        <Button variant="outline" onClick={() => handleNumber("2")} className="text-xl h-12">2</Button>
        <Button variant="outline" onClick={() => handleNumber("3")} className="text-xl h-12">3</Button>
        <Button variant="secondary" onClick={() => handleOperator("+")} className="font-bold text-xl h-12">+</Button>
        
        <Button variant="outline" onClick={() => handleNumber("0")} className="col-span-2 text-xl h-12">0</Button>
        <Button variant="outline" onClick={() => handleNumber(".")} className="text-xl font-bold h-12">.</Button>
        <Button onClick={calculate} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xl h-12">=</Button>
      </div>
    </div>
  );
};

export default Calculator;
