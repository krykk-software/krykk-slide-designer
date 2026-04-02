import { GanttData, GanttTask } from '@/lib/types';

interface GanttBlockProps {
  title: string;
  data: GanttData;
  color: string;
}

export function GanttBlock({ title, data }: GanttBlockProps) {
  const { tasks, totalDays } = data;
  
  const sections = tasks.reduce((acc, task) => {
    const section = task.section || 'Tasks';
    if (!acc.includes(section)) {
      acc.push(section);
    }
    return acc;
  }, [] as string[]);

  const getTasksBySection = (section: string) => {
    return tasks.filter(t => (t.section || 'Tasks') === section);
  };

  const dayMarkers = [];
  const step = totalDays <= 14 ? 1 : totalDays <= 30 ? 5 : 10;
  for (let i = 0; i <= totalDays; i += step) {
    dayMarkers.push(i === 0 ? 1 : i);
  }
  if (dayMarkers[dayMarkers.length - 1] !== totalDays) {
    dayMarkers.push(totalDays);
  }

  const renderTask = (task: GanttTask, index: number) => {
    const startPercent = ((task.startDay - 1) / totalDays) * 100;
    const widthPercent = (task.duration / totalDays) * 100;

    return (
      <div key={task.id} className="flex items-center h-6 gap-2">
        <div className="w-28 text-[10px] text-muted-foreground truncate shrink-0 text-right pr-2">
          {task.name}
        </div>
        <div className="flex-1 relative h-4 bg-muted/30 rounded-sm">
          <div
            className="absolute h-full rounded-sm"
            style={{
              left: `${startPercent}%`,
              width: `${widthPercent}%`,
              backgroundColor: task.color || 'hsl(217, 91%, 60%)',
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl border border-card-border p-4 h-full flex flex-col shadow-sm overflow-hidden">
      <div className="text-sm font-semibold text-foreground mb-3 truncate">{title}</div>
      
      <div className="flex items-center gap-2 mb-2">
        <div className="w-28 shrink-0" />
        <div className="flex-1 flex justify-between text-[9px] text-muted-foreground">
          {dayMarkers.map((day, i) => (
            <span key={i}>Day {day}</span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {sections.map((section, sectionIndex) => (
          <div key={section}>
            {sectionIndex > 0 && (
              <div className="border-t border-border my-2" />
            )}
            <div className="text-[10px] font-medium text-muted-foreground mb-1 pl-1">
              {section}
            </div>
            <div className="space-y-1">
              {getTasksBySection(section).map((task, i) => renderTask(task, i))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
