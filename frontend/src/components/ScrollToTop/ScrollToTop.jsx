// frontend\src\components\ScrollToTop\ScrollToTop.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Мгновенно прокручиваем окно в самый верх (0, 0)
    window.scrollTo(0, 0);
  }, [pathname]); // Срабатывает каждый раз, когда меняется путь (URL)

  return null; // Этот компонент ничего не рисует
}