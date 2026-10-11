import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

const KEY = "ratio-quest-active-course-v1";
const CourseContext = createContext(null);
const valid = (year) => year === "year6" ? "year6" : "year5";

export function CourseProvider({ children }) {
  const location = useLocation();
  const [year, setYearState] = useState(() => {
    const queryYear = new URLSearchParams(location.search).get("year");
    if (queryYear === "6") return "year6";
    if (queryYear === "5") return "year5";
    try { return valid(localStorage.getItem(KEY)); } catch { return "year5"; }
  });
  useEffect(() => {
    const queryYear = new URLSearchParams(location.search).get("year");
    if (queryYear === "6" || queryYear === "5") setYearState(queryYear === "6" ? "year6" : "year5");
  }, [location.search]);
  useEffect(() => { try { localStorage.setItem(KEY, year); } catch { /* routing still works if storage is unavailable */ } }, [year]);
  const setYear = (next) => setYearState(valid(next));
  const value = useMemo(() => ({ year, setYear, yearLabel: year === "year6" ? "Year 6" : "Year 5", withYear: (path) => `${path}${path.includes("?") ? "&" : "?"}year=${year === "year6" ? "6" : "5"}` }), [year]);
  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>;
}

export const useCourse = () => useContext(CourseContext);
