import React, { useEffect, useState } from "react";
import axios from "axios";

const UpcomingContestsCalendar = ({ contests }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };


  const getDaysInMonth = () => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();

  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const calendarRows = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(currentYear, currentMonth, i);
      const dayOfWeek = day.getDay(); // 6 = sâmbătă, 0 = duminică

      if (dayOfWeek === 6) {
        const nextDay = i + 1 <= daysInMonth ? new Date(currentYear, currentMonth, i + 1) : null;
        const isSundayNext = nextDay && nextDay.getDay() === 0;

        const saturday = {
          day: i,
          contest: contests.find(c => {
            const d = new Date(c.date);
            return (
              d.getFullYear() === day.getFullYear() &&
              d.getMonth() === day.getMonth() &&
              d.getDate() === day.getDate()
            );
          })

        };

        const sunday = isSundayNext
          ? {
            day: i + 1,
            contest: contests.find(c => {
              const d = new Date(c.date);
              return (
                d.getFullYear() === nextDay.getFullYear() &&
                d.getMonth() === nextDay.getMonth() &&
                d.getDate() === nextDay.getDate()
              );
            })
          }
          : null;

        calendarRows.push(
          <div className="weekend-row" key={i}>
            <div className={`calendar-day ${saturday.contest ? "has-contest" : ""}`}>
              <div className="day-number">{saturday.day}</div>
              {saturday.contest && <div className="contest-badge"> {saturday.contest.name}</div>}
            </div>
            <div className={`calendar-day ${sunday?.contest ? "has-contest" : ""}`}>
              <div className="day-number">{sunday?.day || ""}</div>
              {sunday?.contest && <div className="contest-badge"> {sunday.contest.name}</div>}
            </div>
          </div>
        );
      }
    }

    return calendarRows;
  };


  return (
    <section>
      <div className="calendar-header">
        <button onClick={goToPrevMonth}>◀</button>

        <h2>
          Concursurile din {new Date(currentYear, currentMonth).toLocaleString("ro", { month: "long", year: "numeric" })}
        </h2>
        <button onClick={goToNextMonth}>▶</button>
      </div>

      <div className="calendar-weekdays weekend-only">
        <div>Sâmbătă</div>
        <div>Duminică</div>
      </div>


      <div className="calendar-weekends">
        {renderCalendar()}
      </div>

    </section>
  );
};

export default UpcomingContestsCalendar;
