import { CalendarData } from '@/lib/types';

interface CalendarBlockProps {
  title: string;
  data: CalendarData;
  color: string;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  const d = new Date(year, month - 1, 1).getDay();
  return (d + 6) % 7;
}

function parseWeekStart(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function WeekView({ data, color }: { data: CalendarData; color: string }) {
  const { weekStartDate, startHour, endHour, showWeekends } = data;
  const start = parseWeekStart(weekStartDate || new Date().toISOString().split('T')[0]);
  const numDays = showWeekends ? 7 : 5;
  const numHours = Math.max(1, endHour - startHour);
  const timeColWidth = 52;
  const headerHeight = 36;

  const days = Array.from({ length: numDays }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  const hours = Array.from({ length: numHours }, (_, i) => startHour + i);

  const isToday = (date: Date) => {
    const now = new Date();
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0" style={{ backgroundColor: `${color}15` }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-foreground truncate">{data.title || 'Week View'}</span>
      </div>

      <div className="flex-1 overflow-hidden" style={{ display: 'grid', gridTemplateColumns: `${timeColWidth}px 1fr` }}>
        <div style={{ display: 'grid', gridTemplateRows: `${headerHeight}px repeat(${numHours}, 1fr)` }}>
          <div className="border-b border-r border-border bg-muted/30" />
          {hours.map(h => (
            <div key={h} className="flex items-start justify-end pr-2 pt-0.5 border-b border-r border-border/50">
              <span className="text-[9px] text-muted-foreground leading-none">{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numDays}, 1fr)`, gridTemplateRows: `${headerHeight}px repeat(${numHours}, 1fr)` }}>
          {days.map((d, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center border-b border-r border-border last:border-r-0"
              style={{ backgroundColor: isToday(d) ? `${color}10` : undefined }}
            >
              <span className="text-[9px] text-muted-foreground leading-none">{DAYS_SHORT[i]}</span>
              <span
                className="text-[11px] font-semibold mt-0.5"
                style={{ color: isToday(d) ? color : 'inherit' }}
              >
                {d.getDate()}
              </span>
              <span className="text-[8px] text-muted-foreground leading-none">{MONTH_SHORT[d.getMonth()]}</span>
            </div>
          ))}

          {hours.map((h, hi) =>
            days.map((_, di) => {
              const isWeekend = di >= 5;
              return (
                <div
                  key={`${hi}-${di}`}
                  className="border-b border-r border-border/40 last:border-r-0"
                  style={{ backgroundColor: isWeekend ? 'rgba(0,0,0,0.025)' : undefined }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function MonthView({ data, color }: { data: CalendarData; color: string }) {
  const { month, year, showWeekends } = data;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOfWeek(year, month);
  const numCols = showWeekends ? 7 : 5;

  const now = new Date();
  const isToday = (day: number) =>
    day === now.getDate() && month === now.getMonth() + 1 && year === now.getFullYear();

  const days = DAYS_SHORT.slice(0, numCols);

  const cells: (number | null)[] = [];
  const offset = showWeekends ? firstDayOffset : Math.min(firstDayOffset, 4);
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    if (!showWeekends) {
      const weekday = (firstDayOffset + d - 1) % 7;
      if (weekday < 5) cells.push(d);
    } else {
      cells.push(d);
    }
  }
  while (cells.length % numCols !== 0) cells.push(null);
  const numRows = cells.length / numCols;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0" style={{ backgroundColor: `${color}15` }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-foreground truncate">{data.title || `${MONTH_NAMES[month - 1]} ${year}`}</span>
      </div>

      <div className="flex-1 overflow-hidden" style={{ display: 'grid', gridTemplateRows: `28px repeat(${numRows}, 1fr)` }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)` }} className="border-b border-border">
          {days.map(d => (
            <div key={d} className="flex items-center justify-center border-r border-border/40 last:border-r-0">
              <span className="text-[10px] font-medium text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>

        {Array.from({ length: numRows }, (_, row) => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: `repeat(${numCols}, 1fr)` }} className="border-b border-border/40 last:border-b-0">
            {Array.from({ length: numCols }, (_, col) => {
              const cellVal = cells[row * numCols + col];
              const today = cellVal !== null && isToday(cellVal);
              return (
                <div key={col} className="relative border-r border-border/40 last:border-r-0 p-1">
                  {cellVal !== null && (
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-medium"
                      style={today ? { backgroundColor: color, color: '#fff' } : { color: 'hsl(var(--foreground))' }}
                    >
                      {cellVal}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function YearView({ data, color }: { data: CalendarData; color: string }) {
  const { year } = data;
  const now = new Date();

  return (
    <div className="w-full h-full flex flex-col overflow-hidden rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0" style={{ backgroundColor: `${color}15` }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-semibold text-foreground">{data.title || String(year)}</span>
      </div>

      <div className="flex-1 overflow-hidden p-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(3, 1fr)', gap: 6 }}>
        {MONTH_SHORT.map((mName, mi) => {
          const m = mi + 1;
          const daysInM = getDaysInMonth(year, m);
          const firstDay = getFirstDayOfWeek(year, m);
          const isCurrentMonth = m === now.getMonth() + 1 && year === now.getFullYear();
          const todayDay = now.getDate();

          const cells: (number | null)[] = [];
          for (let i = 0; i < firstDay; i++) cells.push(null);
          for (let d = 1; d <= daysInM; d++) cells.push(d);
          while (cells.length % 7 !== 0) cells.push(null);

          return (
            <div
              key={mi}
              className="flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card/50"
              style={isCurrentMonth ? { borderColor: color } : undefined}
            >
              <div className="px-1.5 py-0.5 flex items-center justify-between border-b border-border/40" style={isCurrentMonth ? { backgroundColor: `${color}20` } : undefined}>
                <span className="text-[9px] font-semibold" style={{ color: isCurrentMonth ? color : undefined }}>{mName}</span>
              </div>
              <div className="flex-1 overflow-hidden" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `auto repeat(${cells.length / 7}, 1fr)` }}>
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <span className="text-[7px] text-muted-foreground">{d}</span>
                  </div>
                ))}
                {cells.map((day, ci) => {
                  const isToday = isCurrentMonth && day === todayDay;
                  return (
                    <div key={ci} className="flex items-center justify-center">
                      {day !== null && (
                        <span
                          className="inline-flex items-center justify-center rounded-full text-[7px] leading-none"
                          style={{
                            width: 10, height: 10,
                            backgroundColor: isToday ? color : undefined,
                            color: isToday ? '#fff' : undefined,
                          }}
                        >
                          {day}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CalendarBlock({ title, data, color }: CalendarBlockProps) {
  if (data.view === 'week') return <WeekView data={data} color={color} />;
  if (data.view === 'year') return <YearView data={data} color={color} />;
  return <MonthView data={data} color={color} />;
}
