import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Delete, X, Hash, Equal, Minus, Plus, Divide, Percent } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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
    if (equation && !isNewNumber) {
      try {
        // eslint-disable-next-line no-eval
        const cleanEq = (equation + display).replace('×', '*').replace('÷', '/');
        const result = eval(cleanEq);
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
      const cleanEq = (equation + display).replace('×', '*').replace('÷', '/');
      // eslint-disable-next-line no-eval
      const result = eval(cleanEq);
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

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9.]/.test(key)) {
        e.preventDefault();
        handleNumber(key);
      } else if (key === '+') {
        e.preventDefault();
        handleOperator("+");
      } else if (key === '-') {
        e.preventDefault();
        handleOperator("-");
      } else if (key === '*') {
        e.preventDefault();
        handleOperator("×");
      } else if (key === '/') {
        e.preventDefault();
        handleOperator("÷");
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        clear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, calculate, handleBackspace, clear]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-80 bg-card/80 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10"
    >
      <div className="mb-6 text-right bg-black/20 p-6 rounded-3xl border border-white/5 shadow-inner">
        <div className="text-[10px] font-black text-muted-foreground h-4 uppercase tracking-widest mb-1 overflow-hidden">
          {equation}
        </div>
        <div className="text-4xl font-black text-primary truncate tracking-tighter">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Button variant="destructive" onClick={clear} className="h-14 rounded-2xl font-black text-xs uppercase shadow-lg">AC</Button>
        <Button variant="secondary" onClick={handleBackspace} className="h-14 rounded-2xl shadow-lg"><Delete className="h-5 w-5" /></Button>
        <Button variant="secondary" onClick={() => handleOperator("÷")} className="h-14 rounded-2xl shadow-lg font-black text-lg"><Divide className="h-5 w-5" /></Button>
        <Button variant="secondary" onClick={() => handleOperator("×")} className="h-14 rounded-2xl shadow-lg font-black text-lg"><X className="h-5 w-5" /></Button>
        
        {[7, 8, 9].map(n => (
          <Button key={n} variant="outline" onClick={() => handleNumber(String(n))} className="h-14 rounded-2xl text-lg font-black bg-white/5 border-white/5 hover:bg-primary hover:text-white transition-all shadow-md">{n}</Button>
        ))}
        <Button variant="secondary" onClick={() => handleOperator("-")} className="h-14 rounded-2xl shadow-lg font-black text-lg"><Minus className="h-5 w-5" /></Button>
        
        {[4, 5, 6].map(n => (
          <Button key={n} variant="outline" onClick={() => handleNumber(String(n))} className="h-14 rounded-2xl text-lg font-black bg-white/5 border-white/5 hover:bg-primary hover:text-white transition-all shadow-md">{n}</Button>
        ))}
        <Button variant="secondary" onClick={() => handleOperator("+")} className="h-14 rounded-2xl shadow-lg font-black text-lg"><Plus className="h-5 w-5" /></Button>
        
        {[1, 2, 3].map(n => (
          <Button key={n} variant="outline" onClick={() => handleNumber(String(n))} className="h-14 rounded-2xl text-lg font-black bg-white/5 border-white/5 hover:bg-primary hover:text-white transition-all shadow-md">{n}</Button>
        ))}
        <Button onClick={calculate} className="h-32 row-span-2 rounded-2xl bg-accent text-accent-foreground font-black text-2xl shadow-xl shadow-accent/20 border-none"><Equal className="h-8 w-8" /></Button>
        
        <Button variant="outline" onClick={() => handleNumber("0")} className="col-span-2 h-14 rounded-2xl text-lg font-black bg-white/5 border-white/5 hover:bg-primary hover:text-white transition-all shadow-md">0</Button>
        <Button variant="outline" onClick={() => handleNumber(".")} className="h-14 rounded-2xl text-xl font-black bg-white/5 border-white/5 shadow-md">.</Button>
      </div>
    </motion.div>
  );
};

export default Calculator;
